
(function() {
    // DOM elements
    const formTitle = document.getElementById('formTitle');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const switchMsg = document.getElementById('switchMsg');
    const switchBtn = document.getElementById('switchBtn');
    const messageBox = document.getElementById('messageBox');

    // Input fields
    const firstName = document.getElementById('firstName');
    const email = document.getElementById('email');
    const signupPassword = document.getElementById('signupPassword');
    const loginName = document.getElementById('loginName');
    const loginPassword = document.getElementById('loginPassword');

    // Buttons
    const createBtn = document.getElementById('createBtn');
    const loginBtn = document.getElementById('loginBtn');

    // Character counter for username
    const firstCounter = document.getElementById('firstCounter');
    if (firstName && firstCounter) {
        firstName.addEventListener('input', function() {
            const len = this.value.length;
            firstCounter.innerText = `${len}/12 characters`;
        });
    }

  
    function showMessage(msg, isError = true) {
        if (messageBox) {
            messageBox.innerText = msg;
            messageBox.style.color = isError ? '#ff8888' : '#aaffaa';
            setTimeout(() => {
                if (messageBox.innerText === msg) {
                    messageBox.style.color = '#e2ddad';
                    messageBox.innerText = '📜 READY TO QUEST';
                }
            }, 3000);
        } else {
            alert(msg);
        }
    }

    // Switch to Sign Up form
    function showSignup() {
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
        formTitle.innerText = '✨ CREATE ACCOUNT ✨';
        switchMsg.innerText = 'ALREADY A WARRIOR?';
        switchBtn.innerText = 'LOGIN →';
        
        if (firstName) firstName.value = '';
        if (email) email.value = '';
        if (signupPassword) signupPassword.value = '';
        if (loginName) loginName.value = '';
        if (loginPassword) loginPassword.value = '';
        if (firstCounter) firstCounter.innerText = '0/12 characters';
    }


    function showLogin() {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        formTitle.innerText = '🔐 LOGIN';
        switchMsg.innerText = 'NEW WARRIOR?';
        switchBtn.innerText = 'SIGN UP →';
  
        if (firstName) firstName.value = '';
        if (email) email.value = '';
        if (signupPassword) signupPassword.value = '';
        if (loginName) loginName.value = '';
        if (loginPassword) loginPassword.value = '';
        if (firstCounter) firstCounter.innerText = '0/12 characters';
    }

  
    function signUp() {
        const username = firstName ? firstName.value.trim() : '';
        const userEmail = email ? email.value.trim() : '';
        const password = signupPassword ? signupPassword.value.trim() : '';

        if (!username) {
            showMessage('❌ Please enter a username!');
            return;
        }
        if (username.length < 3) {
            showMessage('❌ Username must be at least 3 characters.');
            return;
        }
        if (!userEmail) {
            showMessage('❌ Please enter an email!');
            return;
        }
        if (!userEmail.includes('@') || !userEmail.includes('.')) {
            showMessage('❌ Please enter a valid email address.');
            return;
        }
        if (!password) {
            showMessage('❌ Please enter a password!');
            return;
        }
        if (password.length < 3) {
            showMessage('❌ Password must be at least 3 characters.');
            return;
        }

    
        if (window.PixelQuestStorage.userExists(userEmail)) {
            showMessage('⚠️ An account with this email already exists. Please login.');
            return;
        }


        const newUser = window.PixelQuestStorage.createUser(username, userEmail, password);
        if (newUser) {
       
            window.PixelQuestStorage.setCurrentUser(userEmail);
            showMessage('✅ Account created! Redirecting...', false);
            setTimeout(() => {
                window.location.href = 'Choose_Charater.html';
            }, 1000);
        } else {
            showMessage('❌ Failed to create account. Please try again.');
        }
    }

    function logIn() {
        const userEmail = loginName ? loginName.value.trim() : '';
        const password = loginPassword ? loginPassword.value.trim() : '';

        if (!userEmail) {
            showMessage('❌ Please enter your email.');
            return;
        }
        if (!password) {
            showMessage('❌ Please enter your password.');
            return;
        }

        const user = window.PixelQuestStorage.validateLogin(userEmail, password);
        if (user) {
            window.PixelQuestStorage.setCurrentUser(userEmail);
            showMessage('✅ Login successful! Redirecting...', false);
            setTimeout(() => {
                window.location.href = 'Choose_Charater.html';
            }, 1000);
        } else {
            showMessage('❌ Invalid email or password. Please try again.');
        }
    }

 
    if (createBtn) createBtn.addEventListener('click', signUp);
    if (loginBtn) loginBtn.addEventListener('click', logIn);
    if (switchBtn) {
        switchBtn.addEventListener('click', () => {
            const isSignupVisible = signupForm.style.display !== 'none';
            if (isSignupVisible) {
                showLogin();
            } else {
                showSignup();
            }
        });
    }

    showSignup();
})();