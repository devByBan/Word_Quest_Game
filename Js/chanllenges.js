(function() {
    const DAILY_WORD_BANK = [
        "SERVER", "CLOUD", "PIXEL", "QUEST", "STREAK", "DAILY", "CHALLENGE", "HABIT", "LEARN", "GROWTH",
        "FOCUS", "SHARP", "BRAIN", "THINK", "SOLVE", "GUESS", "PROVE", "VICTORY", "DEFEAT", "RESET",
        "MORNING", "NIGHT", "SUNRISE", "SUNSET", "CYCLE", "ROUTINE", "DISCIPLINE", "PATIENCE", "HONOR",
        "GLORY", "MEDAL", "TROPHY", "CROWN", "THRONE", "WIZARD", "KNIGHT", "DRAGON", "PHOENIX", "TITAN",
        "MYSTIC", "RUNIC", "GLYPH", "TALISMAN", "RELIC", "ARTIFACT", "SHRINE", "TEMPLE", "OBELISK",
        "HARMONY", "BALANCE", "JUSTICE", "COURAGE", "WISDOM", "TRUTH", "PEACE", "POWER", "SPIRIT",
        "FORGE", "HAMMER", "ANVIL", "SMITH", "RUNES", "SAGA", "EPIC", "LEGEND", "FABLE", "MYTH"
    ];

    const lockOverlay = document.getElementById("lockOverlay");
    const lockTimerSpan = document.getElementById("lockTimer");
    const closeLockBtn = document.getElementById("closeLockBtn");
    const streakValueSpan = document.getElementById("streakValue");
    const dayBadgeSpan = document.getElementById("dayBadge");
    const countdownTimerSpan = document.getElementById("countdownTimer");
    const scrambledDiv = document.getElementById("scrambledWord");
    const guessInput = document.getElementById("guessInput");
    const submitBtn = document.getElementById("submitBtn");
    const shuffleBtn = document.getElementById("shuffleBtn");
    const attStatusSpan = document.getElementById("attStatus");
    const streakDisplaySpan = document.getElementById("streakDisplay");
    const messageDiv = document.getElementById("messageDisplay");

    let gameActive = false;
    let currentWord = "";
    let currentScrambled = "";

    function getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }

    function getCurrentDayNumber() {
        const start = new Date("2025-01-01");
        const today = new Date();
        const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
        return diff + 1;
    }

    function getWordForDay(day) {
        return DAILY_WORD_BANK[(day - 1) % DAILY_WORD_BANK.length];
    }

    function scrambleWord(word) {
        let letters = word.split('');
        for (let i = letters.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        return letters.join('');
    }

    function updateStreakUI() {
        const streak = PixelQuestStorage.getDailyStreak();
        streakValueSpan.innerText = streak;
        streakDisplaySpan.innerText = streak;
    }

    function updateDayUI() {
        dayBadgeSpan.innerText = `DAY #${getCurrentDayNumber()}`;
    }

    function getSecondsUntilMidnight() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        return Math.floor((midnight - now) / 1000);
    }

    let countdownInterval = null;
    function startCountdownTimer() {
        if (countdownInterval) clearInterval(countdownInterval);
        function update() {
            const seconds = getSecondsUntilMidnight();
            if (seconds <= 0) location.reload();
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            countdownTimerSpan.innerText = timeStr;
            if (lockOverlay.style.display === 'flex') {
                lockTimerSpan.innerText = `NEXT: ${timeStr}`;
            }
        }
        update();
        countdownInterval = setInterval(update, 1000);
    }

    function lockGame() {
        gameActive = false;
        guessInput.disabled = true;
        submitBtn.disabled = true;
        shuffleBtn.disabled = true;
        lockOverlay.style.display = 'flex';
        startCountdownTimer();
    }

    function handleWin() {
        let streak = PixelQuestStorage.getDailyStreak();
        streak++;
        let best = PixelQuestStorage.getDailyBestStreak();
        if (streak > best) best = streak;
        PixelQuestStorage.setDailyStreak(streak);
        PixelQuestStorage.setDailyBestStreak(best);
        updateStreakUI();
        PixelQuestStorage.setDailyLastPlayDate(getTodayDate());
        PixelQuestStorage.setDailyLastResult('win');
        messageDiv.innerText = "✅ VICTORY! STREAK INCREASED!";
        attStatusSpan.innerText = "WON TODAY";
        attStatusSpan.style.color = "#4caf50";
        if (window.SoundManager) window.SoundManager.playWin(); // win sound
        lockGame();
    }

    function handleLoss() {
        PixelQuestStorage.setDailyStreak(0);
        updateStreakUI();
        PixelQuestStorage.setDailyLastPlayDate(getTodayDate());
        PixelQuestStorage.setDailyLastResult('loss');
        messageDiv.innerText = "❌ DEFEAT! STREAK RESET TO 0.";
        attStatusSpan.innerText = "LOST TODAY";
        attStatusSpan.style.color = "#f44336";
        if (window.SoundManager) window.SoundManager.playLose(); // lose sound
        lockGame();
    }

    function onSubmit() {
        if (!gameActive) {
            messageDiv.innerText = "⏳ Challenge already completed today. Come back tomorrow!";
            return;
        }
        const guess = guessInput.value.trim().toUpperCase();
        if (guess === "") {
            messageDiv.innerText = "⚠️ ENTER A WORD!";
            return;
        }
        guessInput.disabled = true;
        submitBtn.disabled = true;
        shuffleBtn.disabled = true;
        if (guess === currentWord) handleWin();
        else handleLoss();
    }

    function onShuffle() {
        if (!gameActive) return;
        currentScrambled = scrambleWord(currentWord);
        scrambledDiv.innerText = currentScrambled.split('').join(' ');
        messageDiv.innerText = "🃏 LETTERS RESHUFFLED!";
        guessInput.focus();
        if (window.SoundManager) window.SoundManager.playShuffle();
    }

    function initDaily() {
        const today = getTodayDate();
        const lastPlay = PixelQuestStorage.getDailyLastPlayDate();
        const lastResult = PixelQuestStorage.getDailyLastResult();
        const dayNum = getCurrentDayNumber();

        if (lastPlay === today) {
            gameActive = false;
            if (lastResult === 'win') {
                attStatusSpan.innerText = "WON TODAY";
                attStatusSpan.style.color = "#4caf50";
                messageDiv.innerText = "You already won today! Come back tomorrow.";
            } else {
                attStatusSpan.innerText = "LOST TODAY";
                attStatusSpan.style.color = "#f44336";
                messageDiv.innerText = "You already lost today. Try again tomorrow!";
            }
            guessInput.disabled = true;
            submitBtn.disabled = true;
            shuffleBtn.disabled = true;
            lockOverlay.style.display = 'flex';
            startCountdownTimer();
        } else {
            gameActive = true;
            guessInput.disabled = false;
            submitBtn.disabled = false;
            shuffleBtn.disabled = false;
            lockOverlay.style.display = 'none';
            attStatusSpan.innerText = "Not played";
            attStatusSpan.style.color = "#ffcc00";
            messageDiv.innerText = "ONE GUESS · ONE CHANCE";
            guessInput.value = "";

            if (lastPlay) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                if (lastPlay !== yesterdayStr) {
                    PixelQuestStorage.setDailyStreak(0);
                    updateStreakUI();
                    messageDiv.innerText = "⚠️ You missed a day! Streak reset to 0. New word available.";
                }
            }
        }

        currentWord = getWordForDay(dayNum);
        currentScrambled = scrambleWord(currentWord);
        scrambledDiv.innerText = currentScrambled.split('').join(' ');
        updateDayUI();
        updateStreakUI();
        startCountdownTimer();
        if (gameActive) guessInput.focus();
    }

    submitBtn.addEventListener("click", onSubmit);
    shuffleBtn.addEventListener("click", onShuffle);
    guessInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") onSubmit();
    });
    closeLockBtn.addEventListener("click", () => {
        if (window.SoundManager) window.SoundManager.playClick();
        lockOverlay.style.display = "none";
    });

    initDaily();
})();