import { useState } from 'react';

export default function ProjectForm({ initial, users, onSubmit, onCancel, saving }) {
  const [f, setF] = useState({ title: '', description: '', owner_id: '', ...initial });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (f.title.trim().length < 3) err.title = 'Title must be at least 3 characters.';
    setErrors(err);
    if (!Object.keys(err).length) onSubmit({ ...f, owner_id: f.owner_id || null });
  };

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <h3>{initial?.id ? 'Edit project' : 'New project'}</h3>
      <label>Title
        <input value={f.title} onChange={set('title')} maxLength={120} />
        {errors.title && <span className="error">{errors.title}</span>}
      </label>
      <label>Description
        <textarea rows={3} value={f.description || ''} onChange={set('description')} />
      </label>
      <label>Owner
        <select value={f.owner_id || ''} onChange={set('owner_id')}>
          <option value="">Unassigned</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </label>
      <div className="row">
        <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save project'}</button>
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
