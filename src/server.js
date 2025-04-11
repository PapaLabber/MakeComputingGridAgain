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
const users = []; // Array to store registered users

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Optional: prevent duplicate usernames
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(409).json({ message: 'Username already taken.' });
    }

    const newUser = { username, email, password };
    users.push(newUser);

    res.status(201).json({ message: 'User successfully registered' });
});

//GETTING USER DATA FOR LOGIN
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        return res.json({ message: 'Login successful' });
    } else {
        return res.status(401).json({ message: 'Invalid username or password.' });
    }
});

//GETTING USER DATA FOR PROFILE
app.get('/getUserProfile',(req,res) =>{
    const user = users.find(u => u.id === userId);
    if (user) {
        res.json(user); // Send the user profile data as JSON
    } else {
        res.status(404).json({ message: 'User not found' }); // Handle case where user is not found
    }
});

//GETTING USER DATA FOR TASK OVERVIEW
app.get('/api/users-tasks', (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    const userTasks = tasks.filter(task => task.user_id === parseInt(userId));

    res.json(userTasks);
});

// Start the HTTP server
const server = createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});