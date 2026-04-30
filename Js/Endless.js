// ENDLESS MODE – Full persistence with all sounds (win, lose, hint, shuffle, low blood)
(function() {
    // ---------- ENHANCED WORD BANK WITH ANAGRAMS ----------
    const WORD_BANK = [
        "RAT", "ART", "TAR", "STAR", "ARTS", "TARS", "RATS", "SILT", "LIST", "SLIT", "FILM", "MILF",
        "TIME", "MITE", "EMIT", "ITEM", "PARK", "SPARK", "SPAR", "WRONG", "GROWN", "OWNER", "SCORE",
        "CORES", "CRYPT", "SCREW", "CREWS", "SOUND", "NODUS", "ROUND", "DONOR", "GRAIN", "RAIN", "GAIN",
        "APPLE", "GRAPE", "MANGO", "LEMON", "PEACH", "BERRY", "HONEY", "SUGAR", "BREAD", "CHEESE",
        "CLOCK", "WATCH", "PHONE", "TABLE", "PLANT", "FLOWER", "GRASS", "LEAF", "OCEAN", "RIVER",
        "TIGER", "LION", "BEAR", "WOLF", "FOX", "RABBIT", "SNAKE", "EAGLE", "HAWK", "SHARK",
        "WHALE", "DRAGON", "MAGIC", "QUEST", "SWORD", "SHIELD", "ARMOR", "CROWN", "THRONE", "KING",
        "QUEEN", "KNIGHT", "WIZARD", "ELF", "DWARF", "ORC", "GOBLIN", "TROLL", "GIANT", "FAIRY",
        "FREEDOM", "JOURNEY", "MYSTERY", "HARMONY", "STRENGTH", "COURAGE", "PATIENCE", "WISDOM",
        "HONESTY", "KINDNESS", "FRIENDS", "HAPPY", "SADNESS", "VOLCANO", "THUNDER", "LIGHTNING",
        "RAINBOW", "MOONLIGHT", "SUNSHINE", "BUTTERFLY", "ELEPHANT", "GIRAFFE", "KANGAROO", "PANDA",
        "ZEBRA", "GORILLA", "LEOPARD", "CHEETAH", "FLAMINGO", "PARROT", "PELICAN", "HEDGEHOG",
        "JELLYFISH", "STARFISH", "PENGUIN", "OCTOPUS", "LOBSTER", "CRAB", "SPIDER", "ANT", "BEE",
        "CASTLE", "PALACE", "BRIDGE", "TOWER", "FOREST", "DESERT", "ISLAND", "BEACH", "MOUNTAIN",
        "LAKE", "CLOUD", "STORM", "WIND", "FIRE", "WATER", "EARTH", "AIR", "LIGHT", "DARK",
        "SHADOW", "GHOST", "SPIRIT", "ANGEL", "DEMON", "WITCH", "WARLOCK", "MONSTER", "BEAST",
        "CREATURE", "ANIMAL", "STONE", "ROCK", "SAND", "DUST", "ASH", "SMOKE", "FLAME", "ICE",
        "SNOW", "RAIN", "STAR", "MOON", "SUN", "PLANET", "COMET", "ASTEROID"
    ].filter(word => word.length <= 8);

    // DOM elements
    const bloodSpan = document.getElementById("bloodLevel");
    const decayFill = document.getElementById("decayFill");
    const highScoreSpan = document.getElementById("highScoreDisplay");
    const deathCounterSpan = document.getElementById("pointsDisplay");
    const scrambledDiv = document.getElementById("scrambledWord");
    const guessInput = document.getElementById("guessInput");
    const submitBtn = document.getElementById("submitBtn");
    const shuffleBtn = document.getElementById("shuffleBtn");
    const hintBtn = document.getElementById("hintBtn");
    const timerSpan = document.getElementById("timer");
    const messageDiv = document.getElementById("messageDisplay");
    const survivalBars = document.getElementById("survivalBars");

    let lowBloodPlayed = false;

    function updateMeterBars() {
        if (!survivalBars) return;
        const segments = survivalBars.querySelectorAll('.bar-segment');
        if (segments.length === 0) return;
        const filledCount = Math.floor(blood / 20);
        for (let i = 0; i < segments.length; i++) {
            if (i < filledCount) segments[i].classList.add('fill');
            else segments[i].classList.remove('fill');
        }
        if (blood <= 0 || !gameActive) segments.forEach(seg => seg.classList.remove('fill'));
    }

    let currentWord = "", currentScrambled = "";
    let blood = 100;
    let currentRunScore = 0;
    let gameActive = false, cooldownActive = false;
    let cooldownInterval = null, hintUsedForCurrentWord = false;
    let deathRecordedForThisRun = false;
    let runStartTime = null;

    function scrambleWord(word) {
        let letters = word.split('');
        for (let i = letters.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        return letters.join('');
    }

    function applyDisabledCursor(isDisabled) {
        const elements = [guessInput, submitBtn, shuffleBtn, hintBtn];
        elements.forEach(el => {
            if (el) {
                el.style.cursor = isDisabled ? "not-allowed" : "pointer";
                el.style.opacity = isDisabled ? "0.6" : "1";
            }
        });
        if (guessInput) guessInput.style.cursor = isDisabled ? "not-allowed" : "text";
    }

    function updateBloodUI() {
        blood = Math.min(100, Math.max(0, blood));
        bloodSpan.innerText = Math.floor(blood) + "%";
        decayFill.style.width = blood + "%";
        updateMeterBars();

        // Low blood sound – plays when blood drops to 30% or below (once)
        if (blood <= 30 && !lowBloodPlayed && gameActive) {
            if (window.SoundManager) window.SoundManager.playLowBlood();
            lowBloodPlayed = true;
        }
        if (blood > 30) lowBloodPlayed = false; // reset when blood recovers above 30
    }

    function updateStatsUI() {
        deathCounterSpan.innerText = PixelQuestStorage.getEndlessTotalDeaths();
        let storedHigh = PixelQuestStorage.getEndlessHighScore();
        highScoreSpan.innerText = storedHigh;
        if (currentRunScore > storedHigh) {
            PixelQuestStorage.setEndlessHighScore(currentRunScore);
            highScoreSpan.innerText = currentRunScore;
            if (gameActive) {
                messageDiv.innerText = "🏆 NEW HIGH SCORE! 🏆";
                if (window.SoundManager) window.SoundManager.playWin();
            }
        }
    }

    function updateLongestRun() {
        if (runStartTime && gameActive === false && !cooldownActive) {
            const elapsed = Math.floor((Date.now() - runStartTime) / 1000);
            const currentLongest = PixelQuestStorage.getEndlessLongestRun();
            if (elapsed > currentLongest) PixelQuestStorage.setEndlessLongestRun(elapsed);
        }
    }

    function loadNewWord() {
        if (!gameActive) return;
        let newWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
        while (newWord === currentWord && WORD_BANK.length > 1) newWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
        currentWord = newWord;
        let scrambled = scrambleWord(currentWord);
        while (scrambled === currentWord && currentWord.length > 2) scrambled = scrambleWord(currentWord);
        currentScrambled = scrambled;
        scrambledDiv.innerText = currentScrambled.split('').join(' ');
        guessInput.value = "";
        hintUsedForCurrentWord = false;
        hintBtn.disabled = false;
        guessInput.focus();
        saveGameState();
    }

    function setControlsEnabled(enabled) {
        guessInput.disabled = !enabled;
        submitBtn.disabled = !enabled;
        shuffleBtn.disabled = !enabled;
        hintBtn.disabled = !enabled;
        guessInput.placeholder = enabled ? "TYPE THE WORD..." : "GAME OVER";
        applyDisabledCursor(!enabled);
    }

    function gameOver() {
        if (!gameActive) return;
        updateLongestRun();
        if (!deathRecordedForThisRun) {
            PixelQuestStorage.incrementEndlessTotalDeaths();
            deathRecordedForThisRun = true;
            updateStatsUI();
        }
        gameActive = false;
        cooldownActive = true;
        const deadline = Date.now() + 45 * 60 * 1000;
        PixelQuestStorage.setEndlessCooldownDeadline(deadline);
        messageDiv.innerText = `💀 YOU DIED! FINAL SCORE: ${currentRunScore} | COOLDOWN: 45 MINUTES 💀`;
        setControlsEnabled(false);
        blood = 0;
        updateBloodUI();
        updateStatsUI();
        startCooldownTimer();
        runStartTime = null;
        PixelQuestStorage.clearEndlessGameState();
        if (window.SoundManager) window.SoundManager.playLose(); // lose sound on death
    }

    function startCooldownTimer() {
        if (cooldownInterval) clearInterval(cooldownInterval);
        cooldownInterval = setInterval(() => {
            if (!cooldownActive) {
                if (cooldownInterval) clearInterval(cooldownInterval);
                cooldownInterval = null;
                return;
            }
            const deadline = PixelQuestStorage.getEndlessCooldownDeadline();
            if (!deadline || deadline <= Date.now()) clearCooldownAndIdle();
            else {
                const diff = deadline - Date.now();
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                timerSpan.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    function clearCooldownAndIdle() {
        if (cooldownInterval) clearInterval(cooldownInterval);
        cooldownInterval = null;
        cooldownActive = false;
        PixelQuestStorage.setEndlessCooldownDeadline(null);
        timerSpan.innerText = "READY";
        gameActive = false;
        setControlsEnabled(true);
        messageDiv.innerText = "⚔️ CLICK [FIGHT] TO START NEW RUN ⚔️";
        scrambledDiv.innerText = "●  R E A D Y  ●";
        blood = 100;
        currentRunScore = 0;
        deathRecordedForThisRun = false;
        runStartTime = null;
        lowBloodPlayed = false;
        updateBloodUI();
        updateStatsUI();
        hintUsedForCurrentWord = false;
        PixelQuestStorage.clearEndlessGameState();
    }

    function startNewRun() {
        const deadline = PixelQuestStorage.getEndlessCooldownDeadline();
        if (deadline && deadline > Date.now()) {
            const minsLeft = Math.ceil((deadline - Date.now()) / 60000);
            messageDiv.innerText = `⛔ COOLDOWN ACTIVE! WAIT ${minsLeft} MINUTES.`;
            return;
        }
        if (window.SoundManager) window.SoundManager.playClick();
        PixelQuestStorage.setEndlessCooldownDeadline(null);
        if (cooldownInterval) clearInterval(cooldownInterval);
        cooldownActive = false;
        blood = 100;
        currentRunScore = 0;
        gameActive = true;
        deathRecordedForThisRun = false;
        runStartTime = Date.now();
        lowBloodPlayed = false;
        updateBloodUI();
        updateStatsUI();
        currentWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
        let scrambled = scrambleWord(currentWord);
        while (scrambled === currentWord && currentWord.length > 2) scrambled = scrambleWord(currentWord);
        currentScrambled = scrambled;
        scrambledDiv.innerText = currentScrambled.split('').join(' ');
        guessInput.value = "";
        hintUsedForCurrentWord = false;
        setControlsEnabled(true);
        guessInput.focus();
        timerSpan.innerText = "----";
        messageDiv.innerText = "⚔️ SURVIVE! UNSCRAMBLE & STAY ALIVE ⚔️";
        saveGameState();
    }

    function saveGameState() {
        if (!gameActive) return;
        const state = {
            currentWord,
            currentScrambled,
            blood,
            currentRunScore,
            hintUsedForCurrentWord,
            deathRecordedForThisRun,
            runStartTime
        };
        PixelQuestStorage.setEndlessGameState(state);
    }

    function restoreGameState() {
        const state = PixelQuestStorage.getEndlessGameState();
        if (state && state.currentWord) {
            currentWord = state.currentWord;
            currentScrambled = state.currentScrambled;
            blood = state.blood;
            currentRunScore = state.currentRunScore;
            hintUsedForCurrentWord = state.hintUsedForCurrentWord;
            deathRecordedForThisRun = state.deathRecordedForThisRun || false;
            runStartTime = state.runStartTime;
            scrambledDiv.innerText = currentScrambled.split('').join(' ');
            updateBloodUI();
            updateStatsUI();
            hintBtn.disabled = hintUsedForCurrentWord;
            guessInput.value = "";
            return true;
        }
        return false;
    }

    function onSubmit() {
        if (!gameActive && !cooldownActive) { startNewRun(); return; }
        if (!gameActive) { messageDiv.innerText = "❌ GAME NOT ACTIVE. COOLDOWN IN PROGRESS."; return; }
        const guess = guessInput.value.trim().toUpperCase();
        if (guess === "") { messageDiv.innerText = "⚠️ ENTER A WORD!"; return; }
        if (guess === currentWord) {
            currentRunScore += 10;
            updateStatsUI();
            messageDiv.innerText = "✅ CORRECT! +10 SCORE";
            if (window.SoundManager) window.SoundManager.playWin();
            loadNewWord();
        } else {
            blood -= 15;
            updateBloodUI();
            messageDiv.innerText = "❌ WRONG! -15% BLOOD";
            if (window.SoundManager) window.SoundManager.playLose();
            if (blood <= 0) {
                blood = 0;
                updateBloodUI();
                messageDiv.innerText = `💀 BLOOD EMPTY! GAME OVER. FINAL SCORE: ${currentRunScore} 💀`;
                gameOver();
                return;
            }
            guessInput.value = "";
            guessInput.focus();
        }
        saveGameState();
    }

    function onShuffle() {
        if (!gameActive && !cooldownActive) startNewRun();
        if (!gameActive) return;
        let newScrambled = scrambleWord(currentWord);
        while (newScrambled === currentWord && currentWord.length > 2) newScrambled = scrambleWord(currentWord);
        currentScrambled = newScrambled;
        scrambledDiv.innerText = currentScrambled.split('').join(' ');
        messageDiv.innerText = "🃏 LETTERS RESHUFFLED!";
        guessInput.focus();
        if (window.SoundManager) window.SoundManager.playShuffle();
        saveGameState();
    }

    function onHint() {
        if (!gameActive && !cooldownActive) startNewRun();
        if (!gameActive) return;
        if (blood <= 0) { messageDiv.innerText = "💀 NO BLOOD LEFT!"; return; }
        if (hintUsedForCurrentWord) { messageDiv.innerText = "⚠️ HINT ALREADY USED FOR THIS WORD! SOLVE IT FIRST."; return; }
        blood -= 10;
        updateBloodUI();
        if (window.SoundManager) window.SoundManager.playHint();
        if (blood <= 0) {
            blood = 0;
            updateBloodUI();
            messageDiv.innerText = `💀 HINT DRAINED YOUR BLOOD! GAME OVER. FINAL SCORE: ${currentRunScore} 💀`;
            gameOver();
            return;
        }
        const firstLetter = currentWord[0];
        messageDiv.innerText = `💡 HINT: word starts with "${firstLetter}" ( -10% blood )`;
        hintUsedForCurrentWord = true;
        hintBtn.disabled = true;
        guessInput.focus();
        saveGameState();
    }

    function init() {
        const deadline = PixelQuestStorage.getEndlessCooldownDeadline();
        if (deadline && deadline <= Date.now()) {
            PixelQuestStorage.setEndlessCooldownDeadline(null);
        }
        const activeDeadline = PixelQuestStorage.getEndlessCooldownDeadline();
        if (activeDeadline && activeDeadline > Date.now()) {
            cooldownActive = true;
            gameActive = false;
            blood = 0;
            updateBloodUI();
            setControlsEnabled(false);
            startCooldownTimer();
            messageDiv.innerText = "⏳ COOLDOWN ACTIVE. WAIT FOR RESET.";
            scrambledDiv.innerText = "C O O L D O W N";
            currentRunScore = 0;
            updateStatsUI();
            runStartTime = null;
            PixelQuestStorage.clearEndlessGameState();
        } else {
            const restored = restoreGameState();
            if (restored) {
                gameActive = true;
                cooldownActive = false;
                setControlsEnabled(true);
                guessInput.focus();
                timerSpan.innerText = "----";
                messageDiv.innerText = "⚔️ SURVIVE! UNSCRAMBLE & STAY ALIVE ⚔️";
                if (cooldownInterval) clearInterval(cooldownInterval);
                updateStatsUI();
                updateBloodUI();
            } else {
                cooldownActive = false;
                gameActive = false;
                blood = 100;
                updateBloodUI();
                setControlsEnabled(true);
                timerSpan.innerText = "READY";
                messageDiv.innerText = "⚔️ CLICK [FIGHT] TO START NEW RUN ⚔️";
                scrambledDiv.innerText = "●  R E A D Y  ●";
                currentRunScore = 0;
                updateStatsUI();
                runStartTime = null;
                hintUsedForCurrentWord = false;
                deathRecordedForThisRun = false;
                PixelQuestStorage.clearEndlessGameState();
            }
        }
    }

    submitBtn.addEventListener("click", onSubmit);
    shuffleBtn.addEventListener("click", onShuffle);
    hintBtn.addEventListener("click", onHint);
    guessInput.addEventListener("keypress", (e) => { if (e.key === "Enter") { e.preventDefault(); onSubmit(); } });
    init();
})();