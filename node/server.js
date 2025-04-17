import http from 'http'; // Import the HTTP module
import { handleRoutes } from './router.js'; // Import the router
import { fileURLToPath } from 'url'; // Import fileURLToPath for ES modules
import path from 'path'; // Import the 'path' module for file path handling

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the hostname and port for the server
const hostname = '127.0.0.1';
const PORT = 3430;

// In-memory storage for users and tasks
const users = []; // Array to store user data
const tasks = []; // Array to store task data

// Helper function to send JSON responses
export function sendJsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' }); // Set the response header to JSON
    res.end(JSON.stringify(data)); // Send the JSON response
}

// Create the HTTP server
const server = http.createServer((req, res) => {
    handleRoutes(req, res, hostname, PORT, users, tasks); // Delegate route handling to router.js
});

// Start the server
server.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`);
});