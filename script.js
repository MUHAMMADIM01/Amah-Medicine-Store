/* ===== keys & defaults ===== */
const STORAGE_TIPS_KEY = 'amah_health_tips';
const STORAGE_PASS_KEY = 'amah_admin_pass';
const STORAGE_SESSION_KEY = 'amah_admin_session';

const DEFAULT_TIPS = [
  "Get 7-8 hours of sleep every night.",
  "Drink at least 8 glasses of water daily.",
  "Exercise regularly to maintain fitness.",
  "Eat fruits and vegetables every day."
];

/* ===== storage helpers ===== */
function readTips(){
  try {
    const raw = localStorage.getItem(STORAGE_TIPS_KEY);
    return raw ? JSON.parse(raw) : [...DEFAULT_TIPS];
  } catch(e) { return [...DEFAULT_TIPS]; }
}
function saveTips(arr){ localStorage.setItem(STORAGE_TIPS_KEY, JSON.stringify(arr)); }
function getPassword(){ return localStorage.getItem(STORAGE_PASS_KEY) || null; }
function setPassword(p){ localStorage.setItem(STORAGE_PASS_KEY, p); }
function setSession(on){
  if(on) localStorage.setItem(STORAGE_SESSION_KEY, '1');
  else localStorage.removeItem(STORAGE_SESSION_KEY);
}
function isSession(){ return localStorage.getItem(STORAGE_SESSION_KEY) === '1'; }

/* ===== HOMEPAGE: tips rotator ===== */
function initTipsRotator(){
  const tipBox = document.getElementById('tipText');
  if(!tipBox) return;
  let tips = readTips();
  let idx = 0;
  tipBox.textContent = tips[idx] || 'Stay healthy!';
  setInterval(() => {
    tips = readTips(); // re-read to pick up new tips without reload
    if(!tips || tips.length === 0){ tipBox.textContent = 'Stay healthy!'; return; }
    idx = (idx + 1) % tips.length;
    tipBox.textContent = tips[idx];
  }, 5000);
}

/* ===== LOGIN (used by login.html) ===== */
function login(enteredPassword){
  const stored = getPassword();
  if(!stored){
    alert('No admin password set. Create password first on this page.');
    return;
  }
  if(!enteredPassword || enteredPassword.trim() === ''){ alert('Enter password'); return; }
  if(enteredPassword === stored){
    setSession(true);
    window.location.href = 'dashboard.html';
  } else {
    alert('Incorrect password!');
  }
}

/* ===== ADMIN PAGE: require auth ===== */
function requireAuthOrRedirect(){
  if(!isSession()){
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/* ===== ADMIN: render tips list ===== */
function renderAdminTips(){
  if(!requireAuthOrRedirect()) return;
  const list = document.getElementById('tipsList');
  if(!list) return;
  const tips = readTips();
  list.innerHTML = '';
  tips.forEach((t, i) => {
    const li = document.createElement('li');
    li.textContent = t;
    li.title = 'Click to delete';
    li.addEventListener('click', () => {
      if(confirm('Delete this tip?')){
        const arr = readTips();
        arr.splice(i,1);
        saveTips(arr);
        renderAdminTips();
      }
    });
    list.appendChild(li);
  });
}

/* ===== ADMIN: add tip ===== */
function addTipFromInput(){
  if(!requireAuthOrRedirect()) return;
  const ta = document.getElementById('newTip');
  if(!ta) return;
  const text = ta.value.trim();
  if(!text){ alert('Please enter a tip'); return; }
  const arr = readTips();
  arr.push(text);
  saveTips(arr);
  ta.value = '';
  renderAdminTips();
  alert('Tip added — appears on homepage automatically.');
}

/* ===== ADMIN: change password ===== */
function changePasswordFromInput(){
  if(!requireAuthOrRedirect()) return;
  const el = document.getElementById('changePassInput');
  if(!el) return;
  const v = el.value.trim();
  if(v.length < 6){ alert('Password must be at least 6 characters'); return; }
  setPassword(v);
  el.value = '';
  alert('Password updated.');
}

/* ===== logout ===== */
function logoutAndRedirect(){
  setSession(false);
  window.location.href = 'login.html';
}

/* ===== run on load binds ===== */
document.addEventListener('DOMContentLoaded', () => {
  // homepage
  if(document.getElementById('tipText')) initTipsRotator();

  // admin page actions
  if(document.getElementById('tipsList')){
    if(requireAuthOrRedirect()) renderAdminTips();
    // add buttons wired in dashboard.html inline script
  }
});
