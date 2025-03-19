// Main server script

// Import required modules
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";

// Initialize Express app
const app = express();
const PORT = 3000;

// Create an HTTP server
const server = createServer(app);

// Initialize WebSocket server
const options = { server: server };
const wss = new WebSocketServer(options);
/* Why do it like this? 
By passing the server option, the WebSocket server is attached to the existing HTTP server. 
This allows the HTTP server and WebSocket server to share the same port (3000 in this case). 
Without this, we would need to run the WebSocket server on a separate port.
*/

// Handle WebSocket connections
wss.on("connection", (ws) => {
    console.log("A client connected");

    // Handle messages from the client
    ws.on("message", (message) => {
        console.log("Received message from client:", message);
    });

    // Handle client disconnection
    ws.on("close", () => {
        console.log("A client disconnected");
    });
});

// Start the HTTP server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

