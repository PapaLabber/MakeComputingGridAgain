const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' folder
app.use(express.static('src'));

// Handle user connections
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // You can assign a task to the user here later

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
const PORT = 3002;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
