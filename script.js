// ===== Firebase =====
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOBFWl24ZdvuFoS8hwZwiAg3CXsCPPVmQ",
  authDomain: "qotoof-9121a.firebaseapp.com",
  projectId: "qotoof-9121a",
  storageBucket: "qotoof-9121a.firebasestorage.app",
  messagingSenderId: "180620304460",
  appId: "1:180620304460:web:8cf4a43740abcc395d54e9",
  measurementId: "G-EMPJKRXVVJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// كاش بسيط لبيانات المستخدم الحالي (بيتحدث من Firebase نفسه، مش من المتصفح)
let currentUserData = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    let gender = '';
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) gender = snap.data().gender || '';
    } catch (e) {
      console.error('تعذر تحميل بيانات إضافية:', e);
    }
    currentUserData = {
      name: user.displayName || '',
      email: user.email || '',
      gender
    };
  } else {
    currentUserData = null;
  }
  updateAuthButton();
  if (document.getElementById('savedContent')) renderSavedPage();
});

function mapFirebaseError(err) {
  const code = err && err.code;
  switch (code) {
    case 'auth/email-already-in-use': return 'الإيميل ده متسجل قبل كده';
    case 'auth/invalid-email': return 'الإيميل مش صحيح';
    case 'auth/weak-password': return 'كلمة السر ضعيفة، لازم تكون 6 حروف على الأقل';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'الإيميل أو كلمة السر غلط';
    case 'auth/too-many-requests': return 'محاولات كتير غلط، جرب تاني بعد شوية';
    case 'auth/requires-recent-login': return 'برجاء إدخال كلمة السر الحالية الصح للتأكيد';
    default: return 'حصل خطأ، حاول تاني';
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isLoggedIn() {
  return !!auth.currentUser;
}

// ===== المنتجات المحفوظة (Wishlist محلي، مش حساس أمنيًا) =====

function filterProducts(type) {
  const products = document.querySelectorAll('.product');
  products.forEach(p => {
    if (type === 'all') {
      p.style.display = 'block';
    } else if (p.classList.contains(type)) {
      p.style.display = 'block';
    } else {
      p.style.display = 'none';
    }
  });
}

const PRODUCTS = [
  { code: 'QT-DR-001', name: '👗 دريس قطوف 1', img: 'img/tshirt1.jpg' },
  { code: 'QT-DR-002', name: '👗 دريس قطوف 2', img: 'img/tshirt2.jpg' },
  { code: 'QT-DR-003', name: '👗 دريس قطوف 3', img: 'img/tshirt3.jpg' },
  { code: 'QT-DR-004', name: '👗 دريس قطوف 4', img: 'img/tshirt4.jpg' },
  { code: 'QT-DR-005', name: '👗 دريس قطوف 5', img: 'img/tshirt5.jpg' },
  { code: 'QT-DR-006', name: '👗 دريس قطوف 6', img: 'img/tshirt6.jpg' },
  { code: 'QT-DR-007', name: '👗 دريس قطوف 7', img: 'img/tshirt4.jpg' },
  { code: 'QT-PN-010', name: '👖 بنطلون قطوف 1', img: 'img/pants1.jpg' },
  { code: 'QT-PN-011', name: '👖 بنطلون قطوف 2', img: 'img/pants2.jpg' },
  { code: 'QT-PN-012', name: '👖 بنطلون قطوف 3', img: 'img/pants3.jpg' },
  { code: 'QT-PN-013', name: '👖 بنطلون قطوف 4', img: 'img/pants4.jpg' },
  { code: 'QT-PN-014', name: '👖 بنطلون قطوف 5', img: 'img/pants5.jpg' },
  { code: 'QT-ST-100', name: '🧥 طقم قطوف 1', img: 'img/set1.jpg' }
];

function getSavedCodes() {
  return JSON.parse(localStorage.getItem('qotoof_saved') || '[]');
}

function renderSavedPage() {
  const container = document.getElementById('savedContent');
  if (!container) return;

  if (!currentUserData) {
    container.innerHTML = `
      <p style="margin-bottom:14px;">سجّل دخولك الأول عشان تقدر تشوف منتجاتك المحفوظة</p>
      <button class="auth-option-btn" style="max-width:220px;margin:0 auto;" onclick="openAuthModal()">تسجيل الدخول</button>
    `;
    return;
  }

  const genderLabel = currentUserData.gender === 'female' ? 'أنثى' : 'ذكر';
  const safeName = escapeHtml(currentUserData.name);
  const safeEmail = escapeHtml(currentUserData.email);

  let profileHtml = `
    <div style="text-align:center;margin-bottom:25px;">
      <h3 style="margin:10px 0 4px;">مرحبًا ${safeName}</h3>
      <p style="margin:2px 0;font-weight:normal;">${safeEmail}</p>
      <p style="margin:2px 0;font-weight:normal;">${genderLabel}</p>
    </div>
  `;

  const savedCodes = getSavedCodes();
  const savedProducts = PRODUCTS.filter(p => savedCodes.includes(p.code));

  if (savedProducts.length === 0) {
    container.innerHTML = profileHtml + `<p>لا يوجد منتجات محفوظة بعد</p>`;
    return;
  }

  const cardsHtml = savedProducts.map(p => `
    <div class="product">
      <img src="${p.img}">
      <h3>${p.name}</h3>
      <p>🆔 الكود: ${p.code}</p>
      <select id="saved-${p.code}"><option>Oversized</option><option>Slim</option></select>
      <button class="save-btn" onclick="removeFromSaved('${p.code}')">❤️</button>
      <button class="order-btn" onclick="order('${p.code}','${p.name}','saved-${p.code}')">اطلب الآن</button>
    </div>
  `).join('');

  container.innerHTML = profileHtml + `<div class="products" style="padding:0;">${cardsHtml}</div>`;
}

function removeFromSaved(code) {
  let saved = getSavedCodes();
  saved = saved.filter(c => c !== code);
  localStorage.setItem('qotoof_saved', JSON.stringify(saved));
  renderSavedPage();
}

function syncSavedHearts() {
  const saved = getSavedCodes();
  document.querySelectorAll('.product').forEach(product => {
    const codeText = product.querySelector('p').textContent.replace('🆔 الكود:', '').trim();
    const btn = product.querySelector('.save-btn');
    if (btn) {
      btn.textContent = saved.includes(codeText) ? '❤️' : '🤍';
    }
  });
}

function toggleSave(btn) {
  if (!isLoggedIn()) {
    return;
  }

  const product = btn.closest('.product');
  const code = product.querySelector('p').textContent.replace('🆔 الكود:', '').trim();

  let saved = JSON.parse(localStorage.getItem('qotoof_saved') || '[]');

  if (saved.includes(code)) {
    saved = saved.filter(c => c !== code);
    btn.textContent = '🤍';
  } else {
    saved.push(code);
    btn.textContent = '❤️';
  }

  localStorage.setItem('qotoof_saved', JSON.stringify(saved));
}

// ===== تسجيل الدخول / حساب جديد (Firebase Authentication) =====

async function handleSignup(event) {
  event.preventDefault();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const gender = document.getElementById('signupGender').value;
  const errorEl = document.getElementById('signupError');
  errorEl.style.display = 'none';

  if (!name || !email || !password) {
    errorEl.textContent = 'برجاء ملء كل الحقول';
    errorEl.style.display = 'block';
    return;
  }
  if (name.length > 40) {
    errorEl.textContent = 'الاسم طويل جدًا';
    errorEl.style.display = 'block';
    return;
  }
  if (!isValidEmail(email)) {
    errorEl.textContent = 'برجاء إدخال إيميل صحيح';
    errorEl.style.display = 'block';
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = 'كلمة السر لازم تكون 6 حروف على الأقل';
    errorEl.style.display = 'block';
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, 'users', cred.user.uid), { gender });
    location.href = 'index.html';
  } catch (err) {
    errorEl.textContent = mapFirebaseError(err);
    errorEl.style.display = 'block';
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  errorEl.style.display = 'none';

  if (!email || !password) {
    errorEl.textContent = 'برجاء ملء كل الحقول';
    errorEl.style.display = 'block';
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    location.href = 'index.html';
  } catch (err) {
    errorEl.textContent = mapFirebaseError(err);
    errorEl.style.display = 'block';
  }
}

async function logout() {
  await signOut(auth);
  location.href = 'index.html';
}

// ===== نسيت كلمة السر =====

function openForgotModal() {
  closeAuthModal();
  const msgEl = document.getElementById('forgotMsg');
  if (msgEl) msgEl.style.display = 'none';
  const modal = document.getElementById('forgotModal');
  if (modal) modal.classList.add('active');
}

function closeForgotModal() {
  const modal = document.getElementById('forgotModal');
  if (modal) modal.classList.remove('active');
}

async function handleForgotPassword(event) {
  event.preventDefault();
  const email = document.getElementById('forgotEmail').value.trim();
  const msgEl = document.getElementById('forgotMsg');

  if (!isValidEmail(email)) {
    msgEl.textContent = 'برجاء إدخال إيميل صحيح';
    msgEl.style.color = '#dc3545';
    msgEl.style.display = 'block';
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    msgEl.textContent = 'اتبعت لينك إعادة تعيين كلمة السر على إيميلك، افتح صندوق الوارد (وتحقق من الـ Spam)';
    msgEl.style.color = '#25D366';
    msgEl.style.display = 'block';
  } catch (err) {
    msgEl.textContent = mapFirebaseError(err);
    msgEl.style.color = '#dc3545';
    msgEl.style.display = 'block';
  }
}

// ===== واجهة تسجيل الدخول في الهيدر =====

function toggleMenu() {
  document.getElementById('topButtons').classList.toggle('active');
}

function updateAuthButton() {
  const area = document.getElementById('authNavArea');
  const loginBtn = document.getElementById('loginBtnStatic');

  if (currentUserData) {
    const initial = (currentUserData.name || currentUserData.email || '؟').trim().charAt(0).toUpperCase();
    const safeName = escapeHtml(currentUserData.name || '');
    const safeEmail = escapeHtml(currentUserData.email || '');
    const safeInitial = escapeHtml(initial);

    if (area) {
      area.style.display = 'flex';
      area.innerHTML = `
        <div class="user-menu">
          <button class="user-avatar-btn" onclick="toggleUserMenu()">${safeInitial}</button>
          <div class="user-dropdown" id="userDropdown">
            <p class="user-dropdown-name">${safeName}</p>
            <p class="user-dropdown-email">${safeEmail}</p>
            <button class="auth-option-btn" onclick="openEditModal()">تعديل البيانات</button>
            <button class="auth-option-btn secondary" onclick="logout()">تسجيل خروج</button>
          </div>
        </div>
      `;
    }

    if (loginBtn) {
      loginBtn.textContent = 'تسجيل خروج';
      loginBtn.onclick = logout;
    }
  } else {
    if (area) {
      area.innerHTML = '';
      area.style.display = 'none';
    }
    if (loginBtn) {
      loginBtn.textContent = 'تسجيل الدخول';
    }
  }
}

function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.classList.toggle('active');
}

