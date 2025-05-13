import fs from 'fs'; // Import the 'fs' module for file system operations
import path from 'path'; // Import the 'path' module for file path handling
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for token generation and verification
import { sendJsonResponse } from './server.js'; // Import helper functions
import { fileURLToPath } from 'url'; // Import fileURLToPath for ES modules
import { dequeue, messageQueue, dqList, acknowledge } from './TaskBroker.js'; // Import dequeue function
import { registerUserToDB, storeResultsInDB, dbConnection, getUserProfile, pointAdder, getUserResults, checkLoginInfo } from './DatabaseOperation.js';

const __filename = fileURLToPath(import.meta.url); // Get the current file path
const __dirname = path.dirname(__filename); // Get the directory name of the current file

const SECRET_KEY = 'your_secret_key'; // Replace with a secure key

export function handleRoutes(req, res, hostname, PORT, users, tasks) {
    res.setHeader('Access-Control-Allow-Origin', 'chrome-extension://gfcplmcfadkdfogebjbjngfoiecmpmln');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const method = req.method; // Get the HTTP method (GET, POST, etc.)
    const url = new URL(req.url, `http://${hostname}:${PORT}`); // Parse the request URL
    const reqPath = url.pathname; // Extract the path from the URL

    switch (method) {
        case "GET": {
            switch (reqPath) {
                // Serve html landing page
                case "/": {
                    const filePath = path.resolve('./node/PublicResources/webpages/landingPage.html'); // Resolve the HTML file path
                    serveFile(res, filePath, 'text/html'); // Serve the HTML file with the correct content type
                    return; // Leave function when finished
                }

                // Serve the CSS file for the landing page
                case "/node/landingPage.css": {
                    const cssFilePath = path.resolve('./node/PublicResources/webpages/landingPage.css'); // Resolve the CSS file path
                    serveFile(res, cssFilePath, 'text/css'); // Serve the CSS file with the correct content type
                    return; // Leave function when finished
                }

                // Get user profile
                case "/node/getUserProfile": {
                    authenticateToken(req, res, async () => {
                        // Extract the username from the query parameters
                        const username = url.searchParams.get('email');

                        if (!username) {
                            return sendJsonResponse(res, 400, { message: 'Username is required' });
                        }

                        try {
                            // Fetch the user profile from the database
                            const userData = await getUserProfile(dbConnection, email);

                            if (!userData) {
                                return sendJsonResponse(res, 404, { message: 'User not found' });
                            }

                            // Send the user profile data as a response
                            return sendJsonResponse(res, 200, {
                                message: 'Token is valid. User is authorized.',
                                points: userData.points,
                                email: userData.email, // Include additional fields if needed
                            });
                        } catch (error) {
                            console.error('Error fetching user profile:', error);
                            return sendJsonResponse(res, 500, { message: 'Internal server error' });
                        }
                    });
                    return;
                }

                case "/node/userCompletedTasks": {
                    authenticateToken(req, res, async () => {
                        const username = url.searchParams.get('email'); // Extract the username from query parameters

                        if (!username) {
                            return sendJsonResponse(res, 400, { message: 'Email is required' });
                        }

                        try {
                            // Fetch completed tasks for the user from the database
                            const userCompletedTasks = await getUserResults(dbConnection, email);

                            if (!userCompletedTasks || userCompletedTasks.length === 0) {
                                return sendJsonResponse(res, 404, { message: 'No tasks found for this user' });
                            }

                            return sendJsonResponse(res, 200, userCompletedTasks); // Send tasks as JSON response
                        } catch (error) {
                            console.error('Error fetching user tasks:', error);
                            return sendJsonResponse(res, 500, { message: 'Internal server error' });
                        }
                    });
                    return;
                }

                // Get a new task from the taskbroker
                case "/node/requestTask": {
                    console.log("Task requested by client."); // Log the request for a new task
                    const newTask = dequeue(messageQueue, dqList);

                    // Check if task is valid
                    if (!newTask) {
                        return sendJsonResponse(res, 400, { messsage: 'Could not provide task' });
                    }

                    // Send JSON response with task
                    return sendJsonResponse(res, 200, newTask);
                }

                case "/node/getEmail": {
                    authenticateToken(req, res, async () => {
                        // Extract the username from the query parameters
                        const email = url.searchParams.get('email');

                        if (!email) {
                            return sendJsonResponse(res, 400, { message: 'Email is required to proceed. Enter it at the homepage.' });
                        }

                        try {
                            // Fetch the user profile from the database
                            const userData = await getUserProfile(dbConnection, email);

                            if (!userData) {
                                return sendJsonResponse(res, 404, { message: 'User not found' });
                            }

                            // Send the user profile data as a response
                            return sendJsonResponse(res, 200, {
                                message: 'Token is valid. User is authorized.',
                                points: userData.points,
                                email: userData.email, // Include additional fields if needed
                            });
                        } catch (error) {
                            console.error('Error fetching user profile:', error);
                            return sendJsonResponse(res, 500, { message: 'Internal server error' });
                        }
                    });
                    return;
                }


                // Serve static files from the "webpages" and "PublicResources" directories
                default: {
                    // Determine the base directory based on the request path
                    let baseDir;
                    if (reqPath === '/extension.zip') {
                        baseDir = path.resolve(__dirname, 'PublicResources'); // Serve from PublicResources for extension.zip
                    } else {
                        baseDir = path.resolve(__dirname, 'PublicResources/webpages'); // Serve from webpages for other files
                    }

                    const staticFilePath = path.join(baseDir, reqPath); // Resolve the file path
                    const ext = path.extname(staticFilePath); // Get the file extension

                    // Determine the content type based on the file extension
                    let contentType = 'text/plain';
                    if (ext === '.html') contentType = 'text/html';
                    else if (ext === '.css') contentType = 'text/css';
                    else if (ext === '.js') contentType = 'application/javascript';
                    else if (ext === '.png') contentType = 'image/png';
                    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
                    else if (ext === '.zip') contentType = 'application/zip';

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
                case "/node/register": {
                    return registerUser(req, res, users); // Helper function
                }

                case "/node/login": {
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString(); // Collect the request body data
                    });

                    req.on('end', async () => {
                        console.log('Request body received:', body); // Log the raw body for debugging

                        if (!body) {
                            return sendJsonResponse(res, 400, { message: 'Request body is empty.' });
                        }

                        try {
                            const { username, password } = JSON.parse(body); // Parse the JSON body
                            console.log('Parsed username:', username);
                            console.log('Parsed password:', password);

                            // Validate input fields
                            if (!username || !password) {
                                return sendJsonResponse(res, 400, { message: 'Username and password is required.' });
                            }
  
                            const isValidLogin = await checkLoginInfo(dbConnection, username, password);

                            if (isValidLogin) {
                                console.log('DEBUG: User and password loaded correctly from DB:', username, password);
                                // Generate a JWT
                                const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
                                // Send the token to the client
                                return sendJsonResponse(res, 200, { message: 'Login successful', token, username });
                            } else {
                                console.log('DEBUG: User and password NOT loaded correctly from DB:', username, password);
                                return sendJsonResponse(res, 401, { message: 'User is not logged in' });
                            }
                        } catch (error) {
                            console.error('Error during login:', error);
                            return sendJsonResponse(res, 400, { message: 'Invalid JSON format.' });
                        }
                    });
                    return;
                }

                case "/node/clientTaskDone": {
                    let body = '';

                    // Collect the request body data
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });

                    req.on('end', () => {
                        try {
                            // Parse the request body as JSON
                            const { result, taskId } = JSON.parse(body); // Ensure taskId is included in the request
                            console.log('Task result processed:', result); // Log the processed task result

                            // Validate the result
                            if (!result || !taskId) {
                                return sendJsonResponse(res, 400, { message: 'Result and taskId are required.' });
                            }

                            // Store results computed in the database and add points to the user
                            storeResultsInDB(dbConnection, result.exponent, result.username, result.isMersennePrime, result.perfectIsEven);
                            pointAdder(dbConnection, result.username, result.points);

                            // Call the acknowledge function to mark the task as completed
                            const taskProcessed = acknowledge(dqList, taskId); // Call the function from TaskBroker.js

                            if (taskProcessed) {
                                console.log(`Task ${taskId} acknowledged successfully.`);
                                return sendJsonResponse(res, 200, { message: `Task ${taskId} acknowledged successfully.` });
                            } else {
                                console.log(`Task ${taskId} not found in dequeued list.`);
                                return sendJsonResponse(res, 404, { message: `Task ${taskId} not found in dequeued list.` });
                            }
                        } catch (error) {
                            console.error('Error processing task result:', error);
                            return sendJsonResponse(res, 500, { message: 'Internal Server Error' });
                        }
                    });
                    return;
                }

                case "/node/protected": {
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
        if (registerUserToDB(dbConnection, email, username, password)) {
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
        console.log("check 1");
        return sendJsonResponse(res, 401, { message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error("Check error: JWT verification error:", err);
            if (err.name === 'TokenExpiredError') {
                console.log("check 2");
                return sendJsonResponse(res, 403, { message: 'Token has expired.' });
            } else if (err.name === 'JsonWebTokenError') {
                console.log("check 3");
                return sendJsonResponse(res, 403, { message: 'Invalid token.' });
            } else {
                console.log("check 4");
                return sendJsonResponse(res, 403, { message: 'Token verification failed.' });
            }
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