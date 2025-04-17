import http from 'http'; // To create an HTTP server
import fs from 'fs'; // To read files from the file system
import path from 'path'; // To handle file paths
import { URL } from 'url'; // To parse query parameters
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hostname = '127.0.0.1'; // Hostname for the server
const PORT = 3430; // Port number for the server

// In-memory storage for users and tasks
const users = []; // Array to store user data
const tasks = []; // Array to store task data

// Helper function to send JSON responses
function sendJsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' }); // Set response headers
    res.end(JSON.stringify(data)); // Send JSON data as the response
}

// Helper function to serve static files
function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err); // Log the error
            res.writeHead(500, { 'Content-Type': 'text/plain' }); // Respond with 500 Internal Server Error
            res.end('Internal Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType }); // Respond with 200 OK and the correct content type
            res.end(data); // Send the file data as the response
        }
    });
}

// Create the HTTP server
const server = http.createServer((req, res) => {
    const method = req.method; // Get the HTTP method (GET, POST, etc.)
    const url = new URL(req.url, `http://${hostname}:${PORT}`); // Parse the request URL
    const reqPath = url.pathname; // Extract the path from the URL

    // Route handling
    if (method === 'GET' && reqPath === '/') {
        // Serve the landing page
        const filePath = path.resolve('node/PublicResources/landingPage.html'); // Resolve the file path
        serveFile(res, filePath, 'text/html'); // Serve the HTML file
    } else if (method === 'GET' && reqPath === '/landingPage.css') {
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
            users.push({ username, email, password }); // Change for database comms
            sendJsonResponse(res, 201, { message: 'User successfully registered' }); // Respond with success
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
            const user = users.find(u => u.username === username && u.password === password); // Change for database comms

            if (user) {
                sendJsonResponse(res, 200, { message: 'Login successful' }); // Respond with success
            } else {
                sendJsonResponse(res, 401, { message: 'Invalid username or password.' }); // Respond with unauthorized
            }
        });
    } else if (method === 'GET' && reqPath === '/getUserProfile') {
        // Get user profile
        const username = url.searchParams.get('username'); // Extract the username from query parameters

        if (!username) {
            return sendJsonResponse(res, 400, { message: 'Username is required.' }); // Respond with bad request
        }

        // Find the user by username
        const user = users.find(u => u.username === username); // Change for database comms
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
            sendJsonResponse(res, 404, { message: 'User not found.' }); // Respond with not found
        }
    } else if (method === 'GET' && reqPath === '/api/users-tasks') {
        // Get user tasks
        const username = url.searchParams.get('username'); // Extract the username from query parameters

        if (!username) {
            return sendJsonResponse(res, 400, { message: 'Username is required' }); // Respond with bad request
        }

        // Find tasks for the given username
        const userTasks = tasks.filter(task => task.username === username);
        sendJsonResponse(res, 200, userTasks); // Respond with the tasks
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
        sendJsonResponse(res, 404, { message: 'Route not found' }); // Respond with not found
    }
});

// Start the server
server.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`); // Log the server URL
});