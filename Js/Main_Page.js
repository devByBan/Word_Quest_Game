const modeCards = document.querySelectorAll('.mode-card');

modeCards.forEach(card => {
    card.addEventListener('click', function() {
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