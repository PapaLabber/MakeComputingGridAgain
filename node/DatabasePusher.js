// these will essentially just be SQL queries with placeholders instead of example values

// Password hashing
const bcrypt = require('bcrypt');

// Function to hash the password and insert a new user into the database
async function registerUserToDB(connection, newUserEmail, newUserUsername, newUserPassword) { // Function is async, because it involves asynchronous operations
    try {                                                                                     // operations, such as password hashing and database interactions
        const hashedPassword = await bcrypt.hash(newUserPassword, 10); // Hash the password (asynchronous operation)
        const query = 'INSERT INTO users (email, username, password, points) VALUES (?, ?, ?, ?)';
        const values = [newUserEmail, newUserUsername, hashedPassword, 0]; // Use parameterized query. This will help prevent SQL injections.

        connection.query(query, values, (err, result) => { // Query execution.
            console.log("Registering new user...");

            if (err) { // Check for error. If err is false, then the user has succesfully been registered.
                console.error("Error registering new user:", err);
            } else {
                console.log(result);
                console.log("New user registered successfully!");
            }
        });
    } catch (error) { // Error handling. Prevents application from crashing due to unhandled exceptions.
        console.error("Error hashing password or executing query:", error);
    }
}

// Example usage
const connection = /* your database connection */; // Needs looking at
const registerQueryEmail = "exampleEmail@email.com";
const registerQueryUsername = "exampleUsername";
const registerQueryPassword = "examplePassword";

registerUserToDB(connection, registerQueryEmail, registerQueryUsername, registerQueryPassword);

//