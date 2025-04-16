document.addEventListener('DOMContentLoaded', function () {
    // Define the username (this could be dynamically set based on the logged-in user)
    const username = "test_user"; // Example: hardcoded username for testing

    if (username) {
        // Fetch the user's tasks when the page loads
        fetchUserTasks(username);
    } else {
        alert('No user found! Please log in.');
    }

    // Function to fetch user tasks from the backend
    function fetchUserTasks(username) {
        fetch(`/api/users-tasks?username=${username}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json(); // Parse the response as JSON
            })
            .then(tasks => {
                displayTasks(tasks);
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
                alert('Could not fetch your tasks. Please try again later.');
            });
    }

    // Function to display the fetched tasks
    function displayTasks(tasks) {
        const taskContainer = document.getElementById('task-container');
        taskContainer.innerHTML = ''; // Clear any previous content

        // Filter tasks by status
        const completedTasks = tasks.filter(task => task.status.toLowerCase() === 'completed');
        const currentTask = tasks.find(task => task.status.toLowerCase() === 'in progress');

        // Display completed tasks
        const completedList = completedTasks.length
            ? '<ul>' + completedTasks.map(task => `<li>${task.task}</li>`).join('') + '</ul>'
            : '<p>No completed tasks yet!</p>';

        // Display current task
        const currentTaskDisplay = currentTask
            ? `<p>Currently working on: <strong>${currentTask.task}</strong></p>`
            : '<p>No current task in progress.</p>';

        // Update the page with the fetched data
        taskContainer.innerHTML += `<h3>✅ Completed Tasks:</h3>${completedList}`;
        taskContainer.innerHTML += `<h3>🔄 Current Task:</h3>${currentTaskDisplay}`;
    }
});