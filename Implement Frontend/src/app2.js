/* =========================================================================
   BAGIAN 2 — TAMPILAN (VIEW), ROUTER, EVENT, INISIALISASI
   7) State UI & router
   8) Komponen tampilan bersama
   9) Halaman: Beranda, Daftar Resep, Detail, Form, Rekap
  10) Modal kategori & aksi profil
  11) Event global & inisialisasi
   ========================================================================= */

/* ---------- 7) STATE UI & ROUTER ---------- */

const ui = {
  query: '',        /* kata kunci pencarian global (dipakai Beranda? tidak; khusus daftar) */
  filter: '',       /* filter kategori di halaman Daftar Resep */
  recapFilter: '',  /* filter kategori di halaman Rekap */
  flash: null       /* notifikasi sekali-tampil antar navigasi */
};

let formState = null;   /* draft form resep */
let formDirty = false;

const Router = {
  parse: function () {
    const raw = (location.hash || '').replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean).map(decodeURIComponent);
    return { view: parts[0] || 'beranda', id: parts[1] || null, sub: parts[2] || null };
  },
  go: function (path) {
    location.hash = '#/' + String(path).replace(/^#?\/?/, '');
  },
  current: function () { return this.parse(); }
};

function setFlash(type, message) { ui.flash = { type: type, message: message }; }

function consumeFlash() {
  if (!ui.flash) return '';
  const flash = ui.flash;
  ui.flash = null;
  return alertHTML(flash.type, flash.message);
}

function alertHTML(type, message) {
  const icons = { success: 'check', error: 'alert', info: 'info' };
  return '<div class="alert alert--' + esc(type) + '">' + icon(icons[type] || 'info') +
    '<span>' + esc(message) + '</span>' +
    '<button class="alert__close" type="button" data-action="dismiss-alert" aria-label="Tutup pesan">' +
    icon('close') + '</button></div>';
}

/* ---------- 8) KOMPONEN TAMPILAN BERSAMA ---------- */

function categoryName(categoryId) {
  const category = Store.categoryById(categoryId);
  return category ? category.name : 'Tanpa kategori';
}

function categoryOptionsHTML(selectedId, includeAll) {
  const cats = Store.categories();
  return (includeAll ? '<option value="">Semua kategori</option>' : '') +
    cats.map(function (cat) {
      return '<option value="' + esc(cat.id) + '"' + (cat.id === selectedId ? ' selected' : '') + '>' +
        esc(cat.name) + '</option>';
    }).join('');
}

function categoryFilterOptionsHTML(selectedId) {
  const cats = Store.categories();
  return '<option value="">Filter kategori</option>' +
    cats.map(function (cat) {
      return '<option value="' + esc(cat.id) + '"' + (cat.id === selectedId ? ' selected' : '') + '>' +
        esc(cat.name) + '</option>';
    }).join('');
}

function starIcon(filled) { return icon(filled ? 'starFill' : 'star'); }

function dateChipHTML() {
  return '<span class="date-chip">' + icon('calendar') + esc(formatDateLong(new Date())) + '</span>';
}

function emptyStateHTML(config) {
  return '<div class="empty-state">' +
    '<span class="empty-state__icon">' + icon(config.icon || 'search') + '</span>' +
    '<h3>' + esc(config.title || 'Data tidak ditemukan') + '</h3>' +
    (config.text ? '<p>' + esc(config.text) + '</p>' : '') +
    (config.action ? config.action : '') +
    '</div>';
}

function categoryCardHTML(cat) {
  const count = Store.countRecipesInCategory(cat.id);
  return '<article class="cat-card" aria-label="Kategori ' + esc(cat.name) + '">' +
      '<span class="cat-card__icon">' + icon(cat.icon || DEFAULT_CATEGORY_ICON) + '</span>' +
      '<h3><a href="#/resep" data-action="open-category" data-id="' + esc(cat.id) + '" title="Lihat resep kategori ' + esc(cat.name) + '" style="text-decoration:none;color:inherit">' + esc(cat.name) + '</a></h3>' +
      '<p class="cat-card__count"><strong>' + count + '</strong> resep</p>' +
      (cat.description ? '<p class="cat-card__desc">' + esc(cat.description) + '</p>' : '') +
      '<div class="cat-card__actions">' +
        '<button class="btn btn--ghost btn--sm" type="button" data-action="edit-category" data-id="' + esc(cat.id) + '">' +
          icon('pencil', 'icon--sm') + 'Edit</button>' +
        '<button class="btn btn--danger-ghost btn--sm" type="button" data-action="del-category" data-id="' + esc(cat.id) + '">' +
          icon('trash', 'icon--sm') + 'Hapus</button>' +
      '</div>' +
    '</article>';
}

function recipeCardHTML(recipe, options) {
  const opts = options || {};
  const catName = categoryName(recipe.categoryId);
  const ingredientNames = (recipe.ingredients || []).slice(0, 2).map(function (i) { return i.name; });
  const restCount = Math.max((recipe.ingredients || []).length - ingredientNames.length, 0);
  const bahanText = ingredientNames.length
    ? '<b>Bahan:</b> ' + esc(ingredientNames.join(', ')) + (restCount ? ' +' + restCount + ' lainnya' : '')
    : '';

  return '<article class="recipe-card" aria-label="Resep ' + esc(recipe.name) + '">' +
      '<div class="recipe-card__top">' +
        '<span class="chip chip--cat">' + esc(catName) + '</span>' +
        '<button class="star-btn' + (recipe.favorite ? ' is-fav' : '') + '" type="button" ' +
          'data-action="toggle-fav" data-id="' + esc(recipe.id) + '" ' +
          'aria-pressed="' + (recipe.favorite ? 'true' : 'false') + '" ' +
          'aria-label="' + (recipe.favorite ? 'Lepas tanda favorit dari ' : 'Tandai ') + esc(recipe.name) + ' sebagai favorit" ' +
          'title="' + (recipe.favorite ? 'Lepas dari favorit' : 'Tandai favorit') + '">' +
          starIcon(recipe.favorite) + '</button>' +
      '</div>' +
      '<h3><a href="#/resep/' + encodeURIComponent(recipe.id) + '">' + esc(recipe.name) + '</a></h3>' +
      '<div class="recipe-card__meta">' +
        '<span>' + icon('users', 'icon--sm') + recipe.portions + ' porsi</span>' +
        '<span>' + icon('clock', 'icon--sm') + recipe.minutes + ' menit</span>' +
        (recipe.favorite ? '<span class="chip chip--fav" style="padding:2px 9px">' + icon('starFill', 'icon--sm') + 'Favorit</span>' : '') +
      '</div>' +
      (bahanText ? '<p class="recipe-card__bahan">' + bahanText + '</p>' : '') +
      '<div class="recipe-card__actions">' +
        '<a class="btn btn--primary btn--sm btn--detail" href="#/resep/' + encodeURIComponent(recipe.id) + '">Detail</a>' +
        (opts.showEdit === false ? '' :
          '<button class="btn btn--ghost btn--sm" type="button" data-action="edit-recipe" data-id="' + esc(recipe.id) + '">Edit</button>') +
        (opts.showDelete === false ? '' :
          '<button class="btn btn--danger-ghost btn--sm" type="button" data-action="del-recipe" data-id="' + esc(recipe.id) + '">Hapus</button>') +
      '</div>' +
    '</article>';
}

/** Pencarian: nama resep, nama kategori, atau bahan. */
function searchRecipes(list, query) {
  const q = normalize(query);
  if (!q) return list;
  return list.filter(function (recipe) {
    const haystack = [
      recipe.name,
      categoryName(recipe.categoryId),
      (recipe.ingredients || []).map(function (i) { return i.name + ' ' + i.quantity + ' ' + i.unit; }).join(' ')
    ].join(' ').toLowerCase();
    return haystack.indexOf(q) !== -1;
  });
}

function getFilteredRecipes() {
  let list = Store.recipes();
  if (ui.filter) {
    list = list.filter(function (r) { return r.categoryId === ui.filter; });
  }
  return searchRecipes(list, ui.query);
}

/* ---------- 9) HALAMAN ---------- */

const Views = {};

