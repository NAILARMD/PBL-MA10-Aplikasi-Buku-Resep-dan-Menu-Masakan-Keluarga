/* =========================================================================
   BUKU RESEP KELUARGA — app.js (Vanilla JS, tanpa library)
   -------------------------------------------------------------------------
   STRUKTUR FILE
   1) Konstanta & ikon
   2) Utilitas
   3) DATA CONTOH (seed)
   4) Store (state terpusat + penyimpanan lokal)
   5) Adapter API  ← satu-satunya pintu data. Ganti isi fungsi di sini
                     ketika backend REST siap dipakai.
   6) UI primitif: toast, modal, dialog konfirmasi
   ========================================================================= */

'use strict';

/* ---------- 1) KONSTANTA ---------- */

const APP_VERSION = 'brk:v1';
const STORAGE_KEY = 'buku-resep-keluarga:data';
const PERSON = { name: 'Sari Rahmawati', role: 'Ibu rumah tangga', initials: 'SR' };

/* Ikon garis 24×24 (inline SVG, tanpa dependensi). */
const ICON_PATHS = {
  home: '<path d="M3 11.2 12 3.5l9 7.7"/><path d="M5.5 9.8V20a1 1 0 0 0 1 1h3.5v-6h4v6H18a1 1 0 0 0 1-1V9.8"/>',
  book: '<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v18H7.5A2.5 2.5 0 0 0 5 22z"/><path d="M5 19.5V4.5"/><path d="M9.5 6.6h5.5"/><path d="M9.5 10.4h5.5"/>',
  chart: '<path d="M4 20h16"/><path d="M7 20v-6"/><path d="M12 20V8"/><path d="M17 20V4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4.5 4.5"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  pencil: '<path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/><path d="M9 7V4.8c0-.44.36-.8.8-.8h4.4c.44 0 .8.36.8.8V7"/>',
  star: '<path d="m12 3.6 2.6 5.3 5.8.85-4.2 4.1 1 5.8-5.2-2.75-5.2 2.75 1-5.8-4.2-4.1 5.8-.85z"/>',
  starFill: '<path d="m12 3.6 2.6 5.3 5.8.85-4.2 4.1 1 5.8-5.2-2.75-5.2 2.75 1-5.8-4.2-4.1 5.8-.85z" fill="currentColor" stroke="none"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.6V12l2.9 1.9"/>',
  users: '<path d="M16 20v-1.8a3.4 3.4 0 0 0-3.4-3.4H7.4A3.4 3.4 0 0 0 4 18.2V20"/><circle cx="10" cy="8" r="3.4"/><path d="M20 20v-1.8a3.4 3.4 0 0 0-2.6-3.3"/><path d="M15.2 4.6a3.4 3.4 0 0 1 0 6.6"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.6" cy="7.6" r="1.3"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.6 4.5L19 6.5"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><path d="M12 16.5h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.5h.01"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M3.5 10h17"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  print: '<path d="M6.5 9V3.5h11V9"/><path d="M6.5 17H4.5A1.5 1.5 0 0 1 3 15.5v-5A1.5 1.5 0 0 1 4.5 9h15A1.5 1.5 0 0 1 21 10.5v5a1.5 1.5 0 0 1-1.5 1.5h-2"/><rect x="6.5" y="14" width="11" height="6.5" rx="1.2"/><path d="M17.5 12.5h.01"/>',
  download: '<path d="M12 3v11"/><path d="m7.5 10 4.5 4.5L16.5 10"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  rotate: '<path d="M4 4v5h5"/><path d="M20 20v-5h-5"/><path d="M5.6 14.6A7.5 7.5 0 0 0 19 17"/><path d="M18.4 9.4A7.5 7.5 0 0 0 5 7"/>',
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
  leaf: '<path d="M5 19C5 11 11 5 20 4c0 9-5 15-13 15z"/><path d="M5.5 18.5c2-5 5-8 9-10"/>',
  bowl: '<path d="M3.5 11h17a8.5 8.5 0 0 1-17 0z"/><path d="M9.2 7.2c0-1.5 1-2 .5-3.4"/><path d="M13.4 7.2c0-1.5 1-2 .5-3.4"/>',
  coffee: '<path d="M4.5 8.5h12v5.5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M16.5 9.5h1.75a2.75 2.75 0 0 1 0 5.5H16.5"/><path d="M7.5 4.5v1.5"/><path d="M11.5 4.5v1.5"/>',
  sunrise: '<path d="M12 3.5v4.2"/><path d="m6 8 1.6 1.6"/><path d="M18 8l-1.6 1.6"/><path d="M3 17.5h18"/><path d="M6.8 14a5.2 5.2 0 0 1 10.4 0"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2.4M12 18.8v2.4M4.3 4.3l1.7 1.7M18 18l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.3 19.7 6 18M18 6l1.7-1.7"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',
  cookie: '<circle cx="12" cy="12" r="8.6"/><circle cx="9" cy="9.6" r="1"/><circle cx="14.6" cy="8.8" r="1"/><circle cx="15.4" cy="14.2" r="1"/><circle cx="9.6" cy="15" r="1"/>',
  utensils: '<path d="M6.5 3v7.2a2 2 0 0 0 4 0V3"/><path d="M8.5 10.2V21"/><path d="M17 3c-1.8 1.4-2.4 3.4-2.4 5.6 0 1.7.8 2.7 2.4 2.7V21"/>',
  pepper: '<path d="M7 11a5 5 0 0 1 7-4.6c1 .5 1.7.6 2.6.3L18 6"/><path d="M14.2 5.6c.7-1 1.7-1.4 2.8-1.2"/><path d="M7 11c-1 2.6-.4 5.4 1.4 7.2 2 2 5.4 2.4 8.4.8"/><path d="M9.4 9.6c.9 2.6.9 6.6-.4 9.2"/>'
};

