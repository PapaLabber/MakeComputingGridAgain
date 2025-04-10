// Main server script

// Import required modules
import express from "express";
import { createServer } from "http";

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

//CREATING USER PROFILES
// In-memory storage for users (for demo purposes)
let users = []; // Array to store registered users

// Register route: Accept user data and create a new user with a unique ID
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    /*
    // Generate a unique user ID (using timestamp as an example for simplicity)
    const userId = Date.now(); // Use timestamp as unique ID for this example
    */

    // This is where we'd store these users in a database (not implemented).
    const newUser = { userId, username, email, password };
    users.push(newUser);

    // Respond with the user ID upon successful registration
    res.status(201).json({
        message: "User successfully registered",
        userId: newUser.userId
    });
});

//GETTING USER DATA FOR LOGIN
app.get('/getUserProfile',(req,res) =>{
    const user = users.find(u => u.id === userId);
    if (user) {
        res.json(user); // Send the user profile data as JSON
    } else {
        res.status(404).json({ message: 'User not found' }); // Handle case where user is not found
    }
});

//GETTING USER DATA FOR PROFILE
// Define a POST endpoint to receive data from clients
app.post("/process", (req, res) => {
    const { taskId, data } = req.body;
    console.log(`Received task ${taskId} with data:`, data);

    // Simulate processing and send a response
    const result = `Processed data for task ${taskId}`;
    res.json({ taskId, result });
});

//ASSIGNING TASKS TO USERS
// Example list of tasks
const tasks = [
    { id: 1, expression: "5 + 3" },
    { id: 2, expression: "12 - 7" },
    { id: 3, expression: "6 * 9" },
    { id: 4, expression: "10 / 2" }
];

// Endpoint to get a random task
app.get("/getRandomTask", (req, res) => {
    // Select a random task
    const randomIndex = Math.floor(Math.random() * tasks.length);
    const randomTask = tasks[randomIndex];

    // Send the random task to the client
    res.json(randomTask);
});

// Start the HTTP server
const server = createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});