/* A. BERANDA */
Views.beranda = function () {
  const categories = Store.categories();
  const favorites = Store.recipes().filter(function (r) { return r.favorite; });
  const totalRecipes = Store.data.recipes.length;

  const catGrid = categories.length
    ? categories.map(categoryCardHTML).join('')
    : emptyStateHTML({
        icon: 'tag',
        title: 'Belum ada kategori',
        text: 'Mulai susun buku resep keluarga dengan membuat kategori pertamamu.',
        action: '<button class="btn btn--primary" type="button" data-action="add-category">' + icon('plus') + 'Tambah Kategori</button>'
      });

  const favGrid = favorites.length
    ? favorites.map(function (recipe) {
        return recipeCardHTML(recipe, { showEdit: false, showDelete: false });
      }).join('')
    : emptyStateHTML({
        icon: 'star',
        title: 'Data tidak ditemukan',
        text: 'Belum ada resep favorit. Tandai resep dengan ikon bintang agar mudah ditemukan lagi.'
      });

  return consumeFlash() +
    '<div class="page-head">' +
      '<div class="page-head__text">' +
        '<span class="eyebrow">' + icon('leaf', 'icon--sm') + 'Dapur keluarga</span>' +
        '<h1 style="margin-top:6px">Beranda</h1>' +
        '<p class="page-head__sub">Selamat datang kembali, ' + esc(PERSON.name.split(' ')[0]) +
          '. Ada <strong>' + totalRecipes + ' resep</strong> tersimpan di buku keluarga kita.</p>' +
      '</div>' +
      '<div class="page-head__actions">' + dateChipHTML() + '</div>' +
    '</div>' +

    '<section class="section" aria-labelledby="judulKategori">' +
      '<div class="section__head">' +
        '<div class="section__title-wrap">' +
          '<h2 class="section__title" id="judulKategori">Kategori Resep</h2>' +
          '<span class="chip chip--count">' + categories.length + ' kategori</span>' +
        '</div>' +
        '<button class="btn btn--soft" type="button" data-action="add-category">' + icon('plus', 'icon--sm') + 'Tambah Kategori</button>' +
      '</div>' +
      '<div class="cat-grid">' + catGrid + '</div>' +
    '</section>' +

    '<section class="section" aria-labelledby="judulFavorit">' +
      '<div class="section__head">' +
        '<div class="section__title-wrap">' +
          '<h2 class="section__title" id="judulFavorit">Resep Favorit</h2>' +
          '<span class="chip chip--count">' + favorites.length + ' resep</span>' +
        '</div>' +
        '<a class="link-more" href="#/resep">Lihat semua resep' + icon('arrowRight', 'icon--sm') + '</a>' +
      '</div>' +
      '<div class="recipe-grid">' + favGrid + '</div>' +
    '</section>';
};

/* B. DAFTAR RESEP */
Views.resep = function () {
  const list = getFilteredRecipes();
  const category = ui.filter ? Store.categoryById(ui.filter) : null;

  return consumeFlash() +
    '<div class="page-head">' +
      '<div class="page-head__text">' +
        '<span class="eyebrow">' + icon('book', 'icon--sm') + 'Koleksi resep</span>' +
        '<h1 style="margin-top:6px">Daftar Resep</h1>' +
        '<p class="page-head__sub">Semua resep keluarga dalam satu tempat — cari berdasarkan nama, kategori, atau bahan.</p>' +
      '</div>' +
    '</div>' +

    '<div class="toolbar" role="search">' +
      '<button class="btn btn--primary" type="button" data-action="add-recipe">' + icon('plus', 'icon--sm') + 'Tambah Resep</button>' +
      '<div class="toolbar__search">' +
        icon('search', 'icon--search') +
        '<label class="sr-only" for="listSearch">Cari nama, kategori, atau bahan</label>' +
        '<input id="listSearch" type="text" placeholder="Cari nama, kategori, atau bahan..." value="' + esc(ui.query) + '" autocomplete="off">' +
        '<button type="button" class="search-clear" data-action="clear-search" aria-label="Hapus pencarian">' + icon('close') + '</button>' +
      '</div>' +
      '<div class="toolbar__filter">' +
        '<label class="sr-only" for="listFilter">Filter kategori</label>' +
        '<select id="listFilter">' + categoryFilterOptionsHTML(ui.filter) + '</select>' +
        icon('chevronDown', 'icon--chev') +
      '</div>' +
    '</div>' +

    '<div class="result-meta">' +
      '<p id="resultCount">' + resultMetaHTML(list.length, category) + '</p>' +
      '<button class="link-reset" type="button" data-action="reset-filters"' + ((ui.query || ui.filter) ? '' : ' hidden') + '>Atur ulang pencarian & filter</button>' +
    '</div>' +
    '<div class="recipe-grid" id="recipeResults">' + recipeCardsHTML(list) + '</div>';
};

function resultMetaHTML(count, category) {
  if (!count) return 'Tidak ada resep yang cocok.';
  return 'Menampilkan <strong>' + count + '</strong> resep' +
    (category ? ' dalam kategori <strong>' + esc(category.name) + '</strong>' : '') +
    (ui.query ? ' untuk kata kunci <strong>“' + esc(ui.query) + '”</strong>' : '') + '.';
}

function recipeCardsHTML(list) {
  if (!list.length) {
    return emptyStateHTML({
      icon: 'search',
      title: 'Data tidak ditemukan',
      text: 'Coba kata kunci lain, ubah filter kategori, atau tambahkan resep baru ke buku keluarga.',
      action: '<button class="btn btn--primary" type="button" data-action="add-recipe">' + icon('plus') + 'Tambah Resep</button>'
    });
  }
  return list.map(function (recipe) { return recipeCardHTML(recipe); }).join('');
}

/* Memperbarui hasil tanpa me-render ulang seluruh halaman (pencarian real-time). */
function refreshRecipeResults() {
  const list = getFilteredRecipes();
  const results = $('#recipeResults');
  const counter = $('#resultCount');
  if (results) results.innerHTML = recipeCardsHTML(list);
  if (counter) counter.innerHTML = resultMetaHTML(list.length, ui.filter ? Store.categoryById(ui.filter) : null);
  const resetBtn = $('[data-action="reset-filters"]');
  if (resetBtn) resetBtn.hidden = !(ui.query || ui.filter);
}

