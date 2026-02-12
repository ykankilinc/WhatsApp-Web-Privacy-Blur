(function () {
    if (window.waPrivacyBlurLoaded) return;
    window.waPrivacyBlurLoaded = true;

    const CLASS_MAP = {
        blurAllMessages: 'wa-blur-all-messages',
        blurLastMessages: 'wa-blur-last-messages',
        blurMediaPreview: 'wa-blur-media-preview',
        blurMediaGallery: 'wa-blur-media-gallery',
        blurTextInput: 'wa-blur-text-input',
        blurProfilePictures: 'wa-blur-profile-pictures',
        blurGroupNames: 'wa-blur-group-names',
        noTransitionDelay: 'wa-no-transition'
    };

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
        // Security
        enableScreenLock: false,
        screenLockPassword: '',
        autoLockMinutes: 5,
        isLocked: false // State
    };

    let currentSettings = { ...defaults };
    let idleTimer = null;
    let lockOverlay = null;

    function applySettings(settings) {
        if (!document.body) return;

        currentSettings = { ...defaults, ...settings };
        const master = currentSettings.masterToggle;

        // Apply Blur Classes
        if (!master) {
            Object.values(CLASS_MAP).forEach(className => {
                document.body.classList.remove(className);
            });
        } else {
            Object.keys(CLASS_MAP).forEach(key => {
                const isEnabled = currentSettings[key];
                const className = CLASS_MAP[key];

                if (isEnabled) document.body.classList.add(className);
                else document.body.classList.remove(className);
            });
        }

        // Handle Screen Lock
        handleScreenLock(currentSettings);
    }

    function handleScreenLock(settings) {
        const { enableScreenLock, isLocked, screenLockPassword } = settings;

        // If lock is disabled, remove overlay if exists
        if (!enableScreenLock) {
            removeLockScreen();
            return;
        }

        // Check if we need to lock
        if (isLocked) {
            showLockScreen();
        } else {
            removeLockScreen();
        }

        // Reset idle timer logic
        resetIdleTimer();
    }

    function showLockScreen() {
        if (document.getElementById('wa-privacy-lock-screen')) return; // Already shown

        const overlay = document.createElement('div');
        overlay.id = 'wa-privacy-lock-screen';
        overlay.innerHTML = `
        <div class="lock-container">
            <div class="lock-icon">🔒</div>
            <h2>WhatsApp Locked</h2>
            <!-- Input wrapped to isolate against injected icons -->
            <div class="wa-input-wrapper" style="position: relative; width: 100%;">
                <input type="text" id="wa-session-key" class="masked-password" placeholder="Enter Access Code" autocomplete="off" data-lpignore="true" name="no-autofill" />
            </div>
            <button id="wa-unlock-btn">Unlock</button>
            <div id="wa-lock-error"></div>
        </div>
      `;
        document.documentElement.appendChild(overlay);

        const input = document.getElementById('wa-session-key');
        const btn = document.getElementById('wa-unlock-btn');
        const errorMsg = document.getElementById('wa-lock-error');

        // Focus input
        setTimeout(() => input.focus(), 100);

        const attemptUnlock = () => {
            if (input.value === currentSettings.screenLockPassword) {
                chrome.storage.local.set({ isLocked: false });
                removeLockScreen();
            } else {
                errorMsg.innerText = 'Incorrect Password';
                input.classList.add('error');
                setTimeout(() => input.classList.remove('error'), 500);
            }
        };

        btn.addEventListener('click', attemptUnlock);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') attemptUnlock();
        });

        // Blur background heavily
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function removeLockScreen() {
        const overlay = document.getElementById('wa-privacy-lock-screen');
        if (overlay) {
            overlay.remove();
            document.body.style.overflow = '';
        }
    }

    function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);

        if (currentSettings.enableScreenLock && !currentSettings.isLocked) {
            const timeoutMs = (currentSettings.autoLockMinutes || 5) * 60 * 1000;
            idleTimer = setTimeout(() => {
                chrome.storage.local.set({ isLocked: true });
            }, timeoutMs);
        }
    }

    // Load and Loop
    function loadAndApply() {
        chrome.storage.local.get(null, (items) => { // Get all items
            requestAnimationFrame(() => applySettings(items));
        });
    }

    // Initial load
    setTimeout(loadAndApply, 1500);

    // Storage Listener
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            loadAndApply();
        }
    });

    // Periodic Check
    setInterval(() => {
        if (document.body) applySettings(currentSettings);
    }, 2500);

    // User Activity Detection for Auto-Lock
    ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, () => {
            // If we are NOT locked, reset the timer
            if (currentSettings.enableScreenLock && !currentSettings.isLocked) {
                resetIdleTimer();
            }
        }, { passive: true });
    });

    // Keyboard Shortcut: Alt + Shift + L to Lock
    document.addEventListener('keydown', (e) => {
        // Check if Alt + Shift + L is pressed
        if (e.altKey && e.shiftKey && (e.key === 'l' || e.key === 'L')) {
            chrome.storage.local.set({
                isLocked: true,
                enableScreenLock: true // Ensure it enables if not already
            });
        }
    });

})();