function icon(name, cls) {
  const body = ICON_PATHS[name];
  if (!body) return '';
  return '<svg class="icon' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    body + '</svg>';
}

/* Pilihan ikon untuk kategori (dipakai di modal kategori). */
const CATEGORY_ICONS = ['sunrise', 'sun', 'moon', 'cookie', 'coffee', 'bowl', 'leaf', 'utensils'];
const DEFAULT_CATEGORY_ICON = 'bowl';

/* ---------- 2) UTILITAS ---------- */

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
const appEl = $('#app');

/** Escape teks sebelum dimasukkan ke template HTML. */
function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
  });
}

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
  'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatDateLong(date) {
  const d = new Date(date);
  return DAY_NAMES[d.getDay()] + ', ' + d.getDate() + ' ' + MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear();
}
function formatDateShort(date) {
  const d = new Date(date);
  return d.getDate() + ' ' + MONTH_NAMES[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear();
}
function plural(count, word) {
  return count + ' ' + word;
}
function uid(prefix) {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}
function normalize(text) {
  return String(text == null ? '' : text).toLowerCase().trim();
}
function nowIso() { return new Date().toISOString(); }

/** Penyimpanan lokal yang aman (iframe sandbox / mode privat bisa memblokir). */
const storage = (function () {
  let available = false;
  try {
    const probe = '__brk_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    available = true;
  } catch (err) { available = false; }
  return {
    available: available,
    read: function (key) {
      if (!available) return null;
      try { return window.localStorage.getItem(key); } catch (err) { return null; }
    },
    write: function (key, value) {
      if (!available) return false;
      try { window.localStorage.setItem(key, value); return true; } catch (err) { return false; }
    },
    remove: function (key) {
      if (!available) return;
      try { window.localStorage.removeItem(key); } catch (err) { /* diamkan */ }
    }
  };
})();

/* ---------- 3) DATA CONTOH ---------- */
/* Semua angka & tanggal dibuat relatif terhadap hari ini agar demo terasa hidup. */

function seedData() {
  const day = 86400000;
  const iso = (daysAgo) => new Date(Date.now() - daysAgo * day).toISOString();

  const categories = [
    { id: 'cat-sarapan', name: 'Sarapan', icon: 'sunrise', description: 'Menu ringan untuk memulai hari.', createdAt: iso(120) },
    { id: 'cat-makan-siang', name: 'Makan Siang', icon: 'sun', description: 'Hidangan utama tengah hari.', createdAt: iso(118) },
    { id: 'cat-makan-malam', name: 'Makan Malam', icon: 'moon', description: 'Menu hangat untuk berkumpul.', createdAt: iso(116) },
    { id: 'cat-camilan', name: 'Camilan', icon: 'cookie', description: 'Kudapan sore teman minum teh.', createdAt: iso(114) }
  ];

  const recipes = [
    {
      id: 'r-soto-ayam',
      name: 'Soto Ayam Kampung',
      categoryId: 'cat-makan-siang',
      portions: 6,
      minutes: 90,
      favorite: true,
      description: 'Kuah kuning bening beraroma serai dan daun jeruk, disajikan dengan ayam suwir, soun, dan telur rebus. Resep turun-temurun yang selalu jadi menu favorit saat kumpul keluarga.',
      ingredients: [
        { name: 'Ayam kampung', quantity: '1', unit: 'ekor' },
        { name: 'Bawang merah', quantity: '8', unit: 'siung' },
        { name: 'Bawang putih', quantity: '5', unit: 'siung' },
        { name: 'Kunyit bakar', quantity: '3', unit: 'cm' },
        { name: 'Serai', quantity: '2', unit: 'batang' },
        { name: 'Daun jeruk', quantity: '5', unit: 'lembar' },
        { name: 'Kol', quantity: '200', unit: 'gram' },
        { name: 'Soun', quantity: '100', unit: 'gram' },
        { name: 'Telur ayam', quantity: '4', unit: 'butir' },
        { name: 'Garam', quantity: '1', unit: 'sdt' }
      ],
      steps: [
        'Rebus ayam bersama serai dan daun jeruk hingga empuk, angkat, lalu suwir dagingnya.',
        'Haluskan bawang merah, bawang putih, dan kunyit, kemudian tumis hingga benar-benar wangi.',
        'Masukkan bumbu tumis ke dalam kaldu rebusan ayam, bumbui garam, lalu masak selama 15 menit.',
        'Seduh soun hingga lunak, iris halus kol, dan rebus telur lalu belah menjadi dua.',
        'Tata soun, kol, telur, dan ayam suwir di dalam mangkuk saji.',
        'Siram dengan kuah panas, sajikan bersama sambal dan perasan jeruk nipis.'
      ],
      createdAt: iso(60),
      updatedAt: iso(3)
    },
    {
      id: 'r-nasi-goreng',
      name: 'Nasi Goreng Kampung',
      categoryId: 'cat-makan-malam',
      portions: 2,
      minutes: 20,
      favorite: true,
      description: 'Nasi goreng gurih dengan telur, cabai rawit, dan kecap manis. Menu andalan untuk makan malam cepat setelah hari yang panjang.',
      ingredients: [
        { name: 'Nasi putih', quantity: '400', unit: 'gram' },
        { name: 'Bawang merah', quantity: '3', unit: 'siung' },
        { name: 'Bawang putih', quantity: '2', unit: 'siung' },
        { name: 'Cabai rawit', quantity: '5', unit: 'buah' },
        { name: 'Telur ayam', quantity: '2', unit: 'butir' },
        { name: 'Kecap manis', quantity: '2', unit: 'sdm' },
        { name: 'Daun bawang', quantity: '1', unit: 'batang' },
        { name: 'Garam', quantity: '0,5', unit: 'sdt' }
      ],
      steps: [
        'Iris bawang merah, bawang putih, cabai rawit, dan daun bawang.',
        'Tumis irisan bumbu hingga harum, lalu masukkan telur dan orak-arik.',
        'Masukkan nasi putih, aduk rata dengan api besar.',
        'Tambahkan kecap manis dan garam, aduk hingga warna merata.',
        'Sajikan hangat dengan taburan daun bawang dan kerupuk.'
      ],
      createdAt: iso(58),
      updatedAt: iso(9)
    },
    {
      id: 'r-telur-dadar',
      name: 'Telur Dadar Tebal Padang',
      categoryId: 'cat-sarapan',
      portions: 3,
      minutes: 15,
      favorite: false,
      description: 'Telur dadar tebal dengan irisan bawang dan cabai, tepung beras membuat teksturnya renyah di pinggir.',
      ingredients: [
        { name: 'Telur ayam', quantity: '6', unit: 'butir' },
        { name: 'Bawang merah', quantity: '4', unit: 'siung' },
        { name: 'Cabai merah', quantity: '2', unit: 'buah' },
        { name: 'Daun bawang', quantity: '2', unit: 'batang' },
        { name: 'Tepung beras', quantity: '1', unit: 'sdm' },
        { name: 'Garam', quantity: '0,5', unit: 'sdt' }
      ],
      steps: [
        'Iris tipis bawang merah, cabai merah, dan daun bawang.',
        'Kocok telur bersama irisan bumbu, tepung beras, dan garam hingga rata.',
        'Panaskan minyak cukup banyak di wajan datar.',
        'Tuang adonan telur, masak dengan api sedang hingga kedua sisi keemasan.',
        'Angkat, tiriskan, dan sajikan dengan nasi hangat.'
      ],
      createdAt: iso(55),
      updatedAt: iso(14)
    },
    {
      id: 'r-bubur-ayam',
      name: 'Bubur Ayam Rumahan',
      categoryId: 'cat-sarapan',
      portions: 4,
      minutes: 45,
      favorite: true,
      description: 'Bubur lembut dengan kaldu ayam, suwiran ayam, kerupuk, dan cakwe. Hangat dan menenangkan, cocok untuk pagi yang dingin.',
      ingredients: [
        { name: 'Beras', quantity: '200', unit: 'gram' },
        { name: 'Ayam fillet', quantity: '250', unit: 'gram' },
        { name: 'Kaldu ayam', quantity: '1', unit: 'liter' },
        { name: 'Jahe', quantity: '2', unit: 'cm' },
        { name: 'Daun salam', quantity: '2', unit: 'lembar' },
        { name: 'Kerupuk', quantity: '50', unit: 'gram' },
        { name: 'Cakwe', quantity: '2', unit: 'buah' },
        { name: 'Kecap asin', quantity: '1', unit: 'sdm' }
      ],
      steps: [
        'Cuci beras, masak bersama kaldu ayam, jahe, dan daun salam sambil sesekali diaduk.',
        'Rebus ayam fillet hingga matang, angkat, lalu suwir halus.',
        'Masak bubur hingga lembut dan mengental, bumbui kecap asin dan garam.',
        'Sajikan bubur dengan suwiran ayam, irisan cakwe, dan kerupuk.',
        'Tambahkan sambal dan bawang goreng sesuai selera.'
      ],
      createdAt: iso(52),
      updatedAt: iso(6)
    },
    {
      id: 'r-sayur-asem',
      name: 'Sayur Asem Jakarta',
      categoryId: 'cat-makan-siang',
      portions: 5,
      minutes: 40,
      favorite: false,
      description: 'Sayur berkuah bening dengan rasa asam segar dari asam jawa, berisi labu siam, jagung, dan kacang panjang.',
      ingredients: [
        { name: 'Labu siam', quantity: '1', unit: 'buah' },
        { name: 'Jagung manis', quantity: '2', unit: 'buah' },
        { name: 'Kacang panjang', quantity: '100', unit: 'gram' },
        { name: 'Melinjo', quantity: '50', unit: 'gram' },
        { name: 'Daun melinjo', quantity: '1', unit: 'ikat' },
        { name: 'Asam jawa', quantity: '2', unit: 'sdm' },
        { name: 'Lengkuas', quantity: '2', unit: 'cm' },
        { name: 'Terasi', quantity: '1', unit: 'sdt' }
      ],
      steps: [
        'Haluskan bawang merah, bawang putih, dan terasi, lalu tumis hingga wangi.',
        'Didihkan air, masukkan jagung dan melinjo, masak hingga setengah empuk.',
        'Masukkan labu siam, kacang panjang, dan daun melinjo.',
        'Tambahkan bumbu tumis, lengkuas, dan larutan asam jawa.',
        'Masak hingga semua sayur matang, koreksi rasa lalu sajikan.'
      ],
      createdAt: iso(48),
      updatedAt: iso(20)
    },
    {
      id: 'r-ayam-bakar',
      name: 'Ayam Bakar Bumbu Kecap',
      categoryId: 'cat-makan-malam',
      portions: 4,
      minutes: 60,
      favorite: true,
      description: 'Ayam ungkep bumbu rempah lalu dibakar dengan olesan kecap dan margarin. Aroma bakarnya menggoda seluruh rumah.',
      ingredients: [
        { name: 'Ayam', quantity: '1', unit: 'ekor' },
        { name: 'Kecap manis', quantity: '5', unit: 'sdm' },
        { name: 'Bawang putih', quantity: '5', unit: 'siung' },
        { name: 'Bawang merah', quantity: '6', unit: 'siung' },
        { name: 'Ketumbar', quantity: '1', unit: 'sdt' },
        { name: 'Gula merah', quantity: '2', unit: 'sdm' },
        { name: 'Daun jeruk', quantity: '3', unit: 'lembar' },
        { name: 'Margarin', quantity: '2', unit: 'sdm' }
      ],
      steps: [
        'Haluskan bawang merah, bawang putih, ketumbar, dan gula merah.',
        'Ungkep ayam bersama bumbu halus, daun jeruk, dan sedikit air hingga empuk.',
        'Campurkan kecap manis dan margarin sebagai bahan olesan.',
        'Bakar ayam di atas bara sambil diolesi bumbu hingga kecokelatan.',
        'Sajikan dengan lalapan dan sambal terasi.'
      ],
      createdAt: iso(45),
      updatedAt: iso(4)
    },
    {
      id: 'r-pepes-ikan',
      name: 'Pepes Ikan Kembung',
      categoryId: 'cat-makan-siang',
      portions: 4,
      minutes: 35,
      favorite: false,
      description: 'Ikan kembung dibumbui rempah dan kemangi, dikukus dalam daun pisang hingga aroma herbalnya keluar.',
      ingredients: [
        { name: 'Ikan kembung', quantity: '4', unit: 'ekor' },
        { name: 'Daun kemangi', quantity: '1', unit: 'ikat' },
        { name: 'Tomat', quantity: '2', unit: 'buah' },
        { name: 'Cabai rawit', quantity: '8', unit: 'buah' },
        { name: 'Bawang merah', quantity: '5', unit: 'siung' },
        { name: 'Kunyit', quantity: '2', unit: 'cm' },
        { name: 'Daun pisang', quantity: '4', unit: 'lembar' },
        { name: 'Garam', quantity: '1', unit: 'sdt' }
      ],
      steps: [
        'Bersihkan ikan, lumuri dengan garam dan perasan jeruk nipis.',
        'Haluskan bawang merah, kunyit, dan cabai rawit.',
        'Campur ikan dengan bumbu halus, irisan tomat, dan daun kemangi.',
        'Bungkus masing-masing ikan dengan daun pisang, sematkan lidi.',
        'Kukus selama 25 menit hingga matang dan harum.'
      ],
      createdAt: iso(40),
      updatedAt: iso(11)
    },
    {
      id: 'r-pisang-goreng',
      name: 'Pisang Goreng Crispy',
      categoryId: 'cat-camilan',
      portions: 4,
      minutes: 25,
      favorite: true,
      description: 'Pisang kepok berbalut adonan tepung renyah, pas disantap sore hari bersama teh hangat.',
      ingredients: [
        { name: 'Pisang kepok', quantity: '8', unit: 'buah' },
        { name: 'Tepung terigu', quantity: '200', unit: 'gram' },
        { name: 'Tepung beras', quantity: '50', unit: 'gram' },
        { name: 'Gula pasir', quantity: '2', unit: 'sdm' },
        { name: 'Garam', quantity: '0,25', unit: 'sdt' },
        { name: 'Air', quantity: '250', unit: 'ml' },
        { name: 'Minyak goreng', quantity: '500', unit: 'ml' }
      ],
      steps: [
        'Campurkan tepung terigu, tepung beras, gula, dan garam.',
        'Tuang air sedikit demi sedikit sambil diaduk hingga adonan licin.',
        'Kupas pisang dan belah dua memanjang.',
        'Celupkan pisang ke adonan, goreng dalam minyak panas hingga keemasan.',
        'Tiriskan dan sajikan hangat.'
      ],
      createdAt: iso(30),
      updatedAt: iso(2)
    },
    {
      id: 'r-kolak',
      name: 'Kolak Pisang Ubi',
      categoryId: 'cat-camilan',
      portions: 6,
      minutes: 40,
      favorite: false,
      description: 'Kuah santan manis dengan pisang raja, ubi jalar, dan aroma pandan. Takjil klasik yang selalu dinanti.',
      ingredients: [
        { name: 'Pisang raja', quantity: '4', unit: 'buah' },
        { name: 'Ubi jalar', quantity: '300', unit: 'gram' },
        { name: 'Santan', quantity: '500', unit: 'ml' },
        { name: 'Gula merah', quantity: '100', unit: 'gram' },
        { name: 'Daun pandan', quantity: '2', unit: 'lembar' },
        { name: 'Garam', quantity: '0,25', unit: 'sdt' }
      ],
      steps: [
        'Rebus gula merah bersama air dan daun pandan hingga larut, saring.',
        'Masukkan ubi jalar yang dipotong dadu, masak hingga empuk.',
        'Tambahkan pisang raja yang dipotong serong.',
        'Tuang santan dan sedikit garam, masak dengan api kecil sambil diaduk.',
        'Angkat sebelum santan pecah, sajikan hangat atau dingin.'
      ],
      createdAt: iso(26),
      updatedAt: iso(17)
    },
    {
      id: 'r-bakwan-jagung',
      name: 'Bakwan Jagung Renyah',
      categoryId: 'cat-camilan',
      portions: 5,
      minutes: 30,
      favorite: false,
      description: 'Gorengan jagung manis dengan daun bawang, renyah di luar dan lembut di dalam. Cocok jadi teman makan siang.',
      ingredients: [
        { name: 'Jagung manis', quantity: '2', unit: 'buah' },
        { name: 'Tepung terigu', quantity: '150', unit: 'gram' },
        { name: 'Tepung beras', quantity: '30', unit: 'gram' },
        { name: 'Daun bawang', quantity: '2', unit: 'batang' },
        { name: 'Seledri', quantity: '1', unit: 'batang' },
        { name: 'Bawang putih', quantity: '2', unit: 'siung' },
        { name: 'Air', quantity: '120', unit: 'ml' },
        { name: 'Minyak goreng', quantity: '400', unit: 'ml' }
      ],
      steps: [
        'Serut jagung manis, iris daun bawang dan seledri.',
        'Haluskan bawang putih bersama garam.',
        'Campur tepung, bumbu halus, jagung, dan irisan daun, beri air hingga adonan pas.',
        'Sendokkan adonan ke minyak panas, goreng hingga keemasan.',
        'Tiriskan dan sajikan dengan cabai rawit.'
      ],
      createdAt: iso(22),
      updatedAt: iso(8)
    }
  ];

  return { version: APP_VERSION, categories: categories, recipes: recipes, savedAt: nowIso() };
}

/* ---------- 4) STORE (STATE TERPUSAT) ---------- */
/* Semua perubahan data melewati Store agar mudah diganti dengan API nyata. */

const Store = {
  data: null,

  boot: function () {
    const raw = storage.read(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === APP_VERSION && Array.isArray(parsed.recipes) && Array.isArray(parsed.categories)) {
          this.data = parsed;
          return;
        }
      } catch (err) { /* data rusak → jatuh ke data contoh */ }
    }
    this.data = seedData();
    this.persist();
  },

  persist: function () {
    this.data.savedAt = nowIso();
    storage.write(STORAGE_KEY, JSON.stringify(this.data));
  },

  reset: function () {
    this.data = seedData();
    this.persist();
  },

  /* ---- Kategori ---- */
  categories: function () {
    return this.data.categories.slice().sort(function (a, b) {
      return String(a.name).localeCompare(String(b.name), 'id');
    });
  },

  categoryById: function (id) {
    return this.data.categories.find(function (c) { return c.id === id; }) || null;
  },

  countRecipesInCategory: function (categoryId) {
    return this.data.recipes.filter(function (r) { return r.categoryId === categoryId; }).length;
  },

  createCategory: function (payload) {
    const name = String(payload.name || '').trim();
    if (!name) throw new Error('Nama kategori wajib diisi.');
    const duplicate = this.data.categories.some(function (c) {
      return normalize(c.name) === normalize(name);
    });
    if (duplicate) throw new Error('Nama kategori "' + name + '" sudah dipakai.');
    const category = {
      id: uid('cat'),
      name: name,
      icon: CATEGORY_ICONS.indexOf(payload.icon) >= 0 ? payload.icon : DEFAULT_CATEGORY_ICON,
      description: String(payload.description || '').trim(),
      createdAt: nowIso()
    };
    this.data.categories.push(category);
    this.persist();
    return category;
  },

  updateCategory: function (id, payload) {
    const category = this.categoryById(id);
    if (!category) throw new Error('Kategori tidak ditemukan.');
    const name = String(payload.name || '').trim();
    if (!name) throw new Error('Nama kategori wajib diisi.');
    const duplicate = this.data.categories.some(function (c) {
      return c.id !== id && normalize(c.name) === normalize(name);
    });
    if (duplicate) throw new Error('Nama kategori "' + name + '" sudah dipakai.');
    category.name = name;
    if (CATEGORY_ICONS.indexOf(payload.icon) >= 0) category.icon = payload.icon;
    if (typeof payload.description === 'string') category.description = payload.description.trim();
    this.persist();
    return category;
  },

  removeCategory: function (id) {
    const category = this.categoryById(id);
    if (!category) throw new Error('Kategori tidak ditemukan.');
    const used = this.countRecipesInCategory(id);
    if (used > 0) {
      throw new Error('Kategori "' + category.name + '" masih dipakai oleh ' + used +
        ' resep. Pindahkan atau hapus resep tersebut terlebih dahulu.');
    }
    this.data.categories = this.data.categories.filter(function (c) { return c.id !== id; });
    this.persist();
    return true;
  },

  /* ---- Resep ---- */
  recipes: function () {
    return this.data.recipes.slice().sort(function (a, b) {
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });
  },

  recipeById: function (id) {
    return this.data.recipes.find(function (r) { return r.id === id; }) || null;
  },

  createRecipe: function (payload) {
    const recipe = this.sanitizeRecipe(payload);
    recipe.id = uid('r');
    recipe.createdAt = nowIso();
    recipe.updatedAt = recipe.createdAt;
    this.data.recipes.push(recipe);
    this.persist();
    return recipe;
  },

  updateRecipe: function (id, payload) {
    const existing = this.recipeById(id);
    if (!existing) throw new Error('Resep tidak ditemukan.');
    const recipe = this.sanitizeRecipe(payload);
    Object.assign(existing, recipe, { updatedAt: nowIso() });
    this.persist();
    return existing;
  },

  removeRecipe: function (id) {
    const existing = this.recipeById(id);
    if (!existing) throw new Error('Resep tidak ditemukan.');
    this.data.recipes = this.data.recipes.filter(function (r) { return r.id !== id; });
    this.persist();
    return existing;
  },

  setFavorite: function (id, favorite) {
    const recipe = this.recipeById(id);
    if (!recipe) throw new Error('Resep tidak ditemukan.');
    recipe.favorite = Boolean(favorite);
    recipe.updatedAt = nowIso();
    this.persist();
    return recipe;
  },

  sanitizeRecipe: function (payload) {
    const name = String(payload.name || '').trim();
    if (!name) throw new Error('Nama resep wajib diisi.');
    if (!payload.categoryId || !this.categoryById(payload.categoryId)) {
      throw new Error('Kategori resep wajib dipilih.');
    }
    const portions = Number(payload.portions);
    const minutes = Number(payload.minutes);
    if (!portions || portions < 1) throw new Error('Porsi wajib diisi minimal 1.');
    if (!minutes || minutes < 1) throw new Error('Waktu memasak wajib diisi minimal 1 menit.');
    const ingredients = (payload.ingredients || []).map(function (item) {
      return {
        name: String(item.name || '').trim(),
        quantity: String(item.quantity == null ? '' : item.quantity).trim(),
        unit: String(item.unit || '').trim()
      };
    }).filter(function (item) { return item.name; });
    if (ingredients.length === 0) throw new Error('Tambahkan minimal satu bahan.');
    const steps = (payload.steps || []).map(function (step) {
      return String(step || '').trim();
    }).filter(Boolean);
    if (steps.length === 0) throw new Error('Tambahkan minimal satu langkah memasak.');
    return {
      name: name,
      categoryId: payload.categoryId,
      portions: portions,
      minutes: minutes,
      description: String(payload.description || '').trim(),
      favorite: Boolean(payload.favorite),
      ingredients: ingredients,
      steps: steps
    };
  },

  /* ---- Statistik ---- */
  stats: function (categoryId) {
    const scope = categoryId
      ? this.data.recipes.filter(function (r) { return r.categoryId === categoryId; })
      : this.data.recipes.slice();
    return {
      total: scope.length,
      favorites: scope.filter(function (r) { return r.favorite; }).length,
      perCategory: this.categories().map((function (cat) {
        return { id: cat.id, name: cat.name, count: this.countRecipesInCategory(cat.id) };
      }).bind(this))
    };
  }
};