/* C. DETAIL RESEP */
Views.detail = function (recipeId) {
  const recipe = Store.recipeById(recipeId);
  if (!recipe) {
    return '<div class="notfound"><div class="empty-state" style="margin:0 auto">' +
        '<span class="empty-state__icon">' + icon('alert') + '</span>' +
        '<h3>Resep tidak ditemukan</h3>' +
        '<p>Resep yang kamu cari mungkin sudah dihapus atau tautannya tidak valid.</p>' +
        '<a class="btn btn--primary" href="#/resep">' + icon('arrowLeft', 'icon--sm') + 'Kembali ke Daftar Resep</a>' +
      '</div></div>';
  }

  const catName = categoryName(recipe.categoryId);
  const ingredients = recipe.ingredients || [];
  const steps = recipe.steps || [];

  const ingredientRows = ingredients.length
    ? ingredients.map(function (item) {
        return '<tr><td>' + esc(item.name) + '</td>' +
          '<td class="num">' + esc(item.quantity) + '</td>' +
          '<td>' + esc(item.unit) + '</td></tr>';
      }).join('')
    : '<tr><td colspan="3" class="text-muted">Belum ada bahan yang dicatat.</td></tr>';

  const stepRows = steps.length
    ? steps.map(function (text, index) {
        return '<tr><td class="col-no"><span class="step-no">' + (index + 1) + '</span></td>' +
          '<td>' + esc(text) + '</td></tr>';
      }).join('')
    : '<tr><td colspan="2" class="text-muted">Belum ada langkah memasak.</td></tr>';

  return consumeFlash() +
    '<div class="page-head" style="margin-bottom:18px">' +
      '<div class="page-head__text">' +
        '<span class="eyebrow">' + icon('book', 'icon--sm') + 'Detail Resep</span>' +
        '<h1 style="margin-top:6px">' + esc(recipe.name) + '</h1>' +
        '<p class="page-head__sub">Disimpan ' + esc(formatDateShort(recipe.createdAt)) +
          ' · Terakhir diubah ' + esc(formatDateShort(recipe.updatedAt)) + '</p>' +
      '</div>' +
    '</div>' +

    '<article class="card detail-hero">' +
      '<div class="detail-hero__top">' +
        '<div style="min-width:0">' +
          '<div class="detail-meta">' +
            '<span class="chip chip--cat">' + icon('tag', 'icon--sm') + esc(catName) + '</span>' +
            '<span class="chip">' + icon('users', 'icon--sm') + 'Porsi: ' + recipe.portions + '</span>' +
            '<span class="chip">' + icon('clock', 'icon--sm') + 'Waktu: ' + recipe.minutes + ' menit</span>' +
            '<span class="chip">' + icon('utensils', 'icon--sm') + ingredients.length + ' bahan</span>' +
            '<span class="chip">' + icon('leaf', 'icon--sm') + steps.length + ' langkah</span>' +
          '</div>' +
        '</div>' +
        '<div class="detail-hero__actions">' +
          '<button class="btn btn--primary btn--sm" type="button" data-action="edit-recipe" data-id="' + esc(recipe.id) + '">' +
            icon('pencil', 'icon--sm') + 'Edit</button>' +
          '<button class="btn btn--danger-outline btn--sm" type="button" data-action="del-recipe" data-id="' + esc(recipe.id) + '">' +
            icon('trash', 'icon--sm') + 'Hapus</button>' +
          '<a class="btn btn--ghost btn--sm" href="#/resep">' + icon('arrowLeft', 'icon--sm') + 'Kembali</a>' +
          '<span class="detail-hero__sep" aria-hidden="true"></span>' +
          '<button class="btn-fav' + (recipe.favorite ? ' is-fav' : '') + '" type="button" ' +
            'data-action="toggle-fav" data-id="' + esc(recipe.id) + '" aria-pressed="' + (recipe.favorite ? 'true' : 'false') + '">' +
            starIcon(recipe.favorite) + (recipe.favorite ? 'Favorit' : 'Tandai Favorit') +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="desc-block">' +
        '<span class="eyebrow">Deskripsi resep</span>' +
        (recipe.description ? esc(recipe.description) : 'Deskripsi resep tampil di sini.') +
      '</div>' +
    '</article>' +

    '<div class="detail-grid">' +
      '<section class="card" aria-labelledby="judulBahan">' +
        '<div class="card__head"><h3 id="judulBahan">' + icon('bowl') + 'Bahan</h3>' +
          '<span class="chip chip--count">' + ingredients.length + ' item</span></div>' +
        '<div class="table-wrap"><table class="table">' +
          '<caption class="sr-only">Daftar bahan resep ' + esc(recipe.name) + '</caption>' +
          '<thead><tr><th scope="col">Nama bahan</th><th scope="col">Jumlah</th><th scope="col">Satuan</th></tr></thead>' +
          '<tbody>' + ingredientRows + '</tbody>' +
        '</table></div>' +
      '</section>' +

      '<section class="card" aria-labelledby="judulLangkah">' +
        '<div class="card__head"><h3 id="judulLangkah">' + icon('utensils') + 'Langkah memasak</h3>' +
          '<span class="chip chip--count">' + steps.length + ' langkah</span></div>' +
        '<div class="table-wrap"><table class="table">' +
          '<caption class="sr-only">Langkah memasak resep ' + esc(recipe.name) + '</caption>' +
          '<thead><tr><th scope="col" class="col-no">No</th><th scope="col">Instruksi</th></tr></thead>' +
          '<tbody>' + stepRows + '</tbody>' +
        '</table></div>' +
      '</section>' +
    '</div>' +

    '<div class="footer">' +
      '<span class="footer__brand">' + icon('leaf') + 'Disimpan di <b>Buku Resep Keluarga</b></span>' +
      '<span>ID resep: ' + esc(recipe.id) + '</span>' +
    '</div>';
};

/* D. FORM RESEP (TAMBAH / UBAH) */
function newFormState(recipe) {
  if (recipe) {
    return {
      id: recipe.id,
      isEdit: true,
      name: recipe.name,
      categoryId: recipe.categoryId,
      portions: String(recipe.portions),
      minutes: String(recipe.minutes),
      description: recipe.description || '',
      favorite: Boolean(recipe.favorite),
      ingredients: recipe.ingredients.map(function (i) {
        return { name: i.name, quantity: String(i.quantity), unit: i.unit };
      }),
      steps: recipe.steps.slice()
    };
  }
  return {
    id: null,
    isEdit: false,
    name: '',
    categoryId: '',
    portions: '4',
    minutes: '30',
    description: '',
    favorite: false,
    ingredients: [{ name: '', quantity: '', unit: '' }, { name: '', quantity: '', unit: '' }],
    steps: ['', '']
  };
}

Views.form = function (recipeId) {
  const recipe = recipeId ? Store.recipeById(recipeId) : null;
  if (recipeId && !recipe) {
    return Views.detail(recipeId);
  }

  formState = newFormState(recipe);
  formDirty = false;

  const categories = Store.categories();
  const categoryList = categories.length
    ? '<option value="">Pilih kategori *</option>' + categoryOptionsHTML(formState.categoryId, false)
    : '<option value="">Belum ada kategori — buat kategori dulu</option>';

  return '<div class="page-head">' +
      '<div class="page-head__text">' +
        '<span class="eyebrow">' + icon('pencil', 'icon--sm') + (formState.isEdit ? 'Ubah resep' : 'Resep baru') + '</span>' +
        '<h1 style="margin-top:6px">Form Resep (Tambah / Ubah)</h1>' +
        '<p class="page-head__sub">' + (formState.isEdit
          ? 'Perbarui catatan resep keluarga, lalu simpan perubahan.'
          : 'Catat resep baru lengkap dengan bahan dan langkah memasaknya.') + '</p>' +
      '</div>' +
      '<div class="page-head__actions">' +
        '<a class="btn btn--ghost" href="' + (formState.isEdit ? '#/resep/' + encodeURIComponent(formState.id) : '#/resep') + '" data-action="cancel-form">' +
          icon('arrowLeft', 'icon--sm') + 'Kembali</a>' +
      '</div>' +
    '</div>' +

    '<form id="recipeForm" novalidate autocomplete="off">' +
      '<div id="formAlert"></div>' +
      '<div class="form-grid">' +
        '<div class="form-col">' +
          '<div class="card"><div class="card__body" style="display:flex;flex-direction:column;gap:16px">' +
            '<div class="field" data-field="name">' +
              '<label for="fName">Nama resep <span class="req" aria-hidden="true">*</span></label>' +
              '<input class="input" id="fName" name="name" type="text" placeholder="Contoh: Soto Ayam" value="' + esc(formState.name) + '" aria-required="true" aria-describedby="fNameError">' +
              '<span class="field__error" id="fNameError">' + icon('alert') + 'Nama resep wajib diisi</span>' +
            '</div>' +

            '<div class="field" data-field="categoryId">' +
              '<label for="fCategory">Kategori <span class="req" aria-hidden="true">*</span></label>' +
              '<select class="select" id="fCategory" name="categoryId" aria-required="true" aria-describedby="fCategoryError"' + (categories.length ? '' : ' disabled') + '>' +
                categoryList +
              '</select>' +
              '<span class="field__error" id="fCategoryError">' + icon('alert') + 'Kategori wajib dipilih</span>' +
              (categories.length ? '' : '<span class="field__hint">Buat kategori terlebih dahulu di halaman Beranda.</span>') +
            '</div>' +

            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' +
              '<div class="field" data-field="portions">' +
                '<label for="fPortions">Porsi <span class="req" aria-hidden="true">*</span></label>' +
                '<div class="input-group">' +
                  '<input class="input" id="fPortions" name="portions" type="number" min="1" step="1" inputmode="numeric" value="' + esc(formState.portions) + '" aria-describedby="fPortionsError">' +
                  '<span class="input-group__suffix">porsi</span>' +
                '</div>' +
                '<span class="field__error" id="fPortionsError">' + icon('alert') + 'Porsi wajib diisi minimal 1</span>' +
              '</div>' +
              '<div class="field" data-field="minutes">' +
                '<label for="fMinutes">Waktu memasak <span class="req" aria-hidden="true">*</span></label>' +
                '<div class="input-group">' +
                  '<input class="input" id="fMinutes" name="minutes" type="number" min="1" step="1" inputmode="numeric" value="' + esc(formState.minutes) + '" aria-describedby="fMinutesError">' +
                  '<span class="input-group__suffix">menit</span>' +
                '</div>' +
                '<span class="field__error" id="fMinutesError">' + icon('alert') + 'Waktu memasak wajib diisi</span>' +
              '</div>' +
            '</div>' +

            '<div class="field">' +
              '<label for="fDescription">Deskripsi</label>' +
              '<textarea class="textarea" id="fDescription" name="description" placeholder="Deskripsi singkat resep..." rows="4">' + esc(formState.description) + '</textarea>' +
              '<span class="field__hint">Ceritakan asal resep atau tips singkat — opsional.</span>' +
            '</div>' +

            '<label class="check" for="fFavorite">' +
              '<input type="checkbox" id="fFavorite" name="favorite"' + (formState.favorite ? ' checked' : '') + '>' +
              '<span class="check__text">' +
                '<strong>' + icon('star') + 'Tandai sebagai favorit</strong>' +
                '<span>Tampil di bagian Resep Favorit pada Beranda.</span>' +
              '</span>' +
            '</label>' +
          '</div></div>' +
        '</div>' +

        '<div class="form-col">' +
          '<section class="card dyn-card" aria-labelledby="judulFormBahan">' +
            '<div class="card__head">' +
              '<h3 id="judulFormBahan">' + icon('bowl') + 'Bahan</h3>' +
              '<span class="chip chip--count" id="ingCount">' + formState.ingredients.length + ' baris</span>' +
            '</div>' +
            '<div class="card__body">' +
              '<table class="dyn-table">' +
                '<thead><tr><th scope="col">Nama bahan</th><th scope="col" style="width:78px">Jumlah</th><th scope="col" style="width:96px">Satuan</th><th scope="col" style="width:34px"><span class="sr-only">Aksi</span></th></tr></thead>' +
                '<tbody id="ingRows">' + ingredientRowsHTML(formState.ingredients) + '</tbody>' +
              '</table>' +
              '<div class="dyn-actions">' +
                '<button class="btn btn--soft btn--sm" type="button" data-action="add-ingredient">' + icon('plus', 'icon--sm') + 'Tambah Bahan</button>' +
                '<span class="dyn-error" id="ingError">' + icon('alert') + 'Tambahkan minimal satu bahan.</span>' +
              '</div>' +
              '<datalist id="unitOptions">' +
                ['gram', 'kg', 'ml', 'liter', 'sdm', 'sdt', 'siung', 'butir', 'lembar', 'batang', 'buah', 'ekor', 'ikat', 'cm', 'secukupnya']
                  .map(function (u) { return '<option value="' + u + '"></option>'; }).join('') +
              '</datalist>' +
            '</div>' +
          '</section>' +

          '<section class="card dyn-card" aria-labelledby="judulFormLangkah">' +
            '<div class="card__head">' +
              '<h3 id="judulFormLangkah">' + icon('utensils') + 'Langkah memasak</h3>' +
              '<span class="chip chip--count" id="stepCount">' + formState.steps.length + ' langkah</span>' +
            '</div>' +
            '<div class="card__body">' +
              '<table class="dyn-table">' +
                '<thead><tr><th scope="col" style="width:34px">No</th><th scope="col">Instruksi</th><th scope="col" style="width:34px"><span class="sr-only">Aksi</span></th></tr></thead>' +
                '<tbody id="stepRows">' + stepRowsHTML(formState.steps) + '</tbody>' +
              '</table>' +
              '<div class="dyn-actions">' +
                '<button class="btn btn--soft btn--sm" type="button" data-action="add-step">' + icon('plus', 'icon--sm') + 'Tambah Langkah</button>' +
                '<span class="dyn-error" id="stepError">' + icon('alert') + 'Tambahkan minimal satu langkah memasak.</span>' +
              '</div>' +
            '</div>' +
          '</section>' +
        '</div>' +
      '</div>' +

      '<div class="form-actions">' +
        '<span class="form-actions__note"><b>*</b> wajib diisi. Nomor urut langkah mengikuti urutan baris.</span>' +
        '<button class="btn btn--ghost" type="button" data-action="cancel-form" ' +
          'data-href="' + (formState.isEdit ? '#/resep/' + encodeURIComponent(formState.id) : '#/resep') + '">Batal</button>' +
        '<button class="btn btn--primary" type="submit">' + icon('check', 'icon--sm') + 'Simpan</button>' +
      '</div>' +
    '</form>';
};

