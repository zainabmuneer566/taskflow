import Avatar from './Avatar.jsx';

export default function ProjectCard({ project, onEdit, onDelete }) {
  const pct = project.task_count ? Math.round((project.done_count / project.task_count) * 100) : 0;
  return (
    <article className="card project-card">
      <div className="pc-top">
        <h3>{project.title}</h3>
        <span className="pct">{pct}%</span>
      </div>
      <p className="muted desc">{project.description || 'No description yet.'}</p>
      <div className="progress" aria-label={`${pct}% complete`}>
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <div className="pc-meta">
        <Avatar name={project.owner_name} size={26} />
        <span className="small">{project.owner_name || 'Unassigned'}</span>
        <span className="small muted spacer">{project.done_count} of {project.task_count} tasks done</span>
      </div>
      <div className="row">
        <button className="btn ghost sm" onClick={() => onEdit(project)}>Edit</button>
        <button className="btn danger sm" onClick={() => onDelete(project)}>Delete</button>
      </div>
    </article>
  );
}
