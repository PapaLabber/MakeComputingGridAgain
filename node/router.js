import fs from 'fs'; // Import the 'fs' module for file system operations
import path from 'path'; // Import the 'path' module for file path handling
import { sendJsonResponse } from './server.js'; // Import helper functions
import { fileURLToPath } from 'url'; // Import fileURLToPath for ES modules

const __filename = fileURLToPath(import.meta.url); // Get the current file path
const __dirname = path.dirname(__filename); // Get the directory name of the current file

export function handleRoutes(req, res, hostname, PORT, users, tasks) {
    const method = req.method; // Get the HTTP method (GET, POST, etc.)
    const url = new URL(req.url, `http://${hostname}:${PORT}`); // Parse the request URL
    const reqPath = url.pathname; // Extract the path from the URL

    // Route handling
    if (method === 'GET' && reqPath === '/') {
        // Serve the landing page HTML file
        const filePath = path.resolve('node/PublicResources/landingPage.html'); // Resolve the HTML file path
        serveFile(res, filePath, 'text/html'); // Serve the HTML file with the correct content type
        return; // Ensure no further processing
    } else if (method === 'GET' && reqPath === '/landingPage.css') {
        // Serve the CSS file for the landing page
        const cssFilePath = path.resolve('node/PublicResources/landingPage.css'); // Resolve the CSS file path
        serveFile(res, cssFilePath, 'text/css'); // Serve the CSS file with the correct content type
    } else if (method === 'POST' && reqPath === '/register') {
        // Handle user registration
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // Collect the request body data
        });
        req.on('end', () => {
            const { username, email, password } = JSON.parse(body); // Parse the JSON body

            // Validate input fields
            if (!username || !email || !password) {
                return sendJsonResponse(res, 400, { message: 'All fields are required.' });
            }

            // Check if the username is already taken
            if (users.find(user => user.username === username)) {
                return sendJsonResponse(res, 409, { message: 'Username already taken.' });
            }

            // Check if the email is already registered
            if (users.find(user => user.email === email)) {
                return sendJsonResponse(res, 409, { message: 'Email already registered.' });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return sendJsonResponse(res, 400, { message: 'Invalid email format.' });
            }

            // Validate password strength
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
            if (!passwordRegex.test(password)) {
                return sendJsonResponse(res, 400, { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.' });
            }

            // Add the new user to the in-memory storage
            users.push({ username, email, password });
            sendJsonResponse(res, 201, { message: 'User successfully registered' });
        });
    } else if (method === 'POST' && reqPath === '/login') {
        // Handle user login
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // Collect the request body data
        });
        req.on('end', () => {
            const { username, password } = JSON.parse(body); // Parse the JSON body

            // Validate input fields
            if (!username || !password) {
                return sendJsonResponse(res, 400, { message: 'Username and password are required.' });
            }

            // Check if the user exists and the password matches
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                sendJsonResponse(res, 200, { message: 'Login successful' });
            } else {
                sendJsonResponse(res, 401, { message: 'Invalid username or password.' });
            }
        });
    } else if (method === 'GET' && reqPath === '/getUserProfile') {
        // Get user profile
        const username = url.searchParams.get('username'); // Extract the username from query parameters

        if (!username) {
            return sendJsonResponse(res, 400, { message: 'Username is required.' });
        }

        // Find the user by username
        const user = users.find(u => u.username === username);
        if (user) {
            // Get the user's tasks and calculate points
            const userTasks = tasks.filter(task => task.username === username);
            const completedTasks = userTasks.filter(task => task.status === 'Completed');
            const points = completedTasks.length * 10; // Example: 10 points per completed task

            // Respond with the user profile
            sendJsonResponse(res, 200, {
                username: user.username,
                email: user.email,
                points: points,
                tasks: userTasks
            });
        } else {
            sendJsonResponse(res, 404, { message: 'User not found.' });
        }
    } else if (method === 'GET' && reqPath === '/api/users-tasks') {
        // Get user tasks
        const username = url.searchParams.get('username'); // Extract the username from query parameters

        if (!username) {
            return sendJsonResponse(res, 400, { message: 'Username is required' });
        }

        // Find tasks for the given username
        const userTasks = tasks.filter(task => task.username === username);
        sendJsonResponse(res, 200, userTasks);
    } else {
        // Serve static files from the "node/PublicResources" directory
        if (method === 'GET' && reqPath.startsWith('/')) {
            const staticFilePath = path.resolve(__dirname, 'PublicResources' + reqPath); // Resolve the file path
            const ext = path.extname(staticFilePath); // Get the file extension

            // Determine the content type based on the file extension
            let contentType = 'text/plain';
            if (ext === '.html') contentType = 'text/html';
            else if (ext === '.css') contentType = 'text/css';
            else if (ext === '.js') contentType = 'application/javascript';
            else if (ext === '.png') contentType = 'image/png';
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

            // Serve the static file
            fs.stat(staticFilePath, (err, stats) => {
                if (err || !stats.isFile()) {
                    console.error('File not found:', staticFilePath);
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('File not found');
                    return;
                }

                fs.readFile(staticFilePath, (err, data) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Internal Server Error');
                    } else {
                        res.writeHead(200, { 'Content-Type': contentType });
                        res.end(data);
                    }
                });
            });
            return;
        }
        // Handle unknown routes
        sendJsonResponse(res, 404, { message: 'Route not found' });
    }
}

// Helper function to serve files
function serveFile(res, filePath, contentType) { // Resolve the file path
    fs.readFile(filePath, (err, data) => { // Read the file
        if (err) {
            console.error('Error reading file:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data); // Send the file data as the response
        }
    });
}