function ingredientRowsHTML(ingredients) {
  return ingredients.map(function (item, index) {
    return '<tr data-ing="' + index + '">' +
      '<td><input class="cell-input" type="text" data-ing-field="name" data-index="' + index + '" placeholder="Contoh: Bawang merah" value="' + esc(item.name) + '" aria-label="Nama bahan baris ' + (index + 1) + '"></td>' +
      '<td><input class="cell-input cell-qty" type="text" inputmode="decimal" data-ing-field="quantity" data-index="' + index + '" placeholder="5" value="' + esc(item.quantity) + '" aria-label="Jumlah bahan baris ' + (index + 1) + '"></td>' +
      '<td><input class="cell-input cell-unit" type="text" list="unitOptions" data-ing-field="unit" data-index="' + index + '" placeholder="siung" value="' + esc(item.unit) + '" aria-label="Satuan bahan baris ' + (index + 1) + '"></td>' +
      '<td class="cell-del"><button class="row-del" type="button" data-action="remove-ingredient" data-index="' + index + '" aria-label="Hapus bahan baris ' + (index + 1) + '">' + icon('trash') + '</button></td>' +
    '</tr>';
  }).join('');
}

function stepRowsHTML(steps) {
  return steps.map(function (text, index) {
    return '<tr data-step="' + index + '">' +
      '<td class="cell-no"><span>' + (index + 1) + '</span></td>' +
      '<td><textarea class="cell-input" rows="2" data-step-index="' + index + '" placeholder="Contoh: Rebus ayam hingga matang" aria-label="Instruksi langkah ' + (index + 1) + '">' + esc(text) + '</textarea></td>' +
      '<td class="cell-del"><button class="row-del" type="button" data-action="remove-step" data-index="' + index + '" aria-label="Hapus langkah ' + (index + 1) + '">' + icon('trash') + '</button></td>' +
    '</tr>';
  }).join('');
}

function rerenderIngredientRows(focusIndex) {
  const tbody = $('#ingRows');
  if (!tbody) return;
  tbody.innerHTML = ingredientRowsHTML(formState.ingredients);
  const count = $('#ingCount');
  if (count) count.textContent = formState.ingredients.length + ' baris';
  if (typeof focusIndex === 'number') {
    const input = $('input[data-ing-field="name"][data-index="' + focusIndex + '"]');
    if (input) input.focus();
  }
}

function rerenderStepRows(focusIndex) {
  const tbody = $('#stepRows');
  if (!tbody) return;
  tbody.innerHTML = stepRowsHTML(formState.steps);
  const count = $('#stepCount');
  if (count) count.textContent = formState.steps.length + ' langkah';
  if (typeof focusIndex === 'number') {
    const area = $('textarea[data-step-index="' + focusIndex + '"]');
    if (area) area.focus();
  }
}

/* Validasi form — mengembalikan { ok, errors } dan menandai field. */
function validateForm(options) {
  const opts = options || {};
  const errors = {};
  const name = String(formState.name || '').trim();
  if (!name) errors.name = 'Nama resep wajib diisi';

  if (!formState.categoryId) errors.categoryId = 'Kategori wajib dipilih';
  else if (!Store.categoryById(formState.categoryId)) errors.categoryId = 'Kategori tidak dikenal';

  const portions = Number(formState.portions);
  if (!formState.portions || !portions || portions < 1) errors.portions = 'Porsi wajib diisi minimal 1';

  const minutes = Number(formState.minutes);
  if (!formState.minutes || !minutes || minutes < 1) errors.minutes = 'Waktu memasak wajib diisi minimal 1 menit';

  const validIngredients = formState.ingredients.some(function (i) { return String(i.name || '').trim(); });

  /* Tandai baris bahan yang setengah terisi (mis. jumlah tanpa nama). */
  $$('#ingRows tr').forEach(function (row, index) {
    const item = formState.ingredients[index] || {};
    const partial = (String(item.quantity || '').trim() || String(item.unit || '').trim()) &&
      !String(item.name || '').trim();
    row.classList.toggle('is-invalid', Boolean(partial));
  });

  const validSteps = formState.steps.some(function (s) { return String(s || '').trim(); });

  $$('.field[data-field]').forEach(function (field) {
    const key = field.getAttribute('data-field');
    const message = errors[key];
    field.classList.toggle('is-invalid', Boolean(message));
    const errorEl = $('.field__error', field);
    if (errorEl && message) {
      errorEl.lastChild.textContent = message;
    }
  });

  const ingError = $('#ingError');
  if (ingError) ingError.classList.toggle('is-visible', !validIngredients);
  const stepError = $('#stepError');
  if (stepError) stepError.classList.toggle('is-visible', !validSteps);

  const ok = Object.keys(errors).length === 0 && validIngredients && validSteps;

  if (!ok && opts.focus !== false) {
    const firstInvalid = $('.field.is-invalid .input, .field.is-invalid .select');
    if (firstInvalid) firstInvalid.focus();
    else {
      const firstRowInput = $('#ingRows tr.is-invalid .cell-input');
      if (firstRowInput) firstRowInput.focus();
    }
  }

  return { ok: ok, errors: errors, validIngredients: validIngredients, validSteps: validSteps };
}

