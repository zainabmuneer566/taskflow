require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const STATUS = ['todo', 'in_progress', 'done'];
const PRIORITY = ['low', 'medium', 'high'];

// Wraps handlers: converts DB errors into clean JSON messages
const h = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e);
    if (e.code === '23505') return res.status(409).json({ errors: ['That value already exists.'] });
    if (e.code === '23503') return res.status(400).json({ errors: ['A related record does not exist.'] });
    res.status(500).json({ errors: ['Server error. Please try again.'] });
  });

const fail = (res, errors) => res.status(400).json({ errors });

// ---------- Validation ----------
function checkUser(b) {
  const e = [];
  if (!b.name || b.name.trim().length < 2) e.push('Name must be at least 2 characters.');
  if (!/^\S+@\S+\.\S+$/.test(b.email || '')) e.push('Enter a valid email address.');
  return e;
}
function checkProject(b) {
  const e = [];
  if (!b.title || b.title.trim().length < 3) e.push('Title must be at least 3 characters.');
  return e;
}
function checkTask(b) {
  const e = [];
  if (!b.project_id) e.push('Choose a project.');
  if (!b.title || b.title.trim().length < 3) e.push('Title must be at least 3 characters.');
  if (b.status && !STATUS.includes(b.status)) e.push('Invalid status.');
  if (b.priority && !PRIORITY.includes(b.priority)) e.push('Invalid priority.');
  return e;
}

// ---------- Users ----------
app.get('/api/users', h(async (req, res) => {
  const r = await pool.query('SELECT id, name, email FROM users ORDER BY name');
  res.json(r.rows);
}));
app.post('/api/users', h(async (req, res) => {
  const e = checkUser(req.body); if (e.length) return fail(res, e);
  const r = await pool.query('INSERT INTO users (name,email) VALUES ($1,$2) RETURNING *',
    [req.body.name.trim(), req.body.email.trim().toLowerCase()]);
  res.status(201).json(r.rows[0]);
}));

// ---------- Projects ----------
app.get('/api/projects', h(async (req, res) => {
  const r = await pool.query(`
    SELECT p.*, u.name AS owner_name,
           COUNT(t.id)::int AS task_count,
           COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS done_count
    FROM projects p
    LEFT JOIN users u ON u.id = p.owner_id
    LEFT JOIN tasks t ON t.project_id = p.id
    GROUP BY p.id, u.name ORDER BY p.created_at DESC`);
  res.json(r.rows);
}));
app.post('/api/projects', h(async (req, res) => {
  const e = checkProject(req.body); if (e.length) return fail(res, e);
  const { title, description, owner_id } = req.body;
  const r = await pool.query('INSERT INTO projects (title,description,owner_id) VALUES ($1,$2,$3) RETURNING *',
    [title.trim(), description || null, owner_id || null]);
  res.status(201).json(r.rows[0]);
}));
app.put('/api/projects/:id', h(async (req, res) => {
  const e = checkProject(req.body); if (e.length) return fail(res, e);
  const { title, description, owner_id } = req.body;
  const r = await pool.query('UPDATE projects SET title=$1, description=$2, owner_id=$3 WHERE id=$4 RETURNING *',
    [title.trim(), description || null, owner_id || null, req.params.id]);
  if (!r.rowCount) return res.status(404).json({ errors: ['Project not found.'] });
  res.json(r.rows[0]);
}));
app.delete('/api/projects/:id', h(async (req, res) => {
  const r = await pool.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
  if (!r.rowCount) return res.status(404).json({ errors: ['Project not found.'] });
  res.json({ ok: true });
}));

// ---------- Tasks ----------
app.get('/api/tasks', h(async (req, res) => {
  const { status, project_id, q } = req.query;
  const where = []; const vals = [];
  if (status)     { vals.push(status);     where.push(`t.status = $${vals.length}`); }
  if (project_id) { vals.push(project_id); where.push(`t.project_id = $${vals.length}`); }
  if (q)          { vals.push(`%${q}%`);   where.push(`t.title ILIKE $${vals.length}`); }
  const r = await pool.query(`
    SELECT t.*, to_char(t.due_date, 'YYYY-MM-DD') AS due_date,
           p.title AS project_title, u.name AS assignee_name
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    LEFT JOIN users u ON u.id = t.assigned_to
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY t.due_date NULLS LAST, t.id DESC`, vals);
  res.json(r.rows);
}));
app.post('/api/tasks', h(async (req, res) => {
  const e = checkTask(req.body); if (e.length) return fail(res, e);
  const { project_id, title, status, priority, due_date, assigned_to } = req.body;
  const r = await pool.query(
    `INSERT INTO tasks (project_id,title,status,priority,due_date,assigned_to)
     VALUES ($1,$2,COALESCE($3,'todo'),COALESCE($4,'medium'),$5,$6) RETURNING *`,
    [project_id, title.trim(), status, priority, due_date || null, assigned_to || null]);
  res.status(201).json(r.rows[0]);
}));
app.put('/api/tasks/:id', h(async (req, res) => {
  const e = checkTask(req.body); if (e.length) return fail(res, e);
  const { project_id, title, status, priority, due_date, assigned_to } = req.body;
  const r = await pool.query(
    `UPDATE tasks SET project_id=$1,title=$2,status=$3,priority=$4,due_date=$5,assigned_to=$6
     WHERE id=$7 RETURNING *`,
    [project_id, title.trim(), status || 'todo', priority || 'medium', due_date || null, assigned_to || null, req.params.id]);
  if (!r.rowCount) return res.status(404).json({ errors: ['Task not found.'] });
  res.json(r.rows[0]);
}));
app.delete('/api/tasks/:id', h(async (req, res) => {
  const r = await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
  if (!r.rowCount) return res.status(404).json({ errors: ['Task not found.'] });
  res.json({ ok: true });
}));

// ---------- Dashboard stats ----------
app.get('/api/stats', h(async (req, res) => {
  const r = await pool.query(`
    SELECT (SELECT COUNT(*) FROM projects)::int AS projects,
           COUNT(*)::int AS tasks,
           COUNT(*) FILTER (WHERE status='done')::int AS done,
           COUNT(*) FILTER (WHERE status<>'done' AND due_date < CURRENT_DATE)::int AS overdue
    FROM tasks`);
  res.json(r.rows[0]);
}));

// ---------- Serve the built React app (used when the project is hosted online) ----------
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// ---------- Create the tables automatically on a brand-new database ----------
async function initDb() {
  const r = await pool.query("SELECT to_regclass('public.tasks') AS t");
  if (!r.rows[0].t) {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Database was empty: tables and sample data created from schema.sql');
  }
}

const PORT = process.env.PORT || 5000;
initDb()
  .catch((e) => console.error('Database setup failed:', e.message))
  .finally(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)));
