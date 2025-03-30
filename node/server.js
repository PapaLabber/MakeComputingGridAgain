// MAIN SERVER SCRIPT

import http from 'http';
import fs from 'fs';

const hostname = '127.0.0.1';
const PORT = 3000;
const path = 'node/PublicResources/index.html';

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

server.listen(PORT, function(error) {
    if (error) {
        console.error('Error starting server:', error);
    } 
    else {
        console.log(`Server running at http://${hostname}:${PORT}/`);
    }
});



