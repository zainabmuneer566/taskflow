-- TaskFlow schema (PostgreSQL)
-- Run: psql -U postgres -c "CREATE DATABASE taskflow;"  then  psql -U postgres -d taskflow -f database/schema.sql

DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(120) NOT NULL,
  description TEXT,
  owner_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       VARCHAR(150) NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'todo'   CHECK (status IN ('todo','in_progress','done')),
  priority    VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  due_date    DATE,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_status  ON tasks(status);

-- Sample data
INSERT INTO users (name, email) VALUES
  ('Zainab Muneer', 'zainab@example.com'),
  ('Ayesha Khan',   'ayesha@example.com'),
  ('Ali Raza',      'ali@example.com');

INSERT INTO projects (title, description, owner_id) VALUES
  ('Company Website',  'Redesign the public website',          1),
  ('Mobile App MVP',   'First release of the Flutter app',     2);

INSERT INTO tasks (project_id, title, status, priority, due_date, assigned_to) VALUES
  (1, 'Design homepage layout', 'done',        'high',   CURRENT_DATE - 2, 1),
  (1, 'Build contact form',     'in_progress', 'medium', CURRENT_DATE + 3, 1),
  (1, 'Write project README',   'todo',        'low',    CURRENT_DATE + 7, 3),
  (2, 'Set up login screen',    'in_progress', 'high',   CURRENT_DATE + 1, 2),
  (2, 'Connect REST API',       'todo',        'high',   CURRENT_DATE - 1, 2);
