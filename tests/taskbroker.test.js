// In this testing environment we follow the AAA principle: Arrange, Act, Assert. 

import { describe, test, it, expect } from "vitest";
import { enqueue, messageQueue, task } from "../node/TaskBroker";

describe("enqueue", () => {
    it("should return a confirmation that the messagequeue got a new task", () => {
        // Arrange
        const _task = new task(123, 321); 

        // Act
        enqueue(messageQueue, _task);

        // Assert
        expect(messageQueue.tail.task.id).toBe(123);
        expect(messageQueue.tail.task.taskData).toBe(321);
    })
})


// //______________________________________________________________________________
// // *** TEST OF OTHER FUNCTIONS *** ///
// setTimeout(() => {
//     console.log('Dequeue id 1, 2, 3:');
//     dequeue(messageQueue, dqList);
//     dequeue(messageQueue, dqList);
//     dequeue(messageQueue, dqList);
//     printQueue(messageQueue);
//     printQueue(dqList);
//     console.log('___________');

//     console.log('Ackowledge:');
//     acknowledge(dqList, '2');
//     printQueue(dqList);
//     console.log('___________');

//     console.log('Requeue:');
//     requeue(dqList, messageQueue, '3');
//     printQueue(dqList);
//     console.log('___________');

//     console.log('print message queue again:');
//     printQueue(messageQueue);


// }, 1000); // timer of 1 sec used to let the queue fill up first
