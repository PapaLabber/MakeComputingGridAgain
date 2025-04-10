document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
  
    if (loginForm) {
      loginForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form from reloading the page
  
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
          body: JSON.stringify({
            username: username,
            password: password
          }),
        })
          .then(response => response.json())
          .then(data => {
            if (data.message === 'Login successful') {
              alert('Login successful!');
              window.location.href = 'tasks.html'; // Redirect after successful login
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