/* E. REKAP RESEP */
Views.rekap = function () {
  const stats = Store.stats(ui.recapFilter || null);
  const activeCategory = ui.recapFilter ? Store.categoryById(ui.recapFilter) : null;
  const rows = activeCategory
    ? stats.perCategory.filter(function (row) { return row.id === activeCategory.id; })
    : stats.perCategory;
  const totalFromRows = rows.reduce(function (sum, row) { return sum + row.count; }, 0);
  const favorites = Store.recipes()
    .filter(function (r) { return r.favorite && (!ui.recapFilter || r.categoryId === ui.recapFilter); });

  const tableRows = rows.length
    ? rows.map(function (row) {
        return '<tr><td>' + esc(row.name) + '</td><td class="num">' + row.count + '</td></tr>';
      }).join('')
    : '<tr><td colspan="2" class="text-muted">Data tidak ditemukan.</td></tr>';

  const favRows = favorites.length
    ? favorites.map(function (recipe) {
        return '<tr>' +
          '<td><a href="#/resep/' + encodeURIComponent(recipe.id) + '" style="color:inherit;text-decoration:none;font-weight:600;border-bottom:1px solid var(--line-2)">' + esc(recipe.name) + '</a></td>' +
          '<td>' + esc(categoryName(recipe.categoryId)) + '</td>' +
          '<td class="num">' + recipe.portions + '</td>' +
          '<td class="num">' + recipe.minutes + '</td>' +
        '</tr>';
      }).join('')
    : '<tr><td colspan="4" class="text-muted">Data tidak ditemukan.</td></tr>';

  const perCat = Store.stats(null).perCategory;
  const maxCount = perCat.reduce(function (max, row) { return Math.max(max, row.count); }, 0);
  const favoriteShare = stats.total ? Math.round((stats.favorites / stats.total) * 100) : 0;

  return consumeFlash() +
    '<div class="page-head">' +
      '<div class="page-head__text">' +
        '<span class="eyebrow">' + icon('chart', 'icon--sm') + 'Ringkasan koleksi</span>' +
        '<h1 style="margin-top:6px">Rekap Resep</h1>' +
        '<p class="page-head__sub">Pantau sebaran resep per kategori dan koleksi favorit keluarga.</p>' +
      '</div>' +
      '<div class="page-head__actions">' +
        '<button class="btn btn--ghost" type="button" data-action="print-recap">' + icon('print', 'icon--sm') + 'Cetak rekap</button>' +
      '</div>' +
    '</div>' +

    '<div class="recap-filter">' +
      '<label for="recapCategory">Kategori:</label>' +
      '<select id="recapCategory">' + categoryOptionsHTML(ui.recapFilter, true) + '</select>' +
      '<button class="btn btn--primary btn--sm" type="button" data-action="apply-recap">Terapkan</button>' +
      '<span class="recap-filter__note">Filter kategori → tabel rekap → total</span>' +
    '</div>' +

    '<div class="recap-grid">' +
      '<section class="card" aria-labelledby="judulRekapTabel">' +
        '<div class="card__head">' +
          '<h3 id="judulRekapTabel">Rekap Jumlah Resep per Kategori</h3>' +
          (activeCategory ? '<span class="chip chip--cat">' + esc(activeCategory.name) + '</span>' : '<span class="chip chip--count">Semua kategori</span>') +
        '</div>' +
        '<div class="table-wrap"><table class="table table--total">' +
          '<thead><tr><th scope="col">Kategori</th><th scope="col" style="width:140px">Jumlah Resep</th></tr></thead>' +
          '<tbody>' + tableRows + '</tbody>' +
          '<tfoot><tr><td>Total</td><td class="num">' + stats.total + '</td></tr></tfoot>' +
        '</table></div>' +
        '<p class="recap-table-note">' +
          (activeCategory
            ? 'Menampilkan kategori terpilih: ' + totalFromRows + ' resep.'
            : 'Semua angka dihitung dari data aplikasi, bukan diketik manual.') +
        '</p>' +
      '</section>' +

      '<div class="stat-stack">' +
        '<div class="stat-card">' +
          icon('book') +
          '<p class="stat-card__label">Total resep</p>' +
          '<p class="stat-card__value">' + stats.total + '</p>' +
          '<p class="stat-card__sub">' + (activeCategory ? 'di kategori ' + esc(activeCategory.name) : 'Seluruh kategori') + '</p>' +
        '</div>' +
        '<div class="stat-card stat-card--tan">' +
          icon('star') +
          '<p class="stat-card__label">Total favorit</p>' +
          '<p class="stat-card__value">' + stats.favorites + '</p>' +
          '<p class="stat-card__sub">' + favoriteShare + '% dari ' + stats.total + ' resep</p>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<section class="section rekap-sub" aria-labelledby="judulFavTable">' +
      '<div class="rekap-sub__head">' +
        '<div>' +
          '<h2 id="judulFavTable">Daftar Resep Favorit</h2>' +
          '<p>' + (activeCategory ? 'Kategori ' + esc(activeCategory.name) + ' · ' : 'Semua kategori · ') +
            favorites.length + ' resep favorit' +
            (maxCount ? ' · kategori terbanyak: <b>' + esc((perCat.slice().sort(function (a, b) { return b.count - a.count; })[0] || {}).name || '-') + '</b> (' + maxCount + ' resep)' : '') +
          '</p>' +
        '</div>' +
        '<a class="link-more" href="#/resep">Kelola resep' + icon('arrowRight', 'icon--sm') + '</a>' +
      '</div>' +
      '<div class="card"><div class="table-wrap"><table class="table">' +
        '<thead><tr><th scope="col">Nama resep</th><th scope="col">Kategori</th><th scope="col" style="width:90px">Porsi</th><th scope="col" style="width:130px">Waktu (menit)</th></tr></thead>' +
        '<tbody>' + favRows + '</tbody>' +
      '</table></div></div>' +
    '</section>';
};

Views.notFound = function () {
  return '<div class="notfound"><div class="empty-state">' +
      '<span class="empty-state__icon">' + icon('search') + '</span>' +
      '<h3>Halaman tidak ditemukan</h3>' +
      '<p>Tautan yang kamu buka tidak tersedia di Buku Resep Keluarga.</p>' +
      '<a class="btn btn--primary" href="#/beranda">' + icon('home', 'icon--sm') + 'Kembali ke Beranda</a>' +
    '</div></div>';
};

/* ---------- RENDER UTAMA ---------- */

const PAGE_TITLES = {
  beranda: 'Beranda',
  resep: 'Daftar Resep',
  detail: 'Detail Resep',
  form: 'Form Resep',
  rekap: 'Rekap Resep'
};

function renderApp() {
  const route = Router.current();
  let output = '';
  let pageKey = route.view;
  let panel = route.view === 'beranda' ? 'beranda' : (route.view === 'rekap' ? 'rekap' : 'resep');

  switch (route.view) {
    case 'beranda':
      output = Views.beranda();
      break;
    case 'resep':
      if (route.id === 'baru') {
        output = Views.form(null);
        pageKey = 'form';
      } else if (route.id && route.sub === 'ubah') {
        output = Views.form(route.id);
        pageKey = 'form';
      } else if (route.id) {
        output = Views.detail(route.id);
        pageKey = 'detail';
      } else {
        output = Views.resep();
      }
      break;
    case 'rekap':
      output = Views.rekap();
      break;
    default:
      output = Views.notFound();
      pageKey = 'error';
      panel = '';
  }

  appEl.innerHTML = output;

  setActiveNav(panel);
  updateNavCounts();
  document.title = (PAGE_TITLES[pageKey] || 'Halaman tidak ditemukan') + ' · Buku Resep Keluarga';
  closeSidebar();
  $('.profile').classList.remove('is-open');
  $('#profileBtn').setAttribute('aria-expanded', 'false');

  /* Form membutuhkan fokus awal dan listener khusus setelah dirender. */
  if (pageKey === 'form') {
    bindFormEvents();
    const firstName = $('#fName');
    if (firstName && !formState.isEdit) firstName.focus({ preventScroll: true });
  }

  if (pageKey === 'resep') bindListEvents();
}

