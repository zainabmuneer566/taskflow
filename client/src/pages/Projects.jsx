import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import Loader from '../components/Loader.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import ProjectForm from '../components/ProjectForm.jsx';

export default function Projects({ notify }) {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, project = edit
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.projects(), api.users()])
      .then(([p, u]) => { setProjects(p); setUsers(u); })
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [notify]);

  useEffect(load, [load]);

  const save = async (data) => {
    setSaving(true);
    try {
      if (editing.id) await api.updateProject(editing.id, data);
      else await api.createProject(data);
      notify(editing.id ? 'Project updated.' : 'Project created.');
      setEditing(null);
      load();
    } catch (e) { notify(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}" and all its tasks?`)) return;
    try { await api.deleteProject(p.id); notify('Project deleted.'); load(); }
    catch (e) { notify(e.message, 'error'); }
  };

  return (
    <>
      <div className="page-head">
        <h1>Projects</h1>
        <button className="btn" onClick={() => setEditing({})}>New project</button>
      </div>
      {editing && (
        <ProjectForm initial={editing} users={users} saving={saving} onSubmit={save} onCancel={() => setEditing(null)} />
      )}
      {loading ? <Loader /> : projects.length === 0 ? (
        <p className="empty">No projects yet. Create your first project.</p>
      ) : (
        <section className="cards">
          {projects.map((p) => <ProjectCard key={p.id} project={p} onEdit={setEditing} onDelete={remove} />)}
        </section>
      )}
    </>
  );
}
