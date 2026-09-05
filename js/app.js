// DEFAULT DATA STRUCTURE
const DEFAULT_DATA = {
  fundBalance: 0,
  totalReceived: 0,
  totalPending: 0,
  totalSpent: 0,
  members: [],
  registeredUsers: [
    { username: 'admin', password: 'password', fullname: 'ایڈمن', role: 'ایڈمن', status: 'approved' },
    { username: 'user', password: 'password', fullname: 'عام ممبر', role: 'عام ممبر', status: 'approved' }
  ],
  accounts: [
    { id: 1, type: 'Easypaisa', name: 'Easypaisa Mobile', accNumber: '03426965892', accTitle: 'Ismaili Foundation' },
    { id: 2, type: 'JazzCash', name: 'JazzCash Mobile', accNumber: '03426965892', accTitle: 'Ismaili Foundation' }
  ],
  transactions: [],
  familyTrees: []
};

class AppState {
  constructor() {
    this.currentUser = JSON.parse(sessionStorage.getItem('family_user')) || null;
    this.data = JSON.parse(localStorage.getItem('family_portal_data')) || DEFAULT_DATA;
    if (!this.data.registeredUsers) this.data.registeredUsers = DEFAULT_DATA.registeredUsers;
    this.isRegistering = false;
    this.init();
  }

  saveData() {
    localStorage.setItem('family_portal_data', JSON.stringify(this.data));
    this.recalculateTotals();
    this.render();
  }

