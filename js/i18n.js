const translations = {
  en: {
    username: 'Username / Email',
    password: 'Password',
    login: 'Secure Family Access',
    private_notice: 'This is a private family-only platform. Unauthorized access is prohibited.',
    nav_dashboard: 'Dashboard',
    nav_members: 'Family Members',
    nav_transfer: 'Transfer Money',
    nav_history: 'Transaction History',
    nav_payments: 'Payment Methods',
    nav_admin: 'Admin Panel',
    dashboard_title: 'Family Dashboard',
    dashboard_sub: 'Overview of family fund & activity',
    send_money: 'Send Money',
    total_fund: 'Total Family Fund',
    pending_requests: 'Pending Requests',
    active_members: 'Active Members',
    recent_tx: 'Recent Transactions',
    view_all: 'View all',
    family_members_short: 'Family Members',
    notice_title: 'Important:',
    notice_text: ' This platform records internal family transfers only. Actual money movement is done manually via Easypaisa, JazzCash or Bank Transfer listed under Payment Methods.',
    members_title: 'Family Members',
    transfer_title: 'Transfer Money',
    select_member: 'Select Family Member',
    choose_member: 'Choose member...',
    amount_pkr: 'Amount (PKR)',
    reason: 'Transfer Reason',
    note_optional: 'Optional Note',
    submit_request: 'Submit Transfer Request',
    transfer_note_info: 'Requests require admin approval. Funds are recorded in the family ledger only.',
    my_requests: 'My Transfer Requests',
    history_title: 'Transaction History',
    payments_title: 'Payment Methods',
    payments_sub: 'Use these details for actual money transfers. Details are managed by Admin.',
    admin_title: 'Family Admin Panel',
    pending_approvals: 'Pending Transfer Approvals',
    edit_payments: 'Edit Payment Methods',
    add_member: 'Add Family Member',
    manage_members: 'Manage Members',
    adjust_fund: 'Adjust Family Fund',
    no_data: 'No data yet',
    status_pending: 'Pending',
    status_approved: 'Approved',
    status_completed: 'Completed',
    status_rejected: 'Rejected',
    approve: 'Approve',
    reject: 'Reject',
    remove: 'Remove',
    from: 'From',
    to: 'To',
    amount: 'Amount',
    date: 'Date'
  },
  ur: {
    username: 'صارف نام / ای میل',
    password: 'پاس ورڈ',
    login: 'محفوظ فیملی رسائی',
    private_notice: 'یہ صرف خاندان کے لیے نجی پلیٹ فارم ہے۔ غیر مجاز رسائی ممنوع ہے۔',
    nav_dashboard: 'ڈیش بورڈ',
    nav_members: 'خاندان کے افراد',
    nav_transfer: 'رقم منتقل کریں',
    nav_history: 'لین دین کی تاریخ',
    nav_payments: 'ادائیگی کے طریقے',
    nav_admin: 'ایڈمن پینل',
    dashboard_title: 'فیملی ڈیش بورڈ',
    dashboard_sub: 'خاندانی فنڈ اور سرگرمی کا جائزہ',
    send_money: 'رقم بھیجیں',
    total_fund: 'کل خاندانی فنڈ',
    pending_requests: 'زیر التواء درخواستیں',
    active_members: 'فعال اراکین',
    recent_tx: 'حالیہ لین دین',
    view_all: 'سب دیکھیں',
    family_members_short: 'خاندان کے افراد',
    notice_title: 'اہم نوٹ:',
    notice_text: ' یہ پلیٹ فارم صرف اندرونی خاندانی منتقلی ریکارڈ کرتا ہے۔ اصل رقم کی منتقلی دستی طور پر ایزی پیسہ، جاز کیش یا بینک ٹرانسفر کے ذریعے کی جاتی ہے۔',
    members_title: 'خاندان کے افراد',
    transfer_title: 'رقم منتقل کریں',
    select_member: 'خاندان کے فرد کا انتخاب',
    choose_member: 'فرد منتخب کریں...',
    amount_pkr: 'رقم (پاکستانی روپے)',
    reason: 'منتقلی کی وجہ',
    note_optional: 'اختیاری نوٹ',
    submit_request: 'منتقلی کی درخواست جمع کریں',
    transfer_note_info: 'درخواستوں کے لیے ایڈمن کی منظوری درکار ہے۔ فنڈ صرف خاندانی لیجر میں ریکارڈ ہوتے ہیں۔',
    my_requests: 'میری منتقلی کی درخواستیں',
    history_title: 'لین دین کی تاریخ',
    payments_title: 'ادائیگی کے طریقے',
    payments_sub: 'اصل رقم کی منتقلی کے لیے ان تفصیلات کا استعمال کریں۔ تفصیلات ایڈمن کے زیر انتظام ہیں۔',
    admin_title: 'فیملی ایڈمن پینل',
    pending_approvals: 'زیر التواء منظوریاں',
    edit_payments: 'ادائیگی کے طریقے ترمیم کریں',
    add_member: 'نیا خاندان کا فرد شامل کریں',
    manage_members: 'اراکین کا انتظام',
    adjust_fund: 'خاندانی فنڈ ایڈجسٹ کریں',
    no_data: 'ابھی کوئی ڈیٹا نہیں',
    status_pending: 'زیر التواء',
    status_approved: 'منظور',
    status_completed: 'مکمل',
    status_rejected: 'مسترد',
    approve: 'منظور کریں',
    reject: 'مسترد کریں',
    remove: 'ہٹائیں',
    from: 'سے',
    to: 'کو',
    amount: 'رقم',
    date: 'تاریخ'
  }
};

let currentLang = localStorage.getItem('iff_lang') || 'en';

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || translations.en[key] || key;
}

function applyTranslations() {
  // Update text elements and placeholders
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });

  // Update select options that have data-i18n
  document.querySelectorAll('option[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  // Handle Page Direction (RTL / LTR)
  const isUrdu = currentLang === 'ur';
  document.documentElement.lang = isUrdu ? 'ur' : 'en';
  document.documentElement.dir = isUrdu ? 'rtl' : 'ltr';

  // Toggle Language Buttons Styling
  const enBtn = document.getElementById('lang-en');
  const urBtn = document.getElementById('lang-ur');
  if (enBtn && urBtn) {
    if (isUrdu) {
      urBtn.className = 'px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 shadow-sm';
      enBtn.className = 'px-3 py-1 rounded-full text-sm font-medium text-slate-500 hover:bg-slate-100';
    } else {
      enBtn.className = 'px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 shadow-sm';
      urBtn.className = 'px-3 py-1 rounded-full text-sm font-medium text-slate-500 hover:bg-slate-100';
    }
  }
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('iff_lang', lang);
  applyTranslations();
}

// Auto-run translations when page loads
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
});

window.IFF_i18n = { t, setLang, applyTranslations, getLang: () => currentLang };
