const LABELS = { todo: 'To do', in_progress: 'In progress', done: 'Done', low: 'Low', medium: 'Medium', high: 'High' };

export default function StatusBadge({ value }) {
  return <span className={`badge b-${value}`}>{LABELS[value] || value}</span>;
}
