import { baseURL } from './config.js';

document.addEventListener('DOMContentLoaded', function () {

    // Define the username (this could be dynamically set based on the logged-in user)
    localStorage.getItem(['username'], function (result) {
        const username = result.username;
        if (email) {
            console.log('Email retrieved from chrome.storage:', email);
        } else {
            console.error('No email found in chrome.storage.');
        }
    });
   // Fetch the user profile data from the server
    fetch(`${baseURL}/node/getUserProfile?username=${username}`, {
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
                const usernameElement = document.getElementById('username');
                usernameElement.textContent = `Hello ${data.username}`;
                // document.getElementById('email').textContent = `Email: ${data.email}`;
                const pointsElement = document.getElementById('points');
                pointsElement.textContent = `CURRENT POINTS ${data.points}`;
                
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

    // Fetch completed tasks for the user
    fetch(`${baseURL}/node/userCompletedTasks?username=${username}`, {
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
        .then(tasks => {
            if (tasks && tasks.length > 0) {
                console.log("User tasks fetched successfully:", tasks);

                // Populate the table with tasks
                const tasksTable = document.getElementById('completedTasksTable');
                tasks.forEach(task => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${task.exponent}</td>
                        <td>${task.is_mersenne_prime ? 'Yes' : 'No'}</td>
                        <td>${task.is_even || 'N/A'}</td>
                        <td>${task.points}</td>
                    `;
                    tasksTable.appendChild(row);
                });
            } else {
                console.log("No tasks found for the user.");
                alert('No completed tasks found.');
            }
        })
        .catch(error => {
            console.error('Error fetching user tasks:', error);
            alert('There was an error fetching the user tasks.');
        });
});