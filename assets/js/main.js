const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const STORAGE_KEY = "elibrary_figma_state_v5_unpam";
const PAGE_SIZE_BOOKS = 10;
const PAGE_SIZE_CATEGORIES = 5;
const PAGE_SIZE_MEMBERS = 10;
const PAGE_SIZE_REPORT = 10;

let bookPage = 1;
let categoryPage = 1;
let memberPage = 1;
let reportPage = 1;

function todayISO(){ return new Date().toISOString().slice(0,10); }
function addDaysISO(days){ const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0,10); }
function formatDate(input){
  if(!input) return "-";
  if(/[A-Za-z]/.test(String(input))) return input;
  const d = new Date(input + "T00:00:00");
  return d.toLocaleDateString("id-ID", {day:"2-digit", month:"short", year:"numeric"}).replace(".","");
}
function rupiah(n){ return "Rp " + Number(n || 0).toLocaleString("id-ID"); }
function initials(name){ return (name || "A").split(" ").filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase(); }
function slug(text){ return String(text).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }

function buildDefaultState(){
  const categories = [
    {name:"Teknologi", icon:"chip"},
    {name:"Sains", icon:"flask"},
    {name:"Fiksi & Novel", icon:"book"},
    {name:"Sejarah", icon:"history"},
    {name:"Ekonomi", icon:"coin"},
    {name:"Seni & Desain", icon:"palette"},
    {name:"Pendidikan", icon:"school"},
    {name:"Kesehatan", icon:"health"},
    {name:"Hukum", icon:"law"},
    {name:"Psikologi", icon:"brain"},
    {name:"Agama", icon:"mosque"},
    {name:"Bahasa", icon:"language"},
    {name:"Manajemen", icon:"briefcase"},
    {name:"Komunikasi", icon:"message"}
  ];
  const authorPool = [
    "Andi Pratama", "Siti Nurhaliza", "Budi Santoso", "Dewi Lestari", "Ahmad Fauzi",
    "Rina Kartika", "Doni Irawan", "Maya Sari", "Rizky Ramadhan", "Nabila Putri",
    "Fajar Nugroho", "Citra Maharani", "Yoga Saputra", "Intan Permata", "Rudi Hartono",
    "Sri Wahyuni", "Hendra Wijaya", "Lina Marlina", "Agus Salim", "Taufik Hidayat",
    "Ayu Wulandari", "Nur Aini", "Bayu Prakoso", "Dian Pertiwi", "Firman Hakim",
    "Eka Susanti", "Imam Maulana", "Nanda Amelia", "Arif Rahman", "Vina Anggraini"
  ];
  const subjects = {
    "Teknologi":["Pemrograman Web Modern","Dasar Artificial Intelligence","Jaringan Komputer Terapan","Cyber Security Praktis","Cloud Computing Dasar","Basis Data Relasional","Internet of Things","Machine Learning Pemula","UI UX Design","Algoritma dan Struktur Data"],
    "Sains":["Fisika Dasar","Kimia Organik","Biologi Molekuler","Astronomi Populer","Statistika Sains","Ekologi Terapan","Geologi Indonesia","Matematika Diskrit","Eksperimen Laboratorium","Sains Lingkungan"],
    "Fiksi & Novel":["Langit Senja","Kota yang Hilang","Jejak di Ujung Malam","Rumah Kecil di Selatan","Rahasia Surat Lama","Hujan Bulan Juni","Pulang ke Utara","Bayang-Bayang Kota","Laskar Pelangi Baru","Pintu Waktu"],
    "Sejarah":["Sejarah Nusantara","Peradaban Dunia","Revolusi Industri","Tokoh Nasional","Sejarah Maritim","Arkeologi Indonesia","Kolonialisme Asia","Sejarah Pendidikan","Perang Dunia","Warisan Budaya"],
    "Ekonomi":["Ekonomi Mikro","Ekonomi Makro","Manajemen Keuangan","Akuntansi Dasar","Investasi Pemula","Ekonomi Digital","Kewirausahaan","Perbankan Syariah","Pasar Modal","Perencanaan Bisnis"],
    "Seni & Desain":["Desain Grafis","Fotografi Digital","Tipografi Modern","Ilustrasi Kreatif","Arsitektur Interior","Seni Rupa","Branding Visual","Animasi Dasar","Desain Produk","Warna dan Komposisi"],
    "Pendidikan":["Strategi Pembelajaran","Evaluasi Pendidikan","Kurikulum Merdeka","Media Pembelajaran","Psikologi Pendidikan","Manajemen Kelas","Teknologi Pendidikan","Pembelajaran Inklusif","Riset Pendidikan","Bimbingan Konseling"],
    "Kesehatan":["Kesehatan Masyarakat","Gizi Seimbang","Keperawatan Dasar","Farmakologi Praktis","Epidemiologi","Kesehatan Lingkungan","Promosi Kesehatan","Manajemen Rumah Sakit","Anatomi Fisiologi","Keselamatan Pasien"],
    "Hukum":["Pengantar Ilmu Hukum","Hukum Perdata","Hukum Pidana","Hukum Bisnis","Hukum Administrasi","Etika Profesi Hukum","Hukum Ketenagakerjaan","Kontrak Komersial","Hukum Digital","Penyelesaian Sengketa"],
    "Psikologi":["Psikologi Umum","Psikologi Sosial","Psikologi Industri","Kesehatan Mental","Psikologi Perkembangan","Konseling Dasar","Motivasi Belajar","Kepribadian","Psikometri","Psikologi Komunikasi"],
    "Agama":["Studi Islam","Akhlak dan Etika","Sejarah Peradaban Islam","Fiqh Muamalah","Tafsir Tematik","Hadis Pilihan","Pendidikan Agama","Ekonomi Syariah","Moderasi Beragama","Pemikiran Islam"],
    "Bahasa":["Bahasa Indonesia Akademik","English for Business","Linguistik Dasar","Menulis Ilmiah","Public Speaking","Bahasa Arab Dasar","Translation Practice","Pragmatik","Sastra Indonesia","Korespondensi Bisnis"],
    "Manajemen":["Manajemen Strategik","Manajemen Operasi","Manajemen SDM","Manajemen Pemasaran","Manajemen Proyek","Kepemimpinan","Perilaku Organisasi","Manajemen Mutu","Logistik Bisnis","Inovasi Organisasi"],
    "Komunikasi":["Ilmu Komunikasi","Komunikasi Massa","Public Relations","Jurnalistik Dasar","Komunikasi Digital","Semiotika Komunikasi","Komunikasi Organisasi","Media Sosial","Komunikasi Politik","Riset Komunikasi"]
  };
  const books = [];
  let no = 1;
  categories.forEach((cat, catIndex) => {
    for(let i = 1; i <= 50; i++){
      const baseTitle = subjects[cat.name][(i-1) % subjects[cat.name].length];
      const title = `${baseTitle} ${String(i).padStart(2,"0")}`;
      const stock = (i % 11 === 0) ? 0 : ((i * 3 + catIndex) % 18) + 1;
      books.push({
        code:`BKS-${String(no).padStart(5,"0")}`,
        title,
        category:cat.name,
        author:authorPool[(i + catIndex * 3) % authorPool.length],
        year:String(2014 + ((i + catIndex) % 12)),
        stock,
        status:stock === 0 ? "Habis" : (i % 13 === 0 ? "Dipinjam" : "Tersedia"),
        cover:`c${(i % 5) + 1}`,
        desc:`Koleksi ${cat.name} untuk referensi pembelajaran dan literasi digital.`
      });
      no++;
    }
  });
  const memberNames = [
    "Ahmad Fauzi","Siti Aminah","Budi Santoso","Dewi Lestari","Rizky Pratama","Nadia Putri","Fajar Maulana","Rina Kartika","Andi Saputra","Maya Sari",
    "Doni Irawan","Citra Sari","Yoga Prasetyo","Ayu Wulandari","Bayu Nugraha","Dian Pertiwi","Hendra Wijaya","Lina Marlina","Agus Salim","Nabila Aulia",
    "Taufik Hidayat","Intan Permata","Rudi Hartono","Sri Wahyuni","Arif Rahman","Vina Anggraini","Eka Susanti","Imam Maulana","Nanda Amelia","Firman Hakim",
    "Putri Maharani","Gilang Ramadhan","Mira Oktaviani","Rangga Saputra","Dimas Prakoso","Tia Kartika","Rafi Alfarizi","Sarah Amelia","Ilham Akbar","Desi Rahmawati",
    "Farhan Zaki","Wulan Sari","Yusuf Hendra","Kirana Putri","Galih Arya","Niken Larasati","Aldi Firmansyah","Fitria Ningsih","Rama Wijaya","Nisa Azzahra"
  ];
  const members = memberNames.map((name, idx) => {
    const n = idx + 1;
    const join = `2024-${String(((idx % 10) + 1)).padStart(2,"0")}-${String(((idx * 3) % 25) + 1).padStart(2,"0")}`;
    return {
      id:`LIB-2024-${String(n).padStart(3,"0")}`,
      name,
      role: idx % 7 === 0 ? "Dosen" : "Mahasiswa",
      email:`${slug(name)}@unpam.ac.id`,
      phone:`08${String(1200000000 + idx * 23117).slice(0,10)}`,
      date:formatDate(join),
      join,
      status: idx % 17 === 0 ? "Suspended" : "Aktif",
      abbr:initials(name)
    };
  });
  const loans = [];
  const loanBooks = books.slice(0, 36);
  for(let i=0;i<36;i++){
    const member = members[i % members.length];
    const book = loanBooks[i];
    let start, due, returned, status;
    if(i < 16){ start = addDaysISO(-60 + i); due = addDaysISO(-53 + i); returned = addDaysISO(-50 + i); status = "Selesai"; }
    else if(i < 18){ start = addDaysISO(-18 + i); due = addDaysISO(-10 + i); returned = ""; status = "Terlambat"; }
    else { start = addDaysISO(-3 + (i % 3)); due = addDaysISO(4 + (i % 8)); returned = ""; status = "Aktif"; }
    loans.push({
      id:i+1,
      memberId:member.id,
      memberName:member.name,
      bookCode:book.code,
      bookTitle:book.title,
      start, due, returned, status,
      fine:0
    });
  }
  return {books, categories:categories.map(c=>({...c, count:books.filter(b=>b.category===c.name).length})), members, loans, settings:{finePerDay:5000, loanDays:7, maxBorrow:3, fineStatus:"Aktif", photo:null, twoFactor:"Nonaktif"}};
}

