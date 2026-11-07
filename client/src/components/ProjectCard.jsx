export default function ProjectCard({ project, onEdit, onDelete }) {
  const pct = project.task_count ? Math.round((project.done_count / project.task_count) * 100) : 0;
  return (
    <article className="card project-card">
      <h3>{project.title}</h3>
      <p className="muted">{project.description || 'No description yet.'}</p>
      <div className="progress" aria-label={`${pct}% complete`}>
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <p className="small">
        {project.done_count} of {project.task_count} tasks done · Owner: {project.owner_name || 'Unassigned'}
      </p>
      <div className="row">
        <button className="btn ghost" onClick={() => onEdit(project)}>Edit</button>
        <button className="btn danger" onClick={() => onDelete(project)}>Delete</button>
      </div>
    </article>
  );
}
