// Make a linked list to hold tasks
class task {
    constructor(id, taskData) {
        this.id = id; // Task id
        this.taskData = taskData; // The task data
    }
}

class node { // Nodes in the linked list
    constructor(task) {
        this.task = task; // Current task
        this.timeStamp; // Time when the task was created
        this.next = null; // Pointer to the next task
        this.prev = null; // Pointer to the previous task
    }
}

class messageQueue { // The queue itself
    constructor() {
        this.head; // The front node in the queue
        this.tail; // The back node in the queue
    }
}

// Make a function that adds tasks to the linked list (enqueue)
function enqueue(queue, task) {
    const newNode = new Node(task); // Create a new node with the task

    if (!queue.head) { // If queue empty
        queue.head = newNode;
        queue.tail = newNode;
    } else { // If queue not empty
        queue.tail.next = newNode; // Set the next of the tail to the new node
        newNode.prev = queue.tail; // Set the previous of the new node to the tail
        queue.tail = newNode; // Set the tail to the new node
    }
}

// Make a function that removes a task from the list (dequeue)
function dequeue(queue) {
    if (!queue.head.task) { // If queue empty
        console.log("Queue is empty");
        return null;
    }

    queue.head.timeStamp = Date.now(); // Set the time stamp of the head node for when it is dequeued
    const removedTask = queue.head.task; // Get the task from the head

    if (queue.head === queue.tail) { // If there is only one node in the queue
        queue.head.task = null; // Set the head task to null to keep pointers
        queue.tail.task = null; // Set the tail task to null to keep pointers
        return removedTask;
    }
    else {
        queue.head = queue.head.next; // Move the head to the next node
        return removedTask;
    }
}
// Make a function that views the task at the front of the list without removing it (peek)
function peek() {

}

// A function that marks a task as done/finished when it has computed it fully (acknowledge)
// The function takes two parametres. The queue itself and the ID of the task we are looking for.
function acknowledge(queue, taskId) {
    if (!queue.head.task) { // If queue empty
        console.log("Queue is empty");
        return null;
    }

    let currentTask = queue.head.prev;
    while (currentTask) {
        if (currentTask.id === taskId) { // Check if current task ID is the same as the ID we are looking for
            deleteNode(currentTask); // Delete the task from the queue
            console.log(`Task ${taskId} has been acknowledged and deleted from the list.`)
            return true; // Return if the ID's are the same
        } else {
            currentTask = queue.prev; // continue the iteration in the while-loop
        }
    }

    console.log(`Task ${taskId} was not found`);
    return false;
}

// Make a function that re-adds unfinished tasks, that have already been started, but not finished
// to the back of the list again (requeue)
function requeue(queue, taskId) {
    let currentNode = queue.head.prev;
    while (currentNode) {
        if (currentNode.id === taskId) { // Check if current task ID is the same as the ID we are looking for
            // remove current from the queue
            currentNode.prev.next = currentNode.next; // Set the next of the previous node to the next node of the current node
            currentNode.next.prev = currentNode.prev; // Set the previous of the next node to the previous node of the current node
            // insert current at the head of the queue
            queue.head.prev.next = currentNode;
            currentNode.prev = queue.head.prev;
            currentNode.next = queue.head;
            queue.head.prev = currentNode;

            // Make current the new head
            queue.head = currentTask; // Set the head to the current node

            console.log(`Task ${taskId} has been requeued at the head.`)
            return true; // Return if the ID's are the same
        } else {
            currentTask = currentTask.prev; // continue the iteration in the while-loop
        }

        console.log(`Task ${taskId} was not found`);
        return false;
    }
}

function deleteNode(node) {
    if (node.prev) { // If there is a previous node
        node.prev.next = node.next; // Set the next of the previous node to the next node of the current node
    }
    if (node.next) { // If there is a next node
        node.next.prev = node.prev; // Set the previous of the next node to the previous node of the current node
    }

}