  recalculateTotals() {
    let received = 0, pending = 0, spent = 0;
    this.data.transactions.forEach(tx => {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'expense') spent += amt;
      else if (tx.status === 'approved') received += amt;
      else if (tx.status === 'pending') pending += amt;
    });
    this.data.totalReceived = received;
    this.data.totalPending = pending;
    this.data.totalSpent = spent;
    this.data.fundBalance = received - spent;
  }

  register(fullname, username, password, phone, type) {
    const cleanUser = username.trim().toLowerCase();
    const exists = this.data.registeredUsers.find(u => u.username.toLowerCase() === cleanUser);
    
    if (exists) {
      alert(document.documentElement.lang === 'en' ? 'Username already exists!' : 'یہ یوزر نیم پہلے سے موجود ہے!');
      return;
    }

    const newUser = {
      id: Date.now(),
      fullname,
      username: cleanUser,
      password: password.trim(),
      phone,
      role: type,
      status: 'pending'
    };

    this.data.registeredUsers.push(newUser);
    this.data.members.push({
      id: newUser.id,
      name: fullname,
      role: type,
      phone: phone,
      status: 'غیر منظور شدہ'
    });

    this.saveData();
    alert(document.documentElement.lang === 'en' ? 'Registration request sent for approval!' : 'آپ کی رجسٹریشن کی درخواست بھیج دی گئی ہے!');
    this.toggleAuthMode(false);
  }

  login(username, password) {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();
    const found = this.data.registeredUsers.find(u => u.username.toLowerCase() === cleanUser && u.password === cleanPass);

    if (!found) {
      alert(document.documentElement.lang === 'en' ? 'Invalid username or password!' : 'غلط یوزر نیم یا پاس ورڈ!');
      return false;
    }

    if (found.status === 'pending') {
      alert(document.documentElement.lang === 'en' ? 'Account pending approval.' : 'آپ کا اکاؤنٹ ابھی پینڈنگ میں ہے۔');
      return false;
    }

    this.currentUser = {
      username: found.username,
      fullname: found.fullname,
      role: found.username === 'admin' ? 'ایڈمن' : found.role
    };

    sessionStorage.setItem('family_user', JSON.stringify(this.currentUser));
    return true;
  }

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem('family_user');
    window.location.hash = '';
    this.render();
  }

  approveMember(id) {
    const m = this.data.members.find(mem => mem.id === id);
    if (m) m.status = 'منظور شدہ';
    const u = this.data.registeredUsers.find(usr => usr.id === id || usr.fullname === m?.name);
    if (u) u.status = 'approved';
    this.saveData();
  }

  removeMember(id) {
    this.data.members = this.data.members.filter(m => m.id !== id);
    this.data.registeredUsers = this.data.registeredUsers.filter(u => u.id !== id);
    this.saveData();
  }

  addAccount(type, name, accNumber, accTitle) {
    if (this.currentUser?.role !== 'ایڈمن') return;
    this.data.accounts.push({ id: Date.now(), type, name, accNumber, accTitle });
    this.saveData();
  }

  removeAccount(id) {
    if (this.currentUser?.role !== 'ایڈمن') return;
    this.data.accounts = this.data.accounts.filter(a => a.id !== id);
    this.saveData();
  }

  openWalletApp(type, accNumber) {
    navigator.clipboard.writeText(accNumber);
    alert(document.documentElement.lang === 'en' ? `Number (${accNumber}) copied!` : `نمبر (${accNumber}) کاپی ہو گیا ہے!`);
  }

  addTransaction(memberName, amount, type, status, date, paymentMethod = 'Direct', trxId = '-') {
    const newTx = {
      id: Date.now(),
      member: memberName,
      amount: parseFloat(amount),
      type,
      status: this.currentUser?.role === 'ایڈمن' ? status : 'pending',
      date: date || new Date().toISOString().split('T')[0],
      paymentMethod,
      trxId
    };
    this.data.transactions.push(newTx);
    this.saveData();
    alert(document.documentElement.lang === 'en' ? 'Transfer request submitted!' : 'درخواست بھیج دی گئی ہے!');
  }

  approveTransaction(id) {
    const tx = this.data.transactions.find(t => t.id === id);
    if (tx) tx.status = 'approved';
    this.saveData();
  }

  removeTransaction(id) {
    this.data.transactions = this.data.transactions.filter(t => t.id !== id);
    this.saveData();
  }

  addFamilyTree(familyName, headName, details) {
    this.data.familyTrees.push({ id: Date.now(), familyName, headName, details });
    this.saveData();
  }

  removeFamilyTree(id) {
    this.data.familyTrees = this.data.familyTrees.filter(t => t.id !== id);
    this.saveData();
  }

  addMember(name, role, phone, status) {
    this.data.members.push({ id: Date.now(), name, role, phone, status: 'منظور شدہ' });
    this.saveData();
  }

  toggleAuthMode(isReg) {
    this.isRegistering = isReg;
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    if (this.isRegistering) {
      if (loginForm) loginForm.classList.add('hidden');
      if (regForm) regForm.classList.remove('hidden');
    } else {
      if (loginForm) loginForm.classList.remove('hidden');
      if (regForm) regForm.classList.add('hidden');
    }
  }

  init() {
    this.recalculateTotals();
    this.bindEvents();
    this.render();
    window.addEventListener('hashchange', () => this.handleRouting());
  }

  bindEvents() {
    document.getElementById('toggle-auth-btn')?.addEventListener('click', () => this.toggleAuthMode(!this.isRegistering));
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('login-username').value;
      const p = document.getElementById('login-password').value;
      if (this.login(u, p)) {
        this.render();
        window.location.hash = 'dashboard';
      }
    });

    document.getElementById('register-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullname = document.getElementById('reg-fullname').value;
      const username = document.getElementById('reg-username').value;
      const password = document.getElementById('reg-password').value;
      const phone = document.getElementById('reg-phone').value;
      const type = document.getElementById('reg-type').value;
      this.register(fullname, username, password, phone, type);
      e.target.reset();
    });

    document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
  }

  handleRouting() {
    if (!this.currentUser) return;
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    const targetPage = document.getElementById(`page-${hash}`);
    if (targetPage) targetPage.classList.remove('hidden');
    else document.getElementById('page-dashboard')?.classList.remove('hidden');
  }

  render() {
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app');

    if (!this.currentUser) {
      if (loginScreen) loginScreen.classList.remove('hidden');
      if (appScreen) appScreen.classList.add('hidden');
    } else {
      if (loginScreen) loginScreen.classList.add('hidden');
      if (appScreen) appScreen.classList.remove('hidden');

      const roleBadge = document.getElementById('role-badge');
      if (roleBadge) {
        roleBadge.textContent = this.currentUser.role;
        roleBadge.className = `text-xs px-2.5 py-1 rounded-full font-semibold ${
          this.currentUser.role === 'ایڈمن' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
        }`;
      }

      this.renderDashboard();
      this.renderAccounts();
      this.renderMembers();
      this.renderTrees();
      this.handleRouting();
    }
  }

  renderDashboard() {
    const fundBal = document.getElementById('fund-balance');
    const totRec = document.getElementById('total-received');
    const totPen = document.getElementById('total-pending');
    const totSpe = document.getElementById('total-spent');

    if (fundBal) fundBal.textContent = `Rs ${this.data.fundBalance.toLocaleString()}`;
    if (totRec) totRec.textContent = `Rs ${this.data.totalReceived.toLocaleString()}`;
    if (totPen) totPen.textContent = `Rs ${this.data.totalPending.toLocaleString()}`;
    if (totSpe) totSpe.textContent = `Rs ${this.data.totalSpent.toLocaleString()}`;

    const memCount = document.getElementById('members-count');
    if (memCount) memCount.textContent = this.data.members.length;

    const txList = document.getElementById('recent-tx-list');
    if (txList) {
      if (this.data.transactions.length === 0) {
        txList.innerHTML = `<p class="p-4 text-xs text-slate-400 text-center" data-i18n="no_history">کوئی ہسٹری موجود نہیں ہے۔</p>`;
      } else {
        txList.innerHTML = this.data.transactions.map(tx => `
          <div class="p-4 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center text-xs">
            <div>
              <p class="font-bold dark:text-slate-200">${tx.member} (${tx.type === 'expense' ? 'خرچ' : 'جمع'})</p>
              <p class="text-slate-400 mt-0.5">${tx.date} • TID: <b>${tx.trxId || '-'}</b></p>
            </div>
            <div class="flex items-center space-x-2 space-x-reverse">
              <span class="font-bold ${tx.type === 'expense' ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}">
                ${tx.type === 'expense' ? '-' : '+'}Rs ${tx.amount.toLocaleString()}
              </span>
              ${this.currentUser.role === 'ایڈمن' && tx.status === 'pending' ? `
                <button onclick="window.app.approveTransaction(${tx.id})" class="text-xs px-2 py-1 bg-emerald-500 text-white rounded-lg">منظور کریں</button>
              ` : ''}
              ${this.currentUser.role === 'ایڈمن' ? `
                <button onclick="window.app.removeTransaction(${tx.id})" class="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">ڈیلیٹ</button>
              ` : ''}
            </div>
          </div>
        `).join('');
      }
    }
  }

  renderAccounts() {
    const grid = document.getElementById('accounts-grid');
    const adminCard = document.getElementById('admin-add-account-card');
    if (adminCard) adminCard.style.display = this.currentUser.role === 'ایڈمن' ? 'block' : 'none';

    if (grid) {
      grid.innerHTML = this.data.accounts.map(a => `
        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3 transition-colors">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold px-2.5 py-1 rounded-full ${a.type === 'Easypaisa' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'}">${a.type}</span>
            ${this.currentUser.role === 'ایڈمن' ? `<button onclick="window.app.removeAccount(${a.id})" class="text-xs text-red-500 dark:text-red-400 hover:underline">حذف کریں</button>` : ''}
          </div>
          <div>
            <h4 class="font-bold text-sm dark:text-white">${a.name}</h4>
            <p class="text-xs dark:text-slate-300">نمبر: <b class="select-all">${a.accNumber}</b></p>
            <p class="text-xs dark:text-slate-300">عنوان: <b>${a.accTitle}</b></p>
          </div>
          <button onclick="window.app.openWalletApp('${a.type}', '${a.accNumber}')" class="w-full py-2.5 bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors">📲 کاپی نمبر</button>
        </div>
      `).join('');
    }
  }

  renderMembers() {
    const grid = document.getElementById('members-grid');
    if (grid) {
      if (this.data.members.length === 0) {
        grid.innerHTML = `<p class="col-span-2 text-xs text-slate-400 text-center py-4" data-i18n="no_members">کوئی فیملی ممبر موجود نہیں ہے۔</p>`;
      } else {
        grid.innerHTML = this.data.members.map(m => `
          <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex justify-between items-center transition-colors">
            <div>
              <h4 class="font-bold text-sm dark:text-white">${m.name}</h4>
              <p class="text-xs text-slate-400 mt-0.5">${m.role} • ${m.phone}</p>
            </div>
            <div class="flex items-center space-x-2 space-x-reverse">
              ${this.currentUser.role === 'ایڈمن' ? `
                <button onclick="window.app.removeMember(${m.id})" class="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">ڈیلیٹ</button>
              ` : ''}
            </div>
          </div>
        `).join('');
      }
    }
  }

  renderTrees() {
    const grid = document.getElementById('trees-grid');
    if (grid) {
      if (this.data.familyTrees.length === 0) {
        grid.innerHTML = `<p class="text-xs text-slate-400 text-center py-4" data-i18n="no_trees">کوئی شجرہ نسب درج نہیں ہے۔</p>`;
      } else {
        grid.innerHTML = this.data.familyTrees.map(t => `
          <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-2 transition-colors">
            <div class="flex justify-between items-center border-b dark:border-slate-700 pb-2">
              <div>
                <h4 class="font-bold text-primary-600 dark:text-primary-400 text-base">خاندان: ${t.familyName}</h4>
                <p class="text-xs text-slate-400">سربراہ: <b>${t.headName}</b></p>
              </div>
              ${this.currentUser.role === 'ایڈمن' ? `<button onclick="window.app.removeFamilyTree(${t.id})" class="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">ڈیلیٹ</button>` : ''}
            </div>
            <p class="text-xs whitespace-pre-line leading-relaxed dark:text-slate-300">${t.details}</p>
          </div>
        `).join('');
      }
    }
  }
}

