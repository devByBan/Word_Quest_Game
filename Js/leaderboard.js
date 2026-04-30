// Leaderboard.js – displays rankings of all registered users
(function() {
    if (!window.PixelQuestStorage) {
        document.getElementById('leaderboardContent').innerHTML = '<div class="no-data">STORAGE ERROR: Please log in again.</div>';
        return;
    }

    const storage = window.PixelQuestStorage;
    const users = storage.getUsers(); // array of user objects

    if (!users || users.length === 0) {
        document.getElementById('leaderboardContent').innerHTML = '<div class="no-data">NO PLAYERS YET. BE THE FIRST!</div>';
        return;
    }

    // Helper: get a value for a specific user (email) and base key
    function getUserStat(email, baseKey) {
        const key = `${baseKey}_${email}`;
        const val = localStorage.getItem(key);
        if (val === null) return 0;
        // For endless high score and daily streak, it's a number
        if (baseKey === 'ENDLESS_HIGHSCORE' || baseKey === 'daily_best_streak') {
            return parseInt(val) || 0;
        }
        // For classic highest level, it's a string like "A2", convert to numeric level for sorting
        if (baseKey === 'classic_highest_level') {
            const levelMap = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
            return levelMap[val] || 0;
        }
        return 0;
    }

    // Build leaderboard data
    const leaderData = users.map(user => {
        const email = user.email;
        const endlessScore = getUserStat(email, 'ENDLESS_HIGHSCORE');
        const classicLevel = getUserStat(email, 'classic_highest_level');
        const dailyStreak = getUserStat(email, 'daily_best_streak');
        // Get avatar (use user.characterImage or default)
        let avatar = user.characterImage;
        if (!avatar || avatar === 'null' || avatar === 'undefined') {
            avatar = 'Image/character1.png';
        }
        return {
            username: user.username,
            email: email,
            avatar: avatar,
            endlessScore: endlessScore,
            classicLevel: classicLevel,
            dailyStreak: dailyStreak
        };
    });

    // Sort by endless score descending
    leaderData.sort((a, b) => b.endlessScore - a.endlessScore);

    // Generate HTML
    let html = '<table class="leaderboard-table"><thead><tr>';
    html += '<th class="rank-col">#</th>';
    html += '<th>PLAYER</th>';
    html += '<th class="score-col">🏆 ENDLESS</th>';
    html += '<th class="score-col">📚 CLASSIC</th>';
    html += '<th class="score-col">🔥 DAILY</th>';
    html += '</tr></thead><tbody>';

    leaderData.forEach((player, idx) => {
        const rank = idx + 1;
        // Map classic level number to text
        const levelNames = {1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2'};
        const classicText = levelNames[player.classicLevel] || 'A1';
        html += `<tr class="${rank === 1 ? 'highlight' : ''}">
            <td class="rank-col">${rank}</td>
            <td>
                <div class="player-col">
                    <div class="player-avatar"><img src="${player.avatar}" alt="avatar"></div>
                    <span class="player-name">${player.username}</span>
                </div>
            </td>
            <td class="score-col">${player.endlessScore}</td>
            <td class="score-col">${classicText}</td>
            <td class="score-col">${player.dailyStreak}</td>
        </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('leaderboardContent').innerHTML = html;
})();