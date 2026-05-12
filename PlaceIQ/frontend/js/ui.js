/* ============================================================
   UI UTILITIES — frontend/js/ui.js
   FIX: Added all missing helper functions that every dashboard
        calls but were never defined (caused ReferenceError on load):
        toast, openModal, closeModal, fmtDate, fmtSalary,
        matchRing, statusBadge, renderSkillTags, showSkeletons,
        renderUserChip, logout
   FIX: logout() is now globally scoped (was inside DOMContentLoaded)
   FIX: requireAuth now returns false + redirects cleanly instead
        of throwing (callers should NOT throw on its return value)
   ============================================================ */

// ── Toast notifications ────────────────────────────────────
function toast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const t = document.createElement('div');
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(t);

  setTimeout(() => {
    t.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, duration);
}
window.toast = toast;

// ── Modal helpers ──────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

window.openModal  = openModal;
window.closeModal = closeModal;

// ── Date formatter ─────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
window.fmtDate = fmtDate;

// ── Salary formatter ───────────────────────────────────────
function fmtSalary(salary) {
  if (!salary || (!salary.min && !salary.max)) return 'Not disclosed';
  const fmt = (n) => {
    if (!n) return '';
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };
  if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)}`;
  if (salary.min) return `From ${fmt(salary.min)}`;
  return `Up to ${fmt(salary.max)}`;
}
window.fmtSalary = fmtSalary;

// ── Match score ring ───────────────────────────────────────
function matchRing(score = 0) {
  const pct   = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
  return `<div class="match-ring" style="--pct:${pct};background:conic-gradient(${color} calc(${pct}*3.6deg),var(--bg-elevated) 0);">
    <span style="color:${color};">${pct}%</span>
  </div>`;
}
window.matchRing = matchRing;

// ── Application status badge ───────────────────────────────
function statusBadge(status) {
  const map = {
    applied:     ['badge-blue',   '📋 Applied'],
    shortlisted: ['badge-orange', '⭐ Shortlisted'],
    interview:   ['badge-purple', '🎤 Interview'],
    selected:    ['badge-green',  '✅ Selected'],
    rejected:    ['badge-red',    '❌ Rejected'],
    scheduled:   ['badge-blue',   '📅 Scheduled'],
    completed:   ['badge-green',  '✔ Completed'],
    cancelled:   ['badge-red',    '✕ Cancelled'],
    active:      ['badge-green',  '🟢 Active'],
    inactive:    ['badge-red',    '🔴 Inactive'],
  };
  const [cls, label] = map[status] || ['badge-blue', status];
  return `<span class="badge ${cls}">${label}</span>`;
}
window.statusBadge = statusBadge;

// ── Skill tags ─────────────────────────────────────────────
function renderSkillTags(skills = []) {
  if (!skills.length) return '<span style="color:var(--text-muted);font-size:0.78rem;">No skills listed</span>';
  return skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
}
window.renderSkillTags = renderSkillTags;

// ── Skeleton loader ────────────────────────────────────────
function showSkeletons(containerId, count = 4, height = '120px') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = Array.from({ length: count }, () =>
    `<div class="skeleton" style="height:${height};border-radius:var(--radius);"></div>`
  ).join('');
}
window.showSkeletons = showSkeletons;

// ── Render user chip in sidebar ────────────────────────────
function renderUserChip() {
  const user = API.getUser();
  if (!user) return;

  const nameEl   = document.getElementById('userName');
  const roleEl   = document.getElementById('userRole');
  const avatarEl = document.getElementById('userAvatar');

  if (nameEl)   nameEl.textContent   = user.name   || 'User';
  if (roleEl)   roleEl.textContent   = (user.role  || 'user').charAt(0).toUpperCase() + (user.role||'user').slice(1);
  if (avatarEl) {
    if (user.profilePhoto) {
      avatarEl.innerHTML = `<img src="http://localhost:5000${user.profilePhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      avatarEl.textContent = (user.name || 'U')[0].toUpperCase();
    }
  }
}
window.renderUserChip = renderUserChip;

// ── Logout ─────────────────────────────────────────────────
// FIX: Defined globally (not inside DOMContentLoaded) so sidebar button can call it
function logout() {
  API.clearAuth();
  // Navigate back to root index regardless of current folder depth
  const depth = window.location.pathname.split('/').filter(Boolean).length;
  const prefix = depth > 1 ? '../'.repeat(depth - 1) : '';
  window.location.href = prefix + 'index.html';
}
window.logout = logout;

// ── Auth guard ─────────────────────────────────────────────
// FIX: Returns false + redirects cleanly; callers must NOT throw on false
function requireAuth(expectedRole) {
  const token    = API.getToken();
  const userRole = API.getRole();

  if (!token || !userRole) {
    window.location.replace('index.html');
    return false;
  }

  if (expectedRole && userRole !== expectedRole) {
    window.location.replace('index.html');
    return false;
  }

  // Populate sidebar user chip on every authenticated page
  renderUserChip();
  return true;
}
window.requireAuth = requireAuth;

// ── Mobile sidebar toggle ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const toggle  = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // Close sidebar on outside click (mobile)
  document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) && e.target !== toggle) {
      sidebar.classList.remove('open');
    }
  });
});

// ── Chatbot (shared across all dashboards) ─────────────────
document.addEventListener('DOMContentLoaded', () => {
  const btn    = document.getElementById('chatbot-btn');
  const panel  = document.getElementById('chatbot-panel');
  const input  = document.getElementById('chatbot-input');
  const send   = document.getElementById('chatbot-send');
  const msgs   = document.getElementById('chatbot-messages');
  if (!btn || !panel) return;

  const addMsg = (text, role) => {
    const m = document.createElement('div');
    m.className = `chat-msg ${role}`;
    m.textContent = text;
    msgs.appendChild(m);
    msgs.scrollTop = msgs.scrollHeight;
  };

  // Greeting
  setTimeout(() => addMsg("Hi! I'm PlacementBot 🤖 Ask me anything about jobs, applications, or profiles!", 'bot'), 400);

  btn.addEventListener('click', () => panel.classList.toggle('open'));

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMsg(text, 'user');

    // Simple rule-based replies (replace with real API call if desired)
    const lower = text.toLowerCase();
    let reply = "I'm here to help! Try asking about jobs, your applications, or how to update your profile.";

    if (lower.includes('job') || lower.includes('apply'))
      reply = "Browse open jobs in the Jobs section! Our AI matches you based on your skills.";
    else if (lower.includes('profile') || lower.includes('resume'))
      reply = "Go to My Profile to update your skills, CGPA and upload your resume PDF.";
    else if (lower.includes('application') || lower.includes('status'))
      reply = "Check My Applications to see real-time status updates from recruiters.";
    else if (lower.includes('interview'))
      reply = "Interview invitations appear in My Applications. Check your email too!";
    else if (lower.includes('hello') || lower.includes('hi'))
      reply = "Hello! 👋 How can I help you today?";

    setTimeout(() => addMsg(reply, 'bot'), 600);
  };

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
});
