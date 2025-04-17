document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            if (!username || !password) {
                alert('Please enter both username and password.');
                return;
            }

            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Login successful') {
                        alert('Welcome back!');
                        window.location.href = 'userProfile.html';
                    } else {
                        alert('Login failed: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Login error:', error);
                    alert('An error occurred. Please try again later.');
                });
        });
    }
});