/* ---------- 5) ADAPTER API ---------- */
/**
 * Semua akses data lewat objek `api`. Saat backend sudah tersedia,
 * cukup ganti isi fungsi di bawah dengan fetch(). Kontrak yang disarankan:
 *
 *   GET    /api/categories              → [{ id, name, icon, description }]
 *   POST   /api/categories              → { id, name, ... }
 *   PUT    /api/categories/:id          → { ... }
 *   DELETE /api/categories/:id          → 204 (409 jika masih dipakai resep)
 *
 *   GET    /api/recipes?q=&category=    → [{ id, name, categoryId, portions, minutes, favorite, ... }]
 *   GET    /api/recipes/:id             → detail + ingredients[] + steps[]
 *   POST   /api/recipes                 → { ...recipe }
 *   PUT    /api/recipes/:id             → { ...recipe }
 *   PATCH  /api/recipes/:id/favorite    → { favorite: true|false }
 *   DELETE /api/recipes/:id             → 204
 *
 *   GET    /api/recap?category=         → { total, favorites, perCategory: [...] }
 *
 * Bentuk data resep:
 *   { id, name, categoryId, portions, minutes, description, favorite,
 *     ingredients: [{ name, quantity, unit }], steps: ["...", "..."],
 *     createdAt, updatedAt }
 */
