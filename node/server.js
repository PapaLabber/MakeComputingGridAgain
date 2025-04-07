// MAIN SERVER SCRIPT

import https from 'https'; // to create an HTTP server
import fs from 'fs'; // to read files from the server file system

const hostname = '127.0.0.1';
const PORT = 3000;
const path = 'node/PublicResources/clientPage.html';

// Load SSL/TLS certificate and private key (These are self-signed for now, so the browser will show a warning)
const options = {
    key: fs.readFileSync('node/SSL_TLS_certificate/key.pem'), // Path to private key
    cert: fs.readFileSync('node/SSL_TLS_certificate/cert.pem') // Path to certificate
};

const server = https.createServer(options, function(req, res) {
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
        console.log(`Server running at https://${hostname}:${PORT}/`);
    }
});