const DEFAULT_STATE = buildDefaultState();
let state = loadState();

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if(!saved) return clone(DEFAULT_STATE);
    return {
      books: saved.books || DEFAULT_STATE.books,
      categories: saved.categories || DEFAULT_STATE.categories,
      members: saved.members || DEFAULT_STATE.members,
      loans: saved.loans || DEFAULT_STATE.loans,
      settings: {...DEFAULT_STATE.settings, ...(saved.settings || {})}
    };
  }catch(e){ return clone(DEFAULT_STATE); }
}
function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function memberById(id){ return state.members.find(m => m.id === id); }
function bookByCode(code){ return state.books.find(b => b.code === code); }
function getCategoryNames(){ return [...new Set(state.categories.map(c=>c.name).concat(state.books.map(b=>b.category)))].filter(Boolean); }
function nextMemberId(){ const nums = state.members.map(m => Number((m.id.match(/(\d+)$/) || [0,0])[1])); return "LIB-2024-" + String(Math.max(0, ...nums) + 1).padStart(3,"0"); }
function nextLoanId(){ return Math.max(0, ...state.loans.map(l=>Number(l.id)||0)) + 1; }
function syncCategoryCounts(){ state.categories = getCategoryNames().map(name => ({name, count:state.books.filter(b=>b.category === name).length, icon:(state.categories.find(c=>c.name===name)||{}).icon || "book"})); }

function icon(name){
  const icons = {
    edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
    eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    upload:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>'
  };
  return icons[name] || "";
}
function badge(status){
  const s = String(status || "").toLowerCase();
  const c = s.includes("selesai") || s.includes("tersedia") || s === "aktif" ? "success" :
            s.includes("terlambat") || s.includes("habis") || s.includes("suspended") ? "danger" :
            s.includes("dipinjam") || s.includes("pinjam") ? "active" : "muted";
  return `<span class="badge ${c}">${status}</span>`;
}
function showToast(msg){ const old = $(".toast"); if(old) old.remove(); const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(()=>t.remove(), 2600); }
function openModal(html){ $("#modalCard").innerHTML = html; $("#modal").classList.add("show"); $$("#modal [data-close]").forEach(btn => btn.addEventListener("click", closeModal)); }
function closeModal(){ $("#modal")?.classList.remove("show"); }

function updateFineStatus(){
  const cfg = state.settings;
  const now = new Date();
  state.loans.forEach(l => {
    if(l.status === "Selesai") return;
    const due = new Date((l.due || todayISO()) + "T00:00:00");
    const late = Math.max(0, Math.ceil((now - due) / 86400000));
    l.status = late > 0 ? "Terlambat" : "Aktif";
    l.fine = cfg.fineStatus === "Aktif" ? late * Number(cfg.finePerDay || 0) : 0;
  });
  saveState();
}

function getNotifications(){
  updateFineStatus();
  const late = state.loans.filter(l => l.status === "Terlambat");
  const lowStock = state.books.filter(b => Number(b.stock) <= 2);
  const suspended = state.members.filter(m => m.status === "Suspended");
  return [
    ...late.map(l => ({type:"Terlambat", text:`${l.memberName} terlambat mengembalikan ${l.bookTitle}.`, href:"pengembalian.html"})),
    ...lowStock.slice(0,5).map(b => ({type:"Stok", text:`Stok buku ${b.title} hampir habis.`, href:"data-buku.html"})),
    ...suspended.slice(0,3).map(m => ({type:"Anggota", text:`Status anggota ${m.name} perlu dicek.`, href:"data-anggota.html"}))
  ];
}
function initNotifications(){
  const bell = $(".bell");
  if(!bell) return;
  const notes = getNotifications();
  bell.classList.add("notif-wrap");
  bell.innerHTML = `${bell.innerHTML}<span class="notif-badge">${notes.length}</span><div class="notif-popover"><h4>Notifikasi</h4><div class="notif-list">${notes.length ? notes.map(n=>`<a href="${n.href}"><b>${n.type}</b><span>${n.text}</span></a>`).join("") : "<p>Tidak ada notifikasi baru.</p>"}</div></div>`;
  bell.addEventListener("click", e => { e.stopPropagation(); bell.classList.toggle("open"); });
  document.addEventListener("click",()=>bell.classList.remove("open"));
}

