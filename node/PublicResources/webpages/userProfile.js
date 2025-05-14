import { baseURL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('.w3-table-all tbody');
    const usernameElement = document.getElementById('username');
    const pointsElement = document.getElementById('points');

    const username = localStorage.getItem('username');
    console.log('Webpage username:', username); // Debugging log

    // Fetch user profile data
    fetch(`${baseURL}/node/getUserProfile?username=${username}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                usernameElement.textContent = `Hello ${data.username}`;
                pointsElement.textContent = `CURRENT POINTS: ${data.points}`;
            } else {
                console.error('User profile data is empty.');
            }
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
            alert('Failed to fetch user profile.');
        });

    // Fetch user tasks
    fetch(`${baseURL}/node/userCompletedTasks?username=${username}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(tasks => {
            usernameElement.textContent = `Hello ${localStorage.getItem('username')}`;
            pointsElement.textContent = `CURRENT POINTS: ${localStorage.getItem('points')}`;
            
            // Populate the table with tasks
            tableBody.innerHTML = ''; // Clear existing rows

            if (tasks && tasks.length > 0) {
                tasks.forEach(task => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${task.exponent}</td>
                        <td>${task.is_mersenne_prime}</td>
                        <td>${task.is_even}</td>
                        <td>${task.points_worth}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="4">No tasks found.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error fetching user tasks:', error);
            tableBody.innerHTML = '<tr><td colspan="4">Failed to load tasks. Please try again later.</td></tr>';
        });
});