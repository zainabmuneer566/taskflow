import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import Loader from '../components/Loader.jsx';
import TaskTable from '../components/TaskTable.jsx';
import TaskForm from '../components/TaskForm.jsx';

export default function Tasks({ notify }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ q: '', status: '', project_id: '' });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.projects(), api.users()])
      .then(([p, u]) => { setProjects(p); setUsers(u); })
      .catch((e) => notify(e.message, 'error'));
  }, [notify]);

  const load = useCallback(() => {
    setLoading(true);
    api.tasks(filters)
      .then(setTasks)
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [filters, notify]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search typing
    return () => clearTimeout(t);
  }, [load]);

  const save = async (data) => {
    setSaving(true);
    try {
      if (editing.id) await api.updateTask(editing.id, data);
      else await api.createTask(data);
      notify(editing.id ? 'Task updated.' : 'Task created.');
      setEditing(null);
      load();
    } catch (e) { notify(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const changeStatus = async (t, status) => {
    try {
      await api.updateTask(t.id, { ...t, status });
      notify('Status updated.');
      load();
    } catch (e) { notify(e.message, 'error'); }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete task "${t.title}"?`)) return;
    try { await api.deleteTask(t.id); notify('Task deleted.'); load(); }
    catch (e) { notify(e.message, 'error'); }
  };

  const setF = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <>
      <div className="page-head">
        <h1>Tasks</h1>
        <button className="btn" onClick={() => setEditing({})}>New task</button>
      </div>
      {editing && (
        <TaskForm initial={editing} projects={projects} users={users} saving={saving}
          onSubmit={save} onCancel={() => setEditing(null)} />
      )}
      <div className="filters">
        <input placeholder="Search tasks" value={filters.q} onChange={setF('q')} aria-label="Search tasks" />
        <select value={filters.status} onChange={setF('status')} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <select value={filters.project_id} onChange={setF('project_id')} aria-label="Filter by project">
          <option value="">All projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>
      {loading ? <Loader /> : <TaskTable tasks={tasks} onEdit={setEditing} onDelete={remove} onStatus={changeStatus} />}
    </>
  );
}
