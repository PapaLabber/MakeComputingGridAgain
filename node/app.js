// BACKBONE OF THE MCGA PROGRAM

// Imports
import http from 'http';
import { handleRoutes } from './router.js';
import { taskBrokerMain } from './TaskBroker.js';
import { startServer } from './server.js';




// Server setup
startServer();


// Taskbroker
taskBrokerMain();


// Database coms - When 





