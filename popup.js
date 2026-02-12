document.addEventListener('DOMContentLoaded', () => {
  const options = [
    'masterToggle',
    'blurAllMessages',
    'blurLastMessages',
    'blurMediaPreview',
    'blurMediaGallery',
    'blurTextInput',
    'blurProfilePictures',
    'blurGroupNames',
    'noTransitionDelay',
    // Security
    'enableScreenLock',
    'screenLockPassword',
    'autoLockMinutes'
  ];

  const defaults = {
    masterToggle: true,
    blurAllMessages: false,
    blurLastMessages: false,
    blurMediaPreview: false,
    blurMediaGallery: false,
    blurTextInput: false,
    blurProfilePictures: false,
    blurGroupNames: false,
    noTransitionDelay: false,
    enableScreenLock: false,
    screenLockPassword: '',
    autoLockMinutes: 5
  };

  // Views
  const mainView = document.getElementById('mainView');
  const loginView = document.getElementById('loginView');
  const optionsContainer = document.getElementById('optionsContainer');

  // Header Elements
  const masterToggle = document.getElementById('masterToggle');
  const masterSwitchContainer = document.getElementById('masterSwitchContainer');

  // Security Elements
  const enableScreenLock = document.getElementById('enableScreenLock');
  const screenLockPassword = document.getElementById('screenLockPassword');
  const savePasswordBtn = document.getElementById('savePasswordBtn');
  const autoLockMinutes = document.getElementById('autoLockMinutes');
  const lockNowBtn = document.getElementById('lockNowBtn');

  // Login Elements
  const popupPassword = document.getElementById('popupPassword');
  const popupUnlockBtn = document.getElementById('popupUnlockBtn');
  const popupError = document.getElementById('popupError');

  // Stored Password reference
  let storedPassword = '';

  // INITIAL LOAD
  chrome.storage.local.get(Object.keys(defaults), (result) => {
    // 1. Check if we need to lock the popup
    const isLockedEnabled = result.enableScreenLock;
    storedPassword = result.screenLockPassword;

    if (isLockedEnabled && storedPassword) {
      showLoginView();
      // Disable master toggle interaction while locked
      if (masterSwitchContainer) masterSwitchContainer.style.pointerEvents = 'none';
    } else {
      showMainView();
    }

    // 2. Populate Inputs
    options.forEach(option => {
      const el = document.getElementById(option);
      if (el && (el.type === 'checkbox')) {
        el.checked = result[option] !== undefined ? result[option] : defaults[option];
      } else if (el && (el.type === 'password' || el.type === 'number')) {
        el.value = result[option] !== undefined ? result[option] : defaults[option];
      }
    });

    updateUIState();
  });

  // --- VIEW SWITCHING ---
  function showLoginView() {
    mainView.classList.add('hidden');
    loginView.classList.remove('hidden');
    setTimeout(() => popupPassword.focus(), 100);
  }

  function showMainView() {
    loginView.classList.add('hidden');
    mainView.classList.remove('hidden');
    if (masterSwitchContainer) masterSwitchContainer.style.pointerEvents = 'auto'; // Re-enable master switch
  }

  // --- LOGIN LOGIC ---
  const attemptLogin = () => {
    if (popupPassword.value === storedPassword) {
      showMainView();
    } else {
      popupError.innerText = 'Incorrect Password';
      popupPassword.classList.add('error');
      setTimeout(() => popupPassword.classList.remove('error'), 500);
    }
  };

  popupUnlockBtn.addEventListener('click', attemptLogin);
  popupPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') attemptLogin();
  });


  // --- SETTINGS LOGIC ---

  // Listeners for Toggles
  options.forEach(option => {
    const el = document.getElementById(option);
    if (el && el.type === 'checkbox') {
      el.addEventListener('change', () => {
        const value = el.checked;
        chrome.storage.local.set({ [option]: value });
        if (option === 'masterToggle') {
          updateUIState();
        }
      });
    }
  });

  // Listener for Password Set
  savePasswordBtn.addEventListener('click', () => {
    const password = screenLockPassword.value;
    if (password) {
      chrome.storage.local.set({ screenLockPassword: password }, () => {
        storedPassword = password; // Update local ref
        // Visual feedback
        const originalText = savePasswordBtn.innerText;
        savePasswordBtn.innerText = 'Saved!';
        savePasswordBtn.style.backgroundColor = '#4caf50';
        setTimeout(() => {
          savePasswordBtn.innerText = originalText;
          savePasswordBtn.style.backgroundColor = '';
        }, 1500);
      });
    }
  });

  // Listener for Auto-lock Minutes
  autoLockMinutes.addEventListener('change', () => {
    const min = parseInt(autoLockMinutes.value) || 5;
    chrome.storage.local.set({ autoLockMinutes: min });
  });

  // Listener for Lock Now
  lockNowBtn.addEventListener('click', () => {
    // Force enable screen lock if locking now
    chrome.storage.local.set({
      isLocked: true,
      enableScreenLock: true
    });

    // Update the checkbox UI immediately if it exists
    if (enableScreenLock) enableScreenLock.checked = true;

    lockNowBtn.innerText = 'Locked!';
    setTimeout(() => {
      lockNowBtn.innerText = 'Lock Now';
    }, 1500);
  });

  function updateUIState() {
    // If master toggle is OFF, disable options but keep Security active?
    // User choice: usually master toggle disables EVERYTHING including security.
    // BUT: if security is disabled by master toggle, anyone can toggle master back ON.
    // Logic: Master toggle only affects BLUR features. Security is independent.

    // For now, let's keep it simple: Master Toggle disables BLUR options only.
    if (masterToggle.checked) {
      optionsContainer.classList.remove('disabled');
      // Re-enable security inputs if container was disabled
      document.querySelectorAll('.security-section input, .security-section button').forEach(el => el.disabled = false);
    } else {
      // Disable Blur Options visually
      // But keep Security Section active so user can still change password/lock settings?
      // Actually, if Master is OFF, we might still want Lock Screen to work?
      // Let's make Master Toggle ONLY affect the Option Groups (Blur), NOT Security.

      const blurGroups = document.querySelectorAll('.option-group');
      blurGroups.forEach(g => g.style.opacity = '0.5');
      blurGroups.forEach(g => g.style.pointerEvents = 'none');
    }

    if (masterToggle.checked) {
      const blurGroups = document.querySelectorAll('.option-group');
      blurGroups.forEach(g => g.style.opacity = '1');
      blurGroups.forEach(g => g.style.pointerEvents = 'auto');
    }
  }
});
