// ***Handles task distribution***
/*
// Connect to the server
const socket = io(); // This connects to the same server that served the page

// When connected, log it
socket.on("connect", () => {
    console.log("Connected to server with ID:", socket.id);
});

socket.on('taskAssigned', (task) => {
    console.log("Task received:", task);

     // Show task
     const taskBox = document.createElement("div");
     taskBox.innerHTML = `
         <h3>Your task: ${task.expression}</h3>
         <input type="text" id="resultInput" placeholder="Enter your result..." />
         <button id="submitResult">Submit Result</button>
     `;
     document.body.appendChild(taskBox);
 
     // Listen for submit button
     const submitBtn = document.getElementById("submitResult");
     submitBtn.addEventListener("click", () => {
         const userResult = document.getElementById("resultInput").value;
         socket.emit("taskResult", {
             taskId: task.id,
             expression: task.expression,
             result: userResult
         });
 
         // Optional: disable the input/button after submitting
         submitBtn.disabled = true;
     });
 });
})*/

document.addEventListener('DOMContentLoaded', function() {
    // Fetch a random task from the server
    fetch('/getRandomTask')
        .then(response => response.json()) // Parse the response as JSON
        .then(task => {
            if (task) {
                // Display the task to the user
                const taskBox = document.createElement("div");
                taskBox.innerHTML = `
                    <h3>Your task: ${task.expression}</h3>
                    <input type="text" id="resultInput" placeholder="Enter your result..." />
                    <button id="submitResult">Submit Result</button>
                `;
                document.body.appendChild(taskBox);

                // Listen for the submit button click
                const submitBtn = document.getElementById("submitResult");
                submitBtn.addEventListener("click", () => {
                    const userResult = document.getElementById("resultInput").value;
                    // Send the result to the server (optional step, depending on your needs)
                    fetch('/submitResult', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            taskId: task.id,
                            result: userResult
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('There was an error submitting your result.');
                    });

                    // Optional: Disable the button and input after submission
                    submitBtn.disabled = true;
                });
            } else {
                console.log("No task found.");
                alert('Could not fetch a task.');
            }
        })
        .catch(error => {
            console.error('Error fetching task:', error);
            alert('There was an error fetching the task.');
        });
});