import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Loader from '../components/Loader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Dashboard({ notify }) {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.stats(), api.tasks()])
      .then(([s, t]) => { setStats(s); setRecent(t.slice(0, 5)); })
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [notify]);

  if (loading) return <Loader />;
  if (!stats) return <p className="empty">Could not load the dashboard. Check that the API server is running.</p>;

  const items = [
    ['Projects', stats.projects],
    ['Tasks', stats.tasks],
    ['Completed', stats.done],
    ['Overdue', stats.overdue],
  ];

  return (
    <>
      <h1>Dashboard</h1>
      <section className="stats">
        {items.map(([label, n]) => (
          <div className={`card stat ${label === 'Overdue' && n > 0 ? 'alert' : ''}`} key={label}>
            <span className="stat-n">{n}</span>
            <span className="muted">{label}</span>
          </div>
        ))}
      </section>
      <h2>Next up</h2>
      <ul className="list card">
        {recent.length === 0 && <li className="muted">No tasks yet.</li>}
        {recent.map((t) => (
          <li key={t.id}>
            <span>{t.title} <span className="muted small">· {t.project_title}</span></span>
            <StatusBadge value={t.status} />
          </li>
        ))}
      </ul>
    </>
  );
}
