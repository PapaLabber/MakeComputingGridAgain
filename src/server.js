// Main server file

import express from "express";          // Handles HTTP API requests.
import { WebSocketServer } from "ws";   // Enables real-time communication.
import cors from "cors";                // Allows frontend to make requests to backend.

const app = express();  // Initializing an express app
const PORT = process.env.PORT || 3000;  

app.use(cors());
app.use(express.json()); // Allows JSON data in requests
