let CURRENT_USER = null;

async function init() {
  document.getElementById('topbarLogo').src = LOGO_DATA_URI;
  const meRes = await fetch('/api/auth/me');
  const meData = await meRes.json();
  if (!meData.user) { window.location.href = '/login.html'; return; }
  if (meData.user.role !== 'admin') { window.location.href = '/dashboard.html'; return; }
  CURRENT_USER = meData.user;

  document.getElementById('whoami').textContent = `${CURRENT_USER.name} · ${CURRENT_USER.role}`;
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });

  document.getElementById('userForm').addEventListener('submit', createUser);
  loadUsers();
}

async function createUser(e) {
  e.preventDefault();
  const errorBox = document.getElementById('formError');
  const successBox = document.getElementById('formSuccess');
  errorBox.style.display = 'none';
  successBox.style.display = 'none';

  const payload = {
    name: document.getElementById('name').value.trim(),
    username: document.getElementById('username').value.trim(),
    password: document.getElementById('password').value,
    role: document.getElementById('role').value,
  };

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not create user');
    successBox.textContent = `User "${payload.username}" created. Share the username and temporary password with them directly.`;
    successBox.style.display = 'block';
    document.getElementById('userForm').reset();
    loadUsers();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.style.display = 'block';
  }
}

async function loadUsers() {
  const res = await fetch('/api/users');
  const data = await res.json();
  const wrap = document.getElementById('usersWrap');

  const rows = data.users.map(u => `
    <tr>
      <td>${u.name}</td>
      <td class="mono">${u.username}</td>
      <td><span class="tag ${u.role === 'admin' ? 'tag-over' : 'tag-balanced'}">${u.role}</span></td>
      <td>${new Date(u.created_at).toLocaleDateString('en-AE')}</td>
      <td>
        <div class="actions-row">
          <button class="btn btn-outline btn-sm" data-reset="${u.id}" data-username="${u.username}">Reset Password</button>
          ${u.id !== CURRENT_USER.id ? `<button class="btn btn-danger btn-sm" data-delete="${u.id}">Delete</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');

  wrap.innerHTML = `
    <div style="overflow-x:auto;">
    <table class="ledger">
      <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Created</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </div>
  `;

  wrap.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this user? Their past closings will remain in the ledger.')) return;
      const res = await fetch(`/api/users/${btn.dataset.delete}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      loadUsers();
    });
  });

  wrap.querySelectorAll('[data-reset]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newPassword = prompt(`New temporary password for ${btn.dataset.username}:`);
      if (!newPassword) return;
      const res = await fetch(`/api/users/${btn.dataset.reset}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      alert('Password updated.');
    });
  });
}

init();