function setActiveNav(key) {
  $$('[data-nav]').forEach(function (link) {
    if (link.getAttribute('data-nav') === key) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function updateNavCounts() {
  const countEl = $('#navRecipeCount');
  if (countEl) countEl.textContent = String(Store.data.recipes.length);
}

/* ---------- 10) INTERAKSI Halaman: daftar & form ---------- */

function bindListEvents() {
  const input = $('#listSearch');
  if (input) {
    input.addEventListener('input', function () {
      ui.query = input.value;
      syncHeaderSearch();
      refreshRecipeResults();
    });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        ui.query = '';
        input.value = '';
        syncHeaderSearch();
        refreshRecipeResults();
      }
    });
  }
  const filter = $('#listFilter');
  if (filter) {
    filter.addEventListener('change', function () {
      ui.filter = filter.value;
      refreshRecipeResults();
    });
  }
}

function bindFormEvents() {
  const form = $('#recipeForm');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    handleFormSubmit();
  });

  form.addEventListener('input', function (event) {
    const target = event.target;
    if (!target) return;
    formDirty = true;

    if (target.name === 'name') formState.name = target.value;
    else if (target.name === 'categoryId') formState.categoryId = target.value;
    else if (target.name === 'portions') formState.portions = target.value;
    else if (target.name === 'minutes') formState.minutes = target.value;
    else if (target.name === 'description') formState.description = target.value;
    else if (target.name === 'favorite') formState.favorite = target.checked;
    else if (target.hasAttribute('data-ing-field')) {
      const index = Number(target.getAttribute('data-index'));
      const field = target.getAttribute('data-ing-field');
      if (formState.ingredients[index]) formState.ingredients[index][field] = target.value;
    } else if (target.hasAttribute('data-step-index')) {
      const index = Number(target.getAttribute('data-step-index'));
      formState.steps[index] = target.value;
    }

    /* Bersihkan tanda error saat pengguna mulai memperbaiki isian. */
    const field = target.closest('.field[data-field]');
    if (field) {
      const key = field.getAttribute('data-field');
      if (key === 'name' && String(formState.name).trim()) field.classList.remove('is-invalid');
      if (key === 'categoryId' && formState.categoryId) field.classList.remove('is-invalid');
      if (key === 'portions' && Number(formState.portions) >= 1) field.classList.remove('is-invalid');
      if (key === 'minutes' && Number(formState.minutes) >= 1) field.classList.remove('is-invalid');
    }
    const row = target.closest('#ingRows tr');
    if (row) row.classList.remove('is-invalid');
  });

  /* Enter pada input teks (bukan textarea) tidak boleh submit tak sengaja? Tetap boleh submit.
     Kita biarkan perilaku form standar untuk kemudahan pengisian cepat. */
}

function handleFormSubmit() {
  const result = validateForm();
  const alertBox = $('#formAlert');

  if (!result.ok) {
    const messages = [];
    if (result.errors.name) messages.push(result.errors.name);
    if (result.errors.categoryId) messages.push(result.errors.categoryId);
    if (result.errors.portions) messages.push(result.errors.portions);
    if (result.errors.minutes) messages.push(result.errors.minutes);
    if (!result.validIngredients) messages.push('Tambahkan minimal satu bahan.');
    if (!result.validSteps) messages.push('Tambahkan minimal satu langkah memasak.');
    if (alertBox) {
      alertBox.innerHTML = alertHTML('error', 'Data gagal disimpan — ' + messages.join(' · '));
    }
    toast('error', 'Data gagal disimpan', 'Periksa kolom yang ditandai merah.');
    return;
  }

  const payload = {
    name: formState.name,
    categoryId: formState.categoryId,
    portions: formState.portions,
    minutes: formState.minutes,
    description: formState.description,
    favorite: formState.favorite,
    ingredients: formState.ingredients.filter(function (i) { return String(i.name || '').trim(); }),
    steps: formState.steps.filter(function (s) { return String(s || '').trim(); })
  };

  const saveBtn = $('#recipeForm [type="submit"]');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Menyimpan...'; }

  const finish = function (saved) {
    formDirty = false;
    const message = formState.isEdit
      ? 'Perubahan resep "' + saved.name + '" berhasil disimpan.'
      : 'Resep baru "' + saved.name + '" berhasil ditambahkan.';
    setFlash('success', 'Data berhasil disimpan — ' + message);
    toast('success', 'Data berhasil disimpan', message);
    Router.go('resep/' + encodeURIComponent(saved.id));
  };

  const fail = function (err) {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = icon('check', 'icon--sm') + 'Simpan'; }
    if (alertBox) alertBox.innerHTML = alertHTML('error', 'Data gagal disimpan — ' + err.message);
    toast('error', 'Data gagal disimpan', err.message);
  };

  try {
    if (formState.isEdit) {
      api.updateRecipe(formState.id, payload).then(finish).catch(fail);
    } else {
      api.createRecipe(payload).then(finish).catch(fail);
    }
  } catch (err) { fail(err); }
}

/* ---------- 11) MODAL KATEGORI ---------- */

function openCategoryModal(category) {
  const isEdit = Boolean(category);
  const selectedIcon = isEdit ? category.icon : 'bowl';
  const iconChoices = CATEGORY_ICONS.map(function (name) {
    const id = 'catIcon-' + name;
    return '<input type="radio" name="catIcon" id="' + id + '" value="' + name + '"' +
      (name === selectedIcon ? ' checked' : '') + '>' +
      '<label for="' + id + '" title="' + name + '">' + icon(name) + '</label>';
  }).join('');

  showModal({
    label: isEdit ? 'Ubah kategori' : 'Tambah kategori',
    tone: 'sage',
    icon: isEdit ? 'pencil' : 'tag',
    title: isEdit ? 'Ubah Kategori' : 'Tambah Kategori',
    subtitle: isEdit
      ? 'Perbarui nama atau ikon kategori. Resep di dalamnya tidak terpengaruh.'
      : 'Buat kategori baru untuk merapikan koleksi resep keluarga.',
    body:
      '<div class="field" data-cat-field="name">' +
        '<label for="catName">Nama kategori <span class="req" aria-hidden="true">*</span></label>' +
        '<input class="input" id="catName" type="text" placeholder="Contoh: Masakan Berkuah" value="' + esc(isEdit ? category.name : '') + '" data-autofocus aria-describedby="catNameError">' +
        '<span class="field__error" id="catNameError">' + icon('alert') + 'Nama kategori wajib diisi</span>' +
      '</div>' +
      '<div class="field">' +
        '<label for="catDescription">Deskripsi <span class="field__hint" style="font-weight:400">(opsional)</span></label>' +
        '<input class="input" id="catDescription" type="text" placeholder="Contoh: Menu hangat untuk kumpul keluarga" value="' + esc(isEdit ? (category.description || '') : '') + '">' +
      '</div>' +
      '<div class="field">' +
        '<span class="field__label">Ikon kategori</span>' +
        '<div class="icon-picker" role="radiogroup" aria-label="Pilih ikon kategori">' + iconChoices + '</div>' +
      '</div>' +
      '<div id="catFeedback"></div>',
    footer:
      '<button class="btn btn--ghost" type="button" data-modal="close">Batal</button>' +
      '<button class="btn btn--primary" type="button" id="catSubmit">' + icon('check', 'icon--sm') + (isEdit ? 'Simpan Perubahan' : 'Tambah Kategori') + '</button>',
    onMount: function (backdrop) {
      const nameInput = $('#catName', backdrop);
      const descInput = $('#catDescription', backdrop);
      const nameField = $('[data-cat-field="name"]', backdrop);
      const feedback = $('#catFeedback', backdrop);
      const submitBtn = $('#catSubmit', backdrop);

      const attempt = function () {
        const name = nameInput.value.trim();
        nameField.classList.toggle('is-invalid', !name);
        if (!name) {
          nameInput.focus();
          feedback.innerHTML = '';
          toast('error', 'Kategori gagal disimpan', 'Nama kategori wajib diisi.');
          return;
        }
        const payload = {
          name: name,
          description: descInput.value,
          icon: ($('input[name="catIcon"]:checked', backdrop) || {}).value || 'bowl'
        };
        const done = function (saved) {
          closeModal();
          $('.profile').classList.remove('is-open');
          toast('success', isEdit ? 'Kategori diperbarui' : 'Kategori ditambahkan',
            isEdit ? 'Perubahan kategori "' + saved.name + '" tersimpan.' : 'Kategori "' + saved.name + '" siap dipakai.');
          setFlash('success', 'Data berhasil disimpan — kategori "' + saved.name + '".');
          renderApp();
        };
        const fail = function (err) {
          nameField.classList.toggle('is-invalid', /wajib|dipakai/i.test(err.message));
          feedback.innerHTML = alertHTML('error', err.message);
          toast('error', 'Kategori gagal disimpan', err.message);
        };
        try {
          if (isEdit) api.updateCategory(category.id, payload).then(done).catch(fail);
          else api.createCategory(payload).then(done).catch(fail);
        } catch (err) { fail(err); }
      };

      submitBtn.addEventListener('click', attempt);
      nameInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') { event.preventDefault(); attempt(); }
      });
      nameInput.addEventListener('input', function () {
        if (nameInput.value.trim()) nameField.classList.remove('is-invalid');
      });
    }
  });
}