function initGeneral(){
  const side = $("#sidebar");
  const toggle = $("#menuToggle");
  if(toggle && side) toggle.addEventListener("click", ()=> side.classList.toggle("show"));
  $("#modal")?.addEventListener("click", e => { if(e.target.id === "modal") closeModal(); });
  $$('[data-print]').forEach(btn => btn.addEventListener('click',()=>window.print()));
  $$('[data-export]').forEach(btn => btn.addEventListener('click',()=>exportCurrentPage()));
  applySavedPhoto();
  initNotifications();
  initSearch();
}
function initSearch(){
  const topSearch = $("#topSearch");
  if(!topSearch) return;
  topSearch.addEventListener("input", () => {
    const page = document.body.dataset.page || "";
    if(page === "data-buku.html") { bookPage = 1; renderBookRowsFiltered(); }
    else if(page === "data-kategori.html") { categoryPage = 1; renderCategories(); }
    else if(page === "data-anggota.html") { memberPage = 1; renderMembersFiltered(); }
    else if(page === "laporan.html") { reportPage = 1; renderReportRows(); }
    else if(page === "pengembalian.html") renderReturnRows();
    else if(page === "peminjaman.html") renderLoanActiveTable();
    else if(page === "dashboard.html") renderDashboardActivity();
    else $$("tbody tr").forEach(row => row.style.display = row.textContent.toLowerCase().includes(topSearch.value.toLowerCase()) ? "" : "none");
  });
}

function initLogin(){
  const form = $("#loginForm");
  if(!form) return;
  const pass = $("#password");
  const toggle = $("#togglePassword");
  if(toggle) toggle.addEventListener("click",()=> pass.type = pass.type === "password" ? "text" : "password");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const email = $("#email");
    let valid = true;
    $("#emailError").textContent = "";
    $("#passwordError").textContent = "";
    if(email.value.trim() !== "admin@elibrary.com"){
      $("#emailError").textContent = "Email admin tidak sesuai.";
      valid = false;
    }
    if(pass.value.trim() !== "admin123"){
      $("#passwordError").textContent = "Kata sandi salah. Gunakan password admin yang benar.";
      valid = false;
    }
    if(valid) location.href = "dashboard.html";
  });
}

function updateCounts(){
  updateFineStatus(); syncCategoryCounts();
  const page = document.body.dataset.page || "";
  const totalBooks = state.books.length;
  const totalMembers = state.members.length;
  const activeLoans = state.loans.filter(l => l.status === "Aktif").length;
  const lateLoans = state.loans.filter(l => l.status === "Terlambat").length;
  const vals = $$(".stats-grid .stat-value");
  if(page === "dashboard.html"){
    if(vals[0]) vals[0].textContent = totalBooks.toLocaleString("id-ID");
    if(vals[1]) vals[1].textContent = totalMembers.toLocaleString("id-ID");
    if(vals[2]) vals[2].textContent = activeLoans.toLocaleString("id-ID");
    if(vals[3]) vals[3].textContent = lateLoans.toLocaleString("id-ID");
  }
  if(page === "data-kategori.html"){
    const empty = state.categories.filter(c => state.books.filter(b=>b.category===c.name).length === 0).length;
    const popular = topCategories()[0];
    if(vals[0]) vals[0].textContent = state.categories.length;
    if(vals[1]) vals[1].textContent = totalBooks.toLocaleString("id-ID");
    if(vals[2]) vals[2].textContent = popular ? popular.name : "-";
    if(vals[3]) vals[3].textContent = empty;
  }
  if(page === "data-anggota.html"){
    if(vals[0]) vals[0].textContent = totalMembers.toLocaleString("id-ID");
    if(vals[1]) vals[1].textContent = state.members.filter(m=>m.role === "Mahasiswa").length.toLocaleString("id-ID");
    if(vals[2]) vals[2].textContent = state.members.filter(m=>m.role === "Dosen").length.toLocaleString("id-ID");
    if(vals[3]) vals[3].textContent = state.members.filter(m=>m.join?.slice(0,7) === todayISO().slice(0,7)).length || 50;
  }
}

function topCategories(){ return state.categories.map(c=>({name:c.name, count:state.books.filter(b=>b.category===c.name).length})).sort((a,b)=>b.count-a.count); }
function renderPager(container, current, totalPages, onPage){
  if(!container) return;
  totalPages = Math.max(1,totalPages);
  const pages = [];
  if(totalPages <= 7){ for(let i=1;i<=totalPages;i++) pages.push(i); }
  else {
    pages.push(1);
    if(current > 3) pages.push("...");
    for(let i=Math.max(2,current-1); i<=Math.min(totalPages-1,current+1); i++) pages.push(i);
    if(current < totalPages-2) pages.push("...");
    pages.push(totalPages);
  }
  container.innerHTML = `<button class="page-btn" data-go="prev">‹</button>${pages.map(p => p === "..." ? `<span>...</span>` : `<button class="page-btn ${p===current?'active':''}" data-go="${p}">${p}</button>`).join("")}<button class="page-btn" data-go="next">›</button>`;
  container.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click",()=>{
    let target = btn.dataset.go === "prev" ? current-1 : btn.dataset.go === "next" ? current+1 : Number(btn.dataset.go);
    target = Math.max(1, Math.min(totalPages, target));
    if(target !== current) onPage(target);
  }));
}
function rangeText(page, size, total, label){
  if(total === 0) return `Menampilkan 0 dari 0 ${label}`;
  const start = (page-1)*size+1;
  const end = Math.min(total, page*size);
  return `Menampilkan ${start}-${end} dari ${total.toLocaleString("id-ID")} ${label}`;
}

