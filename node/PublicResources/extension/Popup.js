import { baseURL } from "../webpages/config.js"
import { realLLT } from './llt.js';

// The Username from the local storage in the browser
const username = localStorage.getItem('username');
if (!username) {
    alert('No user found! Please log in to the website.');
} else {
    console.log('email retrieved:', email);
}

try {
    document.addEventListener('DOMContentLoaded', function () {
        // Listen for the email sent from landingPage.js
        window.addEventListener('message', function (event) {
            // Ensure the message is of the correct type
            if (event.data && event.data.type === 'EMAIL') {
                const email = event.data.email;
                console.log('Email received via postMessage:', email);
    
                // Save the email in localStorage for the popup
                localStorage.setItem('email', email);
    
                // Fetch user profile using the email
                fetch(`${baseURL}/node/getEmail?email=${email}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('jwt')}`, // Include the JWT
                        'Content-Type': 'application/json',
                    }
                })
            }}
        )}
    )
} catch(err) {
    console.error("Error getting email or fetching userprofile", err);
}


// Prepare states for active calculation or idle
const state = {
    IDLE: 'idle',
    ACTIVE: 'active'
};
let currentState = state.IDLE; // default state


// Get the status of the activation button from the DOM 
const requestTaskButton = document.getElementById('request-task-btn');

document.addEventListener('DOMContentLoaded', function () {
    // Update the event listener to switch state
    if (requestTaskButton) {
        requestTaskButton.addEventListener('click', function () {
            if (currentState === state.IDLE) {
                switchState(state.ACTIVE);
            }
        });
    } else {
        console.log('Request Task button not found. Skipping event listener.');
    }
    window.requestTask = requestTask;
});

document.addEventListener('DOMContentLoaded', function () {
    const userProfileButton = document.getElementById('user-profile-btn');
    const rewardsButton = document.getElementById('rewards-btn');
    const aboutUsButton = document.getElementById('about-us-btn');

    if (userProfileButton) {
        userProfileButton.addEventListener('click', function () {
            location.href = 'https://cs-25-sw-2-13.p2datsw.cs.aau.dk/node0/userProfile.html';
        });
    }

    if (rewardsButton) {
        rewardsButton.addEventListener('click', function () {
            location.href = 'https://cs-25-sw-2-13.p2datsw.cs.aau.dk/node0/Rewards.html';
        });
    }

    if (aboutUsButton) {
        aboutUsButton.addEventListener('click', function () {
            location.href = 'https://cs-25-sw-2-13.p2datsw.cs.aau.dk/node0/landingPage.html';
        });
    }
});

function switchState(newState) {
    currentState = newState;
    console.log(`State changed to: ${currentState}`);

    if (currentState === state.ACTIVE) {
        // Update button to indicate active state
        requestTaskButton.textContent = 'Stop Earning...';
        requestTaskButton.classList.remove('w3-green');
        requestTaskButton.classList.add('w3-red');

        // Start the task loop
        requestTask(username);
    } else if (currentState === state.IDLE) {
        // Revert button to idle state
        requestTaskButton.textContent = 'Earn Points Now!';
        requestTaskButton.classList.remove('w3-red');
        requestTaskButton.classList.add('w3-green');
    }
}

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

// Request a new task from the server
export function requestTask() {
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
    console.log(result + "CHECK CHECK CHECK CHECK CHECK");
    fetch(`${baseURL}/node/clientTaskDone`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result, taskId: result.taskID, email }), // Include task ID in the request body
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse the server response as JSON
        })
        .then(data => {
            console.log('Result successfully sent to the server:', data);
            if (currentState === state.ACTIVE) {
                console.log('Requesting the next task...');
                requestTask(username); // Only request the next task if the state is ACTIVE
            }
            else
                console.log('Requesting tasks stopped.');
        })
        .catch(error => {
            console.error('Error sending task result to the server:', error);
            alert('Error in delivering task result.');
        });
}