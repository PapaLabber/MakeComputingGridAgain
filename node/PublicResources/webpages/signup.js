
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('userData');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form submission for validation

            const username = document.getElementById('username-input').value;
            const email = document.getElementById('email-input').value;
            const password = document.getElementById('password-input').value;
            const repeatPassword = document.getElementById('repeat-password').value;

            // Validation checks...
            if (password !== repeatPassword) {
                alert('Passwords do not match.');
                return;
            }

            // Send the data to the back-end server using fetch
            fetch(`${baseURL}/node/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'User successfully registered') {
                    alert('Sign-up successful - You can now login via the extension.');
                    // Optionally, redirect to a login page or another page
                    window.location.href = `${baseURL}/landingPage.html`;
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