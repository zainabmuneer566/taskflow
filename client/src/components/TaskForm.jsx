import { useState } from 'react';

export default function TaskForm({ initial, projects, users, onSubmit, onCancel, saving }) {
  const [f, setF] = useState({
    project_id: '', title: '', status: 'todo', priority: 'medium', due_date: '', assigned_to: '', ...initial,
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!f.project_id) err.project_id = 'Choose a project.';
    if (f.title.trim().length < 3) err.title = 'Title must be at least 3 characters.';
    setErrors(err);
    if (!Object.keys(err).length)
      onSubmit({ ...f, due_date: f.due_date || null, assigned_to: f.assigned_to || null });
  };

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <h3>{initial?.id ? 'Edit task' : 'New task'}</h3>
      <label>Project
        <select value={f.project_id} onChange={set('project_id')}>
          <option value="">Select a project</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        {errors.project_id && <span className="error">{errors.project_id}</span>}
      </label>
      <label>Title
        <input value={f.title} onChange={set('title')} maxLength={150} />
        {errors.title && <span className="error">{errors.title}</span>}
      </label>
      <div className="grid-2">
        <label>Status
          <select value={f.status} onChange={set('status')}>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
        <label>Priority
          <select value={f.priority} onChange={set('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label>Due date
          <input type="date" value={f.due_date || ''} onChange={set('due_date')} />
        </label>
        <label>Assigned to
          <select value={f.assigned_to || ''} onChange={set('assigned_to')}>
            <option value="">Unassigned</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </label>
      </div>
      <div className="row">
        <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save task'}</button>
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
