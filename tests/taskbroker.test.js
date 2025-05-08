// In this testing environment we follow the AAA principle: Arrange, Act, Assert. 

import { describe, test, it, expect } from "vitest";
import { dequeue, dqList, enqueue, messageQueue, queue, task } from "../node/TaskBroker";

describe("enqueue", () => {
    it("should confirm that enqueue adds a node at the tail of messageQueue", () => {
        // Arrange
        const _task = new task(123, 321); 
        const _messageQueue = new queue;

        // Act
        enqueue(_messageQueue, _task);

        // Assert
        expect(_messageQueue.tail.task.id).toBe(123);
        expect(_messageQueue.tail.task.taskData).toBe(321);
    })
})

describe("dequeue", () => {
    it("should confirm that the head of messageQueue is removed and stored as the tail of dqList", () => {
        // Arrange
        const _task1 = new task(123, 321);
        const _task2 = new task(234, 432);
        const _messageQueue = new queue;
        const _dqList = new queue;

        // Act
        enqueue(_messageQueue, _task1); 
        enqueue(_messageQueue, _task2);
        expect(_messageQueue.head.task.id).toBe(123); // head of messageQueue should be 123
        dequeue(_messageQueue, _dqList);            

        // Assert
        expect(_messageQueue.head.task.id).toBe(234); // head of messageQueue should be 234
        expect(_dqList.tail.task.id).toBe(123); // tail of dqList should be 123
    })
})
