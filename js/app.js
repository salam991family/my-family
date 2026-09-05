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
      alert('یہ یوزر نیم پہلے سے موجود ہے! دوسرا یوزر نیم چنیں۔');
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
    alert('آپ کی رجسٹریشن کی درخواست بھیج دی گئی ہے! ایڈمن کی منظوری کے بعد آپ لاگ ان کر سکیں گے۔');
    this.toggleAuthMode(false);
  }

  login(username, password) {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const found = this.data.registeredUsers.find(u => u.username.toLowerCase() === cleanUser && u.password === cleanPass);

    if (!found) {
      alert('غلط یوزر نیم یا پاس ورڈ!');
      return false;
    }

    if (found.status === 'pending') {
      alert('آپ کا اکاؤنٹ ابھی پینڈنگ میں ہے۔ ایڈمن سے منظوری کا انتظار کریں۔');
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

    if (type === 'Easypaisa') {
      alert(`نمبر (${accNumber}) کاپی ہو گیا ہے! ایزی پیسہ ایپ کھولی جا رہی ہے۔`);
      window.location.href = 'easypaisa://';
    } else if (type === 'JazzCash') {
      alert(`نمبر (${accNumber}) کاپی ہو گیا ہے! جیز کیش ایپ کھولی جا رہی ہے۔`);
      window.location.href = 'jazzcash://';
    } else {
      alert(`نمبر (${accNumber}) کاپی ہو گیا ہے! اپنے بینک کی ایپ سے ٹرانسفر کریں۔`);
    }
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
    alert('درخواست بھیج دی گئی ہے! ایڈمن کی منظوری کے بعد فنڈ میں اضافہ ہوگا۔');
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

  toggleAuthMode(isReg) {
    this.isRegistering = isReg;
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const title = document.getElementById('auth-subtitle');
    const switchText = document.getElementById('auth-switch-text');
    const toggleBtn = document.getElementById('toggle-auth-btn');

    if (this.isRegistering) {
      if (loginForm) loginForm.classList.add('hidden');
      if (regForm) regForm.classList.remove('hidden');
      if (title) title.textContent = 'نیا اکاؤنٹ بنائیں (Registration)';
      if (switchText) switchText.textContent = 'پہلے سے اکاؤنٹ موجود ہے؟';
      if (toggleBtn) toggleBtn.textContent = 'لاگ ان کریں (Sign In)';
    } else {
      if (loginForm) loginForm.classList.remove('hidden');
      if (regForm) regForm.classList.add('hidden');
      if (title) title.textContent = 'محفوظ فیملی پورٹل میں لاگ ان کریں';
      if (switchText) switchText.textContent = 'نیا اکاؤنٹ بنانا چاہتے ہیں؟';
      if (toggleBtn) toggleBtn.textContent = 'نیا اکاؤنٹ رجسٹر کریں (Sign Up)';
    }
  }

  init() {
    this.recalculateTotals();
    this.bindEvents();
    this.render();
    window.addEventListener('hashchange', () => this.handleRouting());
  }

  bindEvents() {
    document.getElementById('toggle-auth-btn')?.addEventListener('click', () => {
      this.toggleAuthMode(!this.isRegistering);
    });

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
          this.currentUser.role === 'ایڈمن' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
        }`;
      }

      this.renderNotifications();
      this.renderDashboard();
      this.renderAccounts();
      this.renderMembers();
      this.renderTrees();
      this.handleRouting();
    }
  }

  renderNotifications() {
    const notifBox = document.getElementById('admin-notification');
    const notifText = document.getElementById('notification-text');
    const pendingBadge = document.getElementById('pending-members-count');

    const pendingCount = this.data.registeredUsers.filter(u => u.status === 'pending').length;

    if (this.currentUser.role === 'ایڈمن' && pendingCount > 0) {
      if (notifBox && notifText) {
        notifBox.classList.remove('hidden');
        notifText.textContent = `🔔 نوٹیفکیشن: ${pendingCount} نئے ممبر(ز) رجسٹریشن کی منظوری کے منتظر ہیں! "فیملی ممبرز" کے ٹیب میں جا کر منظور کریں۔`;
      }
      if (pendingBadge) {
        pendingBadge.classList.remove('hidden');
        pendingBadge.textContent = pendingCount;
      }
    } else {
      if (notifBox) notifBox.classList.add('hidden');
      if (pendingBadge) pendingBadge.classList.add('hidden');
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
        txList.innerHTML = `<p class="p-4 text-xs text-slate-400 text-center">کوئی ہسٹری موجود نہیں ہے۔</p>`;
      } else {
        txList.innerHTML = this.data.transactions.map(tx => `
          <div class="p-4 border-b border-slate-50 flex justify-between items-center text-xs">
            <div>
              <p class="font-bold text-slate-700">${tx.member} (${tx.type === 'expense' ? 'خرچ' : 'جمع'})</p>
              <p class="text-slate-400 mt-0.5">${tx.date} • طریقہ: <b>${tx.paymentMethod || 'Direct'}</b> • TID: <b>${tx.trxId || '-'}</b></p>
              <p class="mt-0.5"><span class="${tx.status === 'approved' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}">${tx.status === 'approved' ? 'منظور شدہ' : 'پینڈنگ (منظوری کی ضرورت ہے)'}</span></p>
            </div>
            <div class="flex items-center space-x-2 space-x-reverse">
              <span class="font-bold ${tx.type === 'expense' ? 'text-red-500' : 'text-emerald-600'}">
                ${tx.type === 'expense' ? '-' : '+'}Rs ${tx.amount.toLocaleString()}
              </span>
              ${this.currentUser.role === 'ایڈمن' && tx.status === 'pending' ? `
                <button onclick="window.app.approveTransaction(${tx.id})" class="text-xs px-2 py-1 bg-emerald-500 text-white rounded-lg">منظور کریں</button>
              ` : ''}
              ${this.currentUser.role === 'ایڈمن' ? `
                <button onclick="window.app.removeTransaction(${tx.id})" class="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg">ڈیلیٹ</button>
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
        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold px-2.5 py-1 rounded-full ${a.type === 'Easypaisa' ? 'bg-emerald-100 text-emerald-800' : a.type === 'JazzCash' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">${a.type}</span>
            ${this.currentUser.role === 'ایڈمن' ? `<button onclick="window.app.removeAccount(${a.id})" class="text-xs text-red-500 hover:underline">حذف کریں</button>` : ''}
          </div>
          <div>
            <h4 class="font-bold text-slate-800 text-sm">${a.name}</h4>
            <p class="text-xs text-slate-600">نمبر: <b class="text-slate-800 select-all">${a.accNumber}</b></p>
            <p class="text-xs text-slate-600">عنوان (Title): <b>${a.accTitle}</b></p>
          </div>
          
          <button onclick="window.app.openWalletApp('${a.type}', '${a.accNumber}')" class="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 space-x-reverse shadow-sm">
            <span>📲 ایپ کھولیں اور رقم بھیجیں</span>
          </button>
        </div>
      `).join('');
    }
  }

  renderMembers() {
    const grid = document.getElementById('members-grid');
    if (grid) {
      if (this.data.members.length === 0) {
        grid.innerHTML = `<p class="col-span-2 text-xs text-slate-400 text-center py-4">کوئی فیملی ممبر موجود نہیں ہے۔</p>`;
      } else {
        grid.innerHTML = this.data.members.map(m => `
          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div>
              <h4 class="font-bold text-slate-800 text-sm">${m.name}</h4>
              <p class="text-xs text-slate-400 mt-0.5">${m.role} • ${m.phone}</p>
            </div>
            <div class="flex items-center space-x-2 space-x-reverse">
              <span class="text-xs px-2 py-1 ${m.status === 'منظور شدہ' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} rounded-lg font-medium">${m.status}</span>
              ${this.currentUser.role === 'ایڈمن' && m.status !== 'منظور شدہ' ? `
                <button onclick="window.app.approveMember(${m.id})" class="text-xs px-2 py-1 bg-emerald-500 text-white rounded-lg">منظور کریں</button>
              ` : ''}
              ${this.currentUser.role === 'ایڈمن' ? `
                <button onclick="window.app.removeMember(${m.id})" class="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg">ڈیلیٹ</button>
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
        grid.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">کوئی شجرہ نسب درج نہیں ہے۔</p>`;
      } else {
        grid.innerHTML = this.data.familyTrees.map(t => `
          <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div class="flex justify-between items-center border-b pb-2">
              <div>
                <h4 class="font-bold text-primary-700 text-base">خاندان: ${t.familyName}</h4>
                <p class="text-xs text-slate-500">سربراہ / بزرگ: <b>${t.headName}</b></p>
              </div>
              ${this.currentUser.role === 'ایڈمن' ? `<button onclick="window.app.removeFamilyTree(${t.id})" class="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg">ڈیلیٹ شجرہ</button>` : ''}
            </div>
            <p class="text-xs text-slate-700 whitespace-pre-line leading-relaxed">${t.details}</p>
          </div>
        `).join('');
      }
    }
  }
}