function populateCategorySelects(){
  const names = getCategoryNames();
  const filter = $("#bookCategory");
  if(filter) filter.innerHTML = `<option value="all">Semua Kategori</option>` + names.map(n=>`<option>${n}</option>`).join("");
  const formSelect = $("#kategoriBuku");
  if(formSelect) formSelect.innerHTML = `<option value="">Pilih Kategori</option>` + names.map(n=>`<option>${n}</option>`).join("");
}
function filteredBooks(){
  const q = ($("#topSearch")?.value || "").toLowerCase().trim();
  const c = $("#bookCategory")?.value || "all";
  const sort = $("#bookSort")?.value || "baru";
  let list = state.books.filter(b => {
    const matchQ = [b.code,b.title,b.category,b.author,b.year].join(" ").toLowerCase().includes(q);
    const matchC = c === "all" || b.category === c;
    return matchQ && matchC;
  });
  if(sort === "stok") list = [...list].sort((a,b)=>Number(b.stock)-Number(a.stock));
  if(sort === "judul") list = [...list].sort((a,b)=>a.title.localeCompare(b.title));
  return list;
}
function renderBookRows(list){
  const tbody = $("#bookRows");
  if(!tbody) return;
  const startNo = (bookPage - 1) * PAGE_SIZE_BOOKS;
  tbody.innerHTML = list.map((b,i)=>`
    <tr>
      <td>${startNo+i+1}</td>
      <td class="text-primary">${b.code}</td>
      <td><div class="book-cell"><div class="cover ${b.cover || 'c1'}"></div><span>${b.title}</span></div></td>
      <td>${b.category}</td>
      <td>${b.author}</td>
      <td>${b.year}</td>
      <td class="${Number(b.stock)===0?'text-danger':''}">${b.stock}</td>
      <td>${badge(b.status)}</td>
      <td><div class="action-row"><button class="icon-action" data-detail-code="${b.code}">${icon('eye')}</button><button class="icon-action" data-edit-code="${b.code}">${icon('edit')}</button><button class="icon-action danger" data-delete-code="${b.code}">${icon('trash')}</button></div></td>
    </tr>`).join("");
  $$("[data-detail-code]").forEach(btn => btn.addEventListener("click",()=>showBookDetail(btn.dataset.detailCode)));
  $$("[data-edit-code]").forEach(btn => btn.addEventListener("click",()=> location.href = `form-buku.html?edit=${encodeURIComponent(btn.dataset.editCode)}`));
  $$("[data-delete-code]").forEach(btn => btn.addEventListener("click",()=> deleteBook(btn.dataset.deleteCode)));
}
function renderBookRowsFiltered(){
  const list = filteredBooks();
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE_BOOKS));
  if(bookPage > totalPages) bookPage = totalPages;
  const slice = list.slice((bookPage-1)*PAGE_SIZE_BOOKS, bookPage*PAGE_SIZE_BOOKS);
  renderBookRows(slice);
  const meta = $("#bookRows")?.closest(".panel")?.querySelector(".meta-line");
  if(meta){
    meta.querySelector("span").textContent = rangeText(bookPage, PAGE_SIZE_BOOKS, list.length, "data buku");
    renderPager(meta.querySelector(".pagination"), bookPage, totalPages, p=>{bookPage=p;renderBookRowsFiltered();});
  }
  const total = $(".total-box strong");
  if(total) total.textContent = state.books.length.toLocaleString("id-ID");
}
function initBooks(){
  if(!$("#bookRows")) return;
  populateCategorySelects();
  [$("#bookCategory"),$("#bookSort")].forEach(el=> el && el.addEventListener("input",()=>{bookPage=1;renderBookRowsFiltered();}));
  renderBookRowsFiltered();
}
function showBookDetail(code){
  const b = state.books.find(x=>x.code === code);
  openModal(`<h3>Detail Buku</h3><p>${b.title}</p>
    <table><tr><td>Kode</td><td>${b.code}</td></tr><tr><td>Kategori</td><td>${b.category}</td></tr><tr><td>Penulis</td><td>${b.author}</td></tr><tr><td>Tahun</td><td>${b.year}</td></tr><tr><td>Stok</td><td>${b.stock}</td></tr><tr><td>Status</td><td>${b.status}</td></tr></table>
    <div class="modal-actions"><button class="btn btn-secondary" data-close>Tutup</button><a class="btn btn-primary" href="form-buku.html?edit=${encodeURIComponent(b.code)}">Edit Buku</a></div>`);
}
function deleteBook(code){
  openModal(`<h3>Hapus Buku?</h3><p>Data buku akan dihapus dari mock data.</p><div class="modal-actions"><button class="btn btn-secondary" data-close>Batal</button><button class="btn btn-danger" id="doDeleteBook">Hapus</button></div>`);
  $("#doDeleteBook").addEventListener("click",()=>{
    state.books = state.books.filter(b => b.code !== code);
    syncCategoryCounts(); saveState(); closeModal(); renderBookRowsFiltered(); updateCounts(); showToast("Buku berhasil dihapus.");
  });
}

function initFormBuku(){
  const form = $("#bookForm");
  if(!form) return;
  populateCategorySelects();
  const editCode = new URLSearchParams(location.search).get("edit");
  if(editCode){
    const b = state.books.find(x=>x.code === editCode);
    if(b){
      $("#kodeBuku").value = b.code;
      $("#kategoriBuku").value = b.category;
      $("#judulBuku").value = b.title;
      $("#penulisBuku").value = b.author;
      $("#tahunBuku").value = b.year;
      $("#stokBuku").value = b.stock;
      $("#deskripsiBuku").value = b.desc || "";
    }
  } else {
    const max = Math.max(...state.books.map(b=>Number((b.code.match(/(\d+)$/)||[0,0])[1])));
    if($("#kodeBuku")) $("#kodeBuku").value = `BKS-${String(max+1).padStart(5,"0")}`;
  }
  const drop = $("#dropzone");
  const file = $("#coverInput");
  if(drop && file){
    drop.addEventListener("click",()=>file.click());
    file.addEventListener("change",()=> { if(file.files.length) drop.innerHTML = `<div>${icon('upload')}<strong>${file.files[0].name}</strong><small>File siap diunggah.</small></div>`; });
  }
  form.addEventListener("submit", e => {
    e.preventDefault();
    let ok = true;
    $$("#bookForm [data-required]").forEach(input => {
      const err = input.closest(".form-field").querySelector(".error-text");
      err.textContent = "";
      if(!input.value.trim()){ err.textContent = "Field ini wajib diisi."; ok = false; }
    });
    if(!ok) return;
    const code = $("#kodeBuku").value.trim();
    const item = { code, title:$("#judulBuku").value.trim(), category:$("#kategoriBuku").value, author:$("#penulisBuku").value.trim(), year:$("#tahunBuku").value.trim(), stock:Number($("#stokBuku").value || 0), status:Number($("#stokBuku").value || 0) > 0 ? "Tersedia" : "Habis", cover:"c" + ((state.books.length % 5) + 1), desc:$("#deskripsiBuku").value.trim() };
    if(editCode) state.books = state.books.map(b => b.code === editCode ? item : b);
    else state.books.push(item);
    if(!state.categories.some(c=>c.name === item.category)) state.categories.push({name:item.category, count:1});
    syncCategoryCounts(); saveState(); showToast("Data buku berhasil disimpan."); setTimeout(()=>location.href="data-buku.html", 700);
  });
}

