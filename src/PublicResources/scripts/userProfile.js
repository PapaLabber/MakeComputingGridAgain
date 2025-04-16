document.addEventListener('DOMContentLoaded', function () {
    // Define the username (this could be dynamically set based on the logged-in user)
    const username = "test_user"; // Example: hardcoded username for testing

    // Fetch the user profile data from the server
    fetch(`/getUserProfile?username=${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse the response as JSON
        })
        .then(data => {
            if (data) {
                // Display the user profile information on the page
                document.getElementById('username').textContent = `Username: ${data.username}`;
                document.getElementById('email').textContent = `Email: ${data.email}`;
                document.getElementById('points').textContent = `Points: ${data.points}`;
                // Optionally display tasks
                const tasksList = document.getElementById('tasks');
                tasksList.innerHTML = ""; // Clear any existing tasks
                data.tasks.forEach(task => {
                    const taskItem = document.createElement('li');
                    taskItem.textContent = `${task.task} - ${task.status}`;
                    tasksList.appendChild(taskItem);
                });
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