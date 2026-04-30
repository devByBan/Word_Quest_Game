(function() {
    if (window.PixelQuestStorage) {
        const highScore = PixelQuestStorage.getEndlessHighScore();
        const totalDeaths = PixelQuestStorage.getEndlessTotalDeaths();
        const longestRun = PixelQuestStorage.getEndlessLongestRun();
        
        document.getElementById('highScoreStat').innerText = highScore;
        document.getElementById('totalDeathsStat').innerText = totalDeaths;
        document.getElementById('longestRunStat').innerText = longestRun;
    }
})();