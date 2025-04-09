// Make a linked list to hold tasks
class Task {
    constructor(id, taskData) {
        this.id = id; // Task id
        this.taskData = taskData; // The task data
    }
}

class Node { // Nodes in the linked list
    constructor(task) {
        this.task = task; // Current task
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

// Make a function that add tasks to the linked list (enqueue)
function enqueue() {
    
}

// Make a function that removes a task from the list (dequeue)
function dequeue() {

}

// Make a function that views the task at the front of the list without removing it (peek)
function peek() {

}

// Make a function that marks a task as done/finished when it has computed it fully (acknowledge)
function acknowledge() {

}

// Make a function that re-adds unfinished tasks, that have already been started, but not finished
// to the back of the list again (requeue)
function requeue() {

}