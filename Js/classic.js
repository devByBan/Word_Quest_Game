(function() {
    const LEVELS = [
        { id: "A1", name: "A1 · BEGINNER", words: ["ABLE", "BIRD", "CLOUD", "DREAM", "EARTH"], time: 30 },
        { id: "A2", name: "A2 · BASIC",    words: ["FLOWER", "GARDEN", "HAPPY", "LITTLE", "MAGIC"], time: 30 },
        { id: "B1", name: "B1 · LOW INT",  words: ["BEAUTIFUL", "ADVENTURE", "CHOCOLATE", "DIAMOND", "ELEPHANT"], time: 35 },
        { id: "B2", name: "B2 · HIGH INT", words: ["FABULOUS", "GENERATION", "HISTORICAL", "IMPORTANT", "JOURNEY"], time: 40 },
        { id: "C1", name: "C1 · ADVANCED", words: ["KNOWLEDGE", "STRATEGY", "CREATIVE", "ANALYSIS", "DECISION"], time: 45 },
        { id: "C2", name: "C2 · MASTER",   words: ["INTERNATIONAL", "DEVELOPMENT", "COMPLEXITY", "RESPONSIBLE", "UNDERSTAND"], time: 50 }
    ];

    // DOM elements 
    const levelBadge = document.getElementById('currentLevel');
    const stepDotsContainer = document.getElementById('stepDots');
    const stepTextSpan = document.getElementById('stepText');
    const scrambledDiv = document.getElementById('scrambledWord');
    const guessInput = document.getElementById('guessInput');
    const submitBtn = document.getElementById('submitBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const hintBtn = document.getElementById('hintBtn');
    const timerSpan = document.getElementById('timer');
    const messageDiv = document.getElementById('messageDisplay');
    const coinCounterSpan = document.getElementById('coinCounter');

    // Game state 
    let currentLevelIdx = 0;
    let currentWordIdx = 0;
    let currentWord = "";
    let scrambledWord = "";
    let keysRemaining = 3;
    let timerSeconds = 0;
    let timerInterval = null;
    let gameActive = true;
    let countdownActive = false;

    function getStoredKeys(levelId) {
        const allKeys = PixelQuestStorage.getClassicKeysPerLevel();
        return allKeys[levelId] !== undefined ? allKeys[levelId] : 3;
    }
    function setStoredKeys(levelId, keys) {
        const allKeys = PixelQuestStorage.getClassicKeysPerLevel();
        allKeys[levelId] = keys;
        PixelQuestStorage.setClassicKeysPerLevel(allKeys);
    }

  
    function scrambleWord(word) {
        let arr = word.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }
    function updateScrambledDisplay(word) {
        scrambledDiv.innerText = word.split('').join(' ');
    }
    function updateStepUI() {
        if (!stepDotsContainer) return;
        stepDotsContainer.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot' + (i < currentWordIdx ? ' filled' : '');
            stepDotsContainer.appendChild(dot);
        }
        if (stepTextSpan) stepTextSpan.innerText = `${currentWordIdx}/5`;
    }
    function updateLevelBadge() {
        if (levelBadge) levelBadge.innerText = LEVELS[currentLevelIdx].name;
    }
    function loadCurrentWord() {
        const levelData = LEVELS[currentLevelIdx];
        currentWord = levelData.words[currentWordIdx].toUpperCase();
        let newScramble = scrambleWord(currentWord);
        while (newScramble === currentWord && currentWord.length > 1) {
            newScramble = scrambleWord(currentWord);
        }
        scrambledWord = newScramble;
        updateScrambledDisplay(scrambledWord);
        guessInput.value = '';
    }
    function updateKeysUI() {
        coinCounterSpan.innerText = `${keysRemaining} KEYS`;
        if (gameActive) {
            setStoredKeys(LEVELS[currentLevelIdx].id, keysRemaining);
        }
    }

    // Countdown 
    function startCountdown(callback) {
        countdownActive = true;
        setControlsEnabled(false);
        let count = 3;
        timerSpan.innerText = "READY";
        messageDiv.innerText = `⏳ Get ready... ${count}`;
        if (window.SoundManager) window.SoundManager.playCountdown();
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                messageDiv.innerText = `⏳ Get ready... ${count}`;
            } else {
                clearInterval(countdownInterval);
                messageDiv.innerText = "🔔 GO!";
                timerSpan.innerText = timerSeconds;
                countdownActive = false;
                setControlsEnabled(true);
                guessInput.focus();
                if (callback) callback();
            }
        }, 1000);
    }

    function resetTimer() {
        if (timerInterval) clearInterval(timerInterval);
        const levelData = LEVELS[currentLevelIdx];
        timerSeconds = levelData.time;
        timerSpan.innerText = timerSeconds;
    }
    function startRealTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!gameActive || countdownActive) return;
            if (timerSeconds <= 1) {
                clearInterval(timerInterval);
                timerInterval = null;
                showGameOverPopup();
            } else {
                timerSeconds--;
                timerSpan.innerText = timerSeconds;
                if (timerSeconds <= 5 && timerSeconds >= 1) {
                    if (window.SoundManager) window.SoundManager.playTimerTick();
                }
                saveGameState();
            }
        }, 1000);
    }

    function beginLevel() {
        resetTimer();
        startCountdown(() => {
            startRealTimer();
        });
    }

    // Game Over Popup 
    function showGameOverPopup() {
        gameActive = false;
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        if (window.SoundManager) window.SoundManager.playLose();

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:3000;display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P",monospace';
        const popupBox = document.createElement('div');
        popupBox.style.cssText = 'background:#1e263c;border:4px solid #f44336;padding:2rem;max-width:400px;text-align:center;box-shadow:inset -4px -4px 0 #0d1323, inset 4px 4px 0 #43507a, 8px 8px 0 rgba(0,0,0,0.5);color:#e2ddad';
        const title = document.createElement('h2');
        title.innerText = '💀 GAME OVER 💀';
        title.style.marginBottom = '1rem';
        title.style.fontSize = '1rem';
        title.style.color = '#f44336';
        popupBox.appendChild(title);
        const msg = document.createElement('p');
        msg.innerText = `Time ran out on ${LEVELS[currentLevelIdx].name}!`;
        msg.style.marginBottom = '1.5rem';
        msg.style.fontSize = '0.7rem';
        popupBox.appendChild(msg);
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display:flex;gap:1rem;justify-content:center;flex-wrap:wrap';
        
        const retryBtn = document.createElement('button');
        retryBtn.innerText = '🔄 RETRY LEVEL';
        retryBtn.style.cssText = 'background:#4d3a62;border:3px solid #836db0;padding:0.8rem 1.5rem;font-family:"Press Start 2P",monospace;font-size:0.6rem;color:#f9eaa2;cursor:pointer';
        retryBtn.onclick = () => {
            document.body.removeChild(overlay);
            if (window.SoundManager) window.SoundManager.playClick();
            setControlsEnabled(false);
            if (timerInterval) clearInterval(timerInterval);
            currentWordIdx = 0;
            keysRemaining = 3;
            setStoredKeys(LEVELS[currentLevelIdx].id, 3);
            updateKeysUI();
            loadCurrentWord();
            updateStepUI();
            beginLevel();
            gameActive = true;
            messageDiv.innerText = "⏪ Ready to retry!";
            saveGameState();
        };
        btnContainer.appendChild(retryBtn);
        
        const exitBtn = document.createElement('button');
        exitBtn.innerText = '🚪 EXIT TO LEVEL PAGE';
        exitBtn.style.cssText = 'background:#1f273f;border:3px solid #46537c;padding:0.8rem 1.5rem;font-family:"Press Start 2P",monospace;font-size:0.6rem;color:#e2ddad;cursor:pointer';
        exitBtn.onclick = () => {
            PixelQuestStorage.clearClassicGameState();
            window.location.href = 'Level_Page.html';
        };
        btnContainer.appendChild(exitBtn);
        
        popupBox.appendChild(btnContainer);
        overlay.appendChild(popupBox);
        document.body.appendChild(overlay);
    }

    // Level completion 
    function saveProgress() {
        const completed = PixelQuestStorage.getClassicCompletedLevels();
        const currentLevelId = LEVELS[currentLevelIdx].id;
        if (!completed.includes(currentLevelId)) {
            completed.push(currentLevelId);
        }
        PixelQuestStorage.setClassicCompletedLevels(completed);
        PixelQuestStorage.setClassicHighestLevel(currentLevelId);
        const allKeys = PixelQuestStorage.getClassicKeysPerLevel();
        delete allKeys[currentLevelId];
        PixelQuestStorage.setClassicKeysPerLevel(allKeys);
    }

    function showLevelCompletePopup(nextLevelExists) {
        gameActive = false;
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        if (window.SoundManager) window.SoundManager.playWin();

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:3000;display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P",monospace';
        const popupBox = document.createElement('div');
        popupBox.style.cssText = 'background:#1e263c;border:4px solid #fadf7a;padding:2rem;max-width:400px;text-align:center;box-shadow:inset -4px -4px 0 #0d1323, inset 4px 4px 0 #43507a, 8px 8px 0 rgba(0,0,0,0.5);color:#e2ddad';
        const title = document.createElement('h2');
        title.innerText = '⭐ LEVEL COMPLETE! ⭐';
        title.style.marginBottom = '1rem';
        title.style.fontSize = '1rem';
        popupBox.appendChild(title);
        const msg = document.createElement('p');
        msg.innerText = `You finished ${LEVELS[currentLevelIdx].name}!`;
        msg.style.marginBottom = '1.5rem';
        msg.style.fontSize = '0.8rem';
        popupBox.appendChild(msg);
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display:flex;gap:1rem;justify-content:center;flex-wrap:wrap';
        if (nextLevelExists) {
            const nextBtn = document.createElement('button');
            nextBtn.innerText = '➡️ NEXT LEVEL';
            nextBtn.style.cssText = 'background:#4d3a62;border:3px solid #836db0;padding:0.8rem 1.5rem;font-family:"Press Start 2P",monospace;font-size:0.7rem;color:#f9eaa2;cursor:pointer';
            nextBtn.onclick = () => {
                document.body.removeChild(overlay);
                if (window.SoundManager) window.SoundManager.playClick();
                currentLevelIdx++;
                currentWordIdx = 0;
                keysRemaining = getStoredKeys(LEVELS[currentLevelIdx].id);
                gameActive = true;
                updateLevelBadge();
                updateKeysUI();
                loadCurrentWord();
                updateStepUI();
                beginLevel();
                messageDiv.innerText = `⚔️ Starting ${LEVELS[currentLevelIdx].name}! Good luck!`;
                saveGameState();
            };
            btnContainer.appendChild(nextBtn);
        }
        const exitBtn = document.createElement('button');
        exitBtn.innerText = '🚪 EXIT TO LEVEL PAGE';
        exitBtn.style.cssText = 'background:#1f273f;border:3px solid #46537c;padding:0.8rem 1.5rem;font-family:"Press Start 2P",monospace;font-size:0.7rem;color:#e2ddad;cursor:pointer';
        exitBtn.onclick = () => {
            PixelQuestStorage.clearClassicGameState();
            window.location.href = 'Level_Page.html';
        };
        btnContainer.appendChild(exitBtn);
        popupBox.appendChild(btnContainer);
        overlay.appendChild(popupBox);
        document.body.appendChild(overlay);
    }

    function advanceToNextWord() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        if (window.SoundManager) window.SoundManager.playWin();

        currentWordIdx++;
        if (currentWordIdx < 5) {
            keysRemaining = 3;
            setStoredKeys(LEVELS[currentLevelIdx].id, keysRemaining);
            updateKeysUI();
            loadCurrentWord();
            updateStepUI();
            beginLevel();
            messageDiv.innerText = "✅ Correct! Next word!";
            saveGameState();
        } else {
            saveProgress();
            const hasNextLevel = (currentLevelIdx + 1 < LEVELS.length);
            if (hasNextLevel) {
                PixelQuestStorage.clearClassicGameState();
                showLevelCompletePopup(true);
            } else {
                messageDiv.innerText = "🏆 VICTORY! You conquered all levels!";
                gameActive = false;
                PixelQuestStorage.clearClassicGameState();
                setTimeout(() => {
                    window.location.href = "Level_Page.html";
                }, 3000);
            }
        }
    }

    // Persistence 
    function saveGameState() {
        if (!gameActive) return;
        const state = {
            currentLevelIdx,
            currentWordIdx,
            currentWord,
            scrambledWord,
            timerSeconds
        };
        PixelQuestStorage.setClassicGameState(state);
        setStoredKeys(LEVELS[currentLevelIdx].id, keysRemaining);
    }

    function restoreGameState() {
        const state = PixelQuestStorage.getClassicGameState();
        if (!state) return false;
        currentLevelIdx = state.currentLevelIdx;
        currentWordIdx = state.currentWordIdx;
        currentWord = state.currentWord;
        scrambledWord = state.scrambledWord;
        timerSeconds = state.timerSeconds;
        keysRemaining = getStoredKeys(LEVELS[currentLevelIdx].id);
        updateLevelBadge();
        updateKeysUI();
        updateScrambledDisplay(scrambledWord);
        updateStepUI();
        timerSpan.innerText = timerSeconds;
        beginLevel();
        gameActive = true;
        messageDiv.innerText = "⏪ Game restored! Continue where you left off.";
        return true;
    }

    function loadStateForLevel(levelIdx) {
        const state = PixelQuestStorage.getClassicGameState();
        if (state && state.currentLevelIdx === levelIdx) {
            currentLevelIdx = state.currentLevelIdx;
            currentWordIdx = state.currentWordIdx;
            currentWord = state.currentWord;
            scrambledWord = state.scrambledWord;
            timerSeconds = state.timerSeconds;
            keysRemaining = getStoredKeys(LEVELS[currentLevelIdx].id);
            updateLevelBadge();
            updateKeysUI();
            updateScrambledDisplay(scrambledWord);
            updateStepUI();
            timerSpan.innerText = timerSeconds;
            beginLevel();
            gameActive = true;
            messageDiv.innerText = "⏪ Resuming your saved progress!";
            return true;
        }
        return false;
    }

    
    function onSubmit() {
        if (!gameActive || countdownActive) return;
        const guess = guessInput.value.trim().toUpperCase();
        if (guess === "") {
            messageDiv.innerText = "❓ Enter a word!";
            return;
        }
        if (guess === currentWord) {
            advanceToNextWord();
        } else {
            if (window.SoundManager) window.SoundManager.playLose();
            messageDiv.innerText = "❌ Wrong! Try again.";
            guessInput.value = '';
            guessInput.focus();
        }
        saveGameState();
    }

    function onShuffle() {
        if (!gameActive || countdownActive) return;
        const newScramble = scrambleWord(currentWord);
        scrambledWord = newScramble;
        updateScrambledDisplay(scrambledWord);
        messageDiv.innerText = "🃏 Letters shuffled!";
        if (window.SoundManager) window.SoundManager.playShuffle();
        saveGameState();
    }

    function onHint() {
        if (!gameActive || countdownActive) return;
        if (keysRemaining <= 0) {
            messageDiv.innerText = "⚠️ No keys left!";
            if (window.SoundManager) window.SoundManager.playLose();
            return;
        }
        const firstLetter = currentWord[0];
        messageDiv.innerText = `💡 HINT: The word starts with "${firstLetter}"`;
        keysRemaining--;
        updateKeysUI();
        if (window.SoundManager) window.SoundManager.playHint();
        saveGameState();
    }

    function setControlsEnabled(enabled) {
        guessInput.disabled = !enabled;
        submitBtn.disabled = !enabled;
        shuffleBtn.disabled = !enabled;
        hintBtn.disabled = !enabled;
        guessInput.placeholder = enabled ? "YOUR GUESS" : "WAIT...";
    }

    function startGame() {
        setControlsEnabled(false);
        const requestedLevel = localStorage.getItem('classic_start_level');
        if (requestedLevel) {
            const idx = LEVELS.findIndex(l => l.id === requestedLevel);
            if (idx !== -1) {
                if (!loadStateForLevel(idx)) {
                    currentLevelIdx = idx;
                    currentWordIdx = 0;
                    keysRemaining = getStoredKeys(LEVELS[currentLevelIdx].id);
                    gameActive = true;
                    updateLevelBadge();
                    updateKeysUI();
                    loadCurrentWord();
                    updateStepUI();
                    beginLevel();
                    messageDiv.innerText = `🔔 Classic Mode! ${LEVELS[currentLevelIdx].name}. Good luck!`;
                    saveGameState();
                }
            }
            localStorage.removeItem('classic_start_level');
            return;
        }

        if (restoreGameState()) return;

        let savedHighest = PixelQuestStorage.getClassicHighestLevel();
        if (savedHighest) {
            const idx = LEVELS.findIndex(l => l.id === savedHighest);
            currentLevelIdx = (idx !== -1) ? idx : 0;
        } else {
            currentLevelIdx = 0;
        }
        currentWordIdx = 0;
        keysRemaining = getStoredKeys(LEVELS[currentLevelIdx].id);
        gameActive = true;
        updateLevelBadge();
        updateKeysUI();
        loadCurrentWord();
        updateStepUI();
        beginLevel();
        messageDiv.innerText = "🔔 Classic Mode! Unscramble and type the word.";
        saveGameState();
    }

    submitBtn.addEventListener('click', onSubmit);
    shuffleBtn.addEventListener('click', onShuffle);
    hintBtn.addEventListener('click', onHint);
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') onSubmit();
    });

    startGame();
})();