const api = {
  getCategories: async function () { return Store.categories(); },
  getCategory: async function (id) { return Store.categoryById(id); },
  createCategory: async function (payload) { return Store.createCategory(payload); },
  updateCategory: async function (id, payload) { return Store.updateCategory(id, payload); },
  deleteCategory: async function (id) { return Store.removeCategory(id); },

  getRecipes: async function () { return Store.recipes(); },
  getRecipe: async function (id) { return Store.recipeById(id); },
  createRecipe: async function (payload) { return Store.createRecipe(payload); },
  updateRecipe: async function (id, payload) { return Store.updateRecipe(id, payload); },
  deleteRecipe: async function (id) { return Store.removeRecipe(id); },
  updateFavorite: async function (id, favorite) { return Store.setFavorite(id, favorite); },

  getRecap: async function (categoryId) { return Store.stats(categoryId || null); }
};

/* ---------- 6) UI PRIMITIF: TOAST, MODAL, DIALOG ---------- */

const toastStack = $('#toastStack');
const modalRoot = $('#modalRoot');

const TOAST_ICON = { success: 'check', error: 'alert', info: 'info' };

let lastToast = { key: '', at: 0 };

function toast(type, title, message) {
  const kind = TOAST_ICON[type] ? type : 'info';
  const key = kind + '|' + title + '|' + (message || '');
  const now = Date.now();
  if (key === lastToast.key && now - lastToast.at < 900) return; /* cegah notifikasi ganda */
  lastToast = { key: key, at: now };

  const el = document.createElement('div');
  el.className = 'toast toast--' + kind;
  el.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  el.innerHTML =
    '<span class="toast__icon">' + icon(TOAST_ICON[kind]) + '</span>' +
    '<div class="toast__body"><strong>' + esc(title) + '</strong>' +
    (message ? '<span>' + esc(message) + '</span>' : '') + '</div>' +
    '<button class="toast__close" type="button" aria-label="Tutup notifikasi">' + icon('close') + '</button>';

  const remove = function () {
    if (!el.parentNode) return;
    el.classList.add('is-leaving');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 240);
  };
  $('.toast__close', el).addEventListener('click', remove);
  toastStack.appendChild(el);

  const items = $$('.toast', toastStack);
  if (items.length > 3) {
    items.slice(0, items.length - 3).forEach(function (node) {
      if (node.parentNode) node.parentNode.removeChild(node);
    });
  }
  setTimeout(remove, 4800);
}

