// TODO: Add comments
export const username = document.getElementById('login-username').value;
const password = document.getElementById('login-password').value;


document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();


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
                        // Save the JWT in localStorage (or sessionStorage)
                        localStorage.setItem('jwt', data.token);

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