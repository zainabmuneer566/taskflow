import StatusBadge from './StatusBadge.jsx';
import Avatar from './Avatar.jsx';

const isOverdue = (t) => t.status !== 'done' && t.due_date && t.due_date < new Date().toISOString().slice(0, 10);

export default function TaskTable({ tasks, onEdit, onDelete, onStatus }) {
  if (!tasks.length) return <p className="empty">No tasks match. Add a task to get started.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Task</th><th>Project</th><th>Priority</th><th>Status</th><th>Due</th><th>Assignee</th><th /></tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td data-label="Task" className="task-title">{t.title}</td>
              <td data-label="Project" className="muted">{t.project_title}</td>
              <td data-label="Priority"><StatusBadge value={t.priority} /></td>
              <td data-label="Status">
                <select className={`inline s-${t.status}`} value={t.status} onChange={(e) => onStatus(t, e.target.value)} aria-label="Change status">
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </td>
              <td data-label="Due" className={isOverdue(t) ? 'overdue' : ''}>
                {t.due_date || '—'}{isOverdue(t) ? ' (overdue)' : ''}
              </td>
              <td data-label="Assignee">
                <span className="assignee"><Avatar name={t.assignee_name} size={24} />{t.assignee_name || '—'}</span>
              </td>
              <td className="actions">
                <button className="btn ghost sm" onClick={() => onEdit(t)}>Edit</button>
                <button className="btn danger sm" onClick={() => onDelete(t)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
