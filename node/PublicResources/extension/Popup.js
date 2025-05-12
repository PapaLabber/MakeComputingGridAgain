import { realLLT } from './llt.js';

// The Username from the local storage in the browser
const username = localStorage.getItem('username');
if (!username) {
    alert('No user found! Please log in to the website.');
} else {
    console.log('username retrieved:', username);
}

const baseURL = "https://cs-25-sw-2-13.p2datsw.cs.aau.dk/node0";

// State indicator calculation
const state = {
    IDLE: 'idle',
    ACTIVE: 'active'
};
let currentState = state.IDLE; // default state


// TODO:x check om dom er loaded 
// TODO:x hvis ja load login status: om der findes JWT og username i local storage
// TODO:x Hvis der ikke er noget i JWT og username, inject login form.
// TODO:x  - udfør login
// TODO:x  - ellers udfør buttons
// TODO:x Håndter status: active / idle
// TODO:x func: requestTask
// TODO:x func: clientTaskDone
// TODO: func: completedUserTask
// TODO: Håndter alle de dynamiske informationer i bunden.


// Login form
document.addEventListener('DOMContentLoaded', function () {
    const loginFormContainer = document.getElementById('login-form-container');
    const buttonContainer = document.getElementById('button-container');

    // Check if the user is already logged in
    if (!localStorage.getItem('jwt') || !localStorage.getItem('username')) {
        handleLoginForm(loginFormContainer, buttonContainer);
    } else {
        handleButtonContainer(loginFormContainer, buttonContainer);
    }
});

// function for login form handling
function handleLoginForm(loginFormContainer, buttonContainer) {
    // Hide the buttons
    buttonContainer.style.display = 'none';

    // Show the login form
    loginFormContainer.style.display = 'block';

    // Inject the login form dynamically
    loginFormContainer.innerHTML = `
            <form id="loginForm">
                <h2>Sign In Here</h2>
                <div>
                    <input type="text" placeholder="Enter Username" id="login-username" required>
                </div>
                <div>
                    <input type="password" placeholder="Enter Password" id="login-password" required>
                </div>
                <button type="submit">Sign In</button>
            </form>`;

    // Add event listener for the login form submission
    loginFormContainer.addEventListener('submit', function (event) {
        event.preventDefault(); // TODO: necessary???

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }

        // Send login request to the server
        fetch(`${baseURL}/node/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    alert('Login successful!');

                    // Save the JWT and username in localStorage
                    localStorage.setItem('jwt', data.token);
                    localStorage.setItem('username', username);

                    handleButtonContainer(loginFormContainer, buttonContainer); // Call the function to handle button container

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


// function for button handling
function handleButtonContainer(loginFormContainer, buttonContainer) {
    // Hide the login form
    loginFormContainer.style.display = 'none';

    // Show the button container
    buttonContainer.style.display = 'block';

    // Inject the buttons dynamically
    buttonContainer.innerHTML = `
        <p id="username-display">Hello, <span id="username">${username}</span>!</p>
        <button id="request-task-btn" class="w3-button w3-green w3-large" style="width: 100%;">Earn Points Now!</button><br>
        <button id="user-profile-btn" class="w3-button w3-blue w3-large" style="width: 100%;">User Profile</button><br>
        <button id="rewards-btn" class="w3-button w3-teal w3-large" style="width: 100%;">Rewards</button><br>
        <button id="home-btn" class="w3-button w3-orange w3-large" style="width: 100%;">Home</button><br>
    `;

    // Add event listeners for the buttons
    const requestTaskButton = document.getElementById('request-task-btn');
    const userProfileButton = document.getElementById('user-profile-btn');
    const rewardsButton = document.getElementById('rewards-btn');
    const homeButton = document.getElementById('home-btn');

    if (requestTaskButton) {
        requestTaskButton.addEventListener('click', function () {
            console.log('Requesting task...');
            requestTask();

        });
    }
    if (userProfileButton) {
        userProfileButton.addEventListener('click', function () {
            location.href = `${baseURL}/userProfile.html`;
        });
    }
    if (rewardsButton) {
        rewardsButton.addEventListener('click', function () {
            location.href = `${baseURL}/Rewards.html`;
        });
    }
    if (homeButton) {
        homeButton.addEventListener('click', function () {
            location.href = `${baseURL}/landingPage.html`;
        });
    }

    // Handle state of the request task button
    if (requestTaskButton) {
        requestTaskButton.addEventListener('click', function () {
            if (currentState === state.IDLE) {
                switchState(state.ACTIVE, requestTaskButton);
            }
        });
    }
}


function switchState(newState, requestTaskButton) {
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


// // Display tasks in the UI
// function displayTasks(tasks) {
//     const taskContainer = document.getElementById('task-container');
//     taskContainer.innerHTML = ''; // Clear any previous content

//     // Filter tasks by their status
//     const completedTasks = tasks.filter(task => task.status.toLowerCase() === 'completed');
//     const currentTask = tasks.find(task => task.status.toLowerCase() === 'in progress');

//     // Generate HTML for completed tasks
//     const completedList = completedTasks.length
//         ? '<ul>' + completedTasks.map(task => `<li>${task.task}</li>`).join('') + '</ul>'
//         : '<p>No completed tasks yet!</p>';

//     // Generate HTML for the current task
//     const currentTaskDisplay = currentTask
//         ? `<p>Currently working on: <strong>${currentTask.task}</strong></p>`
//         : '<p>No current task in progress.</p>';

//     // Update the task container with the generated HTML
//     taskContainer.innerHTML += `<h3>✅ Completed Tasks:</h3>${completedList}`;
//     taskContainer.innerHTML += `<h3>🔄 Current Task:</h3>${currentTaskDisplay}`;
// }

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