document.addEventListener('click', function (e) {
  const menu = document.querySelector('.user-menu');
  const dropdown = document.getElementById('userDropdown');
  if (dropdown && dropdown.classList.contains('active')) {
    if (menu && !menu.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  }
});

// ===== تعديل بيانات الحساب =====

function openEditModal() {
  if (!currentUserData) return;

  document.getElementById('editName').value = currentUserData.name;
  document.getElementById('editEmail').value = currentUserData.email;
  document.getElementById('editPassword').value = '';
  document.getElementById('editCurrentPassword').value = '';

  const errorEl = document.getElementById('editError');
  if (errorEl) errorEl.style.display = 'none';

  toggleUserMenu();
  document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

async function handleEditSave(event) {
  event.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const newName = document.getElementById('editName').value.trim();
  const newEmail = document.getElementById('editEmail').value.trim();
  const newPassword = document.getElementById('editPassword').value;
  const currentPassword = document.getElementById('editCurrentPassword').value;
  const errorEl = document.getElementById('editError');
  errorEl.style.display = 'none';

  if (!newName || !newEmail) {
    errorEl.textContent = 'برجاء ملء الاسم والإيميل';
    errorEl.style.display = 'block';
    return;
  }
  if (newName.length > 40) {
    errorEl.textContent = 'الاسم طويل جدًا';
    errorEl.style.display = 'block';
    return;
  }
  if (!isValidEmail(newEmail)) {
    errorEl.textContent = 'برجاء إدخال إيميل صحيح';
    errorEl.style.display = 'block';
    return;
  }
  if (newPassword && newPassword.length < 6) {
    errorEl.textContent = 'كلمة السر لازم تكون 6 حروف على الأقل';
    errorEl.style.display = 'block';
    return;
  }

  const emailChanged = newEmail !== user.email;
  const passwordChanged = !!newPassword;

  if ((emailChanged || passwordChanged) && !currentPassword) {
    errorEl.textContent = 'برجاء إدخال كلمة السر الحالية للتأكيد على أي تعديل حساس';
    errorEl.style.display = 'block';
    return;
  }

  try {
    if (emailChanged || passwordChanged) {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
    }

    if (newName !== user.displayName) {
      await updateProfile(user, { displayName: newName });
    }
    if (emailChanged) {
      await updateEmail(user, newEmail);
    }
    if (passwordChanged) {
      await updatePassword(user, newPassword);
    }

    currentUserData = {
      name: newName,
      email: newEmail,
      gender: currentUserData ? currentUserData.gender : ''
    };

    closeEditModal();
    updateAuthButton();
    if (document.getElementById('savedContent')) renderSavedPage();
  } catch (err) {
    errorEl.textContent = mapFirebaseError(err);
    errorEl.style.display = 'block';
  }
}

// ===== نوافذ عامة =====

function openAuthModal() {
  document.getElementById('authModal').classList.add('active');
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('active');
}

function showDetails(btn) {
  const product = btn.closest('.product');
  const img = product.querySelector('img').getAttribute('src');
  const title = product.querySelector('h3').textContent;
  const code = product.querySelector('p').textContent;
  const desc = product.getAttribute('data-details') || 'لا يوجد وصف إضافي لهذا المنتج.';

  document.getElementById('modalImg').setAttribute('src', img);
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalCode').textContent = code;
  document.getElementById('modalDesc').textContent = desc;

  document.getElementById('detailsModal').classList.add('active');
}

function closeDetails() {
  document.getElementById('detailsModal').classList.remove('active');
}

function order(code, type, sizeId) {
  if (!isLoggedIn()) {
    openAuthModal();
    return;
  }

  const size = document.getElementById(sizeId).value;

  const msg = `😍 طلب جديد ل قطوف 👗
--------------------
الكود: ${code}
النوع: ${type}
المقاس: ${size}
--------------------
برجاء تأكيد السعر وموعد التسليم`;

  window.open("https://wa.me/201145587547?text=" + encodeURIComponent(msg), "_blank");
}

// ===== تشغيل أولي (الصفحة module، فمحتاجين نستدعي بأنفسنا) =====

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.product')) syncSavedHearts();
  if (document.getElementById('savedContent')) renderSavedPage();
  updateAuthButton();
});

// ===== إتاحة الفانكشنز للـ onclick في الـ HTML (الملف ده module الآن) =====
window.filterProducts = filterProducts;
window.toggleSave = toggleSave;
window.removeFromSaved = removeFromSaved;
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.logout = logout;
window.toggleMenu = toggleMenu;
window.toggleUserMenu = toggleUserMenu;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.handleEditSave = handleEditSave;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.showDetails = showDetails;
window.closeDetails = closeDetails;
window.order = order;
window.openForgotModal = openForgotModal;
window.closeForgotModal = closeForgotModal;
window.handleForgotPassword = handleForgotPassword;