/* State modal aktif */
let activeModal = null;
let modalLastFocus = null;

function showModal(options) {
  const opts = options || {};
  closeModal({ silent: true });

  modalLastFocus = document.activeElement;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML =
    '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(opts.label || opts.title || 'Dialog') + '" tabindex="-1">' +
      '<div class="modal__head">' +
        '<span class="modal__icon modal__icon--' + esc(opts.tone || 'sage') + '">' + icon(opts.icon || 'info') + '</span>' +
        '<div style="min-width:0">' +
          '<h2 id="modalTitle">' + esc(opts.title || '') + '</h2>' +
          (opts.subtitle ? '<p>' + esc(opts.subtitle) + '</p>' : '') +
        '</div>' +
        '<button class="icon-btn modal__close" type="button" data-modal="close" aria-label="Tutup dialog">' + icon('close') + '</button>' +
      '</div>' +
      '<div class="modal__body">' + (opts.body || '') + '</div>' +
      (opts.footer ? '<div class="modal__footer">' + opts.footer + '</div>' : '') +
    '</div>';

  modalRoot.appendChild(backdrop);
  document.body.classList.add('modal-open');
  activeModal = backdrop;

  requestAnimationFrame(function () { backdrop.classList.add('is-open'); });

  backdrop.addEventListener('click', function (event) {
    if (event.target === backdrop && opts.dismissible !== false) closeModal();
  });

  $$('[data-modal="close"]', backdrop).forEach(function (btn) {
    btn.addEventListener('click', function () { closeModal(); });
  });

  document.addEventListener('keydown', onModalKeydown);

  const focusTarget = $('[data-autofocus]', backdrop) || $('.modal', backdrop);
  setTimeout(function () { if (focusTarget) focusTarget.focus(); }, 60);

  if (typeof opts.onMount === 'function') opts.onMount(backdrop);
  return backdrop;
}