function confirmDeleteCategory(category) {
  const used = Store.countRecipesInCategory(category.id);
  confirmDialog({
    tone: 'danger',
    icon: 'tag',
    title: 'Hapus kategori ini?',
    subtitle: 'Tindakan ini tidak bisa dibatalkan.',
    messageHtml:
      '<p>Kategori <b>' + esc(category.name) + '</b> akan dihapus dari daftar kategori.</p>' +
      (used > 0
        ? '<div class="alert alert--error" style="margin:12px 0 0">' + icon('alert') +
          '<span>Kategori ini masih dipakai oleh <b>' + used + ' resep</b>. Kategori tidak dapat dihapus sampai semua resep di dalamnya dipindahkan atau dihapus.</span></div>'
        : '<p class="field__hint" style="margin-top:8px">Kategori ini belum dipakai oleh resep mana pun.</p>'),
    confirmLabel: 'Ya, Hapus',
    cancelLabel: 'Batal',
    onConfirm: function () {
      return api.deleteCategory(category.id).then(function () {
        toast('success', 'Kategori dihapus', 'Kategori "' + category.name + '" telah dihapus.');
        setFlash('success', 'Data berhasil dihapus — kategori "' + category.name + '".');
        renderApp();
        return true;
      }, function (err) {
        toast('error', 'Kategori tidak bisa dihapus', err.message);
        throw err; /* tampilkan pesan di dalam dialog */
      });
    }
  });
}

function confirmDeleteRecipe(recipe, opts) {
  const options = opts || {};
  confirmDialog({
    tone: 'danger',
    icon: 'trash',
    title: 'Hapus resep ini?',
    subtitle: 'Data bahan dan langkahnya ikut terhapus.',
    messageHtml: '<p>Resep <b>' + esc(recipe.name) + '</b> beserta seluruh bahan dan langkah memasaknya akan dihapus permanen.</p>',
    confirmLabel: 'Ya, Hapus',
    cancelLabel: 'Batal',
    onConfirm: function () {
      return api.deleteRecipe(recipe.id).then(function () {
        toast('success', 'Data berhasil dihapus', 'Resep "' + recipe.name + '" telah dihapus.');
        setFlash('success', 'Data berhasil dihapus — resep "' + recipe.name + '".');
        if (options.fromDetail) Router.go('resep');
        else renderApp();
        return true;
      }, function (err) {
        toast('error', 'Data gagal dihapus', err.message);
        throw err;
      });
    }
  });
}

/* ---------- 12) AKSI GLOBAL ---------- */

