// Single place for all backend calls
async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data.errors || ['Something went wrong.']).join(' '));
  return data;
}

export const api = {
  stats: () => request('/stats'),
  users: () => request('/users'),
  projects: () => request('/projects'),
  createProject: (b) => request('/projects', { method: 'POST', body: b }),
  updateProject: (id, b) => request(`/projects/${id}`, { method: 'PUT', body: b }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  tasks: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/tasks${qs ? `?${qs}` : ''}`);
  },
  createTask: (b) => request('/tasks', { method: 'POST', body: b }),
  updateTask: (id, b) => request(`/tasks/${id}`, { method: 'PUT', body: b }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
