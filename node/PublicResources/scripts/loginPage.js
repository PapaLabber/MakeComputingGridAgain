import { baseURL } from './config.js';

// TODO: Add comments
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // Storing what the user inputs in constants
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            if (!username || !password) {
                alert('Please enter both username and password.');
                return;
            }

            fetch(`${baseURL}/node/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.token) {
                        alert('Login successful!');
                        // Save the JWT and username in localStorage
                        localStorage.setItem('jwt', data.token);
                        localStorage.setItem('username', username); 

                        window.location.href = `${baseURL}/userProfile.html`;
                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('There was an error. Please try again later.');
                });
        });
    }
});