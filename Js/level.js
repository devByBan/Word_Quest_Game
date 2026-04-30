(function() {
    function goToClassic(levelId) {
        localStorage.setItem('classic_start_level', levelId);
        window.location.href = 'classic.html';
    }

    const rooms = {
        a1: document.getElementById('room-a1'),
        a2: document.getElementById('room-a2'),
        b1: document.getElementById('room-b1'),
        b2: document.getElementById('room-b2'),
        c1: document.getElementById('room-c1'),
        c2: document.getElementById('room-c2')
    };

    let completedLevels = [];
    if (window.PixelQuestStorage) {
        completedLevels = PixelQuestStorage.getClassicCompletedLevels();
    }

    const unlockOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    function getHighestUnlockedLevel() {
        if (completedLevels.length === 0) return 'A1';
        for (let i = 0; i < unlockOrder.length; i++) {
            if (!completedLevels.includes(unlockOrder[i])) {
                return unlockOrder[i];
            }
        }
        return 'C2';
    }

    function getCurrentProgress() {
        let gameState = null;
        if (window.PixelQuestStorage) {
            gameState = PixelQuestStorage.getClassicGameState();
        }
        if (gameState && gameState.currentLevelIdx !== undefined) {
            const levelIdx = gameState.currentLevelIdx;
            const wordIdx = gameState.currentWordIdx;
            const level = unlockOrder[levelIdx];
            if (level) return { levelId: level, levelIndex: levelIdx, wordIndex: wordIdx };
        }
        let highestIdx = 0;
        for (let i = 0; i < unlockOrder.length; i++) {
            if (completedLevels.includes(unlockOrder[i])) highestIdx = i;
            else break;
        }
        return { levelId: unlockOrder[highestIdx], levelIndex: highestIdx, wordIndex: 0 };
    }

    function updateTopBar() {
        const progress = getCurrentProgress();
        const levelId = progress.levelId;
        const levelIndex = progress.levelIndex;
        const wordIndex = progress.wordIndex;

        const levelNames = {
            'A1': 'A1 · BEGINNER', 'A2': 'A2 · BASIC',
            'B1': 'B1 · LOW INT', 'B2': 'B2 · HIGH INT',
            'C1': 'C1 · ADVANCED', 'C2': 'C2 · MASTER'
        };
        const levelFullName = levelNames[levelId] || levelId;

        const levelLabelSpan = document.querySelector('.level-label span:not(.icon-sword):not(.level-badge)');
        if (levelLabelSpan) levelLabelSpan.textContent = levelFullName;

        const levelBadge = document.querySelector('.level-badge');
        if (levelBadge) levelBadge.textContent = `${levelIndex + 1}L`;

        const dotsContainer = document.querySelector('.step-dots');
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const dot = document.createElement('span');
                dot.className = 'dot' + (i < wordIndex ? ' filled' : '');
                dotsContainer.appendChild(dot);
            }
        }

        const currentRoomTag = document.querySelector('.current-room-tag');
        if (currentRoomTag) currentRoomTag.textContent = `${wordIndex}/5`;
    }

    function updateFooter() {
        const openTextSpan = document.querySelector('.open-text');
        if (openTextSpan) {
            const unlockedLevel = getHighestUnlockedLevel();
            openTextSpan.innerHTML = `⭐ ${unlockedLevel} OPEN`;
        }

        const masteredSpan = document.querySelector('.pixel-counter span:last-child');
        if (masteredSpan) {
            masteredSpan.innerHTML = `🏆 ${completedLevels.length}/6 MASTERED`;
        }
    }

    unlockOrder.forEach((level, index) => {
        const roomId = level.toLowerCase();
        const room = rooms[roomId];
        if (!room) return;

        let isUnlocked = (index === 0) ? true : completedLevels.includes(unlockOrder[index - 1]);

        if (isUnlocked) {
            room.classList.remove('locked');
            room.classList.add('unlocked');
            const newRoom = room.cloneNode(true);
            room.parentNode.replaceChild(newRoom, room);
            newRoom.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.SoundManager) window.SoundManager.playClick();
                goToClassic(level);
            });
            rooms[roomId] = newRoom;
        } else {
            room.classList.add('locked');
            room.classList.remove('unlocked');
            room.style.cursor = 'not-allowed';
            const newRoom = room.cloneNode(true);
            room.parentNode.replaceChild(newRoom, room);
            newRoom.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.SoundManager) window.SoundManager.playClick();
                alert(`🔒 Complete ${unlockOrder[index - 1]} first to unlock ${level}!`);
            });
            rooms[roomId] = newRoom;
        }
    });

    updateTopBar();
    updateFooter();
})();