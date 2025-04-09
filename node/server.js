// MAIN SERVER SCRIPT

import http from 'http'; // to create an HTTP server
import fs from 'fs'; // to read files from the server file system

const hostname = '127.0.0.1';
const PORT = 3430;
const path = 'node/PublicResources/ClientPage.html';


const server = http.createServer(function(req, res) {
    fs.readFile(path, function(err, data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end("404 Not Found");
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
});

// Start the server and listen on the specified port
// and log the server address to the console
server.listen(PORT, function(error) {
    if (error) {
        console.error('Error starting server:', error);
    } 
    else {
        console.log(`Server running at http://${hostname}:${PORT}/`);
    }
});



