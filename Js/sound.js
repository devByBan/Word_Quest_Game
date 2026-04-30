// Sound.js – extended sound manager for the game
(function() {
    window.SoundManager = {
        enabled: true,
        clickSound: null,
        winSound: null,
        loseSound: null,
        countdownSound: null,
        lowBloodSound: null,
        hintSound: null,
        shuffleSound: null,
        timerTickSound: null,

        init: function() {
            this.clickSound = new Audio('Sound/click.wav');
            this.clickSound.volume = 0.4;

            this.winSound = new Audio('Sound/win.mp3');
            this.winSound.volume = 0.5;

            this.loseSound = new Audio('Sound/lose.mp3');
            this.loseSound.volume = 0.5;

            this.countdownSound = new Audio('Sound/countdown.wav');
            this.countdownSound.volume = 0.4;

            this.lowBloodSound = new Audio('Sound/low_blood.wav');
            this.lowBloodSound.volume = 0.5;

            this.hintSound = new Audio('Sound/hint.wav');
            this.hintSound.volume = 0.4;

            this.shuffleSound = new Audio('Sound/shuffle.mp3');
            this.shuffleSound.volume = 0.5;

            this.timerTickSound = new Audio('Sound/cutoffdown.wav');
            this.timerTickSound.volume = 0.4;
        },

        playClick: function() {
            if (!this.enabled) return;
            if (!this.clickSound) this.init();
            const sound = this.clickSound.cloneNode();
            sound.play().catch(e => console.log("Audio play failed:", e));
        },

        playWin: function() {
            if (!this.enabled) return;
            if (!this.winSound) this.init();
            const sound = this.winSound.cloneNode();
            sound.play().catch(e => console.log("Audio play failed:", e));
        },

        playLose: function() {
            if (!this.enabled) return;
            if (!this.loseSound) this.init();
            const sound = this.loseSound.cloneNode();
            sound.play().catch(e => console.log("Audio play failed:", e));
        },

        playCountdown: function() {
            if (!this.enabled) return;
            if (!this.countdownSound) this.init();
            const sound = this.countdownSound.cloneNode();
            sound.play().catch(e => console.log("Audio play failed:", e));
        },

        playLowBlood: function() {
            if (!this.enabled) return;
            if (!this.lowBloodSound) this.init();
            const sound = this.lowBloodSound.cloneNode();
            sound.play().catch(e => console.log("Audio play failed:", e));
        },

        playHint: function() {
            if (!this.enabled) return;
            if (!this.hintSound) this.init();
            const sound = this.hintSound.cloneNode();
            sound.play().catch(e => console.log("Audio play failed:", e));
        },

        playShuffle: function() {
            if (!this.enabled) return;
            if (!this.shuffleSound) this.init();
            const sound = this.shuffleSound.cloneNode();
            sound.play().catch(e => console.log("Audio play failed:", e));
        },

        playTimerTick: function() {
            if (!this.enabled) return;
            if (!this.timerTickSound) this.init();
            const sound = this.timerTickSound.cloneNode();
            sound.play().catch(e => console.log("Audio play failed:", e));
        },

        toggle: function() {
            this.enabled = !this.enabled;
            return this.enabled;
        }
    };

    window.SoundManager.init();
})();