// INITIALIZE APP
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppState();

  // Load Saved Language
  const savedLang = localStorage.getItem('selected_lang') || 'ur';
  const langSelect = document.getElementById("languageSelect");
  if (langSelect) langSelect.value = savedLang;
  changeLanguage(savedLang);
});

// MODAL FUNCTIONS
function openDonateModal() {
  const modal = document.getElementById("donationModal");
  if (modal) modal.style.display = "block";
}

function closeDonateModal() {
  const modal = document.getElementById("donationModal");
  if (modal) modal.style.display = "none";
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("نمبر کاپی ہو گیا ہے: " + text);
  }).catch(err => {
    console.error('کاپی کرنے میں مسئلہ آیا: ', err);
  });
}

function toggleSettingsMenu() {
  const menu = document.getElementById("settingsMenu");
  if (menu) menu.classList.toggle("hidden");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function openProfileModal() {
  const profModal = document.getElementById("profileModal");
  if (profModal) profModal.style.display = "block";
}

function closeProfileModal() {
  const profModal = document.getElementById("profileModal");
  if (profModal) profModal.style.display = "none";
}

function saveProfileSettings(event) {
  event.preventDefault();
  const username = document.getElementById("profUsername")?.value;
  const password = document.getElementById("profPassword")?.value;
  const account = document.getElementById("profAccount")?.value;

  if (username) localStorage.setItem("user_username", username);
  if (password) localStorage.setItem("user_password", password);
  if (account) localStorage.setItem("user_account", account);

  alert(document.documentElement.lang === 'en' ? "Profile Updated!" : "تبدیلیاں محفوظ ہو گئی ہیں!");
  closeProfileModal();
}

// TRANSLATIONS & LANGUAGE SWITCHER
const translations = {
  ur: {
    portal_title: "فیملی پورٹل",
    admin: "ایڈمن",
    dashboard: "ڈیش بورڈ",
    foundation_accounts: "فاؤنڈیشن اکاؤنٹس",
    fund_transfer: "فنڈز ٹرانسفر",
    family_members: "فیملی ممبرز",
    family_tree: "شجرہ نسب",
    settings: "سیٹنگز",
    edit_profile: "ایڈیٹ پروفائل",
    dark_mode: "ڈارک موڈ",
    logout: "لاگ آؤٹ",
    donate: "عطیہ / ڈونیشن"
  },
  en: {
    portal_title: "Family Portal",
    admin: "Admin",
    dashboard: "Dashboard",
    foundation_accounts: "Foundation Accounts",
    fund_transfer: "Fund Transfer",
    family_members: "Family Members",
    family_tree: "Family Tree",
    settings: "Settings",
    edit_profile: "Edit Profile",
    dark_mode: "Dark Mode",
    logout: "Logout",
    donate: "Donate"
  }
};

function changeLanguage(lang) {
  const t = translations[lang];
  if (!t) return;

  document.documentElement.dir = (lang === 'en') ? 'ltr' : 'rtl';
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (t[key]) {
      element.innerText = t[key];
    }
  });

  localStorage.setItem('selected_lang', lang);
}

// CLOSE MODALS ON OUTSIDE CLICK
window.addEventListener('click', (e) => {
  const donateModal = document.getElementById("donationModal");
  const profileModal = document.getElementById("profileModal");
  const settingsMenu = document.getElementById("settingsMenu");
  const settingsBtn = document.querySelector(".settings-btn");

  if (e.target === donateModal) closeDonateModal();
  if (e.target === profileModal) closeProfileModal();

  if (settingsMenu && settingsBtn && !settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
    settingsMenu.classList.add("hidden");
  }
});
