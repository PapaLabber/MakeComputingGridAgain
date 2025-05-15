import { realLLT } from './llt.js';

const baseURL = "https://cs-25-sw-2-13.p2datsw.cs.aau.dk/node0";

// State indicator calculation
const state = {
    IDLE: 'idle',
    ACTIVE: 'active'
};
let currentState = state.IDLE; // default state

// Login form
document.addEventListener('DOMContentLoaded', function () {
    // The Username from the local storage in the browser
    let username = localStorage.getItem('username');
    if (!username) {
        console.log('No user found! Please log in to the website.');
    } else {
        console.log('username retrieved:', username);
        getUserPoints(username);
    }

    const loginFormContainer = document.getElementById('login-form-container');
    const buttonContainer = document.getElementById('button-container');
    const logoutContainer = document.getElementById('logout-container');

    // Check if the user is already logged in
    if (!localStorage.getItem('jwt') || !username) {
        handleLoginForm(username, loginFormContainer, buttonContainer, logoutContainer);
    } else {
        handleButtonContainer(username, loginFormContainer, buttonContainer, logoutContainer);
    }
});

// function for login form handling
function handleLoginForm(username, loginFormContainer, buttonContainer, logoutContainer) {
    // Hide the buttons
    buttonContainer.style.display = 'none';
    logoutContainer.style.display = 'none';

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

        const formUsername = document.getElementById('login-username').value;
        const formPassword = document.getElementById('login-password').value;

        if (!formUsername || !formPassword) {
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
                username: formUsername,
                password: formPassword
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    // Save the JWT and username in localStorage
                    localStorage.setItem('jwt', data.token);
                    localStorage.setItem('username', data.username);

                    handleButtonContainer(localStorage.getItem('username'), loginFormContainer, buttonContainer, logoutContainer); // Call the function to handle button container
                    window.location.reload();
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
function handleButtonContainer(username, loginFormContainer, buttonContainer, logoutContainer) {
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
            if (currentState === state.IDLE) {
                switchState(state.ACTIVE, requestTaskButton);
                console.log('Requesting task...');
                requestTask();
            } else {
                switchState(state.IDLE, requestTaskButton);
                console.log('Stopping task requests...');
            }
        });
    }
    if (userProfileButton) {
        userProfileButton.addEventListener('click', function () {
            const username = localStorage.getItem('username');
            const jwt = localStorage.getItem('jwt');
            const newWindow = window.open(`${baseURL}/leaderBoard.html`, '_blank');

            // ############## Ensure the message is sent with the correct data ##############
            if (newWindow) {
                newWindow.postMessage({ username, jwt }, `https://cs-25-sw-2-13.p2datsw.cs.aau.dk`); // Replace '*' with the correct target origin if possible
                console.log('Message sent:', { username, jwt });
            } else {
                console.error('Failed to open the new window.');
            }
        });
    }
    if (rewardsButton) {
        rewardsButton.addEventListener('click', function () {
            window.open(`${baseURL}/Rewards.html`, '_blank');
        });
    }
    if (homeButton) {
        homeButton.addEventListener('click', function () {
            window.open(`${baseURL}/landingPage.html`, '_blank');
        });
    }

    // Show the logout button container
    logoutContainer.style.display = 'block';

    // Inject the logout button dynamically
    logoutContainer.innerHTML = `<button id="logout-btn" class="w3-button w3-red w3-small">Logout</button>`
    const logoutBtn = document.getElementById('logout-btn');

    // Add event listener for the logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            // Clear the JWT and username from localStorage
            localStorage.removeItem('jwt');
            localStorage.removeItem('username');

            // Reload the page to show the login form again
            location.reload();
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

// Request a new task from the server
export function requestTask() {
    const username = localStorage.getItem('username');
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
                return false;
            }

            console.log('(taskOverview) New task received:', newTask.taskData);

            try {
                const result = realLLT(BigInt(newTask.taskData)); // Perform Mersenne prime calculation
                result.taskID = newTask.id; // Add task ID to the result object
                clientTaskDone(result); // Send the result back to the server
                getUserPoints(username);
                return true;
            } catch (error) {
                console.error('Error calculating Mersenne prime:', error);
                return false;
            }
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
            return false;
        });
}

// Send the completed task result to the server
function clientTaskDone(result) {
    const username = localStorage.getItem('username');
    // Convert BigInt properties to strings before sending
    result.exponent = result.exponent.toString();
    console.log(result);
    fetch(`${baseURL}/node/clientTaskDone`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result, taskId: result.taskID, username }), // Include task ID in the request body
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
        });
}

// Fetch completed tasks for a specific user
function getUserPoints(username) {
    username = localStorage.getItem('username');
    fetch(`${baseURL}/node/users-tasks?username=${username}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse the response as JSON
        })
        .then(tasks => {
            const pointsElement = document.getElementById('points');
            pointsElement.innerHTML = `${tasks.points}`;
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
        })
}

// Display tasks in the UI
function displayCurrentTask(tasks) {
    const taskContainer = document.getElementById('task-container');
    taskContainer.innerHTML = ''; // Clear any previous content

    // Ensure tasks is an array
    if (!Array.isArray(tasks)) {
        console.error('Invalid tasks data:', tasks);
        taskContainer.innerHTML = '<p>Error: Unable to load tasks.</p>';
        return;
    }

    // Filter tasks by their status
    const completedTasks = tasks.filter(task => task.status && task.status.toLowerCase() === 'completed');
    const currentTask = tasks.find(task => task.status && task.status.toLowerCase() === 'in progress');

    // Generate HTML for completed tasks
    const completedList = completedTasks.length
        ? '<ul>' + completedTasks.map(task => `<li>${task.exponent}</li>`).join('') + '</ul>'
        : '<p>No completed tasks yet!</p>';

    // Generate HTML for the current task
    const currentTaskDisplay = currentTask
        ? `<p>Currently working on: <strong>${currentTask.exponent}</strong></p>`
        : '<p>No current task in progress.</p>';

    // Update the task container with the generated HTML
    taskContainer.innerHTML += `<h3>✅ Completed Tasks:</h3>${completedList}`;
    taskContainer.innerHTML += `<h3>🔄 Current Task:</h3>${currentTaskDisplay}`;
}



