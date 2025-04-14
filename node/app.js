// BACKBONE OF THE MCGA PROGRAM

// imports
const fs = require('fs');
const csv = require('csv-parser');
const { enqueue, dequeue, acknowledge, requeue, print, task, queue } = require("./TaskBroker.js");

// Server setup


// Initialize message queue for task distribution
let messageQueue = new queue;
let dqList = new queue;


// taskbroker -- read from file and push to MQ
fs.createReadStream('./primes_1_to_1000.csv') // Replace 'data.csv' with your file path
    .pipe(csv())
    .on('data', (row) => {
        // Extract only the values from the row
        const values = Object.values(row); // Example: ['1', 'bla']

        // Create a new task using the extracted values
        const newTask = new task(values[1], values[0]); // Assuming task(id, data)

        enqueue(messageQueue, newTask); // Add each row to the linked list
    })
    .on('end', () => {
        console.log('CSV file successfully processed.');
        print(messageQueue);
    });



// taskbroker -- MQ and DQ manipulation


// Database coms





//______________________________________________________________________________
// *** TEST OF OTHER FUNCTIONS *** ///

setTimeout(() => {
    console.log('Dequeue id 1, 2, 3:');
    dequeue(messageQueue, dqList);
    dequeue(messageQueue, dqList);
    dequeue(messageQueue, dqList);
    print(messageQueue);
    print(dqList);
    console.log('___________');

    console.log('Ackowledge:');
    acknowledge(dqList, '2');
    print(dqList);
    console.log('___________');

    console.log('Requeue:');
    requeue(dqList, messageQueue, '3');
    print(dqList);
    console.log('___________');

    console.log('Print message queue again:');
    print(messageQueue);


}, 1000);