function filteredCategories(){
  const q = ($("#topSearch")?.value || "").toLowerCase().trim();
  return state.categories.filter(c => c.name.toLowerCase().includes(q));
}
function renderCategories(){
  const rows = $("#categoryRows");
  if(!rows) return;
  syncCategoryCounts();
  const list = filteredCategories();
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE_CATEGORIES));
  if(categoryPage > totalPages) categoryPage = totalPages;
  const slice = list.slice((categoryPage-1)*PAGE_SIZE_CATEGORIES, categoryPage*PAGE_SIZE_CATEGORIES);
  const startNo = (categoryPage-1)*PAGE_SIZE_CATEGORIES;
  rows.innerHTML = slice.map((c,i)=>{
    const globalIndex = state.categories.findIndex(cat=>cat.name === c.name);
    const count = state.books.filter(b=>b.category === c.name).length;
    return `<tr>
      <td>${startNo+i+1}</td>
      <td><span class="badge ${i%2?'active':'success'}">${c.name.slice(0,1)}</span> &nbsp; ${c.name}</td>
      <td><span class="badge muted">${count} Buku</span></td>
      <td><div class="action-row"><button class="icon-action" data-edit-cat="${globalIndex}">${icon('edit')}</button><button class="icon-action danger" data-delete-cat="${globalIndex}">${icon('trash')}</button></div></td>
    </tr>`;
  }).join("");
  $$("[data-edit-cat]").forEach(btn => btn.addEventListener("click",()=>categoryModal(state.categories[Number(btn.dataset.editCat)], Number(btn.dataset.editCat))));
  $$("[data-delete-cat]").forEach(btn => btn.addEventListener("click",()=> {
    const idx = Number(btn.dataset.deleteCat);
    const name = state.categories[idx].name;
    if(state.books.some(b => b.category === name)){ showToast("Kategori masih dipakai pada data buku."); return; }
    openModal(`<h3>Hapus Kategori?</h3><p>Kategori akan dihapus dari mock data.</p><div class="modal-actions"><button class="btn btn-secondary" data-close>Batal</button><button class="btn btn-danger" id="doDeleteCat">Hapus</button></div>`);
    $("#doDeleteCat").addEventListener("click",()=>{state.categories.splice(idx,1);syncCategoryCounts();saveState();closeModal();renderCategories();updateCounts();showToast("Kategori berhasil dihapus.");});
  }));
  const meta = rows.closest(".panel")?.querySelector(".meta-line");
  if(meta){
    meta.querySelector("span").textContent = rangeText(categoryPage, PAGE_SIZE_CATEGORIES, list.length, "kategori");
    renderPager(meta.querySelector(".pagination"), categoryPage, totalPages, p=>{categoryPage=p;renderCategories();});
  }
  updateCounts();
}
function categoryModal(data={}, index=null){
  openModal(`<h3>${index===null?'Tambah':'Edit'} Kategori</h3><p>Isi data kategori buku.</p>
    <div class="form-field"><label>Nama Kategori</label><input id="catName" value="${data.name || ''}" placeholder="Contoh: Teknologi"></div>
    <div class="form-field"><label>Jumlah Buku</label><input id="catCount" type="number" value="${data.count || 0}" readonly></div>
    <div class="modal-actions"><button class="btn btn-secondary" data-close>Batal</button><button class="btn btn-primary" id="saveCat">Simpan</button></div>`);
  $("#saveCat").addEventListener("click",()=>{
    const oldName = index !== null ? state.categories[index].name : null;
    const item = {name:$("#catName").value.trim() || "Kategori Baru", count:0};
    if(index===null) state.categories.push(item);
    else { state.categories[index]=item; state.books = state.books.map(b => b.category === oldName ? {...b, category:item.name} : b); }
    syncCategoryCounts(); saveState(); closeModal(); categoryPage=1; renderCategories(); populateCategorySelects(); showToast("Kategori berhasil disimpan dan sinkron ke form buku.");
  });
}
function initCategories(){ if(!$("#categoryRows")) return; renderCategories(); $("#addCategory")?.addEventListener("click",()=>categoryModal()); }

function renderMembers(list){
  const rows = $("#memberRows");
  if(!rows) return;
  rows.innerHTML = list.map((m)=>`
    <tr>
      <td class="text-primary">${m.id}</td>
      <td><div class="borrower"><div class="initial">${m.abbr || initials(m.name)}</div><div>${m.name}<br><small>${m.role}</small></div></div></td>
      <td>${m.email}</td>
      <td>${m.phone}</td>
      <td>${m.date || formatDate(m.join)}</td>
      <td>${badge(m.status)}</td>
      <td><div class="action-row"><button class="icon-action" data-edit-member="${m.id}">${icon('edit')}</button><button class="icon-action danger" data-delete-member="${m.id}">${icon('trash')}</button></div></td>
    </tr>`).join("");
  $$("[data-edit-member]").forEach(btn=>btn.addEventListener("click",()=>memberModal(state.members.find(m=>m.id===btn.dataset.editMember))));
  $$("[data-delete-member]").forEach(btn=>btn.addEventListener("click",()=> {
    openModal(`<h3>Hapus Anggota?</h3><p>Data anggota akan dihapus dari tampilan.</p><div class="modal-actions"><button class="btn btn-secondary" data-close>Batal</button><button class="btn btn-danger" id="doDelMember">Hapus</button></div>`);
    $("#doDelMember").addEventListener("click",()=>{state.members = state.members.filter(m=>m.id !== btn.dataset.deleteMember);saveState();closeModal();memberPage=1;renderMembersFiltered();updateCounts();showToast("Anggota berhasil dihapus.");});
  }));
}
function memberModal(data=null){
  const isEdit = !!data;
  const m = data || {id:nextMemberId(), name:"", role:"Mahasiswa", email:"", phone:"", join:todayISO(), date:formatDate(todayISO()), status:"Aktif", abbr:""};
  openModal(`<h3>${isEdit?'Edit':'Tambah'} Anggota</h3>
    <div class="form-grid">
      <div class="form-field slim"><label>ID Anggota</label><input id="mId" value="${m.id}" readonly></div>
      <div class="form-field slim"><label>Nama</label><input id="mName" value="${m.name||''}" placeholder="Nama lengkap"></div>
      <div class="form-field slim"><label>Email</label><input id="mEmail" value="${m.email||''}" placeholder="email@unpam.ac.id"></div>
      <div class="form-field slim"><label>No. Telepon</label><input id="mPhone" value="${m.phone||''}" placeholder="08xxxxxxxxxx"></div>
      <div class="form-field slim"><label>Tanggal Bergabung</label><input id="mJoin" type="date" value="${m.join || todayISO()}"></div>
      <div class="form-field slim"><label>Role</label><select id="mRole"><option ${m.role==='Mahasiswa'?'selected':''}>Mahasiswa</option><option ${m.role==='Dosen'?'selected':''}>Dosen</option></select></div>
      <div class="form-field slim"><label>Status</label><select id="mStatus"><option ${m.status==='Aktif'?'selected':''}>Aktif</option><option ${m.status==='Suspended'?'selected':''}>Suspended</option></select></div>
    </div>
    <div class="modal-actions"><button class="btn btn-secondary" data-close>Batal</button><button class="btn btn-primary" id="saveMember">Simpan</button></div>`);
  $("#saveMember").addEventListener("click",()=>{
    const name = $("#mName").value.trim();
    const email = $("#mEmail").value.trim();
    const phone = $("#mPhone").value.trim();
    const join = $("#mJoin").value || todayISO();
    if(!name || !email || !phone){ showToast("Nama, email, dan nomor telepon wajib diisi."); return; }
    const item = {id:$("#mId").value, name, role:$("#mRole").value, email, phone, join, date:formatDate(join), status:$("#mStatus").value, abbr:initials(name)};
    if(isEdit) state.members = state.members.map(x=>x.id===item.id?item:x); else state.members.push(item);
    saveState(); closeModal(); memberPage=1; renderMembersFiltered(); updateCounts(); showToast("Data anggota berhasil disimpan.");
  });
}
function filteredMembers(){
  const q = ($("#topSearch")?.value || "").toLowerCase().trim();
  const activeTab = $(".member-tab.active")?.dataset.role || "all";
  let list = state.members.filter(m => activeTab === "all" || m.role.toLowerCase() === activeTab);
  if(q) list = list.filter(m => [m.id,m.name,m.email,m.phone,m.role].join(" ").toLowerCase().includes(q));
  return list;
}
function renderMembersFiltered(){
  if(!$("#memberRows")) return;
  const list = filteredMembers();
  const totalPages = Math.max(1, Math.ceil(list.length/PAGE_SIZE_MEMBERS));
  if(memberPage > totalPages) memberPage = totalPages;
  renderMembers(list.slice((memberPage-1)*PAGE_SIZE_MEMBERS, memberPage*PAGE_SIZE_MEMBERS));
  const meta = $("#memberRows").closest(".panel")?.querySelector(".meta-line");
  if(meta){
    meta.querySelector("span").textContent = rangeText(memberPage, PAGE_SIZE_MEMBERS, list.length, "anggota");
    renderPager(meta.querySelector(".pagination"), memberPage, totalPages, p=>{memberPage=p;renderMembersFiltered();});
  }
  updateCounts();
}
function initMembers(){
  if(!$("#memberRows")) return;
  renderMembersFiltered();
  $("#addMember")?.addEventListener("click",()=>memberModal());
  $$(".member-tab").forEach(tab=>tab.addEventListener("click",()=>{
    $$(".member-tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active"); memberPage=1; renderMembersFiltered();
  }));
}