// INITIALIZE APP
document.addEventListener('DOMContentLoaded', () => {
  // Theme initialization from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  window.app = new AppState();
  const savedLang = localStorage.getItem('selected_lang') || 'ur';
  const langSelect = document.getElementById("languageSelect");
  if (langSelect) langSelect.value = savedLang;
  changeLanguage(savedLang);
});

// MODAL & SETTINGS FUNCTIONS
function toggleSettingsMenu() {
  const menu = document.getElementById("settingsMenu");
  if (menu) menu.classList.toggle("hidden");
}

function toggleDarkMode() {
  const htmlEl = document.documentElement;
  htmlEl.classList.toggle("dark");
  const isDark = htmlEl.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  toggleSettingsMenu();
}

function openProfileModal() {
  const modal = document.getElementById("profileModal");
  if (modal) modal.classList.remove("hidden");
  toggleSettingsMenu();
}

function closeProfileModal() {
  const modal = document.getElementById("profileModal");
  if (modal) modal.classList.add("hidden");
}

function openDonateModal() {
  const modal = document.getElementById("donationModal");
  if (modal) modal.classList.remove("hidden");
  toggleSettingsMenu();
}

function closeDonateModal() {
  const modal = document.getElementById("donationModal");
  if (modal) modal.classList.add("hidden");
}

