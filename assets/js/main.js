const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const STORAGE_KEY = "elibrary_fisik_state_v8_physical_borrowing";
const PAGE_SIZE_BOOKS = 10;
const PAGE_SIZE_CATEGORIES = 5;
const PAGE_SIZE_MEMBERS = 10;
const PAGE_SIZE_REPORT = 10;
const PAGE_SIZE_MEMBER_BOOKS = 12;
const MEMBER_SESSION_KEY = "elibrary_current_member_id";

let bookPage = 1;
let categoryPage = 1;
let memberPage = 1;
let reportPage = 1;
let memberBookPage = 1;

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


function hashString(text){
  return String(text || '').split('').reduce((acc, ch)=>((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0);
}
function escapeXml(value){
  return String(value ?? '').replace(/[&<>'"]/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[s]));
}
function splitCoverTitle(title){
  const words = String(title || 'Buku').replace(/\s+/g,' ').trim().split(' ');
  const lines = [];
  let line = '';
  words.forEach(word => {
    if((line + ' ' + word).trim().length > 18 && line){ lines.push(line); line = word; }
    else line = (line + ' ' + word).trim();
  });
  if(line) lines.push(line);
  return lines.slice(0, 3);
}
function coverTheme(category, title){
  const palettePool = [
    ['#0F172A','#2563EB','#93C5FD'], ['#312E81','#7C3AED','#DDD6FE'], ['#064E3B','#10B981','#A7F3D0'],
    ['#7C2D12','#F97316','#FED7AA'], ['#831843','#EC4899','#FBCFE8'], ['#14532D','#65A30D','#D9F99D'],
    ['#111827','#64748B','#E2E8F0'], ['#581C87','#C026D3','#F5D0FE'], ['#164E63','#06B6D4','#CFFAFE'],
    ['#450A0A','#DC2626','#FECACA'], ['#422006','#CA8A04','#FEF3C7'], ['#1E1B4B','#4F46E5','#C7D2FE'],
    ['#0C4A6E','#0284C7','#BAE6FD'], ['#052E16','#16A34A','#BBF7D0'], ['#4A044E','#D946EF','#F5D0FE'],
    ['#1F2937','#0891B2','#A5F3FC'], ['#7F1D1D','#EA580C','#FFEDD5'], ['#083344','#0E7490','#CCFBF1']
  ];
  const categoryIcons = {
    'Teknologi':'code','Sains':'atom','Fiksi & Novel':'moon','Sejarah':'pillar','Ekonomi':'chart','Seni & Desain':'brush',
    'Pendidikan':'cap','Kesehatan':'heart','Hukum':'scale','Psikologi':'brain','Agama':'star','Bahasa':'quote','Manajemen':'brief','Komunikasi':'chat'
  };
  const h = Math.abs(hashString(`${category}|${title}`));
  return { palette: palettePool[h % palettePool.length], icon: categoryIcons[category] || ['book','code','star','chat'][h % 4], layout: h % 5, seed: h };
}
function coverIconSvg(icon){
  const common = 'stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.92"';
  const icons = {
    code:`<path ${common} d="M82 150 52 180l30 30M158 150l30 30-30 30M132 132l-24 96"/>`,
    atom:`<circle cx="120" cy="180" r="9" fill="#fff" opacity=".95"/><ellipse cx="120" cy="180" rx="68" ry="24" ${common}/><ellipse cx="120" cy="180" rx="68" ry="24" transform="rotate(60 120 180)" ${common}/><ellipse cx="120" cy="180" rx="68" ry="24" transform="rotate(-60 120 180)" ${common}/>`,
    moon:`<path d="M148 128c-28 8-48 34-48 65 0 28 17 52 42 62-7 3-15 5-24 5-39 0-70-31-70-70s31-70 70-70c11 0 21 3 30 8Z" fill="#fff" opacity=".85"/>`,
    pillar:`<path ${common} d="M62 128h116M76 150h88M86 154v86M118 154v86M150 154v86M66 244h108M58 264h124"/>`,
    chart:`<path ${common} d="M60 236V132M60 236h132M88 210l28-38 28 22 36-62"/><circle cx="88" cy="210" r="7" fill="#fff"/><circle cx="116" cy="172" r="7" fill="#fff"/><circle cx="144" cy="194" r="7" fill="#fff"/><circle cx="180" cy="132" r="7" fill="#fff"/>`,
    brush:`<path ${common} d="M150 126l36 36-72 72c-12 12-32 13-45 2 9-1 18-6 25-13l56-97Z"/><path d="M70 238c-20 3-28 14-30 34 20-2 31-10 34-30Z" fill="#fff" opacity=".85"/>`,
    cap:`<path d="M42 166l78-42 78 42-78 42-78-42Z" fill="#fff" opacity=".85"/><path ${common} d="M78 188v34c26 18 58 18 84 0v-34M198 166v58"/>`,
    heart:`<path d="M120 248s-72-42-72-90c0-25 18-43 41-43 14 0 25 7 31 18 6-11 17-18 31-18 23 0 41 18 41 43 0 48-72 90-72 90Z" fill="#fff" opacity=".88"/>`,
    scale:`<path ${common} d="M120 116v140M72 140h96M88 140l-34 64h68l-34-64ZM152 140l-34 64h68l-34-64ZM82 260h76"/>`,
    brain:`<path ${common} d="M96 126c-22 0-38 18-35 39-16 9-20 32-7 46-6 22 12 42 34 38 8 17 34 20 45 4 21 5 40-11 39-32 16-10 17-34 2-45 6-23-12-44-35-40-9-16-33-19-43-10Z"/>`,
    star:`<path d="M120 116l20 42 46 7-33 32 8 46-41-22-41 22 8-46-33-32 46-7 20-42Z" fill="#fff" opacity=".86"/>`,
    quote:`<path d="M84 148h42v42c0 30-16 50-44 62l-12-22c15-7 23-18 24-32H66v-50h18Zm76 0h42v42c0 30-16 50-44 62l-12-22c15-7 23-18 24-32h-28v-50h18Z" fill="#fff" opacity=".86"/>`,
    brief:`<path ${common} d="M62 154h116v92H62zM98 154v-22h44v22M62 188h116M112 202h16"/>`,
    chat:`<path ${common} d="M58 140h124v78H94l-36 32v-110Z"/><path ${common} d="M86 170h68M86 198h44"/>`,
    book:`<path ${common} d="M62 130h58c18 0 32 14 32 32v90c0-16-14-30-32-30H62V130Zm90 0h26v92h-26"/>`
  };
  return icons[icon] || icons.book;
}
function coverDataUri(book){
  const b = book || {};
  const {palette, icon, layout, seed} = coverTheme(b.category, b.title);
  const [c1,c2,c3] = palette;
  const lines = splitCoverTitle(b.title);
  const titleY = layout === 0 ? 74 : layout === 1 ? 88 : layout === 2 ? 62 : 78;
  const titleText = lines.map((line,i)=>`<text x="28" y="${titleY+i*23}" font-size="18" font-weight="900" fill="#ffffff">${escapeXml(line)}</text>`).join('');
  const initialsText = String(b.category || 'Buku').slice(0,2).toUpperCase();
  const author = String(b.author || 'Perpustakaan').slice(0,28);
  const year = String(b.year || new Date().getFullYear());
  const shapeA = 42 + (seed % 120), shapeB = 38 + ((seed >> 3) % 90);
  const iconY = layout % 2 === 0 ? 176 : 190;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320" viewBox="0 0 240 320">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="0.55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient>
      <radialGradient id="r" cx="50%" cy="50%" r="65%"><stop offset="0" stop-color="#fff" stop-opacity=".30"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="240" height="320" rx="18" fill="url(#g)"/>
    <circle cx="${shapeA}" cy="${shapeB}" r="72" fill="url(#r)"/>
    <circle cx="198" cy="56" r="54" fill="#ffffff" opacity=".14"/>
    <path d="M0 250 C62 218 120 280 240 236 L240 320 L0 320 Z" fill="#000000" opacity=".16"/>
    <rect x="24" y="22" width="56" height="24" rx="12" fill="#ffffff" opacity=".22"/>
    <text x="52" y="40" font-size="12" font-weight="900" text-anchor="middle" fill="#fff">${escapeXml(initialsText)}</text>
    <text x="28" y="60" font-size="9" font-weight="800" fill="#fff" opacity=".78">BUKU FISIK</text>
    ${titleText}
    <g transform="translate(0 ${iconY-180})">${coverIconSvg(icon)}</g>
    <rect x="28" y="230" width="184" height="1.5" fill="#ffffff" opacity=".42"/>
    <text x="28" y="256" font-size="12" font-weight="800" fill="#fff" opacity=".90">${escapeXml(author)}</text>
    <text x="28" y="278" font-size="11" font-weight="800" fill="#fff" opacity=".78">${escapeXml(b.category || 'Buku')} • ${escapeXml(year)}</text>
    <text x="28" y="302" font-size="10" font-weight="900" fill="#fff" opacity=".65">${escapeXml(b.code || 'BUKU')}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
function bookCover(book, extraClass=''){
  return `<div class="cover-digital ${extraClass}" style="background-image:url('${coverDataUri(book)}')" title="Cover ${escapeHtml(book?.title || 'Buku')}"></div>`;
}

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
        desc:`Koleksi ${cat.name} dalam bentuk buku fisik untuk referensi pembelajaran dan literasi.`
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
      password: idx % 7 === 0 ? "dosen123" : "anggota123",
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

function ensureDefaultMemberAccounts(){
  let changed = false;
  state.members.forEach(m => {
    if(!m.status){ m.status = "Aktif"; changed = true; }
    if(!m.password){ m.password = m.role === "Dosen" ? "dosen123" : "anggota123"; changed = true; }
    if(!m.abbr){ m.abbr = initials(m.name); changed = true; }
  });
  const siti = state.members.find(m => String(m.email || '').toLowerCase() === 'siti-aminah@unpam.ac.id') || state.members.find(m => m.name === 'Siti Aminah');
  if(siti){
    Object.assign(siti, {name:'Siti Aminah', role:'Mahasiswa', email:'siti-aminah@unpam.ac.id', status:siti.status || 'Aktif', password:siti.password || 'anggota123', abbr:'SA'});
    changed = true;
  }
  const lecturerEmail = 'dosen.elibrary@unpam.ac.id';
  let lecturer = state.members.find(m => String(m.email || '').toLowerCase() === lecturerEmail);
  if(!lecturer){
    const nums = state.members.map(m => Number((String(m.id||'').match(/(\d+)$/) || [0,0])[1]));
    lecturer = {
      id:'LIB-2024-' + String(Math.max(50, ...nums) + 1).padStart(3,'0'),
      name:'Dosen E-Library', role:'Dosen', email:lecturerEmail, phone:'081200991177',
      join:'2024-01-10', date:formatDate('2024-01-10'), status:'Aktif', password:'dosen123', abbr:'DE', photo:null
    };
    state.members.push(lecturer);
    changed = true;
  }else{
    Object.assign(lecturer, {role:'Dosen', status:lecturer.status || 'Aktif', password:lecturer.password || 'dosen123', abbr:lecturer.abbr || initials(lecturer.name || 'Dosen E-Library')});
    changed = true;
  }
  if(changed) saveState();
}

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
            s.includes("menunggu") || s.includes("konfirmasi") || s.includes("tempo") ? "active" :
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
    if(["Selesai","Menunggu Persetujuan","Ditolak"].includes(l.status)) return;
    const due = new Date((l.due || todayISO()) + "T00:00:00");
    const late = Math.max(0, Math.ceil((now - due) / 86400000));
    l.fine = cfg.fineStatus === "Aktif" ? late * Number(cfg.finePerDay || 0) : 0;
    if(l.status === "Menunggu Konfirmasi") return;
    l.status = late > 0 ? "Terlambat" : "Aktif";
  });
  saveState();
}

function getNotifications(){
  updateFineStatus();
  const pending = state.loans.filter(l => l.status === "Menunggu Konfirmasi");
  const pendingLoan = state.loans.filter(l => l.status === "Menunggu Persetujuan");
  const late = state.loans.filter(l => l.status === "Terlambat");
  const lowStock = state.books.filter(b => Number(b.stock) <= 2);
  const suspended = state.members.filter(m => m.status === "Suspended");
  const pendingAccounts = state.members.filter(m => m.status === "Menunggu Persetujuan");
  return [
    ...pendingAccounts.map(m => ({type:"Registrasi", text:`${m.name} (${m.role}) menunggu persetujuan akun.`, href:"data-anggota.html"})),
    ...pendingLoan.map(l => ({type:"Pengajuan Pinjam", text:`${l.memberName} mengajukan peminjaman ${l.bookTitle}.`, href:"peminjaman.html"})),
    ...pending.map(l => ({type:"Konfirmasi", text:`${l.memberName} mengajukan pengembalian ${l.bookTitle}.`, href:"pengembalian.html"})),
    ...late.map(l => ({type:"Terlambat", text:`${l.memberName} terlambat mengembalikan ${l.bookTitle}.`, href:"pengembalian.html"})),
    ...lowStock.slice(0,5).map(b => ({type:"Stok", text:`Stok buku ${b.title} hampir habis.`, href:"data-buku.html"})),
    ...suspended.slice(0,3).map(m => ({type:"Anggota", text:`Status anggota ${m.name} perlu dicek.`, href:"data-anggota.html"}))
  ];
}
function initNotifications(){
  const bell = $(".bell");
  if(!bell) return;
  const notes = isMemberPage() ? getMemberNotifications() : getNotifications();
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
    else if(page === "anggota-dashboard.html") renderMemberDashboard();
    else if(page === "anggota-katalog.html") { memberBookPage = 1; renderMemberCatalog(); }
    else if(page === "anggota-peminjaman.html") renderMemberLoans();
    else if(page === "anggota-pengembalian.html") renderMemberReturns();
    else if(page === "anggota-riwayat.html") renderMemberHistory();
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
    const emailValue = email.value.trim().toLowerCase();
    const passValue = pass.value.trim();
    $("#emailError").textContent = "";
    $("#passwordError").textContent = "";

    if(emailValue === "admin@elibrary.com" && passValue === "admin123"){
      localStorage.setItem("elibrary_auth_role", "admin");
      location.href = "dashboard.html";
      return;
    }

    const member = state.members.find(m => String(m.email || "").toLowerCase() === emailValue);
    if(!member){
      $("#emailError").textContent = "Email belum terdaftar.";
      $("#passwordError").textContent = "Periksa kembali kata sandi.";
      return;
    }
    if(member.status === "Menunggu Persetujuan"){
      $("#emailError").textContent = "Akun sedang menunggu persetujuan admin.";
      return;
    }
    if(member.status === "Ditolak"){
      $("#emailError").textContent = "Pendaftaran akun belum disetujui.";
      return;
    }
    if(member.status !== "Aktif"){
      $("#emailError").textContent = "Akun belum aktif. Hubungi admin perpustakaan.";
      return;
    }
    const memberPassword = member.password || (member.role === "Dosen" ? "dosen123" : "anggota123");
    if(passValue === memberPassword){
      localStorage.setItem("elibrary_auth_role", "anggota");
      localStorage.setItem(MEMBER_SESSION_KEY, member.id);
      location.href = "anggota-dashboard.html";
      return;
    }

    $("#passwordError").textContent = "Kata sandi salah.";
  });
}

