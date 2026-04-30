// Choose_Character.js – redirects returning users to main page if character already selected
(function() {
    if (!window.PixelQuestStorage) {
        console.error("localStorage.js must be loaded first!");
        return;
    }
    const storage = window.PixelQuestStorage;

    const email = storage.getCurrentUserEmail();
    if (!email) {
        window.location.href = "EnterName.html";
        return;
    }

    let currentUser = storage.getCurrentUser();
    if (!currentUser) {
        storage.setCurrentUser(null);
        window.location.href = "EnterName.html";
        return;
    }

    // If user already has a character, skip selection and go straight to main page
    if (currentUser.characterImage) {
        window.location.href = "Main_Page.html";
        return;
    }

    let selectedCard = null;
    const cards = document.querySelectorAll('.char-card');
    const playLink = document.getElementById('playLink');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove previous highlights
            cards.forEach(c => {
                c.querySelector('.char-img').style.borderColor = 'transparent';
                c.querySelector('.char-img').style.boxShadow = 'none';
                c.querySelector('.char-img').style.background = 'none';
            });
            // Highlight selected
            const imgDiv = card.querySelector('.char-img');
            imgDiv.style.borderColor = '#ffcc88';
            imgDiv.style.boxShadow = '0 0 16px #ffaa66';
            imgDiv.style.background = 'rgba(255, 204, 136, 0.1)';

            const charName = card.getAttribute('data-name');
            const imgSrc = card.querySelector('img').src;
            selectedCard = { name: charName, img: imgSrc };
        });
    });

    playLink.addEventListener('click', (e) => {
        if (!selectedCard) {
            e.preventDefault();
            alert("⚔️ Please select a character first!");
            return;
        }
        storage.updateUserCharacter(email, selectedCard.name, selectedCard.img);
        // Redirect to main page after selection
        window.location.href = "Main_Page.html";
    });
})();