function saveProfileSettings(e) {
  e.preventDefault();
  alert(document.documentElement.lang === 'en' ? 'Profile saved!' : 'پروفائل محفوظ ہو گئی!');
  closeProfileModal();
}

// TRANSLATIONS
const translations = {
  ur: {
    lang_label: "🌐 زبان / Language:",
    portal_title: "اسماعیلی فیملی فاؤنڈیشن",
    admin: "ایڈمن",
    dashboard: "ڈیش بورڈ",
    foundation_accounts: "🏦 فاؤنڈیشن اکاؤنٹس",
    fund_transfer: "💸 فنڈز ٹرانسفر",
    family_members: "فیملی ممبرز",
    family_tree: "🌳 شجرہ نسب",
    settings: "⚙️ سیٹنگز",
    edit_profile: "👤 ایڈیٹ پروفائل",
    dark_mode: "🌙 ڈارک موڈ",
    logout: "لاگ آؤٹ",
    donate: "💰 عطیہ / ڈونیشن",
    auth_subtitle: "محفوظ فیملی پورٹل میں لاگ ان کریں",
    username_lbl: "یوزر نیم",
    password_lbl: "پاس ورڈ",
    fullname_lbl: "پورا نام",
    phone_lbl: "موبائل نمبر",
    membership_lbl: "ممبرشپ قسم",
    login_btn: "لاگ ان کریں",
    submit_reg: "رجسٹریشن کی درخواست بھیجیں",
    switch_text: "نیا اکاؤنٹ بنانا چاہتے ہیں؟",
    toggle_auth_btn: "نیا اکاؤنٹ رجسٹر کریں (Sign Up)",
    dash_header: "🏛️ اسماعیلی فیملی فاؤنڈیشن",
    dash_desc: "فاؤنڈیشن کے فنڈز، ممبرز اور شجرہ نسب کا محفوظ اور منظم پورٹل",
    feat_title: "🌟 اہم خصوصیات:",
    feat_1: "<b>فنڈز کا حساب:</b> شفاف مالیاتی حساب کتاب بذریعہ ایزی پیسہ، جیز کیش اور بینک اکاؤنٹس۔",
    feat_2: "<b>فیملی ممبرز ڈائریکٹری:</b> تمام اراکین کا بنیادی ریکارڈ اور رابطہ معلومات۔",
    feat_3: "<b>شجرہ نسب:</b> خاندانی تاریخ اور بزرگوں کا مکمل شجرہ نسب۔",
    feat_4: "<b>آسان رجسٹریشن:</b> نئے ممبرز کی رجسٹریشن اور لاگ ان کی فوری سہولت۔",
    demo_login_title: "🔐 آزمائشی لاگ ان کی تفصیلات:",
    admin_label: "ایڈمن (Admin)",
    user_label: "عام ممبر (User)",
    curr_bal_label: "موجودہ کل فیملی فنڈ",
    rec_fund_label: "موصول فنڈ",
    pen_fund_label: "پینڈنگ فنڈ",
    spent_fund_label: "خرچ فنڈ",
    total_mem_label: "کل ممبرز",
    history_label: "ہسٹری فنڈز",
    add_acc_heading: "نیا اکاؤنٹ شامل کریں (صرف ایڈمن)",
    add_acc_btn: "اکاؤنٹ شامل کریں",
    send_req_heading: "رقم بھیجنے کی درخواست جمع کریں",
    send_transfer_btn: "ٹرانسفر کی درخواست بھیجیں",
    add_mem_heading: "نیا ممبر شامل کریں",
    add_btn: "اضافہ کریں",
    add_tree_heading: "نیا شجرہ نسب شامل کریں",
    save_tree_btn: "شجرہ محفوظ کریں",
    donate_modal_desc: "فاؤنڈیشن کے فنڈ میں ڈائریکٹ رقم جمع کرنے کے لیے درج ذیل نمبر پر ایزی پیسہ یا جیز کیش کریں:",
    cancel: "منسوخ",
    save: "محفوظ کریں",
    close: "بند کریں",
    no_history: "کوئی ہسٹری موجود نہیں ہے۔",
    no_members: "کوئی فیملی ممبر موجود نہیں ہے۔",
    no_trees: "کوئی شجرہ نسب درج نہیں ہے۔"
  },
  en: {
    lang_label: "🌐 Language / زبان:",
    portal_title: "Ismaili Family Foundation",
    admin: "Admin",
    dashboard: "Dashboard",
    foundation_accounts: "🏦 Foundation Accounts",
    fund_transfer: "💸 Fund Transfer",
    family_members: "Family Members",
    family_tree: "🌳 Family Tree",
    settings: "⚙️ Settings",
    edit_profile: "👤 Edit Profile",
    dark_mode: "🌙 Dark Mode",
    logout: "Logout",
    donate: "💰 Donate",
    auth_subtitle: "Login to Secure Family Portal",
    username_lbl: "Username",
    password_lbl: "Password",
    fullname_lbl: "Full Name",
    phone_lbl: "Mobile Number",
    membership_lbl: "Membership Type",
    login_btn: "Login",
    submit_reg: "Submit Registration",
    switch_text: "Don't have an account?",
    toggle_auth_btn: "Register New Account (Sign Up)",
    dash_header: "🏛️ Ismaili Family Foundation",
    dash_desc: "A secure and organized portal for foundation funds, members, and family tree.",
    feat_title: "🌟 Key Features:",
    feat_1: "<b>Fund Accounting:</b> Transparent financial tracking via Easypaisa, JazzCash, and Bank accounts.",
    feat_2: "<b>Family Directory:</b> Member records and contact details.",
    feat_3: "<b>Family Tree:</b> Genealogical family lineage and elders history.",
    feat_4: "<b>Easy Registration:</b> Quick registration and instant sign in.",
    demo_login_title: "🔐 Demo Credentials:",
    admin_label: "Admin",
    user_label: "General Member",
    curr_bal_label: "Current Net Balance",
    rec_fund_label: "Received Fund",
    pen_fund_label: "Pending Fund",
    spent_fund_label: "Spent Fund",
    total_mem_label: "Total Members",
    history_label: "Fund History",
    add_acc_heading: "Add New Account (Admin Only)",
    add_acc_btn: "Add Account",
    send_req_heading: "Submit Transfer Request",
    send_transfer_btn: "Send Request",
    add_mem_heading: "Add New Member",
    add_btn: "Add Member",
    add_tree_heading: "Add New Family Tree",
    save_tree_btn: "Save Tree",
    donate_modal_desc: "Send Easypaisa or JazzCash directly to the following number to donate:",
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    no_history: "No history found.",
    no_members: "No family members found.",
    no_trees: "No family tree recorded."
  }
};

