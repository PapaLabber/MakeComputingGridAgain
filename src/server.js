// Main server script

// Import required modules
import express from "express";
import { createServer } from "http";

// Initialize Express app
const app = express();
const PORT = 3000;

// Temporary in-memory data storage
const users = [
    { username: "test_user", email: "test@example.com", password: "Password123" },
    { username: "john_doe", email: "john@example.com", password: "John12345" },
    { username: "jane_doe", email: "jane@example.com", password: "Jane12345" }
];

const tasks = [
    { username: "test_user", task: "Complete project", status: "In Progress" },
    { username: "test_user", task: "Write documentation", status: "Completed" },
    { username: "john_doe", task: "Fix bugs", status: "Completed" },
    { username: "john_doe", task: "Deploy application", status: "In Progress" },
    { username: "jane_doe", task: "Design UI", status: "Completed" },
    { username: "jane_doe", task: "Conduct testing", status: "Completed" }
];

// Middleware to parse JSON request bodies
app.use(express.json());

// Centralized route handling using a switch-case structure
app.use((req, res) => {
    const { method, path } = req;

    switch (true) {
        case method === 'GET' && path === '/':
            res.send("Server is running!");
            break;

        // POST REGISTER USER
        case method === 'POST' && path === '/register': {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ message: 'All fields are required.' });
            }

            if (users.find(user => user.username === username)) {
                return res.status(409).json({ message: 'Username already taken.' });
            }

            if (users.find(user => user.email === email)) {
                return res.status(409).json({ message: 'Email already registered.' });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Invalid email format.' });
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.' });
            }

            users.push({ username, email, password });
            res.status(201).json({ message: 'User successfully registered' });
            break;
        }

        // POST USER LOGIN
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

        // GET USER PROFILE
        case method === 'GET' && path === '/getUserProfile': {
            const { username } = req.query;

            if (!username) {
                return res.status(400).json({ message: 'Username is required.' });
            }

            const user = users.find(u => u.username === username);
            if (user) {
                const userTasks = tasks.filter(task => task.username === username);
                const completedTasks = userTasks.filter(task => task.status === 'Completed');
                const points = completedTasks.length * 10; // Example: 10 points per completed task

                res.json({
                    username: user.username,
                    email: user.email,
                    points: points,
                    tasks: userTasks
                });
            } else {
                res.status(404).json({ message: 'User not found.' });
            }
            break;
        }

        // GET USER TASKS FOR OVERVIEW
        case method === 'GET' && path === '/api/users-tasks': {
            const { username } = req.query;

            if (!username) {
                return res.status(400).json({ message: 'Username is required' });
            }

            const userTasks = tasks.filter(task => task.username === username);
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