function initLoanPage(){
  const form = $("#loanForm");
  if(!form) return;
  const selects = $$('select', form);
  const dates = $$('input[type="date"]', form);
  const memberSelect = selects[0], bookSelect = selects[1], startInput = dates[0], dueInput = dates[1];
  function fillOptions(){
    memberSelect.innerHTML = `<option value="">Pilih Anggota</option>` + state.members.filter(m=>m.status === "Aktif").map(m=>`<option value="${m.id}">${m.id} - ${m.name}</option>`).join("");
    bookSelect.innerHTML = `<option value="">Pilih Buku</option>` + state.books.filter(b=>Number(b.stock)>0).map(b=>`<option value="${b.code}">${b.code} - ${b.title}</option>`).join("");
    if(!startInput.value) startInput.value = todayISO();
    if(!dueInput.value) dueInput.value = addDaysISO(Number(state.settings.loanDays || 7));
  }
  fillOptions(); renderLoanActiveTable();
  form.addEventListener("submit", e=>{
    e.preventDefault();
    if(!memberSelect.value || !bookSelect.value || !startInput.value || !dueInput.value){ showToast("Anggota, buku, tanggal pinjam, dan batas kembali wajib diisi."); return; }
    const m = memberById(memberSelect.value);
    const b = bookByCode(bookSelect.value);
    const item = {id:nextLoanId(), memberId:m.id, memberName:m.name, bookCode:b.code, bookTitle:b.title, start:startInput.value, due:dueInput.value, returned:"", status:"Aktif", fine:0};
    state.loans.unshift(item);
    state.books = state.books.map(book => book.code === b.code ? {...book, stock:Math.max(0,Number(book.stock)-1), status:Number(book.stock)-1 > 0 ? book.status : "Habis"} : book);
    saveState(); form.reset(); fillOptions(); renderLoanActiveTable(); updateCounts(); showToast("Transaksi peminjaman berhasil dibuat dan langsung masuk ke Pengembalian serta Laporan.");
  });
}
function renderLoanActiveTable(){
  const form = $("#loanForm");
  if(!form) return;
  const nextPanel = form.closest("section")?.nextElementSibling;
  const tbody = nextPanel?.querySelector("tbody");
  if(!tbody) return;
  const q = ($("#topSearch")?.value || "").toLowerCase().trim();
  let active = state.loans.filter(l=>l.status !== "Selesai");
  if(q) active = active.filter(l=>[l.memberName,l.memberId,l.bookTitle,l.bookCode,l.status].join(" ").toLowerCase().includes(q));
  tbody.innerHTML = active.map((l,i)=>`<tr><td>${i+1}</td><td>${l.memberName}</td><td>${l.bookTitle}</td><td>${formatDate(l.start)}</td><td>${formatDate(l.due)}</td><td>${badge(l.status)}</td></tr>`).join("");
  const pill = nextPanel.querySelector(".badge.muted");
  if(pill) pill.textContent = `${active.length} data`;
}

function initReturnPage(){ if(!(document.body.dataset.page||"").includes("pengembalian")) return; renderReturnRows(); }
function renderReturnRows(){
  updateFineStatus();
  const tbody = $(".return-table tbody");
  if(!tbody) return;
  const q = ($("#topSearch")?.value || "").toLowerCase().trim();
  let active = state.loans.filter(l=>l.status !== "Selesai");
  if(q) active = active.filter(l=>[l.memberName,l.memberId,l.bookTitle,l.bookCode,l.status].join(" ").toLowerCase().includes(q));
  tbody.innerHTML = active.map(l=>{
    const lateInfo = l.status === "Terlambat" ? `<span class="text-danger">${formatDate(l.due)}<br>Terlambat</span>` : formatDate(l.due);
    return `<tr><td><div class="borrower"><div class="initial">${initials(l.memberName)}</div><div>${l.memberName}<br><small>${l.memberId}</small></div></div></td><td>${l.bookTitle}<br><small>${l.bookCode}</small></td><td>${formatDate(l.start)}</td><td>${lateInfo}</td><td>${l.fine ? `<span class="badge danger">${rupiah(l.fine)}</span>` : '-'}</td><td><button class="process-btn" data-return-id="${l.id}">Proses Kembali</button></td></tr>`;
  }).join("");
  $$("[data-return-id]").forEach(btn=>btn.addEventListener("click",()=>processReturn(Number(btn.dataset.returnId))));
  const vals = $$(".stats-grid .stat-value");
  if(vals[0]) vals[0].textContent = active.length;
  if(vals[1]) vals[1].textContent = active.filter(l=>l.status === "Terlambat").length;
  if(vals[2]) vals[2].textContent = state.loans.filter(l=>l.returned === todayISO()).length;
  if(vals[3]) vals[3].textContent = rupiah(active.reduce((s,l)=>s+(l.fine||0),0));
  const meta = $(".meta-line span:last-child");
  if(meta) meta.textContent = `Menampilkan 1-${active.length} dari ${active.length} peminjaman`;
}
function processReturn(id){
  const l = state.loans.find(x=>Number(x.id) === id);
  openModal(`<h3>Proses Pengembalian</h3><p>Konfirmasi buku sudah diterima dan hitung denda otomatis.</p>
    <div class="form-field"><label>Nama Peminjam</label><input value="${l.memberName}" readonly></div>
    <div class="form-field"><label>Judul Buku</label><input value="${l.bookTitle}" readonly></div>
    <div class="form-field"><label>Denda</label><input value="${rupiah(l.fine)}" readonly></div>
    <div class="modal-actions"><button class="btn btn-secondary" data-close>Batal</button><button class="btn btn-primary" id="saveReturn">Proses Kembali</button></div>`);
  $("#saveReturn").addEventListener("click",()=>{
    state.loans = state.loans.map(x=>Number(x.id) === id ? {...x, status:"Selesai", returned:todayISO()} : x);
    state.books = state.books.map(b=> b.code === l.bookCode ? {...b, stock:Number(b.stock)+1, status:"Tersedia"} : b);
    saveState(); closeModal(); renderReturnRows(); updateCounts(); showToast("Pengembalian berhasil diproses.");
  });
}

