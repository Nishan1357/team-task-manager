const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (window.location.pathname === '/dashboard') {
  if (!token) window.location.href = '/';
  else init();
}

function authHeaders() {
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function logout() {
  localStorage.clear();
  window.location.href = '/';
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  if (res.status === 401) { logout(); return; }
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

let currentProject = null;
let allUsers = [];

async function init() {
  document.getElementById('user-info').textContent = `${user.name} (${user.role})`;
  await loadDashboard();
  await loadProjects();
  allUsers = await api('/api/users/');
}

async function loadDashboard() {
  const stats = await api('/api/dashboard');
  document.getElementById('stats').innerHTML = `
    <div class="stat-card"><h3>${stats.total_tasks}</h3><p>Total Tasks</p></div>
    <div class="stat-card"><h3>${stats.todo}</h3><p>To Do</p></div>
    <div class="stat-card"><h3>${stats.in_progress}</h3><p>In Progress</p></div>
    <div class="stat-card"><h3>${stats.done}</h3><p>Completed</p></div>
    <div class="stat-card stat-overdue"><h3>${stats.overdue}</h3><p>Overdue</p></div>
  `;
}

async function loadProjects() {
  const projects = await api('/api/projects/');
  const html = projects.map(p => `
    <div class="project-card" onclick="openProject(${p.id})">
      <h3>${escapeHtml(p.name)}</h3>
      <p>${escapeHtml(p.description || 'No description')}</p>
      <p style="margin-top:10px;font-size:12px;">👥 ${p.members.length} members</p>
    </div>
  `).join('') || '<p>No projects yet. Create one!</p>';
  document.getElementById('projects-list').innerHTML = html;
}

async function openProject(id) {
  currentProject = await api(`/api/projects/${id}`);
  document.getElementById('tasks-section').classList.remove('hidden');
  document.getElementById('project-title').textContent = currentProject.name;

  const isOwnerOrAdmin = currentProject.owner_id === user.id || user.role === 'admin';
  document.getElementById('add-member-btn').style.display = isOwnerOrAdmin ? 'inline-block' : 'none';

  document.getElementById('members-list').innerHTML = currentProject.members.map(m =>
    `<span class="member-chip">${escapeHtml(m.name)} ${m.id === currentProject.owner_id ? '👑' : ''}</span>`
  ).join('');

  await loadTasks();
}

async function loadTasks() {
  const tasks = await api(`/api/projects/${currentProject.id}/tasks`);
  const isOwnerOrAdmin = currentProject.owner_id === user.id || user.role === 'admin';

  document.querySelectorAll('.column').forEach(col => {
    const status = col.dataset.status;
    const filtered = tasks.filter(t => t.status === status);
    col.querySelector('.tasks').innerHTML = filtered.map(t => {
      const isOverdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done';
      const canEdit = isOwnerOrAdmin || t.assignee_id === user.id;
      return `
        <div class="task-card priority-${t.priority} ${isOverdue ? 'overdue' : ''}">
          <h4>${escapeHtml(t.title)}</h4>
          <p>${escapeHtml(t.description || '')}</p>
          <div class="task-meta">
            <span>👤 ${t.assignee ? escapeHtml(t.assignee.name) : 'Unassigned'}</span>
            <span>${t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No due'}</span>
          </div>
          ${canEdit ? `
          <div class="task-actions">
            <select onchange="updateTaskStatus(${t.id}, this.value)">
              <option value="todo" ${t.status==='todo'?'selected':''}>To Do</option>
              <option value="in_progress" ${t.status==='in_progress'?'selected':''}>In Progress</option>
              <option value="done" ${t.status==='done'?'selected':''}>Done</option>
            </select>
            ${isOwnerOrAdmin ? `<button onclick="deleteTask(${t.id})">🗑</button>` : ''}
          </div>` : ''}
        </div>
      `;
    }).join('');
  });

  await loadDashboard();
}

async function updateTaskStatus(taskId, status) {
  try {
    await api(`/api/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify({ status }) });
    await loadTasks();
  } catch (e) { alert(e.message); }
}

async function deleteTask(taskId) {
  if (!confirm('Delete this task?')) return;
  await api(`/api/tasks/${taskId}`, { method: 'DELETE' });
  await loadTasks();
}

function openModal(html) {
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal() { document.getElementById('modal').classList.add('hidden'); }

function showCreateProject() {
  openModal(`
    <h2>Create Project</h2>
    <form onsubmit="createProject(event)">
      <input name="name" placeholder="Project name" required minlength="2">
      <textarea name="description" placeholder="Description" rows="3"></textarea>
      <button type="submit">Create</button>
    </form>
  `);
}

async function createProject(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  await api('/api/projects/', {
    method: 'POST',
    body: JSON.stringify({ name: fd.get('name'), description: fd.get('description') }),
  });
  closeModal();
  await loadProjects();
}

function showCreateTask() {
  const memberOptions = currentProject.members.map(m =>
    `<option value="${m.id}">${escapeHtml(m.name)}</option>`).join('');
  openModal(`
    <h2>Create Task</h2>
    <form onsubmit="createTask(event)">
      <input name="title" placeholder="Title" required>
      <textarea name="description" placeholder="Description" rows="3"></textarea>
      <select name="priority">
        <option value="low">Low Priority</option>
        <option value="medium" selected>Medium Priority</option>
        <option value="high">High Priority</option>
      </select>
      <select name="assignee_id">
        <option value="">Unassigned</option>${memberOptions}
      </select>
      <input name="due_date" type="datetime-local">
      <button type="submit">Create</button>
    </form>
  `);
}

async function createTask(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = {
    title: fd.get('title'),
    description: fd.get('description'),
    priority: fd.get('priority'),
    assignee_id: fd.get('assignee_id') ? parseInt(fd.get('assignee_id')) : null,
    due_date: fd.get('due_date') || null,
  };
  await api(`/api/projects/${currentProject.id}/tasks`, {
    method: 'POST', body: JSON.stringify(body),
  });
  closeModal();
  await loadTasks();
}

function showAddMember() {
  const currentIds = currentProject.members.map(m => m.id);
  const available = allUsers.filter(u => !currentIds.includes(u.id));
  if (available.length === 0) return alert('All users already added');
  const opts = available.map(u => `<option value="${u.id}">${escapeHtml(u.name)} (${u.email})</option>`).join('');
  openModal(`
    <h2>Add Member</h2>
    <form onsubmit="addMember(event)">
      <select name="user_id" required>${opts}</select>
      <button type="submit">Add</button>
    </form>
  `);
}

async function addMember(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  await api(`/api/projects/${currentProject.id}/members`, {
    method: 'POST', body: JSON.stringify({ user_id: parseInt(fd.get('user_id')) }),
  });
  closeModal();
  await openProject(currentProject.id);
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}