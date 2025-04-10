document.addEventListener('DOMContentLoaded', function() {
    // Fetch the user profile data from the server
    fetch('/getUserProfile')
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            if (data) {
                // Display the user profile information on the page
                document.getElementById('username').textContent = `Username: ${data.username}`;
                document.getElementById('email').textContent = `Email: ${data.email}`;
            } else {
                console.log("User not found.");
                alert('User profile could not be fetched.');
            }
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
            alert('There was an error fetching the user profile.');
        });
});