function filteredReport(){
  updateFineStatus();
  let list = [...state.loans];
  const dates = $$(".filter-panel input[type='date']");
  const start = dates[0]?.value, end = dates[1]?.value;
  const q = ($("#topSearch")?.value || "").toLowerCase().trim();
  if(start) list = list.filter(l=>l.start >= start);
  if(end) list = list.filter(l=>l.start <= end);
  if(q) list = list.filter(l=>[l.memberName,l.memberId,l.bookTitle,l.bookCode,l.status].join(" ").toLowerCase().includes(q));
  return list;
}
function initReport(){
  if(!(document.body.dataset.page||"").includes("laporan.html")) return;
  renderReportRows();
  $("#filterReport")?.addEventListener("click",()=>{reportPage=1;renderReportRows();showToast("Filter laporan diterapkan.");});
}
function renderReportRows(){
  const tbody = $(".content .panel table tbody");
  if(!tbody) return;
  const list = filteredReport();
  const totalPages = Math.max(1, Math.ceil(list.length/PAGE_SIZE_REPORT));
  if(reportPage > totalPages) reportPage = totalPages;
  const slice = list.slice((reportPage-1)*PAGE_SIZE_REPORT, reportPage*PAGE_SIZE_REPORT);
  const startNo = (reportPage-1)*PAGE_SIZE_REPORT;
  tbody.innerHTML = slice.map((l,i)=>`<tr><td>${startNo+i+1}</td><td><span class="text-primary">${l.memberName}</span></td><td>${l.bookTitle}</td><td>${formatDate(l.start)}</td><td>${formatDate(l.returned)}</td><td>${badge(l.status)}</td><td>${l.fine ? `<span class="text-danger">${rupiah(l.fine)}</span>` : '-'}</td></tr>`).join("");
  const vals = $$(".stats-grid .stat-value");
  if(vals[0]) vals[0].textContent = list.length.toLocaleString("id-ID");
  if(vals[1]) vals[1].textContent = list.filter(l=>l.status === "Aktif").length;
  if(vals[2]) vals[2].textContent = list.filter(l=>l.status === "Selesai").length.toLocaleString("id-ID");
  if(vals[3]) vals[3].textContent = rupiah(list.reduce((s,l)=>s+(l.fine||0),0));
  const panel = tbody.closest(".panel");
  const pill = panel?.querySelector(".panel-title .badge.muted");
  if(pill) pill.textContent = rangeText(reportPage, PAGE_SIZE_REPORT, list.length, "data");
  const meta = panel?.querySelector(".meta-line");
  if(meta){
    meta.querySelector("span").textContent = `Menampilkan halaman ${reportPage} dari ${totalPages}`;
    renderPager(meta.querySelector(".pagination"), reportPage, totalPages, p=>{reportPage=p;renderReportRows();});
  }
  renderReportCharts(list);
}
function renderReportCharts(list){
  const bars = $$(".week-bars .bar");
  if(bars.length){
    const values = [0,0,0,0,0,0,0];
    list.forEach(l=>{ const d = new Date(l.start+"T00:00:00"); values[(d.getDay()+6)%7]++; });
    const max = Math.max(1,...values);
    bars.forEach((bar,i)=>{ bar.style.height = `${Math.max(20, Math.round((values[i]/max)*100))}%`; });
  }
  const done = list.filter(l=>l.status === "Selesai").length;
  const percent = list.length ? Math.round(done/list.length*100) : 0;
  const donut = $(".donut strong"); if(donut) donut.textContent = `${percent}%`;
  const statusList = $(".status-list");
  if(statusList) statusList.innerHTML = `<div><span>Selesai Tepat Waktu</span><strong>${done}</strong></div><div><span>Peminjaman Aktif</span><strong>${list.filter(l=>l.status==='Aktif').length}</strong></div><div><span>Terlambat</span><strong>${list.filter(l=>l.status==='Terlambat').length}</strong></div>`;
}


function updateDashboardYearLabels(){
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const currentYearLabel = $("#currentYearLabel");
  const previousYearLabel = $("#previousYearLabel");
  if(currentYearLabel) currentYearLabel.textContent = currentYear;
  if(previousYearLabel) previousYearLabel.textContent = previousYear;
}

function initDashboard(){
  if((document.body.dataset.page||"") !== "dashboard.html") return;
  updateDashboardYearLabels();
  renderDashboardActivity();
  renderDashboardCharts();
  renderDashboardCategories();
}
function renderDashboardActivity(){
  const tbody = $(".panel table tbody");
  if(!tbody) return;
  const q = ($("#topSearch")?.value || "").toLowerCase().trim();
  let list = state.loans.slice(0,12);
  if(q) list = list.filter(l=>[l.memberName,l.bookTitle,l.status,l.bookCode].join(" ").toLowerCase().includes(q));
  tbody.innerHTML = list.slice(0,5).map((l,i)=>`<tr><td>${String(i+1).padStart(2,"0")}</td><td>${l.status === "Selesai" ? "Pengembalian" : "Peminjaman"}: "${l.bookTitle}"</td><td>${l.memberName}</td><td>${formatDate(l.start)}</td><td>${badge(l.status)}</td></tr>`).join("");
}
function renderDashboardCharts(){
  const bars = $$(".bar-chart .bar");
  if(!bars.length) return;
  const values = Array(12).fill(0);
  state.loans.forEach(l=>{ const d = new Date(l.start+"T00:00:00"); if(!isNaN(d)) values[d.getMonth()]++; });
  const max = Math.max(1,...values);
  bars.forEach((bar,i)=>{ bar.style.height = `${Math.max(25, Math.round((values[i]/max)*88))}%`; });
}
function renderDashboardCategories(){
  const card = $(".category-card");
  if(!card) return;
  const top = topCategories().slice(0,3);
  const max = Math.max(1,...top.map(c=>c.count));
  card.innerHTML = `<h2>Kategori Terpopuler</h2>${top.map((c,i)=>`<div class="progress-item"><div class="row"><span>${c.name}</span><strong>${c.count}</strong></div><div class="progress-line"><span class="${i===0?'blue':i===2?'red':''}" style="width:${Math.max(8,Math.round(c.count/max*100))}%"></span></div></div>`).join("")}<div class="new-collection">Koleksi Terbaru: ${state.books[state.books.length-1]?.title || 'E-Library'}</div>`;
}

