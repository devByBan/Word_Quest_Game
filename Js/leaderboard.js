
(function() {
    if (!window.PixelQuestStorage) {
        document.getElementById('leaderboardContent').innerHTML = '<div class="no-data">STORAGE ERROR: Please log in again.</div>';
        return;
    }

    const storage = window.PixelQuestStorage;
    const users = storage.getUsers();

    if (!users || users.length === 0) {
        document.getElementById('leaderboardContent').innerHTML = '<div class="no-data">NO PLAYERS YET. BE THE FIRST!</div>';
        return;
    }

   
    function getUserCurrentRank(email) {
        const completedKey = `classic_completed_levels_${email}`;
        let completed = [];
        const rawCompleted = localStorage.getItem(completedKey);
        if (rawCompleted) completed = JSON.parse(rawCompleted);
        const unlockOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        if (completed.length === 0) return 'A1';
        for (let i = 0; i < unlockOrder.length; i++) {
            if (!completed.includes(unlockOrder[i])) {
                return unlockOrder[i];
            }
        }
        return 'C2';
    }

   
    function getEndlessScore(email) {
        const val = localStorage.getItem(`ENDLESS_HIGHSCORE_${email}`);
        return val ? parseInt(val) : 0;
    }


    function getDailyBest(email) {
        const val = localStorage.getItem(`daily_best_streak_${email}`);
        return val ? parseInt(val) : 0;
    }

   
    const leaderData = users.map(user => {
        const email = user.email;
        const endlessScore = getEndlessScore(email);
        const currentRank = getUserCurrentRank(email);
        const dailyStreak = getDailyBest(email);
        let avatar = user.characterImage;
        if (!avatar || avatar === 'null' || avatar === 'undefined') {
            avatar = 'Image/character1.png';
        }
        return {
            username: user.username,
            email: email,
            avatar: avatar,
            endlessScore: endlessScore,
            classicRank: currentRank,  
            dailyStreak: dailyStreak
        };
    });

    leaderData.sort((a, b) => b.endlessScore - a.endlessScore);

  
    let html = '<table class="leaderboard-table"><thead><tr>';
    html += '<th class="rank-col">#</th>';
    html += '<th>PLAYER</th>';
    html += '<th class="score-col">🏆 ENDLESS</th>';
    html += '<th class="score-col">📚 CLASSIC</th>';
    html += '<th class="score-col">🔥 DAILY</th>';
    html += '</thead><tbody>';

    leaderData.forEach((player, idx) => {
        const rank = idx + 1;
        html += `<tr class="${rank === 1 ? 'highlight' : ''}">
            <td class="rank-col">${rank}</td>
            <td>
                <div class="player-col">
                    <div class="player-avatar"><img src="${player.avatar}" alt="avatar"></div>
                    <span class="player-name">${player.username}</span>
                </div>
            </td>
            <td class="score-col">${player.endlessScore}</td>
            <td class="score-col">${player.classicRank}</td>
            <td class="score-col">${player.dailyStreak}</td>
        </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('leaderboardContent').innerHTML = html;
})();