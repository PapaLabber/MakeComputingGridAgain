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

// Centralized route handling using a switch-like structure
app.use((req, res) => {
    const { method, path } = req;

    switch (true) {
        case method === 'GET' && path === '/':
            res.send("Server is running!");
            break;
//POST REGISTER USER
        case method === 'POST' && path === '/register': {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ message: 'All fields are required.' });
            }

            const existingUser = users.find(user => user.username === username);
            if (existingUser) {
                return res.status(409).json({ message: 'Username already taken.' });
            }

            const newUser = { username, email, password };
            users.push(newUser);

            res.status(201).json({ message: 'User successfully registered' });
            break;
        }
//POST USER LOGIN 
        case method === 'POST' && path === '/login': {
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
        }
//GET USER PROFILE
        case method === 'GET' && path === '/getUserProfile': {
            const user = users.find(u => u.id === userId);
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
            break;
        }
//GET USER TASKS FOR OVERVIEW
        case method === 'GET' && path === '/api/users-tasks': {
            const userId = req.query.userId;

            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }

            const userTasks = tasks.filter(task => task.user_id === parseInt(userId));
            res.json(userTasks);
            break;
        }

        default:
            res.status(404).json({ message: 'Route not found' });
    }
});

// Start the HTTP server
const server = createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});