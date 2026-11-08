import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Loader from '../components/Loader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Icon from '../components/Icon.jsx';
import Avatar from '../components/Avatar.jsx';

const STATUS_META = [
  ['todo', 'To do', 'var(--muted)'],
  ['in_progress', 'In progress', 'var(--warn)'],
  ['done', 'Done', 'var(--ok)'],
];

// Presentational part (kept separate so it is easy to test and restyle)
export function DashboardView({ stats, tasks }) {
  const counts = { todo: 0, in_progress: 0, done: 0 };
  tasks.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
  const total = tasks.length;
  const upcoming = tasks.filter((t) => t.status !== 'done').slice(0, 5);
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const items = [
    ['projects', 'Projects', stats.projects, 'folder'],
    ['tasks', 'Tasks', stats.tasks, 'tasks'],
    ['done', 'Completed', stats.done, 'check'],
    ['overdue', 'Overdue', stats.overdue, 'alert'],
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted subtitle">{today}</p>
        </div>
      </div>

      <section className="stats">
        {items.map(([key, label, n, icon]) => (
          <div className={`card stat s-${key}`} key={key}>
            <span className="stat-icon"><Icon name={icon} /></span>
            <div>
              <span className="stat-n">{n}</span>
              <span className="muted stat-label">{label}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="dash-grid">
        <section className="card">
          <h2 className="card-title">Task progress</h2>
          {total === 0 ? <p className="muted">No tasks yet.</p> : (
            <>
              <div className="breakdown-bar" role="img" aria-label="Tasks by status">
                {STATUS_META.map(([key, , color]) => counts[key] > 0 && (
                  <span key={key} style={{ width: `${(counts[key] / total) * 100}%`, background: color }} />
                ))}
              </div>
              <ul className="legend">
                {STATUS_META.map(([key, label, color]) => (
                  <li key={key}><span className="dot" style={{ background: color }} />{label}<strong>{counts[key]}</strong></li>
                ))}
              </ul>
              <p className="small muted">{Math.round((counts.done / total) * 100)}% of all tasks are complete.</p>
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Next up</h2>
          <ul className="list">
            {upcoming.length === 0 && <li className="muted">You are all caught up.</li>}
            {upcoming.map((t) => (
              <li key={t.id}>
                <Avatar name={t.assignee_name} size={30} />
                <span className="li-main">
                  <span className="li-title">{t.title}</span>
                  <span className="muted small">{t.project_title}{t.due_date ? ` · due ${t.due_date}` : ''}</span>
                </span>
                <StatusBadge value={t.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

export default function Dashboard({ notify }) {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.stats(), api.tasks()])
      .then(([s, t]) => { setStats(s); setTasks(t); })
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [notify]);

  if (loading) return <Loader />;
  if (!stats) return <p className="empty">Could not load the dashboard. Check that the API server is running.</p>;
  return <DashboardView stats={stats} tasks={tasks} />;
}
