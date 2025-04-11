document.addEventListener('DOMContentLoaded', function() {
    // Get the userId from localStorage (it should be saved after the user signs up or logs in)
    const userId = localStorage.getItem('userId');
    
    if (userId) {
        // Fetch the user's tasks when the page loads
        fetchUserTasks(userId);
    } else {
        alert('No user found! Please log in.');
    }

    // Function to fetch user tasks from the backend
    function fetchUserTasks(userId) {
        fetch(`/api/users-tasks?userId=${userId}`)
            .then(response => response.json())
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
        const completedTasks = tasks.filter(task => task.status === 'completed');
        const currentTask = tasks.find(task => task.status === 'in-progress');

        // Display completed tasks
        const completedList = completedTasks.length
            ? '<ul>' + completedTasks.map(task => `<li>${task.title}</li>`).join('') + '</ul>'
            : '<p>No completed tasks yet!</p>';

        // Display current task
        const currentTaskDisplay = currentTask
            ? `<p>Currently working on: <strong>${currentTask.title}</strong></p>`
            : '<p>No current task in progress.</p>';

        // Update the page with the fetched data
        taskContainer.innerHTML += `<h3>✅ Completed Tasks:</h3>${completedList}`;
        taskContainer.innerHTML += `<h3>🔄 Current Task:</h3>${currentTaskDisplay}`;
    }
});