function onModalKeydown(event) {
  if (!activeModal) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeModal();
    return;
  }
  if (event.key === 'Tab') {
    const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', activeModal)
      .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }
}

function closeModal(opts) {
  const options = opts || {};
  if (!activeModal) return;
  const backdrop = activeModal;
  activeModal = null;
  backdrop.classList.remove('is-open');
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', onModalKeydown);
  setTimeout(function () {
    if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
  }, 220);
  if (!options.silent) {
    if (modalLastFocus && typeof modalLastFocus.focus === 'function' && document.contains(modalLastFocus)) {
      modalLastFocus.focus();
    }
    modalLastFocus = null;
  }
}

/**
 * Dialog konfirmasi generik.
 * options: { tone, icon, title, subtitle, messageHtml, confirmLabel, cancelLabel,
 *            extraNote, onConfirm(helpers), dismissible }
 */
function confirmDialog(options) {
  const opts = options || {};
  const tone = opts.tone || 'danger';
  const confirmClass = tone === 'danger' ? 'btn btn--danger' : 'btn btn--primary';
  showModal({
    label: opts.title || 'Konfirmasi',
    tone: tone === 'danger' ? 'danger' : (tone === 'tan' ? 'tan' : 'sage'),
    icon: opts.icon || (tone === 'danger' ? 'trash' : 'info'),
    title: opts.title,
    subtitle: opts.subtitle,
    dismissible: opts.dismissible !== false,
    body: '<div id="confirmBody">' + (opts.messageHtml || '<p>' + esc(opts.message || '') + '</p>') + '</div>' +
      (opts.extraNote ? '<p class="field__hint">' + opts.extraNote + '</p>' : '') +
      '<div id="confirmFeedback"></div>',
    footer:
      '<button type="button" class="btn btn--ghost" data-confirm="cancel">' + esc(opts.cancelLabel || 'Batal') + '</button>' +
      '<button type="button" class="' + confirmClass + '" data-confirm="yes" data-autofocus>' + esc(opts.confirmLabel || 'Ya, Hapus') + '</button>',
    onMount: function (backdrop) {
      const yesBtn = $('[data-confirm="yes"]', backdrop);
      const noBtn = $('[data-confirm="cancel"]', backdrop);

      const resetFeedback = function () {
        const box = $('#confirmFeedback', backdrop);
        if (box) box.innerHTML = '';
      };

      noBtn.addEventListener('click', function () { closeModal(); });
      yesBtn.addEventListener('click', function () {
        resetFeedback();
        if (typeof opts.onConfirm !== 'function') {
          if (!opts.keepOpen) closeModal();
          return;
        }

        let result;
        try {
          result = opts.onConfirm({ close: closeModal });
        } catch (err) {
          showConfirmError(backdrop, err.message || 'Terjadi kesalahan.');
          return;
        }

        if (result === false) return; /* pembatalan oleh pemanggil */

        if (result && typeof result.then === 'function') {
          yesBtn.disabled = true;
          const originalLabel = yesBtn.innerHTML;
          yesBtn.textContent = 'Memproses...';
          result.then(function (value) {
            yesBtn.disabled = false;
            yesBtn.innerHTML = originalLabel;
            if (value === false) return;
            if (!opts.keepOpen) closeModal();
          }).catch(function (err) {
            yesBtn.disabled = false;
            yesBtn.innerHTML = originalLabel;
            showConfirmError(backdrop, (err && err.message) || 'Terjadi kesalahan. Coba lagi.');
          });
          return;
        }

        if (!opts.keepOpen) closeModal();
      });
    }
  });
}

function showConfirmError(backdrop, message) {
  const box = $('#confirmFeedback', backdrop) || backdrop;
  const el = document.createElement('div');
  el.className = 'alert alert--error';
  el.style.margin = '6px 0 0';
  el.innerHTML = icon('alert') + '<span>' + esc(message) + '</span>';
  box.innerHTML = '';
  box.appendChild(el);
}