function applySavedPhoto(){
  const photo = state.settings.photo;
  if(photo){
    $$(".avatar-img,.profile-photo").forEach(el=>{el.style.backgroundImage=`url(${photo})`;el.classList.add("has-photo");});
  }
}
function initSettings(){
  const grid = $(".settings-grid");
  if(!grid) return;
  grid.innerHTML = `
  <aside>
    <div class="settings-menu">
      <button class="settings-tab active" data-tab="profile">👤 Profil Admin</button>
      <button class="settings-tab" data-tab="fine">▣ Sistem & Denda</button>
      <button class="settings-tab" data-tab="security">🔒 Keamanan</button>
    </div>
    <div class="help-card"><h3>Butuh Bantuan?</h3><p>Dokumentasi lengkap mengenai konfigurasi sistem tersedia di portal bantuan.</p><button class="btn btn-secondary" data-toast="Dokumentasi dibuka.">Buka Dokumentasi</button></div>
  </aside>
  <section class="form-card settings-panel active" id="panel-profile">
    <form id="settingsForm">
      <div class="page-head" style="margin-bottom:14px"><div><h1 style="font-size:24px">Profil Admin</h1></div><button class="btn btn-primary" type="submit">Simpan Perubahan</button></div>
      <div class="profile-row"><div class="profile-photo"></div><div><strong>Foto Profil</strong><br><small>Format JPG atau PNG, maksimal 2MB.</small><br><label class="link-btn" for="profilePhotoInput">Ganti Foto</label> <input id="profilePhotoInput" type="file" accept="image/*" hidden> <button type="button" class="link-btn text-danger" id="removeProfilePhoto">Hapus</button></div></div>
      <div class="form-grid">
        <div class="form-field slim"><label>Nama Lengkap</label><input value="Super Admin E-Library"></div>
        <div class="form-field slim"><label>Email</label><input value="admin@elibrary.com"></div>
        <div class="form-field slim"><label>Jabatan</label><input value="Head of Digital Resources"></div>
        <div class="form-field slim"><label>Nomor Telepon</label><input value="+62 812 3456 7890"></div>
      </div>
    </form>
  </section>
  <section class="form-card settings-panel" id="panel-fine">
    <div class="page-head" style="margin-bottom:14px"><div><h1 style="font-size:24px">Sistem & Denda</h1><p>Atur durasi pinjam dan nominal denda keterlambatan.</p></div><button class="btn btn-primary" id="saveFineSetting">Simpan Denda</button></div>
    <div class="form-grid">
      <div class="form-field slim"><label>Lama Peminjaman Default</label><input id="loanDays" type="number" value="${state.settings.loanDays}"></div>
      <div class="form-field slim"><label>Denda Per Hari</label><input id="finePerDay" type="number" value="${state.settings.finePerDay}"></div>
      <div class="form-field slim"><label>Maksimal Buku Dipinjam</label><input id="maxBorrow" type="number" value="${state.settings.maxBorrow}"></div>
      <div class="form-field slim"><label>Status Sistem Denda</label><select id="fineStatus"><option ${state.settings.fineStatus==='Aktif'?'selected':''}>Aktif</option><option ${state.settings.fineStatus==='Nonaktif'?'selected':''}>Nonaktif</option></select></div>
    </div>
  </section>
  <section class="form-card settings-panel" id="panel-security">
    <div class="page-head" style="margin-bottom:14px"><div><h1 style="font-size:24px">Keamanan</h1><p>Atur password dan keamanan akun admin.</p></div><button class="btn btn-primary" id="saveSecuritySetting">Simpan Keamanan</button></div>
    <div class="form-grid">
      <div class="form-field slim"><label>Password Lama</label><input id="oldPass" type="password"></div>
      <div class="form-field slim"><label>Password Baru</label><input id="newPass" type="password"></div>
      <div class="form-field slim"><label>Konfirmasi Password</label><input id="confirmPass" type="password"></div>
      <div class="form-field slim"><label>Login Dua Langkah</label><select id="twoFactor"><option ${state.settings.twoFactor==='Nonaktif'?'selected':''}>Nonaktif</option><option ${state.settings.twoFactor==='Aktif'?'selected':''}>Aktif</option></select></div>
    </div>
  </section>`;
  applySavedPhoto();
  $$(".settings-tab").forEach(tab=>tab.addEventListener("click",()=>{
    $$(".settings-tab").forEach(t=>t.classList.remove("active"));
    $$(".settings-panel").forEach(p=>p.classList.remove("active"));
    tab.classList.add("active");
    $("#panel-"+tab.dataset.tab).classList.add("active");
  }));
  $("#settingsForm")?.addEventListener("submit", e=>{e.preventDefault();showToast("Perubahan profil berhasil disimpan.");});
  $("#profilePhotoInput")?.addEventListener("change", e=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = () => { state.settings.photo = reader.result; saveState(); applySavedPhoto(); showToast("Foto profil berhasil diganti."); };
    reader.readAsDataURL(file);
  });
  $("#removeProfilePhoto")?.addEventListener("click",()=>{
    state.settings.photo = null; saveState();
    $$(".avatar-img,.profile-photo").forEach(el=>{el.style.backgroundImage="";el.classList.remove("has-photo");});
    showToast("Foto profil berhasil dihapus.");
  });
  $("#saveFineSetting")?.addEventListener("click",()=>{
    state.settings.loanDays = Number($("#loanDays").value || 7);
    state.settings.finePerDay = Number($("#finePerDay").value || 0);
    state.settings.maxBorrow = Number($("#maxBorrow").value || 3);
    state.settings.fineStatus = $("#fineStatus").value;
    updateFineStatus(); saveState(); updateCounts(); showToast("Pengaturan denda berhasil disimpan.");
  });
  $("#saveSecuritySetting")?.addEventListener("click",()=>{
    const oldPass = $("#oldPass").value;
    const newPass = $("#newPass").value;
    const confirm = $("#confirmPass").value;
    if(oldPass && oldPass !== "admin123"){ showToast("Password lama salah."); return; }
    if(newPass && newPass.length < 6){ showToast("Password baru minimal 6 karakter."); return; }
    if(newPass !== confirm){ showToast("Konfirmasi password tidak sama."); return; }
    state.settings.twoFactor = $("#twoFactor").value; saveState(); showToast("Pengaturan keamanan berhasil disimpan.");
  });
}

function exportCurrentPage(){
  const page = document.body.dataset.page || "";
  let headers = [], rows = [], name = "elibrary-export";
  if(page === "data-buku.html"){
    name = "data-buku"; headers = ["Kode Buku","Judul Buku","Kategori","Penulis","Tahun","Stok","Status"];
    rows = filteredBooks().map(b=>[b.code,b.title,b.category,b.author,b.year,b.stock,b.status]);
  } else if(page === "data-kategori.html"){
    name = "data-kategori"; headers = ["Nama Kategori","Jumlah Buku"];
    rows = filteredCategories().map(c=>[c.name, state.books.filter(b=>b.category===c.name).length]);
  } else if(page === "data-anggota.html"){
    name = "data-anggota"; headers = ["ID","Nama","Role","Email","No Telepon","Tanggal Bergabung","Status"];
    rows = filteredMembers().map(m=>[m.id,m.name,m.role,m.email,m.phone,m.date || formatDate(m.join),m.status]);
  } else if(page === "laporan.html"){
    name = "laporan-peminjaman"; headers = ["No","Nama Anggota","Judul Buku","Tanggal Pinjam","Tanggal Kembali","Status","Denda"];
    rows = filteredReport().map((l,i)=>[i+1,l.memberName,l.bookTitle,formatDate(l.start),formatDate(l.returned),l.status,l.fine ? rupiah(l.fine) : "-"]);
  } else {
    headers = ["Data"]; rows = [["Tidak ada data untuk diekspor"]];
  }
  downloadExcel(name, headers, rows);
}
function downloadExcel(filename, headers, rows){
  const html = `<table><thead><tr>${headers.map(h=>`<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const blob = new Blob([`<!doctype html><html><head><meta charset="UTF-8"></head><body>${html}</body></html>`], {type:"application/vnd.ms-excel"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${filename}.xls`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  showToast("File Excel berhasil diunduh.");
}
function escapeHtml(value){ return String(value ?? "").replace(/[&<>'"]/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[s])); }

function initDetailReport(){
  if(!(document.body.dataset.page||"").includes("laporan-detail")) return;
  const vals = $$(".stat-value");
  if(vals[0]) vals[0].textContent = state.loans.length.toLocaleString("id-ID");
  if(vals[1]) vals[1].textContent = rupiah(state.loans.reduce((s,l)=>s+(l.fine||0),0));
  const tbody = $(".panel table tbody");
  if(tbody){
    tbody.innerHTML = state.loans.slice(0,6).map(l=>`<tr><td><span class="badge active">${initials(l.memberName)}</span> ${l.memberName}</td><td>${l.bookTitle}</td><td>${formatDate(l.start)}</td><td>${badge(l.status === 'Selesai' ? 'Dikembalikan' : l.status)}</td><td>${l.fine ? `<span class="text-danger">${rupiah(l.fine)}</span>` : '-'}</td></tr>`).join("");
  }
}

document.addEventListener("DOMContentLoaded",()=>{
  updateFineStatus(); syncCategoryCounts(); saveState();
  initGeneral();
  initLogin();
  updateCounts();
  initDashboard();
  initBooks();
  initFormBuku();
  initCategories();
  initMembers();
  initLoanPage();
  initReturnPage();
  initSettings();
  initReport();
  initDetailReport();
});
