
document.addEventListener('DOMContentLoaded', function () {

    // Define the username (this could be dynamically set based on the logged-in user)

    // Fetch the user profile data from the server
    fetch(`${baseURL}/node/getUserProfile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`, // Include the JWT
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse the response as JSON
        })
        .then(data => {
            if (data) {
                console.log("login success :)");
                // Display the user profile information on the page
                document.getElementById('username').textContent = `Hello ${data.username}`;
                // document.getElementById('email').textContent = `Email: ${data.email}`;
                document.getElementById('points').textContent = `CURRENT POINTS ${data.points}`;
                
                // // Optionally display tasks
                // const tasksList = document.getElementById('tasks');
                // tasksList.innerHTML = ""; // Clear any existing tasks
                // data.tasks.forEach(task => {
                //     const taskItem = document.createElement('li');
                //     taskItem.textContent = `${task.task} - ${task.status}`;
                //     tasksList.appendChild(taskItem);
                // });
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