// In this testing environment we follow the AAA principle: Arrange, Act, Assert. 

import { describe, test, it, expect } from "vitest";
import { dequeue, enqueue, queue, task, acknowledge, requeue, removeNode, checkExperationTime } from "../node/TaskBroker";

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

describe("removeNode", () => {
    it("should confirm that removeNode removes the tail from the queue", () => {
        // Arrange
        const _task1 = new task(123, 321);
        const _task2 = new task(234, 432); // becomes tail
        const _messageQueue = new queue;
        enqueue(_messageQueue, _task1);
        enqueue(_messageQueue, _task2);

        // Act
        removeNode(_messageQueue, _messageQueue.tail);

        // Assert
        expect(_messageQueue.tail.task.id).toBe(123); // tail of messageQueue should be 123
    })

    it("should confirm that removeNode removes the head from the queue", () => {
        // Arrange
        const _task1 = new task(123, 321); // becomes head
        const _task2 = new task(234, 432);
        const _messageQueue = new queue;
        enqueue(_messageQueue, _task1);
        enqueue(_messageQueue, _task2);

        // Act
        removeNode(_messageQueue, _messageQueue.head);

        // Assert
        expect(_messageQueue.head.task.id).toBe(234); // head of messageQueue should be 234
    })
});


describe("dequeue", () => {
    it("should confirm that the head of messageQueue is removed and stored as the tail of dqList", () => {
        // Arrange
        const _task1 = new task(123, 321);
        const _task2 = new task(234, 432);
        const _messageQueue = new queue;
        const _dqList = new queue;
        enqueue(_messageQueue, _task1); 
        enqueue(_messageQueue, _task2);
        expect(_messageQueue.head.task.id).toBe(123); // head of messageQueue should be 123

        // Act
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
        const _task1 = new task(123, 321);
        const _dqList = new queue;
        enqueue(_dqList, _task1);

        // Act
        let result = acknowledge(_dqList, 123);
        expect(result).toBe(true); // Task should be acknowledged
        result = acknowledge(_dqList, 999); // Try to acknowledge again

        // Assert
        expect(result).toBe(null); // dqList should be empty
    });
});

describe("requeue", () => {
    it("should requeue a task from dqList to the head of messageQueue", () => {
        // Arrange
        const _task1 = new task(123, 321);
        const _task2 = new task(234, 432);
        const _dqList = new queue;
        const _messageQueue = new queue;
        enqueue(_messageQueue, _task1);
        enqueue(_messageQueue, _task2);
        dequeue(_messageQueue, _dqList); // Move task1 to messageQueue
        expect(_messageQueue.head.task.id).toBe(234); // head of messageQueue should be 123

        // Act
        const result = requeue(_dqList, _messageQueue, 123);

        // Assert
        expect(result).toBe(true);
        expect(_messageQueue.head.task.id).toBe(123);
        expect(_dqList.head).toBe(null); // dqList should be empty
    });

    it("should return null if the task is not found in dqList", () => {
        // Arrange
        const _dqList = new queue;
        const _messageQueue = new queue;

        // Act
        const result = requeue(_dqList, _messageQueue, 999);

        // Assert
        expect(result).toBe(null);
    });
});

describe("checkExperationTime", () => {
    it("should requeue a task if it has reached its expiration time", () => {
        // Arrange
        const _task1 = new task(123, 321);
        const _dqList = new queue;
        const _messageQueue = new queue;
        enqueue(_messageQueue, _task1);
        dequeue(_messageQueue, _dqList); // Move task1 to _dqList
        _dqList.tail.timeStamp -= 120000; // offset the timestamp to be 2 minutes in the past

        // Act
        const result = checkExperationTime(_dqList, _messageQueue);

        // Assert
        expect(result).toBe(true);
        expect(_dqList.head).toBe(null); // dqList should be empty
        expect(_messageQueue.head.task.id).toBe(123); // Task should be requeued
    });

    it("should return false if no task has reached its expiration time", () => {
        // Arrange
        const _task1 = new task(123, 321);
        const _dqList = new queue;
        const _messageQueue = new queue;
        enqueue(_messageQueue, _task1);
        dequeue(_messageQueue, _dqList); // Move task1 to _dqList

        // Act
        const result = checkExperationTime(_dqList, _messageQueue);

        // Assert
        expect(result).toBe(false);
        expect(_dqList.head.task.id).toBe(123); // Task should still be in dqList

    });

    it("should return null if dqList is empty", () => {
        // Arrange
        const _dqList = new queue;
        const _messageQueue = new queue;

        // Act
        const result = checkExperationTime(_dqList, _messageQueue);

        // Assert
        expect(result).toBe(null);
    });
});