const Actions = {
  'add-category': function () { openCategoryModal(null); },
  'open-category': function (id) {
    ui.filter = id;
    ui.query = '';
    const header = $('#globalSearch');
    if (header) header.value = '';
    if (Router.current().view === 'resep' && !Router.current().id) renderApp();
    else Router.go('resep');
  },
  'edit-category': function (id) {
    const category = Store.categoryById(id);
    if (category) openCategoryModal(category);
  },
  'del-category': function (id) {
    const category = Store.categoryById(id);
    if (category) confirmDeleteCategory(category);
  },
  'add-recipe': function () { Router.go('resep/baru'); },
  'edit-recipe': function (id) { Router.go('resep/' + encodeURIComponent(id) + '/ubah'); },
  'del-recipe': function (id) {
    const recipe = Store.recipeById(id);
    if (recipe) confirmDeleteRecipe(recipe, { fromDetail: Router.current().view === 'resep' && Boolean(Router.current().id) });
  },
  'toggle-fav': function (id, trigger) {
    const recipe = Store.recipeById(id);
    if (!recipe) return;
    const next = !recipe.favorite;
    try {
      api.updateFavorite(id, next);
      toast(next ? 'success' : 'info',
        next ? 'Ditandai sebagai favorit' : 'Favorit dilepas',
        'Resep "' + recipe.name + '" ' + (next ? 'kini tampil di Beranda.' : 'tidak lagi di daftar favorit.'));
      renderApp();
      if (trigger && trigger.focus && document.contains(trigger)) {
        /* fokus dikembalikan ke tombol bintang yang setara setelah render */
        const same = $('[data-action="toggle-fav"][data-id="' + id + '"]');
        if (same) same.focus({ preventScroll: true });
      }
    } catch (err) {
      toast('error', 'Gagal memperbarui favorit', err.message);
    }
  },
  'clear-search': function () {
    ui.query = '';
    const header = $('#globalSearch');
    if (header) header.value = '';
    const listSearch = $('#listSearch');
    if (listSearch) { listSearch.value = ''; listSearch.focus(); }
    refreshRecipeResults();
  },
  'reset-filters': function () {
    ui.query = '';
    ui.filter = '';
    const header = $('#globalSearch');
    if (header) header.value = '';
    renderApp();
  },
  'add-ingredient': function () {
    if (!formState) return;
    formState.ingredients.push({ name: '', quantity: '', unit: '' });
    formDirty = true;
    rerenderIngredientRows(formState.ingredients.length - 1);
  },
  'remove-ingredient': function (id, trigger) {
    if (!formState) return;
    const index = Number(trigger.getAttribute('data-index'));
    if (formState.ingredients.length <= 1) {
      formState.ingredients[0] = { name: '', quantity: '', unit: '' };
    } else {
      formState.ingredients.splice(index, 1);
    }
    formDirty = true;
    rerenderIngredientRows();
  },
  'add-step': function () {
    if (!formState) return;
    formState.steps.push('');
    formDirty = true;
    rerenderStepRows(formState.steps.length - 1);
  },
  'remove-step': function (id, trigger) {
    if (!formState) return;
    const index = Number(trigger.getAttribute('data-index'));
    if (formState.steps.length <= 1) {
      formState.steps[0] = '';
    } else {
      formState.steps.splice(index, 1);
    }
    formDirty = true;
    rerenderStepRows();
  },
  'cancel-form': function (id, trigger) {
    const target = trigger.getAttribute('href') || trigger.getAttribute('data-href');
    if (!target) return;
    if (!formDirty) {
      if (trigger.getAttribute('data-href')) Router.go(target.replace(/^#\/?/, ''));
      return; /* tautan biasa: biarkan berjalan normal */
    }

    confirmDialog({
      tone: 'tan',
      icon: 'alert',
      title: 'Buang perubahan?',
      subtitle: 'Perubahan pada form belum disimpan.',
      message: 'Jika kamu kembali sekarang, semua isian yang belum disimpan akan hilang.',
      confirmLabel: 'Ya, Buang',
      cancelLabel: 'Lanjut Mengisi',
      onConfirm: function () {
        formDirty = false;
        Router.go(target.replace(/^#\/?/, ''));
        return true;
      }
    });
  },
  'apply-recap': function () {
    const select = $('#recapCategory');
    ui.recapFilter = select ? select.value : '';
    renderApp();
    toast('info', 'Filter diterapkan', ui.recapFilter
      ? 'Rekap disaring untuk kategori "' + categoryName(ui.recapFilter) + '".'
      : 'Menampilkan rekap semua kategori.');
  },
  'print-recap': function () { window.print(); },
  'dismiss-alert': function (id, trigger) {
    const alert = trigger.closest('.alert');
    if (alert && alert.parentNode) alert.parentNode.removeChild(alert);
  },
  'open-about': function () { openAboutModal(); },
  'export-data': function () { exportData(); },
  'reset-data': function () { confirmResetData(); }
};

/* ---------- 13) PROFIL, TENTANG, EKSPOR ---------- */

function openAboutModal() {
  showModal({
    label: 'Tentang aplikasi',
    tone: 'tan',
    icon: 'book',
    title: 'Buku Resep Keluarga',
    subtitle: 'Frontend demo · HTML5 + CSS3 + JavaScript murni',
    body:
      '<p>Buku Resep Keluarga membantu keluarga menyimpan resep rumahan: kelola kategori, catat bahan dan langkah memasak, tandai favorit, lalu pantau rekap koleksi.</p>' +
      '<div class="alert alert--info" style="margin:0">' + icon('info') +
        '<span>Semua data saat ini adalah <b>data contoh</b> yang disimpan di peramban (localStorage). Tidak ada data yang dikirim ke server.</span></div>' +
      '<div class="card" style="box-shadow:none;background:var(--surface-2)"><div class="card__body" style="padding:16px 18px">' +
        '<p class="eyebrow" style="margin-bottom:8px">Siap dihubungkan ke backend</p>' +
        '<p style="font-size:13.5px;line-height:1.7">Seluruh akses data melewati objek <b>api</b> di dalam <b>app.js</b>. ' +
        'Ganti isi fungsinya dengan <b>fetch()</b> ke endpoint REST, lalu sesuaikan bentuk data pada pemanggil. ' +
        'Struktur yang disarankan: <b>GET/POST/PUT/DELETE /api/categories</b> dan <b>/api/recipes</b>.</p>' +
      '</div></div>' +
      '<p class="field__hint">Versi ' + esc(APP_VERSION) + ' · Dibuat untuk latihan PBL IF-MA10.</p>',
    footer: '<button class="btn btn--primary" type="button" data-modal="close">Mengerti</button>'
  });
}

function exportData() {
  try {
    const blob = new Blob([JSON.stringify(Store.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'buku-resep-keluarga-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    toast('success', 'Data contoh diunduh', 'Berkas JSON dapat dipakai untuk menyiapkan backend.');
  } catch (err) {
    toast('error', 'Gagal mengunduh data', 'Peramban memblokir unduhan pada mode ini.');
  }
  $('.profile').classList.remove('is-open');
  $('#profileBtn').setAttribute('aria-expanded', 'false');
}

function confirmResetData() {
  closeProfile();
  confirmDialog({
    tone: 'tan',
    icon: 'rotate',
    title: 'Muat ulang data contoh?',
    subtitle: 'Seluruh perubahan akan dikembalikan ke data awal.',
    messageHtml: '<p>Resep dan kategori yang kamu tambahkan, ubah, atau hapus akan <b>hilang</b> dan diganti dengan data contoh awal.</p>',
    confirmLabel: 'Ya, Muat Ulang',
    cancelLabel: 'Batal',
    onConfirm: function () {
      Store.reset();
      ui.query = '';
      ui.filter = '';
      ui.recapFilter = '';
      const header = $('#globalSearch');
      if (header) header.value = '';
      toast('success', 'Data contoh dimuat ulang', Store.data.recipes.length + ' resep siap dijelajahi.');
      setFlash('info', 'Data contoh berhasil dimuat ulang.');
      renderApp();
      return true;
    }
  });
}

function closeProfile() {
  $('.profile').classList.remove('is-open');
  $('#profileBtn').setAttribute('aria-expanded', 'false');
}

/* ---------- 14) SIDEBAR & HEADER ---------- */

function openSidebar() {
  document.body.classList.add('sidebar-open');
  $('#sidebarBackdrop').hidden = false;
  $('#navToggle').setAttribute('aria-expanded', 'true');
  const firstLink = $('.nav-link', $('#sidebar'));
  if (firstLink) firstLink.focus({ preventScroll: true });
}

function closeSidebar() {
  if (!document.body.classList.contains('sidebar-open')) return;
  document.body.classList.remove('sidebar-open');
  $('#navToggle').setAttribute('aria-expanded', 'false');
  setTimeout(function () {
    if (!document.body.classList.contains('sidebar-open')) $('#sidebarBackdrop').hidden = true;
  }, 260);
}

function syncHeaderSearch() {
  const header = $('#globalSearch');
  if (header && header.value !== ui.query) header.value = ui.query;
}

/* ---------- 15) INISIALISASI ---------- */

function showPreviewNote() {
  if (location.protocol !== 'file:') return;
  const note = document.createElement('div');
  note.className = 'file-protocol-note';
  note.innerHTML = icon('info') +
    '<span>Mode pratinjau berkas: data disimpan di memori sesi. Unduh dan buka lewat server lokal agar penyimpanan peramban aktif.</span>';
  document.body.insertBefore(note, document.querySelector('.app-shell'));
}

function init() {
  Store.boot();
  showPreviewNote();

  if (!storage.available) {
    const mode = $('#profileMode');
    if (mode) mode.textContent = 'Mode data contoh · tanpa penyimpanan lokal';
  }

  /* Navigasi hash */
  window.addEventListener('hashchange', function () {
    renderApp();
    window.scrollTo({ top: 0, behavior: 'auto' });
  });

  /* Delegasi klik untuk semua aksi data-action */
  document.addEventListener('click', function (event) {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;
    const action = trigger.getAttribute('data-action');
    const handler = Actions[action];
    if (!handler) return;

    /* Aksi cancel-form menangani sendiri tautannya. */
    if (action === 'cancel-form') {
      event.preventDefault();
      handler(null, trigger);
      return;
    }

    /* Tautan yang memicu aksi pembuka form tidak perlu menavigasi sendiri. */
    if (trigger.tagName === 'A') event.preventDefault();
    const id = trigger.getAttribute('data-id');
    handler(id, trigger);
  });

  /* Header: pencarian global */
  const headerSearch = $('#globalSearch');
  const headerForm = $('#globalSearchForm');
  if (headerForm) {
    headerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (Router.current().view !== 'resep' || Router.current().id) Router.go('resep');
    });
  }
  if (headerSearch) {
    headerSearch.addEventListener('input', function () {
      ui.query = headerSearch.value;
      const route = Router.current();
      if (route.view !== 'resep' || route.id) {
        Router.go('resep');
        return;
      }
      const listSearch = $('#listSearch');
      if (listSearch) listSearch.value = ui.query;
      refreshRecipeResults();
    });
    headerSearch.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        headerSearch.value = '';
        ui.query = '';
        if (Router.current().view === 'resep' && !Router.current().id) {
          const listSearch = $('#listSearch');
          if (listSearch) listSearch.value = '';
          refreshRecipeResults();
        }
      }
    });
  }
  const headerClear = $('#globalSearchClear');
  if (headerClear) {
    headerClear.addEventListener('click', function () {
      headerSearch.value = '';
      ui.query = '';
      if (Router.current().view === 'resep' && !Router.current().id) {
        const listSearch = $('#listSearch');
        if (listSearch) listSearch.value = '';
        refreshRecipeResults();
      }
      headerSearch.focus();
    });
  }

  /* Shortcut "/" untuk fokus pencarian */
  document.addEventListener('keydown', function (event) {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || (document.activeElement && document.activeElement.isContentEditable)) return;
    event.preventDefault();
    headerSearch.focus();
  });

  /* Profil dropdown */
  const profileBtn = $('#profileBtn');
  if (profileBtn) {
    profileBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      const profile = $('#profile');
      const open = profile.classList.toggle('is-open');
      profileBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        const first = $('#profileDropdown .dropdown__item');
        if (first) first.focus({ preventScroll: true });
      }
    });
  }
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.profile')) closeProfile();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeProfile();
  });

  /* Sidebar mobile */
  const navToggle = $('#navToggle');
  if (navToggle) navToggle.addEventListener('click', openSidebar);
  const sidebarClose = $('#sidebarClose');
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  const backdrop = $('#sidebarBackdrop');
  if (backdrop) {
    backdrop.hidden = true;
    backdrop.addEventListener('click', closeSidebar);
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeSidebar();
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 960) closeSidebar();
  });

  /* Selaraskan nilai pencarian global dengan state saat pertama dimuat */
  syncHeaderSearch();

  if (!location.hash) {
    location.replace('#/beranda');
  }
  renderApp();
}

document.addEventListener('DOMContentLoaded', init);
