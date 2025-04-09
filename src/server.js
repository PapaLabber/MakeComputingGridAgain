// Main server script

//

// Import required modules
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";

// Initialize Express app
const app = express(); 
/* What is an Express app?
An Express app is an instance of the express framework in Node.js. 
It represents your web application and provides a set of methods and 
middleware to handle HTTP requests, define routes, and manage server-side logic.
*/

// Define the port number for communicating with clients
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Define a simple GET endpoint
app.get("/", (req, res) => { // A simple GET endpoint (/) responds with a message to confirm the server is running.
    res.send("Server is running!"); // *** Should be changed to make it answer with a task ***
});

//Register
app.get("/register", (req, res) => {
    res.send("User registered succesfully");
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

