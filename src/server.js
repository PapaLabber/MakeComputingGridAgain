// MAIN SERVER SCRIPT

// Import required modules
import express from "express"; // Express is a popular web framework for Node.js. 
/* 
more info see https://expressjs.com/
remember to install express with "npm install express" in cmd 
*/

// Initialize Express app
const app = express(); 
/* What is an Express app?
An Express app is an instance of the express framework in Node.js. 
It represents your web application and provides a set of methods and 
middleware to handle HTTP requests, define routes, and manage server-side logic.
*/

// Define the port number for client communication
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());
/* Why do we need to parse JSON request bodies?
Data responses from clients are sent in JSON format.
This middleware parses incoming request bodies and makes the data available in the req.body object.
*/

// Define a simple GET endpoint
app.get("/", (req, res) => { // A simple GET endpoint (/) responds with a message for now.
    res.send("Server is running!"); // *** Should be changed to make it answer with a task ***
});

// Define a POST endpoint to receive data from clients
app.post("/process", (req, res) => {
    const { taskId, data } = req.body;
    console.log(`Received task ${taskId} with data:`, data);

    // Simulate processing and send a response
    const result = `Processed data for task ${taskId}`;
    res.json({ taskId, result });
});


// Start the HTTP server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

