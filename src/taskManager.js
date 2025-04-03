// ***Handles task distribution***

// Connect to the server
const socket = io(); // This connects to the same server that served the page

// When connected, log it
socket.on("connect", () => {
    console.log("Connected to server with ID:", socket.id);
});

