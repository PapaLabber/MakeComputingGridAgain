// Import the realLLT function for Mersenne prime calculations
import { realLLT } from './llt.js';
export { requestTask };

// Configuration for deployment
const aau_port = true; // Set to false for local deployment
let baseURL = "";

if (aau_port) {
    // Use Apache URL translation for AAU deployment
    baseURL = `${window.location.origin}/node0`;
} else {
    // Use standard URL for local deployment
    baseURL = `${window.location.origin}`;
}

// Add event listener to the "Request Task" button
const requestTaskButton = document.getElementById('request-task-btn');
requestTaskButton.addEventListener('click', function () {
    requestTask(); // Trigger task request when button is clicked
});

// Execute when the DOM is fully loaded
// Fetch and display user tasks if a username is available
// Otherwise, alert the user to log in

document.addEventListener('DOMContentLoaded', function () {
    const username = "test_user"; // Example: hardcoded username for testing

    if (username) {
        // Fetch completed tasks for the user
        completedUserTasks(username);
    } else {
        alert('No user found! Please log in.');
    }

    // Fetch completed tasks for a specific user
    function completedUserTasks(username) {
        fetch(`${baseURL}/node/users-tasks?username=${username}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json(); // Parse the response as JSON
            })
            .then(tasks => {
                displayTasks(tasks); // Display the fetched tasks
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
                alert('Could not fetch your completed tasks. Please try again later.');
            });
    }

    // Expose the requestTask function globally for external use
    window.requestTask = requestTask;

    // Display tasks in the UI
    function displayTasks(tasks) {
        const taskContainer = document.getElementById('task-container');
        taskContainer.innerHTML = ''; // Clear any previous content

        // Filter tasks by their status
        const completedTasks = tasks.filter(task => task.status.toLowerCase() === 'completed');
        const currentTask = tasks.find(task => task.status.toLowerCase() === 'in progress');

        // Generate HTML for completed tasks
        const completedList = completedTasks.length
            ? '<ul>' + completedTasks.map(task => `<li>${task.task}</li>`).join('') + '</ul>'
            : '<p>No completed tasks yet!</p>';

        // Generate HTML for the current task
        const currentTaskDisplay = currentTask
            ? `<p>Currently working on: <strong>${currentTask.task}</strong></p>`
            : '<p>No current task in progress.</p>';

        // Update the task container with the generated HTML
        taskContainer.innerHTML += `<h3>✅ Completed Tasks:</h3>${completedList}`;
        taskContainer.innerHTML += `<h3>🔄 Current Task:</h3>${currentTaskDisplay}`;
    }
});

// Request a new task from the server
function requestTask() {
    fetch(`${baseURL}/node/requestTask`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse the response as JSON
        })
        .then(newTask => {
            if (!newTask || !newTask.taskData) {
                console.error('Invalid task received:', newTask);
                alert('No valid task received from the server.');
                return false;
            }

            console.log('(taskOverview) New task received:', newTask.taskData);

            try {
                const result = realLLT(BigInt(newTask.taskData)); // Perform Mersenne prime calculation
                result.taskID = newTask.id; // Add task ID to the result object
                clientTaskDone(result); // Send the result back to the server
                return true;
            } catch (error) {
                console.error('Error calculating Mersenne prime:', error);
                alert('An error occurred while processing the task.');
                return false;
            }
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
            alert('Could not fetch any new tasks. Please try again later.');
            return false;
        });
}

// Send the completed task result to the server
function clientTaskDone(result) {
    // Convert BigInt properties to strings before sending
    result.exponent = result.exponent.toString();

    fetch(`${baseURL}/node/clientTaskDone`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result, taskId: result.taskID }), // Include task ID in the request body
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse the server response as JSON
        })
        .then(data => {
            console.log('Result successfully sent to the server:', data);
            console.log('Requesting the next task...');
            requestTask(); // Automatically request the next task
        })
        .catch(error => {
            console.error('Error sending task result to the server:', error);
            alert('Error in delivering task result.');
        });
}