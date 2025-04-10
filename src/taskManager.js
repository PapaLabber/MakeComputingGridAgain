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

fetch('/submitTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      taskId: task.id,
      expression: task.expression,
      result: userResult
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Server response:", data);
    alert(data.message || "Result submitted!");
  })
  .catch(err => {
    console.error("Error submitting result:", err);
    alert("There was an error submitting your result.");
  });
