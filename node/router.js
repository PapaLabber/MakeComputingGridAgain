import fs from 'fs'; // Import the 'fs' module for file system operations
import path from 'path'; // Import the 'path' module for file path handling
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for token generation and verification
import { sendJsonResponse } from './server.js'; // Import helper functions
import { fileURLToPath } from 'url'; // Import fileURLToPath for ES modules
import { dequeue, messageQueue, dqList, acknowledge } from './TaskBroker.js'; // Import dequeue function
import { registerUserToDB, storeResultsInDB, checkLoginInfo, dbConnection } from './DatabaseOperation.js';



export { handleRoutes };

const __filename = fileURLToPath(import.meta.url); // Get the current file path
const __dirname = path.dirname(__filename); // Get the directory name of the current file

const SECRET_KEY = 'your_secret_key'; // Replace with a secure key

function handleRoutes(req, res, hostname, PORT, users, tasks) {
    const method = req.method; // Get the HTTP method (GET, POST, etc.)
    const url = new URL(req.url, `http://${hostname}:${PORT}`); // Parse the request URL
    const reqPath = url.pathname; // Extract the path from the URL

    switch (method) {
        case "GET": {
            switch (reqPath) {
                // Serve html landing page
                case "/": {
                    const filePath = path.resolve('node/PublicResources/landingPage.html'); // Resolve the HTML file path
                    serveFile(res, filePath, 'text/html'); // Serve the HTML file with the correct content type
                    return; // Leave function when finished
                }

                // Serve the CSS file for the landing page
                case "/landingPage.css": {
                    const cssFilePath = path.resolve('node/PublicResources/landingPage.css'); // Resolve the CSS file path
                    serveFile(res, cssFilePath, 'text/css'); // Serve the CSS file with the correct content type
                    return; // Leave function when finished
                }

                // Get user profile
                case "/getUserProfile": {
                    const username = url.searchParams.get('username'); // Extract the username from query parameters
                    if (!username) {
                        return sendJsonResponse(res, 400, { message: 'Username is required.' });
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
                        return;
                    } else {
                        sendJsonResponse(res, 404, { message: 'User not found.' });
                        return;
                    }
                }

                // Get completed user tasks
                case "/api/users-tasks": {
                    const username = url.searchParams.get('username'); // Extract the username from query parameters
                    if (!username) {
                        return sendJsonResponse(res, 400, { message: 'Username is required' });
                    }
                    // Find tasks for the given username
                    const userTasks = tasks.filter(task => task.username === username);
                    return sendJsonResponse(res, 200, userTasks);
                }

                // Get a new task from the taskbroker
                case "/api/requestTask": {
                    const newTask = dequeue(messageQueue, dqList);

                    // Check if task is valid
                    if (!newTask) {
                        return sendJsonResponse(res, 400, { messsage: 'Could not provide task' });
                    }

                    // Send JSON response with task
                    return sendJsonResponse(res, 200, newTask);
                }

                // Serve static files from the "node/PublicResources" directory
                default: {
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
            }
        }

        case "POST": {
            switch (reqPath) {
                // Handle user registration
                case "/register": {
                    return registerUser(req, res, users); // Helper function
                }

                case "/login": {
                    // Handle user login
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString(); // Collect the request body data
                    });
                    req.on('end', async () => {
                        const { username, password } = JSON.parse(body); // Parse the JSON body

                        // Validate input fields
                        if (!username || !password) {
                            return sendJsonResponse(res, 400, { message: 'Username and password are required.' });
                        }

                        try {
                            // Check if the user exists and the password matches
                            const isValidUser = await checkLoginInfo(dbConnection, username, password);

                            if (isValidUser) {
                                // Generate a JWT
                                const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

                                // Send the token to the client
                                return sendJsonResponse(res, 200, { message: 'Login successful', token });
                            } else {
                                return sendJsonResponse(res, 401, { message: 'Invalid username or password.' });
                            }
                        } catch (error) {
                            console.error('Error during login:', error);
                            return sendJsonResponse(res, 500, { message: 'Internal server error.' });
                        }
                    });
                    return;
                }

                case "/api/clientTaskDone": {
                    let body = '';

                    // Collect the request body data
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });

                    req.on('end', () => {
                        try {
                            // Parse the request body as JSON
                            const { result } = JSON.parse(body);

                            // Validate the result
                            if (!result) {
                                return sendJsonResponse(res, 400, { message: 'Result is required.' });
                            }

                            // Pass the result to a function in TaskBroker.js
                            const taskProcessed = acknowledge(dqList, taskId); // Call the function from TaskBroker.js

                            // Save result in DB
                            const dataSavedToDB = storeResultsInDB(dbConnection, primeComputed, userName, resultIsPrime, perfectEvenOrOdd); 

                            // Respond with success
                            return sendJsonResponse(res, 200, { message: 'Task result processed: ', taskProcessed });
                        } catch (error) {
                            console.error('Error processing task result:', error);
                            return sendJsonResponse(res, 500, { message: 'Internal Server Error' });
                        }
                    });
                }

                case "/api/protected": {
                    authenticateToken(req, res, () => {
                        // Handle the protected route
                        sendJsonResponse(res, 200, { message: 'You have access to this protected route.' });
                    });
                    return;
                }

                default: {
                    // Handle unknown routes
                    return sendJsonResponse(res, 404, { message: 'Route not found' });
                }
            }
        }

        default: {
            // Handle unknown routes
            return sendJsonResponse(res, 404, { message: 'Route not found' });
        }
    }
}

// Helper function to register users
function registerUser(req, res, users) {
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
        if (users.find(user => user.username === username)) { // Change for database comms
            return sendJsonResponse(res, 409, { message: 'Username already taken.' });
        }
        // Check if the email is already registered
        if (users.find(user => user.email === email)) { // Change for database comms
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
        if (registerUserToDB(dbConnection, username, email, password)) {
            return sendJsonResponse(res, 201, { message: 'User successfully registered' });
        } else {
            return sendJsonResponse(res, 500, { message: 'User could not be registered. Internal server error.' });
        }

    });
}

// Helper function to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return sendJsonResponse(res, 401, { message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return sendJsonResponse(res, 403, { message: 'Invalid token.' });
        }

        req.user = user; // Attach the user to the request
        next();
    });
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
