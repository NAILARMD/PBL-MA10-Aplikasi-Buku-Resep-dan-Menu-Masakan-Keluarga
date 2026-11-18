/* ============================================================
   DapurKatalog — Shared App Logic
   ============================================================ */
'use strict';

/* ---------- Jam WIB real-time ---------- */
function startWibClock(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  const tick = () => { el.textContent = fmt.format(new Date()).replace(/\./g, ':') + ' WIB'; };
  tick();
  setInterval(tick, 1000);
}

/* ---------- Shortcut ⌘K / Ctrl+K untuk fokus ke pencarian ---------- */
function bindSearchShortcut() {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const input = document.getElementById('globalSearch') || document.getElementById('recipeSearch');
      if (input) input.focus();
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });
}

/* ---------- Sidebar mobile (hamburger) ---------- */
function bindSidebarToggle() {
  const btn = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  if (!btn || !sidebar) return;
  btn.addEventListener('click', () => sidebar.classList.toggle('open'));
  // Tutup sidebar saat klik di luar pada layar kecil
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024 &&
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !btn.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

/* ---------- Toast universal ---------- */
let toastTimer = null;
function showToast(title, desc, isDanger = false) {
  const toast = document.getElementById('appToast');
  if (!toast) return;
  const iconBox = toast.querySelector('.toast-icon');
  const icon = toast.querySelector('[data-toast-icon]');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastDesc').textContent = desc || '';
  if (isDanger) {
    iconBox.classList.add('danger');
    icon.innerHTML = '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>';
  } else {
    iconBox.classList.remove('danger');
    icon.innerHTML = '<circle cx="12" cy="12" r="9"></circle><polyline points="8.5 12 11 14.5 15.5 9.5"></polyline>';
  }
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}
function bindToastClose() {
  const btn = document.getElementById('toastClose');
  if (btn) btn.addEventListener('click', () => {
    clearTimeout(toastTimer);
    document.getElementById('appToast').classList.remove('show');
  });
}

/* ---------- Link modul "segera hadir" & lonceng notifikasi ---------- */
function bindSoonLinks() {
  document.querySelectorAll('[data-soon]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Modul Segera Hadir', 'Halaman ini akan tersedia pada rilis DapurKatalog berikutnya.');
    });
  });
  const bell = document.getElementById('notifBtn');
  if (bell) {
    bell.addEventListener('click', () => {
      showToast('3 Notifikasi Baru', 'Stok santan menipis • Kluwek segar tiba dari pemasok • Uji resep dijadwalkan 15:00 WIB.');
      const dot = bell.querySelector('.dot');
      if (dot) dot.remove();
    });
  }
}

/* ---------- Inisialisasi global ---------- */
document.addEventListener('DOMContentLoaded', () => {
  startWibClock('liveClock');
  bindSearchShortcut();
  bindSidebarToggle();
  bindToastClose();
  bindSoonLinks();
});
