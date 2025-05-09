// In this testing environment we follow the AAA principle: Arrange, Act, Assert. 

import { describe, test, it, expect } from "vitest";
import { dequeue, enqueue, queue, task, acknowledge, requeue, checkExperationTime } from "../node/TaskBroker";

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

describe("acknowledge", () => {
    it("should confirm that a task is acknowledged and removed from the dqList", () => {
        // Arrange
        const _task1 = new task(123, 321);
        const _task2 = new task(234, 432);
        const _dqList = new queue;

        enqueue(_dqList, _task1);
        enqueue(_dqList, _task2);

        // Act
        const result = acknowledge(_dqList, 123);

        // Assert
        expect(result).toBe(true);
        expect(_dqList.head.task.id).toBe(234);
    });

    it("should return false if the task is not found", () => {
        // Arrange
        const _task1 = new task(123, 321);
        const _dqList = new queue;
        enqueue(_dqList, _task1);

        // Act
        const result = acknowledge(_dqList, 999);

        // Assert
        expect(result).toBe(false);
    });

    it("should return false if the dqList is empty", () => {
        // Arrange
        const _dqList = new queue;

        // Act
        const result = acknowledge(_dqList, 123);

        // Assert
        expect(result).toBe(false);
    });
});

// ########################################################## Not done:
describe("requeue", () => {
    it("should requeue a task from dqList to the head of messageQueue", () => {
        // Arrange
        const _task1 = new task(123, 321);
        const _dqList = new queue;
        const _messageQueue = new queue;

        enqueue(_dqList, _task1);

        // Act
        const result = requeue(_dqList, _messageQueue, 123);

        // Assert
        expect(result).toBe(true);
        expect(_messageQueue.head.task.id).toBe(123);
        expect(_dqList.head).toBe(null); // dqList should be empty
    });

    it("should return false if the task is not found in dqList", () => {
        // Arrange
        const _dqList = new queue;
        const _messageQueue = new queue;

        // Act
        const result = requeue(_dqList, _messageQueue, 999);

        // Assert
        expect(result).toBe(false);
    });
});

describe("checkExperationTime", () => {
    it("should requeue a task if it has reached its expiration time", () => {
        // Arrange
        const _task1 = new task(123, 321);
        const _dqList = new queue;
        const _messageQueue = new queue;
        const expiredNode = new node(_task1);

        expiredNode.timeStamp = Date.now() - 120000; // Set timestamp to 2 minutes ago
        expiredNode.experationTime = Date.now();
        _dqList.head = expiredNode;
        _dqList.tail = expiredNode;

        // Act
        const result = checkExperationTime(_dqList, _messageQueue);

        // Assert
        expect(result).toBe(true);
        expect(_messageQueue.head.task.id).toBe(123);
        expect(_dqList.head).toBe(null); // dqList should be empty
    });

    it("should return false if no task has reached its expiration time", () => {
        // Arrange
        const _task1 = new task(123, 321);
        const _dqList = new queue;
        const _messageQueue = new queue;
        const nonExpiredNode = new node(_task1);

        nonExpiredNode.timeStamp = Date.now();
        nonExpiredNode.experationTime = Date.now() + 120000; // Set expiration time to 2 minutes later
        _dqList.head = nonExpiredNode;
        _dqList.tail = nonExpiredNode;

        // Act
        const result = checkExperationTime(_dqList, _messageQueue);

        // Assert
        expect(result).toBe(false);
        expect(_messageQueue.head).toBe(null); // messageQueue should remain empty
    });
});

