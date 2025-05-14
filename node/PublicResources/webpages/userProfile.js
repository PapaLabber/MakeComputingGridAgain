
// Buffer to store the message if it arrives before the DOM is ready
let bufferedMessage = null;

// Listen for the message with username and JWT
window.addEventListener('message', (event) => {
    const extensionOrigin = 'chrome-extension://gfcplmcfadkdfogebjbjngfoiecmpmln'; // Replace with your extension ID

    if (event.origin === extensionOrigin) {
        const { username, jwt } = event.data;
        if (username && jwt) {
            console.log('Received username and JWT from extension:', username, jwt);

            // Store the data in localStorage
            localStorage.setItem('username', username);
            localStorage.setItem('jwt', jwt);

            // If the DOM is not ready, buffer the message
            if (document.readyState !== 'complete') {
                bufferedMessage = { username, jwt };
            } else {
                // If the DOM is ready, process the message immediately
                processMessage(username, jwt);
            }
        } else {
            console.warn('Invalid message data received.');
        }
    } else {
        console.warn('Message received from untrusted origin:', event.origin);
    }
});


// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded.');

    // If a message was buffered, process it now
    if (bufferedMessage) {
        const { username, jwt } = bufferedMessage;
        processMessage(username, jwt);
    } else {
        // If no message was buffered, check localStorage for existing data
        const username = localStorage.getItem('username');
        const jwt = localStorage.getItem('jwt');
        if (username && jwt) {
            processMessage(username, jwt);
        } else {
            console.warn('No username or JWT found in localStorage.');
        }
    }
});

// Function to process the message (fetch data and update the DOM)
function processMessage(username, jwt) {
    console.warn(`DEBUG: Username and JWT received: [${username}], [${jwt}]`);

    // console.log('Processing message with username:', username);

    // const tableBody = document.querySelector('.w3-table-all tbody');
    // const usernameElement = document.getElementById('username');
    // const pointsElement = document.getElementById('points');

    // // Fetch user profile data
    // fetch(`${baseURL}/node/getUserProfile?username=${username}`, {
    //     method: 'GET',
    //     headers: {
    //         'Authorization': `Bearer ${jwt}`,
    //         'Content-Type': 'application/json',
    //     }
    // })
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! Status: ${response.status}`);
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         if (data) {
    //             usernameElement.textContent = `Hello ${data.username}`;
    //             pointsElement.textContent = `CURRENT POINTS: ${data.points}`;
    //         } else {
    //             console.error('User profile data is empty.');
    //         }
    //     })
    //     .catch(error => {
    //         console.error('Error fetching user profile:', error);
    //         alert('Failed to fetch user profile.');
    //     });

    // // Fetch user tasks
    // fetch(`${baseURL}/node/userCompletedTasks?username=${username}`, {
    //     method: 'GET',
    //     headers: {
    //         'Authorization': `Bearer ${jwt}`,
    //         'Content-Type': 'application/json',
    //     }
    // })
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! Status: ${response.status}`);
    //         }
    //         return response.json();
    //     })
    //     .then(tasks => {
    //         // Populate the table with tasks
    //         tableBody.innerHTML = ''; // Clear existing rows

    //         if (tasks && tasks.length > 0) {
    //             tasks.forEach(task => {
    //                 const row = document.createElement('tr');
    //                 row.innerHTML = `
    //                     <td>${task.exponent}</td>
    //                     <td>${task.is_mersenne_prime}</td>
    //                     <td>${task.is_even}</td>
    //                     <td>${task.points_worth}</td>
    //                 `;
    //                 tableBody.appendChild(row);
    //             });
    //         } else {
    //             tableBody.innerHTML = '<tr><td colspan="4">No tasks found.</td></tr>';
    //         }
    //     })
    //     .catch(error => {
    //         console.error('Error fetching user tasks:', error);
    //         tableBody.innerHTML = '<tr><td colspan="4">Failed to load tasks. Please try again later.</td></tr>';
    //     });
}