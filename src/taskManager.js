// ***Handles task distribution***

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

    /* Show the task on the page (you can get fancy later)
    const header = document.createElement("h3");
    header.innerText = `Your task: ${task.expression}`;
    document.body.appendChild(header);
})*/
