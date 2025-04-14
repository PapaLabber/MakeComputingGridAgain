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
            fetch('/register', {
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
                    alert('Sign-up successful! Your user ID is ' + data.userId);
                    // Optionally, store the user ID in localStorage or sessionStorage
                    localStorage.setItem('userId', data.userId);
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