function initRegister(){
  const form = $("#registerForm");
  if(!form) return;
  const pass = $("#regPassword");
  const confirm = $("#regConfirmPassword");
  const toggle = $("#toggleRegPassword");
  if(toggle) toggle.addEventListener("click",()=> pass.type = pass.type === "password" ? "text" : "password");
  form.addEventListener("submit", e => {
    e.preventDefault();
    $$("#registerForm .error-text").forEach(el => el.textContent = "");
    const name = $("#regName").value.trim();
    const email = $("#regEmail").value.trim().toLowerCase();
    const phone = $("#regPhone").value.trim();
    const role = $("#regRole").value;
    const password = pass.value.trim();
    const confirmPassword = confirm.value.trim();
    let ok = true;
    if(!name){ $("#regNameError").textContent = "Nama wajib diisi."; ok = false; }
    if(!email || !email.includes("@")){ $("#regEmailError").textContent = "Email valid wajib diisi."; ok = false; }
    if(state.members.some(m => String(m.email || "").toLowerCase() === email)){
      $("#regEmailError").textContent = "Email sudah terdaftar."; ok = false;
    }
    if(!phone){ $("#regPhoneError").textContent = "Nomor telepon wajib diisi."; ok = false; }
    if(password.length < 6){ $("#regPasswordError").textContent = "Kata sandi minimal 6 karakter."; ok = false; }
    if(password !== confirmPassword){ $("#regConfirmError").textContent = "Konfirmasi kata sandi tidak sama."; ok = false; }
    if(!ok) return;

    const join = todayISO();
    const item = {
      id: nextMemberId(), name, role, email, phone, join, date:formatDate(join),
      status:"Menunggu Persetujuan", password, abbr:initials(name), photo:null
    };
    state.members.push(item);
    saveState();
    const msg = $("#registerMessage");
    if(msg){ msg.innerHTML = `<strong>Pendaftaran terkirim.</strong><br>Akun kamu menunggu persetujuan admin sebelum bisa login.`; msg.classList.add("show"); }
    showToast("Pendaftaran berhasil dikirim. Menunggu persetujuan admin.");
    setTimeout(()=>location.href="index.html", 1800);
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
      <td><div class="book-cell">${bookCover(b,'cover-mini')}<span>${b.title}</span></div></td>
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
  openModal(`<h3>Detail Buku</h3><div class="member-detail-book">${bookCover(b,'ebook-cover big')}<div><h3>${b.title}</h3><p>${b.desc || 'Koleksi buku fisik perpustakaan.'}</p>
    <table><tr><td>Kode</td><td>${b.code}</td></tr><tr><td>Kategori</td><td>${b.category}</td></tr><tr><td>Penulis</td><td>${b.author}</td></tr><tr><td>Tahun</td><td>${b.year}</td></tr><tr><td>Stok</td><td>${b.stock}</td></tr><tr><td>Status</td><td>${b.status}</td></tr></table></div></div>
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
      <td><div class="action-row">${m.status === "Menunggu Persetujuan" ? `<button class="mini-btn success" data-approve-member="${m.id}">Setujui</button><button class="mini-btn danger" data-reject-member="${m.id}">Tolak</button>` : ""}<button class="icon-action" data-edit-member="${m.id}">${icon('edit')}</button><button class="icon-action danger" data-delete-member="${m.id}">${icon('trash')}</button></div></td>
    </tr>`).join("");
  $$('[data-approve-member]').forEach(btn=>btn.addEventListener('click',()=>approveMember(btn.dataset.approveMember)));
  $$('[data-reject-member]').forEach(btn=>btn.addEventListener('click',()=>rejectMember(btn.dataset.rejectMember)));
  $$("[data-edit-member]").forEach(btn=>btn.addEventListener("click",()=>memberModal(state.members.find(m=>m.id===btn.dataset.editMember))));
  $$("[data-delete-member]").forEach(btn=>btn.addEventListener("click",()=> {
    openModal(`<h3>Hapus Anggota?</h3><p>Data anggota akan dihapus dari tampilan.</p><div class="modal-actions"><button class="btn btn-secondary" data-close>Batal</button><button class="btn btn-danger" id="doDelMember">Hapus</button></div>`);
    $("#doDelMember").addEventListener("click",()=>{state.members = state.members.filter(m=>m.id !== btn.dataset.deleteMember);saveState();closeModal();memberPage=1;renderMembersFiltered();updateCounts();showToast("Anggota berhasil dihapus.");});
  }));
}
function approveMember(id){
  state.members = state.members.map(m => m.id === id ? {...m, status:"Aktif", password:m.password || (m.role === "Dosen" ? "dosen123" : "anggota123")} : m);
  saveState(); renderMembersFiltered(); updateCounts(); showToast("Akun anggota disetujui dan sudah bisa login.");
}
function rejectMember(id){
  openModal(`<h3>Tolak Pendaftaran?</h3><p>Akun ini tidak akan bisa login sampai admin mengubah statusnya menjadi Aktif.</p><div class="modal-actions"><button class="btn btn-secondary" data-close>Batal</button><button class="btn btn-danger" id="doRejectMember">Tolak</button></div>`);
  $("#doRejectMember").addEventListener("click",()=>{
    state.members = state.members.map(m => m.id === id ? {...m, status:"Ditolak"} : m);
    saveState(); closeModal(); renderMembersFiltered(); updateCounts(); showToast("Pendaftaran anggota ditolak.");
  });
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
      <div class="form-field slim"><label>Status</label><select id="mStatus"><option ${m.status==='Aktif'?'selected':''}>Aktif</option><option ${m.status==='Menunggu Persetujuan'?'selected':''}>Menunggu Persetujuan</option><option ${m.status==='Ditolak'?'selected':''}>Ditolak</option><option ${m.status==='Suspended'?'selected':''}>Suspended</option></select></div>
      <div class="form-field slim"><label>Kata Sandi Akun</label><input id="mPassword" type="text" value="${m.password || ''}" placeholder="Isi kata sandi anggota"></div>
    </div>
    <div class="modal-actions"><button class="btn btn-secondary" data-close>Batal</button><button class="btn btn-primary" id="saveMember">Simpan</button></div>`);
  $("#saveMember").addEventListener("click",()=>{
    const name = $("#mName").value.trim();
    const email = $("#mEmail").value.trim();
    const phone = $("#mPhone").value.trim();
    const join = $("#mJoin").value || todayISO();
    if(!name || !email || !phone){ showToast("Nama, email, dan nomor telepon wajib diisi."); return; }
    const role = $("#mRole").value;
    const password = $("#mPassword")?.value.trim() || (role === "Dosen" ? "dosen123" : "anggota123");
    const item = {id:$("#mId").value, name, role, email, phone, join, date:formatDate(join), status:$("#mStatus").value, password, abbr:initials(name), photo:(data && data.photo) || null};
    if(isEdit) state.members = state.members.map(x=>x.id===item.id?item:x); else state.members.push(item);
    saveState(); closeModal(); memberPage=1; renderMembersFiltered(); updateCounts(); showToast("Data anggota berhasil disimpan.");
  });
}
function filteredMembers(){
  const q = ($("#topSearch")?.value || "").toLowerCase().trim();
  const activeTab = $(".member-tab.active")?.dataset.role || "all";
  let list = state.members.filter(m => activeTab === "all" || (activeTab === "pending" ? m.status === "Menunggu Persetujuan" : m.role.toLowerCase() === activeTab));
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
  let active = state.loans.filter(l=>!["Selesai","Ditolak"].includes(l.status));
  if(q) active = active.filter(l=>[l.memberName,l.memberId,l.bookTitle,l.bookCode,l.status].join(" ").toLowerCase().includes(q));
  tbody.innerHTML = active.map((l,i)=>{
    const actions = l.status === "Menunggu Persetujuan"
      ? `<div class="action-row action-stack"><button class="process-btn" data-approve-loan="${l.id}">Setujui</button><button class="process-btn danger" data-reject-loan="${l.id}">Tolak</button></div>`
      : `<span class="muted">-</span>`;
    return `<tr><td>${i+1}</td><td>${l.memberName}<br><small>${l.memberId}</small></td><td>${l.bookTitle}<br><small>${l.bookCode}</small></td><td>${formatDate(l.start)}</td><td>${formatDate(l.due)}</td><td>${badge(l.status)}</td><td>${actions}</td></tr>`;
  }).join("");
  $$('[data-approve-loan]').forEach(btn=>btn.addEventListener("click",()=>approveLoanRequest(Number(btn.dataset.approveLoan))));
  $$('[data-reject-loan]').forEach(btn=>btn.addEventListener("click",()=>rejectLoanRequest(Number(btn.dataset.rejectLoan))));
  const pill = nextPanel.querySelector(".badge.muted");
  if(pill) pill.textContent = `${active.length} data`;
}
function approveLoanRequest(id){
  const l = state.loans.find(x=>Number(x.id) === id); if(!l) return;
  const b = bookByCode(l.bookCode);
  if(!b || Number(b.stock) <= 0){ showToast("Stok buku fisik sedang habis. Pengajuan belum dapat disetujui."); return; }
  openModal(`<h3>Setujui Peminjaman?</h3><p>Setelah disetujui, stok buku fisik berkurang dan anggota dapat mengambil buku di perpustakaan.</p><div class="form-field"><label>Anggota</label><input value="${escapeHtml(l.memberName)}" readonly></div><div class="form-field"><label>Judul Buku</label><input value="${escapeHtml(l.bookTitle)}" readonly></div><div class="modal-actions"><button class="btn btn-secondary" data-close>Batal</button><button class="btn btn-primary" id="doApproveLoan">Setujui</button></div>`);
  $("#doApproveLoan")?.addEventListener("click",()=>{
    state.loans = state.loans.map(x=>Number(x.id) === id ? {...x, start:todayISO(), due:addDaysISO(Number(state.settings.loanDays || 7)), status:"Aktif", returned:"", fine:0} : x);
    state.books = state.books.map(book => book.code === l.bookCode ? {...book, stock:Math.max(0,Number(book.stock)-1), status:Number(book.stock)-1 > 0 ? "Tersedia" : "Habis"} : book);
    saveState(); closeModal(); renderLoanActiveTable(); updateCounts(); showToast("Peminjaman disetujui. Buku fisik siap diambil anggota.");
  });
}
function rejectLoanRequest(id){
  const l = state.loans.find(x=>Number(x.id) === id); if(!l) return;
  openModal(`<h3>Tolak Pengajuan?</h3><p>Pengajuan peminjaman buku fisik ini akan ditandai ditolak.</p><div class="form-field"><label>Judul Buku</label><input value="${escapeHtml(l.bookTitle)}" readonly></div><div class="modal-actions"><button class="btn btn-secondary" data-close>Batal</button><button class="btn btn-danger" id="doRejectLoan">Tolak</button></div>`);
  $("#doRejectLoan")?.addEventListener("click",()=>{
    state.loans = state.loans.map(x=>Number(x.id) === id ? {...x, status:"Ditolak", returned:todayISO(), fine:0} : x);
    saveState(); closeModal(); renderLoanActiveTable(); updateCounts(); showToast("Pengajuan peminjaman ditolak.");
  });
}

function initReturnPage(){ if(!(document.body.dataset.page||"").includes("pengembalian")) return; renderReturnRows(); }
function renderReturnRows(){
  updateFineStatus();
  const tbody = $(".return-table tbody");
  if(!tbody) return;
  const q = ($("#topSearch")?.value || "").toLowerCase().trim();
  let active = state.loans.filter(l=>["Aktif","Terlambat","Menunggu Konfirmasi"].includes(l.status));
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
    <div class="help-card"><h3>Butuh Bantuan?</h3><p>Dokumentasi lengkap mengenai konfigurasi sistem tersedia di portal bantuan.</p><a class="btn btn-secondary" href="dokumentasi.html">Buka Dokumentasi</a></div>
  </aside>
  <section class="form-card settings-panel active" id="panel-profile">
    <form id="settingsForm">
      <div class="page-head" style="margin-bottom:14px"><div><h1 style="font-size:24px">Profil Admin</h1></div><button class="btn btn-primary" type="submit">Simpan Perubahan</button></div>
      <div class="profile-row"><div class="profile-photo"></div><div><strong>Foto Profil</strong><br><small>Format JPG atau PNG, maksimal 2MB.</small><br><label class="link-btn" for="profilePhotoInput">Ganti Foto</label> <input id="profilePhotoInput" type="file" accept="image/*" hidden> <button type="button" class="link-btn text-danger" id="removeProfilePhoto">Hapus</button></div></div>
      <div class="form-grid">
        <div class="form-field slim"><label>Nama Lengkap</label><input value="Super Admin E-Library"></div>
        <div class="form-field slim"><label>Email</label><input value="admin@elibrary.com"></div>
        <div class="form-field slim"><label>Jabatan</label><input value="Kepala Sirkulasi Perpustakaan"></div>
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
  } else if(page === "anggota-riwayat.html" || page === "anggota-peminjaman.html" || page === "anggota-pengembalian.html"){
    name = page === "anggota-riwayat.html" ? "riwayat-anggota" : page.replace(".html", "");
    headers = ["No","Judul Buku","Tanggal Pinjam","Batas Kembali","Tanggal Dikembalikan","Status","Denda"];
    rows = getMemberLoans().map((l,i)=>[i+1,l.bookTitle,formatDate(l.start),formatDate(l.due),formatDate(l.returned),l.status,l.fine ? rupiah(l.fine) : "-"]);
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


/* MEMBER PORTAL */
function isMemberPage(){ return (document.body.dataset.page || "").startsWith("anggota-"); }
function getCurrentMember(){
  const savedId = localStorage.getItem(MEMBER_SESSION_KEY);
  const member = state.members.find(m => m.id === savedId) || state.members.find(m => m.email === "siti-aminah@unpam.ac.id") || state.members[1] || state.members[0];
  if(member && !member.role) member.role = "Mahasiswa";
  return member;
}
function setMemberIdentity(){
  if(!isMemberPage()) return;
  const m = getCurrentMember();
  if(!m) return;
  $$(".member-name").forEach(el => el.textContent = m.name);
  $$(".member-role").forEach(el => el.textContent = m.role || "Mahasiswa");
  $$(".member-id").forEach(el => { if(el.tagName === "INPUT") el.value = m.id; else el.textContent = m.id; });
  $$(".member-email").forEach(el => { if(el.tagName === "INPUT") el.value = m.email; else el.textContent = m.email; });
  $$(".member-phone").forEach(el => { if(el.tagName === "INPUT") el.value = m.phone || "-"; else el.textContent = m.phone || "-"; });
  $$(".member-join").forEach(el => { if(el.tagName === "INPUT") el.value = m.date || formatDate(m.join); else el.textContent = m.date || formatDate(m.join); });
  $$(".member-status").forEach(el => el.innerHTML = badge(m.status || "Aktif"));
  $$(".member-initial").forEach(el => el.textContent = m.abbr || initials(m.name));
  $$(".member-avatar").forEach(el => {
    if(m.photo){ el.style.backgroundImage = `url(${m.photo})`; el.classList.add("has-photo"); el.textContent = ""; }
    else { el.style.backgroundImage = ""; el.classList.remove("has-photo"); el.textContent = m.abbr || initials(m.name); }
  });
}
function getMemberLoans(){
  const m = getCurrentMember();
  if(!m) return [];
  updateFineStatus();
  return state.loans.filter(l => l.memberId === m.id);
}
function daysUntilDue(dateStr){
  const due = new Date((dateStr || todayISO()) + "T00:00:00");
  const now = new Date(todayISO() + "T00:00:00");
  return Math.ceil((due - now) / 86400000);
}
function getMemberNotifications(){
  const loans = getMemberLoans();
  const pendingApproval = loans.filter(l => l.status === "Menunggu Persetujuan");
  const pending = loans.filter(l => l.status === "Menunggu Konfirmasi");
  const late = loans.filter(l => l.status === "Terlambat");
  const dueSoon = loans.filter(l => l.status === "Aktif" && daysUntilDue(l.due) >= 0 && daysUntilDue(l.due) <= 2);
  const active = loans.filter(l => l.status === "Aktif" && daysUntilDue(l.due) > 2);
  return [
    ...late.map(l => ({type:"Terlambat", text:`Buku ${l.bookTitle} sudah melewati batas kembali.`, href:"anggota-pengembalian.html"})),
    ...dueSoon.map(l => ({type:"Jatuh Tempo", text:`Buku ${l.bookTitle} jatuh tempo ${daysUntilDue(l.due) === 0 ? "hari ini" : daysUntilDue(l.due) + " hari lagi"}.`, href:"anggota-pengembalian.html"})),
    ...pendingApproval.map(l => ({type:"Pengajuan", text:`Peminjaman ${l.bookTitle} menunggu persetujuan admin.`, href:"anggota-peminjaman.html"})),
    ...pending.map(l => ({type:"Menunggu", text:`Pengembalian ${l.bookTitle} menunggu konfirmasi admin.`, href:"anggota-pengembalian.html"})),
    ...active.slice(0,2).map(l => ({type:"Aktif", text:`Buku ${l.bookTitle} sedang kamu pinjam.`, href:"anggota-peminjaman.html"}))
  ];
}
function memberBorrowedCodes(){ return new Set(getMemberLoans().filter(l=>!["Selesai","Ditolak"].includes(l.status)).map(l=>l.bookCode)); }
function memberFilteredBooks(){
  const q = ($("#topSearch")?.value || "").toLowerCase().trim();
  const cat = $("#memberCategory")?.value || "all";
  let list = state.books.filter(b => {
    const matchQ = [b.code,b.title,b.category,b.author,b.year].join(" ").toLowerCase().includes(q);
    const matchCat = cat === "all" || b.category === cat;
    return matchQ && matchCat;
  });
  return list;
}
function initMemberPages(){
  if(!isMemberPage()) return;
  updateDashboardYearLabels();
  setMemberIdentity();
  populateMemberCategorySelect();
  renderMemberDashboard();
  renderMemberCatalog();
  renderMemberLoans();
  renderMemberReturns();
  renderMemberHistory();
  initMemberProfile();
}
function populateMemberCategorySelect(){
  const select = $("#memberCategory");
  if(!select) return;
  const names = getCategoryNames();
  select.innerHTML = `<option value="all">Semua Kategori</option>` + names.map(n=>`<option>${n}</option>`).join("");
  select.addEventListener("input",()=>{memberBookPage=1;renderMemberCatalog();});
}
function renderMemberDashboard(){
  if((document.body.dataset.page||"") !== "anggota-dashboard.html") return;
  const loans = getMemberLoans();
  const active = loans.filter(l=>l.status === "Aktif");
  const pending = loans.filter(l=>l.status === "Menunggu Konfirmasi");
  const late = loans.filter(l=>l.status === "Terlambat");
  const finished = loans.filter(l=>l.status === "Selesai");
  const dueSoon = active.filter(l=>daysUntilDue(l.due) >= 0 && daysUntilDue(l.due) <= 2);
  const vals = $$(".stats-grid .stat-value");
  if(vals[0]) vals[0].textContent = state.books.length.toLocaleString("id-ID");
  if(vals[1]) vals[1].textContent = active.length.toLocaleString("id-ID");
  if(vals[2]) vals[2].textContent = dueSoon.length.toLocaleString("id-ID");
  if(vals[3]) vals[3].textContent = finished.length.toLocaleString("id-ID");

  const bars = $$(".bar-chart .bar");
  if(bars.length){
    const values = Array(12).fill(0);
    loans.forEach(l=>{ const d = new Date(l.start+"T00:00:00"); if(!isNaN(d)) values[d.getMonth()]++; });
    const max = Math.max(1,...values);
    bars.forEach((bar,i)=>{ bar.style.height = `${Math.max(25, Math.round((values[i]/max)*88))}%`; });
  }

  const catCard = $(".member-category-card");
  if(catCard){
    const top = topCategories().slice(0,3);
    const max = Math.max(1,...top.map(c=>c.count));
    catCard.innerHTML = `<h2>Rekomendasi Kategori</h2>${top.map((c,i)=>`<div class="progress-item"><div class="row"><span>${c.name}</span><strong>${c.count}</strong></div><div class="progress-line"><span class="${i===0?'blue':i===2?'red':''}" style="width:${Math.max(8,Math.round(c.count/max*100))}%"></span></div></div>`).join("")}<a class="btn btn-primary btn-full" href="anggota-katalog.html">Lihat Katalog</a>`;
  }

  const tbody = $("#memberRecentRows");
  if(tbody){
    const q = ($("#topSearch")?.value || "").toLowerCase().trim();
    let list = loans;
    if(q) list = list.filter(l=>[l.bookTitle,l.bookCode,l.status].join(" ").toLowerCase().includes(q));
    tbody.innerHTML = list.slice(0,5).map((l,i)=>`<tr><td>${String(i+1).padStart(2,"0")}</td><td>${l.bookTitle}<br><small>${l.bookCode}</small></td><td>${formatDate(l.start)}</td><td>${formatDate(l.due)}</td><td>${badge(l.status)}</td></tr>`).join("") || `<tr><td colspan="5">Belum ada riwayat peminjaman.</td></tr>`;
  }
}
function renderMemberCatalog(){
  if((document.body.dataset.page||"") !== "anggota-katalog.html") return;
  const wrap = $("#memberCatalogRows");
  if(!wrap) return;
  const list = memberFilteredBooks();
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE_MEMBER_BOOKS));
  if(memberBookPage > totalPages) memberBookPage = totalPages;
  const slice = list.slice((memberBookPage-1)*PAGE_SIZE_MEMBER_BOOKS, memberBookPage*PAGE_SIZE_MEMBER_BOOKS);
  const borrowed = memberBorrowedCodes();
  const vals = $$(".stats-grid .stat-value");
  if(vals[0]) vals[0].textContent = state.books.length.toLocaleString("id-ID");
  if(vals[1]) vals[1].textContent = getCategoryNames().length.toLocaleString("id-ID");
  if(vals[2]) vals[2].textContent = Number(state.settings.maxBorrow || 3);
  if(vals[3]) vals[3].textContent = "Online";
  wrap.innerHTML = slice.map(b => {
    const isBorrowed = borrowed.has(b.code);
    const available = Number(b.stock) > 0 && !isBorrowed;
    return `<article class="ebook-card">
      <div class="ebook-cover-wrap">${bookCover(b,'ebook-cover')}<span class="badge ${Number(b.stock)>0?'success':'danger'}">${Number(b.stock)>0?'Tersedia':'Habis'}</span></div>
      <div class="ebook-body">
        <strong>${b.title}</strong>
        <p>${b.author} • ${b.year}</p>
        <span class="badge muted">${b.category}</span>
      </div>
      <div class="ebook-actions">
        <button class="btn btn-outline" data-member-detail="${b.code}">Detail</button>
        ${isBorrowed ? `<button class="btn btn-primary" data-loan-status="${b.code}">Lihat Status</button>` : `<button class="btn btn-primary" ${available?'':'disabled'} data-member-borrow="${b.code}">Ajukan Pinjam</button>`}
      </div>
    </article>`;
  }).join("");
  $$('[data-member-detail]').forEach(btn=>btn.addEventListener("click",()=>showMemberBookDetail(btn.dataset.memberDetail)));
  $$('[data-member-borrow]').forEach(btn=>btn.addEventListener("click",()=>borrowDigitalBook(btn.dataset.memberBorrow)));
  $$('[data-loan-status]').forEach(btn=>btn.addEventListener("click",()=>openLoanStatus(btn.dataset.loanStatus)));
  const meta = $("#memberCatalogMeta");
  if(meta){
    meta.querySelector("span").textContent = rangeText(memberBookPage, PAGE_SIZE_MEMBER_BOOKS, list.length, "buku");
    renderPager(meta.querySelector(".pagination"), memberBookPage, totalPages, p=>{memberBookPage=p;renderMemberCatalog();});
  }
}
function showMemberBookDetail(code){
  const b = bookByCode(code); if(!b) return;
  const borrowed = memberBorrowedCodes().has(code);
  openModal(`<h3>Detail Buku</h3><div class="member-detail-book detail-book-modal">${bookCover(b,'ebook-cover big')}<div><h3>${escapeHtml(b.title)}</h3><p>${escapeHtml(b.desc || 'Koleksi buku fisik perpustakaan.')}</p><table><tr><td>Kode</td><td>${escapeHtml(b.code)}</td></tr><tr><td>Kategori</td><td>${escapeHtml(b.category)}</td></tr><tr><td>Penulis</td><td>${escapeHtml(b.author)}</td></tr><tr><td>Tahun</td><td>${escapeHtml(b.year)}</td></tr><tr><td>Stok</td><td>${escapeHtml(b.stock)}</td></tr></table></div></div><div class="modal-actions"><button class="btn btn-secondary" data-close>Tutup</button>${borrowed ? `<button class="btn btn-primary" id="statusFromDetail">Lihat Status</button>` : `<button class="btn btn-primary" id="borrowFromDetail" ${Number(b.stock)>0 ? '' : 'disabled'}>Ajukan Pinjam</button>`}</div>`);
  $("#borrowFromDetail")?.addEventListener("click",()=>borrowDigitalBook(code));
  $("#statusFromDetail")?.addEventListener("click",()=>openLoanStatus(code));
}
function openLoanStatus(code){
  const b = bookByCode(code); if(!b) return;
  const activeLoan = getMemberLoans().find(l => l.bookCode === code && !["Selesai","Ditolak"].includes(l.status));
  if(!activeLoan){ showToast('Belum ada pengajuan atau peminjaman aktif untuk buku ini.'); return; }
  const note = activeLoan.status === "Menunggu Persetujuan"
    ? "Pengajuan peminjaman sudah dikirim. Tunggu persetujuan admin sebelum mengambil buku fisik di perpustakaan."
    : activeLoan.status === "Menunggu Konfirmasi"
      ? "Pengembalian sudah diajukan. Tunggu admin mengonfirmasi buku fisik sudah diterima."
      : "Buku fisik sedang dalam status peminjaman aktif. Kembalikan buku sebelum batas kembali.";
  openModal(`<h3>Status Peminjaman</h3><div class="member-detail-book detail-book-modal">${bookCover(b,'ebook-cover big')}<div><h3>${escapeHtml(b.title)}</h3><p>${escapeHtml(note)}</p><table><tr><td>Kode</td><td>${escapeHtml(b.code)}</td></tr><tr><td>Status</td><td>${badge(activeLoan.status)}</td></tr><tr><td>Tanggal Pinjam</td><td>${formatDate(activeLoan.start)}</td></tr><tr><td>Batas Kembali</td><td>${formatDate(activeLoan.due)}</td></tr><tr><td>Denda</td><td>${rupiah(activeLoan.fine || 0)}</td></tr></table></div></div><div class="modal-actions"><button class="btn btn-secondary" data-close>Tutup</button><a class="btn btn-primary" href="anggota-peminjaman.html">Lihat Peminjaman Saya</a></div>`);
}
function borrowDigitalBook(code){
  const m = getCurrentMember(); const b = bookByCode(code);
  if(!m || !b) return;
  if(m.status === "Suspended"){ showToast("Akun anggota sedang suspended."); return; }
  const activeCount = getMemberLoans().filter(l=>!["Selesai","Ditolak"].includes(l.status)).length;
  if(activeCount >= Number(state.settings.maxBorrow || 3)){ showToast("Batas maksimal peminjaman aktif sudah tercapai."); return; }
  if(memberBorrowedCodes().has(code)){ showToast("Buku ini sudah ada di peminjaman aktif kamu."); return; }
  if(Number(b.stock) <= 0){ showToast("Stok buku sedang habis."); return; }
  const item = {id:nextLoanId(), memberId:m.id, memberName:m.name, bookCode:b.code, bookTitle:b.title, start:todayISO(), due:addDaysISO(Number(state.settings.loanDays || 7)), returned:"", status:"Menunggu Persetujuan", fine:0};
  state.loans.unshift(item);
  saveState(); closeModal(); renderMemberCatalog(); renderMemberDashboard(); renderMemberLoans(); renderMemberReturns(); renderMemberHistory(); showToast("Pengajuan peminjaman buku berhasil dikirim. Menunggu persetujuan admin.");
}
function memberLoanRows(list, showAction=false){
  return list.map((l,i)=>{
    const due = daysUntilDue(l.due);
    const dueText = l.status === "Terlambat" ? `<span class="text-danger">${formatDate(l.due)}<br>Terlambat</span>` : `${formatDate(l.due)}${due >= 0 && due <= 2 && l.status === "Aktif" ? `<br><span class="text-danger">${due === 0 ? 'Hari ini' : due + ' hari lagi'}</span>` : ''}`;
    const action = showAction ? `<td>${memberReturnAction(l)}</td>` : '';
    return `<tr><td>${i+1}</td><td>${l.bookTitle}<br><small>${l.bookCode}</small></td><td>${formatDate(l.start)}</td><td>${dueText}</td><td>${formatDate(l.returned)}</td><td>${badge(l.status)}</td><td>${l.fine ? `<span class="text-danger">${rupiah(l.fine)}</span>` : '-'}</td>${action}</tr>`;
  }).join("");
}
function memberReturnAction(l){
  if(l.status === "Selesai") return `<span class="badge success">Selesai</span>`;
  if(l.status === "Ditolak") return `<span class="badge danger">Ditolak</span>`;
  const statusBtn = `<button class="process-btn read" data-loan-status="${l.bookCode}">Lihat Status</button>`;
  if(l.status === "Menunggu Persetujuan") return `<div class="action-row action-stack">${statusBtn}<button class="process-btn disabled" disabled>Menunggu Persetujuan</button></div>`;
  if(l.status === "Menunggu Konfirmasi") return `<div class="action-row action-stack">${statusBtn}<button class="process-btn disabled" disabled>Menunggu Admin</button></div>`;
  return `<div class="action-row action-stack">${statusBtn}<button class="process-btn" data-request-return="${l.id}">Ajukan Pengembalian</button></div>`;
}
function renderMemberLoans(){
  if((document.body.dataset.page||"") !== "anggota-peminjaman.html") return;
  const tbody = $("#memberLoanRows"); if(!tbody) return;
  const q = ($("#topSearch")?.value || "").toLowerCase().trim();
  let list = getMemberLoans().filter(l=>l.status === "Aktif" || l.status === "Terlambat" || l.status === "Menunggu Konfirmasi" || l.status === "Menunggu Persetujuan");
  if(q) list = list.filter(l=>[l.bookTitle,l.bookCode,l.status].join(" ").toLowerCase().includes(q));
  tbody.innerHTML = memberLoanRows(list, true) || `<tr><td colspan="8">Tidak ada peminjaman aktif.</td></tr>`;
  $$('[data-request-return]').forEach(btn=>btn.addEventListener("click",()=>requestMemberReturn(Number(btn.dataset.requestReturn))));
  $$('[data-loan-status]').forEach(btn=>btn.addEventListener("click",()=>openLoanStatus(btn.dataset.loanStatus)));
  const vals = $$(".stats-grid .stat-value");
  if(vals[0]) vals[0].textContent = list.length;
  if(vals[1]) vals[1].textContent = list.filter(l=>l.status === "Aktif").length;
  if(vals[2]) vals[2].textContent = list.filter(l=>l.status === "Menunggu Konfirmasi" || l.status === "Menunggu Persetujuan").length;
  if(vals[3]) vals[3].textContent = list.filter(l=>l.status === "Terlambat").length;
}
function renderMemberReturns(){
  if((document.body.dataset.page||"") !== "anggota-pengembalian.html") return;
  const tbody = $("#memberReturnRows"); if(!tbody) return;
  const q = ($("#topSearch")?.value || "").toLowerCase().trim();
  let list = getMemberLoans().filter(l=>l.status === "Aktif" || l.status === "Terlambat" || l.status === "Menunggu Konfirmasi");
  if(q) list = list.filter(l=>[l.bookTitle,l.bookCode,l.status].join(" ").toLowerCase().includes(q));
  tbody.innerHTML = memberLoanRows(list, true) || `<tr><td colspan="8">Tidak ada buku yang perlu dikembalikan.</td></tr>`;
  $$('[data-request-return]').forEach(btn=>btn.addEventListener("click",()=>requestMemberReturn(Number(btn.dataset.requestReturn))));
  $$('[data-loan-status]').forEach(btn=>btn.addEventListener("click",()=>openLoanStatus(btn.dataset.loanStatus)));
  const vals = $$(".stats-grid .stat-value");
  const dueSoon = list.filter(l=>l.status === "Aktif" && daysUntilDue(l.due) >= 0 && daysUntilDue(l.due) <= 2).length;
  if(vals[0]) vals[0].textContent = list.length;
  if(vals[1]) vals[1].textContent = dueSoon;
  if(vals[2]) vals[2].textContent = list.filter(l=>l.status === "Menunggu Konfirmasi").length;
  if(vals[3]) vals[3].textContent = rupiah(list.reduce((s,l)=>s+(l.fine||0),0));
}
function requestMemberReturn(id){
  const l = state.loans.find(x=>Number(x.id) === id); if(!l) return;
  openModal(`<h3>Ajukan Pengembalian</h3><p>Data akan masuk ke halaman Pengembalian admin untuk dikonfirmasi.</p><div class="form-field"><label>Judul Buku</label><input value="${l.bookTitle}" readonly></div><div class="form-field"><label>Denda Saat Ini</label><input value="${rupiah(l.fine)}" readonly></div><div class="modal-actions"><button class="btn btn-secondary" data-close>Batal</button><button class="btn btn-primary" id="confirmRequestReturn">Ajukan</button></div>`);
  $("#confirmRequestReturn")?.addEventListener("click",()=>{
    state.loans = state.loans.map(x=>Number(x.id) === id ? {...x, status:"Menunggu Konfirmasi"} : x);
    saveState(); closeModal(); renderMemberLoans(); renderMemberReturns(); renderMemberHistory(); showToast("Pengajuan pengembalian dikirim. Menunggu konfirmasi admin.");
  });
}
function renderMemberHistory(){
  if((document.body.dataset.page||"") !== "anggota-riwayat.html") return;
  const tbody = $("#memberHistoryRows");
  if(!tbody) return;
  const q = ($("#topSearch")?.value || "").toLowerCase().trim();
  let list = getMemberLoans();
  if(q) list = list.filter(l=>[l.bookTitle,l.bookCode,l.status].join(" ").toLowerCase().includes(q));
  tbody.innerHTML = memberLoanRows(list, false) || `<tr><td colspan="7">Belum ada riwayat peminjaman.</td></tr>`;
  const vals = $$(".stats-grid .stat-value");
  const active = list.filter(l=>l.status === "Aktif").length;
  const done = list.filter(l=>l.status === "Selesai").length;
  const late = list.filter(l=>l.status === "Terlambat").length;
  const waiting = list.filter(l=>l.status === "Menunggu Konfirmasi" || l.status === "Menunggu Persetujuan").length;
  if(vals[0]) vals[0].textContent = list.length;
  if(vals[1]) vals[1].textContent = active;
  if(vals[2]) vals[2].textContent = done;
  if(vals[3]) vals[3].textContent = late + waiting;
}
function initMemberProfile(){
  if((document.body.dataset.page||"") !== "anggota-profil.html") return;
  const m = getCurrentMember(); if(!m) return;
  const form = $("#memberProfileForm"); if(!form) return;
  $("#profileName").value = m.name || "";
  $("#profileEmail").value = m.email || "";
  $("#profilePhone").value = m.phone || "";
  $("#profileRole").value = m.role || "Mahasiswa";
  $("#profileRoleText") && ($("#profileRoleText").textContent = m.role || "Mahasiswa");
  const photoInput = $("#memberPhotoInput");
  if(photoInput){
    photoInput.addEventListener("change", e=>{
      const file = e.target.files[0]; if(!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const updated = {...m, photo:reader.result};
        state.members = state.members.map(x=>x.id===m.id?updated:x);
        saveState(); setMemberIdentity(); showToast("Foto profil anggota berhasil diganti.");
      };
      reader.readAsDataURL(file);
    });
  }
  $("#removeMemberPhoto")?.addEventListener("click",()=>{
    const updated = {...m, photo:null};
    state.members = state.members.map(x=>x.id===m.id?updated:x);
    saveState(); setMemberIdentity(); showToast("Foto profil anggota berhasil dihapus.");
  });
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const updated = {...getCurrentMember(), name:$("#profileName").value.trim(), email:$("#profileEmail").value.trim(), phone:$("#profilePhone").value.trim(), role:m.role || "Mahasiswa", abbr:initials($("#profileName").value.trim())};
    state.members = state.members.map(x=>x.id===m.id?updated:x);
    state.loans = state.loans.map(l=>l.memberId===m.id?{...l, memberName:updated.name}:l);
    saveState(); setMemberIdentity(); showToast("Profil anggota berhasil diperbarui.");
  });
}

document.addEventListener("DOMContentLoaded",()=>{
  ensureDefaultMemberAccounts();
  updateFineStatus(); syncCategoryCounts(); saveState();
  initGeneral();
  initLogin();
  initRegister();
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
  initMemberPages();
});
