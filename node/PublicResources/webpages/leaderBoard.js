import{ baseURL } from './config.js'

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('.w3-table-all tbody');

    // Fetch user profile data
    fetch(`${baseURL}/node/fillLeaderBoard`, {
        method: 'GET',
        headers: {
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
            tableBody.innerHTML = ''; // Clear existing rows

            if (Array.isArray(data) && data.length > 0) {
                data.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.exponent}</td>
                        <td>${user.is_mersenne_prime}</td>
                        <td>${user.is_even}</td>
                        <td>${user.points_worth}</td>
                        <td>${user.found_by_user}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="4">No tasks found.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
            alert('Failed to fetch user profile.');
        });

});