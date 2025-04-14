
// Export functions
export { enqueue, dequeue, acknowledge, requeue, print, task, queue };


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

class queue { // The queue itself
    constructor() {
        this.head; // The front node in the queue
        this.tail; // The back node in the queue
    }
}

// Make a function that adds tasks to the linked list (enqueue)
function enqueue(queue, task) {
    const newNode = new node(task); // Create a new node with the task

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
        console.log("Cannot dequeue - Queue is empty");
        return null;
    }

    const newdqNode = new node(mq.head.task); // Make a node in dqList
    newdqNode.experationTime = Date.now() + 60000; // Set an experation to signal time for requeue.

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
    console.log(`Task ${newdqNode.task.id} has been dequeued and is now stored in the dequeued list`);
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
        if (targetNode.task.id === taskId) { // Check if current task ID is the same as the ID we are looking for
            if (queue.head === queue.tail) { // Check if target node is the only node in the list.
                queue.head = null; // Nuke all pointers, because target node is the only node in the list.
                queue.tail = null;
            } else if (targetNode === queue.head) { // Check if target node is the head.
                queue.head = targetNode.next; // Set the head to the next node
                targetNode.next.prev = null; // Nuke only pointers to the next node, because target node is first.
                targetNode.next = null;
            } else if (targetNode === queue.tail) { // Check if target node is the tail.
                queue.tail = targetNode.prev; // Set the tail to the previous node
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
            targetNode = targetNode.next; // continue the iteration in the while-loop
        }
    }

    console.log(`Task ${taskId} was not found`);
    return false;
}

// Make a function that re-adds unfinished tasks, that have already been started, but not finished
// to the back of the list again (requeue)
function requeue(dq, mq, targetId) {
    let currentNode = dq.head; // Start at the head of the dequeued list
    while (currentNode) {
        if (currentNode.task.id === targetId) { // Check if current task ID is the same as the ID we are looking for
            // remove current from the dq
            if (dq.head === dq.tail) { // Check if target node is the only node in the list.
                dq.head = null; // Nuke all pointers, because target node is the only node in the list.
                dq.tail = null;
            } else if (currentNode === dq.head) { // Check if target node is the head.
                dq.head = currentNode.next; // Set the head to the next node
                currentNode.next.prev = null; // Nuke only pointers to the next node, because target node is first.
                currentNode.next = null;
            } else if (currentNode === dq.tail) { // Check if target node is the tail.
                dq.tail = currentNode.prev; // Set the tail to the previous node
                currentNode.prev.next = null; // Nuke only pointers to previous node, because target node is last.
                currentNode.prev = null;
            } else { // Target node is in between two nodes, and has pointers going both ways.
                currentNode.prev.next = currentNode.next; // Connect the previous node and the next node with eachother
                currentNode.next.prev = currentNode.prev;
                currentNode.next = null; // Nuke outgoing pointers
                currentNode.prev = null;
            }

            // insert current at the head of the mq
            mq.head.prev = currentNode;
            currentNode.next = mq.head;
            mq.head = currentNode;

            console.log(`Task ${targetId} has been requeued at the head.`)
            return true; // Return if the ID's are the same
        } else {
            currentNode = currentNode.next; // continue the iteration in the while-loop
        }

    }
    console.log(`Task ${targetId} was not found`);
    return false;
}

// Print the linked list
function print(queue) {
    if (!queue.head) { // If queue empty
        console.log("Nothing to print - List is empty");
        return null;
    }
    let current = queue.head;
    while (current) {
        console.log(current.task);
        current = current.next;
    }
}