const placeholders = {
  ur: {
    ph_username: "admin",
    ph_bank_name: "بینک کا نام",
    ph_acc_num: "اکاؤنٹ / موبائل نمبر",
    ph_acc_title: "اکاؤنٹ ٹائٹل",
    ph_your_name: "آپ کا نام",
    ph_amount: "رقم (Rs)",
    ph_trx_id: "ٹرانزیکشن ID / TID",
    ph_name: "نام",
    ph_role: "عہدہ",
    ph_phone: "فون نمبر",
    ph_family_name: "خاندان / شاخ کا نام",
    ph_head_name: "سربراہ کا نام",
    ph_tree_details: "شجرہ نسب کی تفصیل"
  },
  en: {
    ph_username: "admin",
    ph_bank_name: "Bank Name",
    ph_acc_num: "Account / Mobile Number",
    ph_acc_title: "Account Title",
    ph_your_name: "Your Name",
    ph_amount: "Amount (Rs)",
    ph_trx_id: "Transaction ID / TID",
    ph_name: "Name",
    ph_role: "Role / Designation",
    ph_phone: "Phone Number",
    ph_family_name: "Family / Branch Name",
    ph_head_name: "Head / Elder Name",
    ph_tree_details: "Family Tree Details"
  }
};

function changeLanguage(lang) {
  const t = translations[lang];
  const p = placeholders[lang];
  if (!t) return;

  document.documentElement.dir = (lang === 'en') ? 'ltr' : 'rtl';
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (t[key]) element.innerHTML = t[key];
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(element => {
    const key = element.getAttribute('data-i18n-ph');
    if (p && p[key]) element.setAttribute('placeholder', p[key]);
  });

  localStorage.setItem('selected_lang', lang);
}
