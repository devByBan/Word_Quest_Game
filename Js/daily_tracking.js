(function() {
    function getCurrentDayNumber() {
        const startDate = new Date("2025-01-01");
        const today = new Date();
        const diffTime = today - startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1;
    }

    const dayNumberElem = document.getElementById("dayNumber");
    const streakStatElem = document.getElementById("streakStat");
    const bestStatElem = document.getElementById("bestStat");

    if (dayNumberElem) dayNumberElem.innerText = `#${getCurrentDayNumber()}`;
    if (streakStatElem) streakStatElem.innerText = PixelQuestStorage.getDailyStreak();
    if (bestStatElem) bestStatElem.innerText = PixelQuestStorage.getDailyBestStreak();
})();