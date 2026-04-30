// Mode selection
const modeCards = document.querySelectorAll('.mode-card');
modeCards.forEach(card => {
    card.addEventListener('click', function() {
        if (window.SoundManager) window.SoundManager.playClick(); // + SOUND
        modeCards.forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        
        const mode = this.dataset.mode;
        if (mode === 'classic') {
            window.location.href = 'Level_Page.html';
        } else if (mode === 'endless') {
            window.location.href = 'endless_level.html';
        } else if (mode === 'challenge') {
            window.location.href = 'challenges_Tracking.html';
        }
    });
});


function updateStatsUI() {
    if (!window.PixelQuestStorage) return;
    const storage = window.PixelQuestStorage;

    const dailyBest = storage.getDailyBestStreak();
    const highStatElem = document.getElementById('statHigh');
    if (highStatElem) highStatElem.innerText = dailyBest;

    let endlessScore = 0;
    const endlessState = storage.getEndlessGameState();
    if (endlessState && endlessState.currentRunScore !== undefined) {
        endlessScore = endlessState.currentRunScore;
    }
    const pointStatElem = document.getElementById('statPoint');
    if (pointStatElem) pointStatElem.innerText = endlessScore;

    let highestLevel = storage.getClassicHighestLevel();
    if (!highestLevel) highestLevel = 'A1';
    const rankStatElem = document.getElementById('statRank');
    if (rankStatElem) rankStatElem.innerText = highestLevel;
}

// Storage & UI initialisation + Profile Dropdown
(function() {
    if (!window.PixelQuestStorage) {
        console.error("localStorage.js must be loaded first!");
        return;
    }
    const storage = window.PixelQuestStorage;

    const email = storage.getCurrentUserEmail();
    if (!email) {
        window.location.href = "EnterName.html";
        return;
    }

    let currentUser = storage.getCurrentUser();
    if (!currentUser) {
        storage.setCurrentUser(null);
        window.location.href = "EnterName.html";
        return;
    }

    const usernameSpan = document.getElementById('usernameDisplay');
    if (usernameSpan) {
        usernameSpan.textContent = currentUser.username.toUpperCase();
    }

    const avatarImg = document.getElementById('userAvatar');
    if (currentUser.characterImage) {
        avatarImg.src = currentUser.characterImage;
    } else {
        window.location.href = "Choose_Charater.html";
        return;
    }

    updateStatsUI();

    const avatarBtn = document.getElementById('profileAvatarBtn');
    const dropdown = document.getElementById('profileDropdown');
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    const dropdownName = document.getElementById('dropdownUserName');
    const fileInput = document.getElementById('avatarUpload');

    function updateDropdownUI() {
        if (dropdownName) dropdownName.textContent = currentUser.username;
        if (dropdownAvatar && avatarImg) dropdownAvatar.src = avatarImg.src;
    }

    function toggleDropdown(e) {
        e.stopPropagation();
        if (window.SoundManager) window.SoundManager.playClick(); // + SOUND
        dropdown.classList.toggle('show');
    }

    function closeDropdown(e) {
        if (!avatarBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    }

    avatarBtn.addEventListener('click', toggleDropdown);
    document.addEventListener('click', closeDropdown);

    const changeUsernameBtn = document.getElementById('changeUsernameBtn');
    if (changeUsernameBtn) {
        changeUsernameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.SoundManager) window.SoundManager.playClick(); // + SOUND
            const newName = prompt('Enter new username:', currentUser.username);
            if (newName && newName.trim() !== '') {
                const trimmed = newName.trim();
                storage.updateUserUsername(email, trimmed);
                currentUser = storage.getCurrentUser();
                if (usernameSpan) usernameSpan.textContent = currentUser.username.toUpperCase();
                updateDropdownUI();
                updateStatsUI();
            }
            dropdown.classList.remove('show');
        });
    }

    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.SoundManager) window.SoundManager.playClick(); // + SOUND
            fileInput.click();
            dropdown.classList.remove('show');
        });
    }

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        if (window.SoundManager) window.SoundManager.playClick(); // + SOUND
        const reader = new FileReader();
        reader.onload = function(ev) {
            const newAvatar = ev.target.result;
            storage.updateUserAvatar(email, newAvatar);
            currentUser = storage.getCurrentUser();
            if (avatarImg) avatarImg.src = newAvatar;
            updateDropdownUI();
            updateStatsUI();
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
    });

    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.SoundManager) window.SoundManager.playClick(); // + SOUND
            if (confirm('Sign out? Your progress will be saved.')) {
                storage.setCurrentUser(null);
                window.location.href = "EnterName.html";
            }
            dropdown.classList.remove('show');
        });
    }

    updateDropdownUI();

    const leaderboardBtn = document.getElementById('leaderboard');
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.SoundManager) window.SoundManager.playClick(); // + SOUND
            window.location.href = 'Leaderboard.html';
            dropdown.classList.remove('show');
        });
    }

    const darkBtn = document.getElementById('darkLightBtn');
    let darkMode = false;
    if (darkBtn) {
        darkBtn.addEventListener('click', () => {
            if (window.SoundManager) window.SoundManager.playClick(); // + SOUND
            darkMode = !darkMode;
            document.body.style.background = darkMode ? '#020005' : '#0b0710';
            darkBtn.innerHTML = darkMode ? '☀️ LIGHT' : '🌓 DARK';
        });
    }

    const soundBtn = document.getElementById('soundToggleBtn');
    let soundOn = true;
    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            if (window.SoundManager) window.SoundManager.playClick(); // + SOUND
            soundOn = !soundOn;
            // Use SoundManager to mute/unmute
            if (window.SoundManager) window.SoundManager.enabled = soundOn;
            soundBtn.innerHTML = soundOn ? '🔊 ON' : '🔇 OFF';
        });
    }

    const howPopout = document.getElementById('howPopup');
    const closeHowBtn = howPopout ? howPopout.querySelector('.how-popout-close') : null;

    function showHowPopout() {
        if (!howPopout) return;
        howPopout.classList.remove('show');
        void howPopout.offsetWidth;
        howPopout.classList.add('show');
    }

    if (howPopout && !sessionStorage.getItem('tipShown')) {
        setTimeout(() => {
            showHowPopout();
            sessionStorage.setItem('tipShown', 'true');
        }, 500);
    }

    if (closeHowBtn) {
        closeHowBtn.addEventListener('click', () => {
            if (window.SoundManager) window.SoundManager.playClick(); // + SOUND
            if (howPopout) howPopout.classList.remove('show');
        });
    }

    const instrBtn = document.getElementById('instructionBtn');
    const popup = document.getElementById('instructionPopup');
    const closePopup = document.getElementById('closePopupBtn');

    if (instrBtn && popup && closePopup) {
        instrBtn.addEventListener('click', () => {
            if (window.SoundManager) window.SoundManager.playClick(); // + SOUND
            popup.classList.add('show');
        });
        closePopup.addEventListener('click', () => {
            if (window.SoundManager) window.SoundManager.playClick(); // + SOUND
            popup.classList.remove('show');
        });
        popup.addEventListener('click', (e) => {
            if (e.target === popup) popup.classList.remove('show');
        });
    }
})();