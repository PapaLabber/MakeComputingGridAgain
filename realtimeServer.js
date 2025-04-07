const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' folder
app.use(express.static('src'));

// Task list to simulate grid computing jobs
const taskQueue = [
    { id: 1, expression: "5 + 3" },
    { id: 2, expression: "12 * 4" },
    { id: 3, expression: "Math.sqrt(81)" },
    { id: 4, expression: "20 / 4" }
];

// Handle user connections
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('taskResult', (data) => {
        console.log(`✅ Result received from ${socket.id}`);
        console.log(`Task ID: ${data.taskId}`);
        console.log(`Expression: ${data.expression}`);
        console.log(`User's Result: ${data.result}`);
    });
    

   // Assign a task if available
   if (taskQueue.length > 0) {
    const task = taskQueue.shift(); // remove first task
    socket.emit('taskAssigned', task); // send it to the client
    console.log(`Assigned task ${task.id} to ${socket.id}`);
} else {
    socket.emit('taskAssigned', { id: null, expression: "No tasks left!" });
}

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
const PORT = 3002;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
