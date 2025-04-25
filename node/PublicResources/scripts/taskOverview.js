import { realLLT } from './llt.js'; // Import the isMersennePrime function from llt.js
export { requestTask };

const requestTaskButton = document.getElementById('request-task-btn');
requestTaskButton.addEventListener('click', function () {
    requestTask(); // Call the function to request a new task
    console.log("works (taskoverview.js)"); // Log to check if the button is working
});

document.addEventListener('DOMContentLoaded', function () {
    // Define the username (this could be dynamically set based on the logged-in user)
    const username = "test_user"; // Example: hardcoded username for testing

    if (username) {
        // Fetch the user's tasks when the page loads
        completedUserTasks(username);
    } else {
        alert('No user found! Please log in.');
    }
    
    
    
    // Function to fetch user tasks from the backend
    function completedUserTasks(username) {
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
                    alert('Could not fetch your completed tasks. Please try again later.');
                });
        }

    // Function to distribute tasks when extension activated
    

    window.requestTask = requestTask;

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

function clientTaskDone(result) {
    fetch('/node/api/clientTaskDone', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ result, taskId: result.taskID }) // Include taskId in the request body
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        })
        .then(() => {
            console.log('Task result successfully sent to the server.');
        })
        .catch(error => {
            console.error('Error sending task result to the server:', error);
            alert('Error in delivering task result.');
        });
}

function requestTask() {
    fetch('/node/api/requestTask')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        //Give task to calculation file****!!!!
        .then(newTask => {
            if (!newTask || !newTask.taskData) {
                console.error('Invalid task received:', newTask);
                alert('No valid task received from the server.');
                return;
            }

            let result;
            console.log('(taskOverview) New task received:', newTask.taskData); // Log the received task data
            try {
                result = realLLT(BigInt(newTask.taskData));
                result.taskID = newTask.id; // Add task ID to the result object
                // insert remaining column data into object (which is to be inserted into DB) 
                clientTaskDone(result);
            } catch (error) {
                console.error('Error calculating Mersenne prime:', error);
                alert('An error occurred while processing the task.');
                return;
            }
        })
        .catch(error => {
            console.error('Error fetching tasks', error);
            alert('Could not fetch any new tasks. Please try again later.');
        });
}