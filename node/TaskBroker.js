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
        this.next = null; // Pointer to the next task
        this.prev = null; // Pointer to the previous task
        this.timeStamp; // Time when the task was created
    }
    
}
class messageQueue { // The queue itself
    constructor() {
        this.head; // The front node in the queue
        this.tail; // The back node in the queue
    }
}

class dqList { // The dequeued list.
    constructor() {
        this.head; // The front node of the dequeued list
        this.tail; // The back node of the dequeued list
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
function dequeue(mq, dq) {
    if (!mq.head) { // If queue empty
        console.log("Queue is empty");
        return null;
    }

    const newdqNode = new Node(mq.head.task); // Make a node in dqList
    newdqNode.experationTime = Date.now()+60000; // Set an experation to signal time for requeue.

    if (mq.head === mq.tail) { // If there is only one node in the message queue
        mq.head.task = null; // Set the head task to null to keep pointers
        mq.tail.task = null; // Set the tail task to null to keep pointers
    }
    else {
        mq.head = mq.head.next; // Move the head to the next node
        mq.head.prev.next = null; // Remove pointers from the previous head.
        mq.head.prev = null; // Remove pointer to the previous head.
    }

    if (!dq.head) { // If dequeue list is empty
        dq.head = newdqNode;
        dq.tail = newdqNode;
    } else { // If dequeue list is not empty
        dq.tail.next = newdqNode; // Set the next of the tail to the new node
        newdqNode.prev = dq.tail; // Set the previous of the new node to the tail
        dq.tail = newdqNode; // Set the tail to the new node
    }
    console.log(`Task ${newdqNode.task.id} has been dequeued and is now stored in DEEEEEEEEEEZ NUTZZZZZZZZZZ`) // Check if group is reading our code.
    // "DEEEEEEEEEEZ NUTZZZZZZZZZZ" should be changed to "dequeue list" once the joke has been finished.
}

// A function that marks a task as done/finished when it has computed it fully (acknowledge)
// The function takes two parametres. The queue itself and the ID of the task we are looking for.
function acknowledge(queue, taskId) {
    if (!queue.head) { // If queue empty
        console.log("Dequeue list is empty");
        return null;
    }

    let targetNode = queue.head;
    while (targetNode) {
        if (targetNode.id === taskId) { // Check if current task ID is the same as the ID we are looking for
            if (targetNode === queue.head) { // Check if target node is the head.
                targetNode.next.prev = null; // Nuke only pointers to the next node, because target node is first.
                targetNode.next = null;
            } else if (targetNode === queue.tail) { // Check if target node is the tail.
                targetNode.prev.next = null; // Nuke only pointers to previous node, because target node is last.
                targetNode.prev = null;
            } else { // Target node is in between two nodes, and has pointers going both ways.
                targetNode.prev.next = targetNode.next; // Connect the previous node and the next node with eachother
                targetNode.next.prev = targetNode.prev;
                targetNode.next = null; // Nuke outgoing pointers
                targetNode.prev = null;
            }

            console.log(`Task ${taskId} has been acknowledged and deleted from the list.`)
            return true; // Return if the ID's are the same
        } else {
            targetNode = queue.prev; // continue the iteration in the while-loop
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
