(function() {
    const STORAGE_KEYS = {
        USERS: "pixelQuest_users",
        CURRENT_USER: "pixelQuest_currentUser",
     
    };

    
    function getUserKey(baseKey, email) {
        if (!email) email = getCurrentUserEmail();
        return `${baseKey}_${email}`;
    }

    function getUsers() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    }
    function saveUsers(users) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    function getCurrentUserEmail() {
        return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    }
    function setCurrentUser(email) {
        if (email) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, email);
        else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    function getCurrentUser() {
        const email = getCurrentUserEmail();
        if (!email) return null;
        const users = getUsers();
        return users.find(u => u.email === email) || null;
    }
    function updateUserCharacter(email, characterName, characterImage) {
        const users = getUsers();
        const index = users.findIndex(u => u.email === email);
        if (index !== -1) {
            users[index].selectedCharacter = characterName;
            users[index].characterImage = characterImage;
            saveUsers(users);
            return true;
        }
        return false;
    }
    function updateUserUsername(email, newUsername) {
        const users = getUsers();
        const index = users.findIndex(u => u.email === email);
        if (index !== -1) {
            users[index].username = newUsername.trim();
            saveUsers(users);
            return true;
        }
        return false;
    }
    function updateUserAvatar(email, avatarDataURL) {
        const users = getUsers();
        const index = users.findIndex(u => u.email === email);
        if (index !== -1) {
            users[index].characterImage = avatarDataURL;
            saveUsers(users);
            return true;
        }
        return false;
    }
    function userExists(email) {
        return getUsers().some(u => u.email === email);
    }
    function createUser(username, email, password) {
        const users = getUsers();
        if (users.find(u => u.email === email)) return null;
        const newUser = {
            id: Date.now(),
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: password.trim(),
            selectedCharacter: null,
            characterImage: null
        };
        users.push(newUser);
        saveUsers(users);
        return newUser;
    }
    function validateLogin(email, password) {
        const users = getUsers();
        const normalizedEmail = email.toLowerCase().trim();
        return users.find(u => u.email === normalizedEmail && u.password === password.trim()) || null;
    }

    // Classic Mode
    function getClassicCompletedLevels() {
        const key = getUserKey('classic_completed_levels');
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : [];
    }
    function setClassicCompletedLevels(levels) {
        const key = getUserKey('classic_completed_levels');
        localStorage.setItem(key, JSON.stringify(levels));
    }
    function getClassicHighestLevel() {
        const key = getUserKey('classic_highest_level');
        return localStorage.getItem(key) || null;
    }
    function setClassicHighestLevel(levelId) {
        const key = getUserKey('classic_highest_level');
        localStorage.setItem(key, levelId);
    }
    function getClassicGameState() {
        const key = getUserKey('classic_game_state');
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
    }
    function setClassicGameState(state) {
        const key = getUserKey('classic_game_state');
        localStorage.setItem(key, JSON.stringify(state));
    }
    function clearClassicGameState() {
        const key = getUserKey('classic_game_state');
        localStorage.removeItem(key);
    }
    function getClassicKeysPerLevel() {
        const key = getUserKey('classic_keys_per_level');
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : {};
    }
    function setClassicKeysPerLevel(keysMap) {
        const key = getUserKey('classic_keys_per_level');
        localStorage.setItem(key, JSON.stringify(keysMap));
    }

   
    function getClassicCurrentRank() {
        const completed = getClassicCompletedLevels();
        const unlockOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        if (completed.length === 0) return 'A1';
        for (let i = 0; i < unlockOrder.length; i++) {
            if (!completed.includes(unlockOrder[i])) {
                return unlockOrder[i];
            }
        }
        return 'C2';
    }

    // Endless Mode
    function getEndlessHighScore() {
        const key = getUserKey('ENDLESS_HIGHSCORE');
        const val = localStorage.getItem(key);
        return val ? parseInt(val) : 0;
    }
    function setEndlessHighScore(score) {
        const key = getUserKey('ENDLESS_HIGHSCORE');
        localStorage.setItem(key, score);
    }
    function getEndlessCooldownDeadline() {
        const key = getUserKey('ENDLESS_COOLDOWN_DEADLINE');
        const val = localStorage.getItem(key);
        return val ? parseInt(val) : null;
    }
    function setEndlessCooldownDeadline(deadline) {
        const key = getUserKey('ENDLESS_COOLDOWN_DEADLINE');
        if (deadline) localStorage.setItem(key, deadline);
        else localStorage.removeItem(key);
    }
    function getEndlessTotalDeaths() {
        const key = getUserKey('ENDLESS_TOTAL_DEATHS');
        const val = localStorage.getItem(key);
        return val ? parseInt(val) : 0;
    }
    function setEndlessTotalDeaths(deaths) {
        const key = getUserKey('ENDLESS_TOTAL_DEATHS');
        localStorage.setItem(key, deaths);
    }
    function incrementEndlessTotalDeaths() {
        let current = getEndlessTotalDeaths();
        current++;
        setEndlessTotalDeaths(current);
        return current;
    }
    function getEndlessLongestRun() {
        const key = getUserKey('ENDLESS_LONGEST_RUN');
        const val = localStorage.getItem(key);
        return val ? parseInt(val) : 0;
    }
    function setEndlessLongestRun(seconds) {
        const key = getUserKey('ENDLESS_LONGEST_RUN');
        localStorage.setItem(key, seconds);
    }
    function getEndlessGameState() {
        const key = getUserKey('ENDLESS_GAME_STATE');
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
    }
    function setEndlessGameState(state) {
        const key = getUserKey('ENDLESS_GAME_STATE');
        localStorage.setItem(key, JSON.stringify(state));
    }
    function clearEndlessGameState() {
        const key = getUserKey('ENDLESS_GAME_STATE');
        localStorage.removeItem(key);
    }

    // Daily Challenge Mode
    function getDailyStreak() {
        const key = getUserKey('daily_streak');
        const val = localStorage.getItem(key);
        return val ? parseInt(val) : 0;
    }
    function setDailyStreak(streak) {
        const key = getUserKey('daily_streak');
        localStorage.setItem(key, streak);
    }
    function getDailyBestStreak() {
        const key = getUserKey('daily_best_streak');
        const val = localStorage.getItem(key);
        return val ? parseInt(val) : 0;
    }
    function setDailyBestStreak(best) {
        const key = getUserKey('daily_best_streak');
        localStorage.setItem(key, best);
    }
    function getDailyLastPlayDate() {
        const key = getUserKey('daily_last_play_date');
        return localStorage.getItem(key);
    }
    function setDailyLastPlayDate(date) {
        const key = getUserKey('daily_last_play_date');
        localStorage.setItem(key, date);
    }
    function getDailyLastResult() {
        const key = getUserKey('daily_last_result');
        return localStorage.getItem(key);
    }
    function setDailyLastResult(result) {
        const key = getUserKey('daily_last_result');
        localStorage.setItem(key, result);
    }

    window.PixelQuestStorage = {
        // core user functions
        getUsers, saveUsers, getCurrentUserEmail, setCurrentUser, getCurrentUser,
        updateUserCharacter, updateUserUsername, updateUserAvatar, userExists,
        createUser, validateLogin,
        // classic user‑specific
        getClassicCompletedLevels, setClassicCompletedLevels,
        getClassicHighestLevel, setClassicHighestLevel,
        getClassicGameState, setClassicGameState, clearClassicGameState,
        getClassicKeysPerLevel, setClassicKeysPerLevel,
        getClassicCurrentRank,   
        // endless user‑specific
        getEndlessHighScore, setEndlessHighScore,
        getEndlessCooldownDeadline, setEndlessCooldownDeadline,
        getEndlessTotalDeaths, setEndlessTotalDeaths, incrementEndlessTotalDeaths,
        getEndlessLongestRun, setEndlessLongestRun,
        getEndlessGameState, setEndlessGameState, clearEndlessGameState,
        // daily user‑specific
        getDailyStreak, setDailyStreak,
        getDailyBestStreak, setDailyBestStreak,
        getDailyLastPlayDate, setDailyLastPlayDate,
        getDailyLastResult, setDailyLastResult
    };
})();