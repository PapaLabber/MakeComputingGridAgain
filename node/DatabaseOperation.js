//Database pushing (not drugs)
// these will essentially just be SQL queries with placeholders instead of example values

// Imports
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

// create a connection to DB
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'cs-25-sw-2-13@student.aau.dk',
    password: 'GLz3@eKBVmQXhX3d',
    database: 'cs_25_sw_2_13' // given DB name
});

// Function to hash the password and insert a new user into the database
async function registerUserToDB(connection, newUserEmail, newUserUsername, newUserPassword) { // Function is async, because it involves asynchronous operations,
    try {                                                                                     // such as password hashing and database interactions
        const hashedPassword = await bcrypt.hash(newUserPassword, 10); // Hash the password (asynchronous operation)
        const query = 'INSERT INTO users (email, username, password, points) VALUES (?, ?, ?, ?)';
        const values = [newUserEmail, newUserUsername, hashedPassword, 0]; // Use parameterized query. This will help prevent SQL injections.

        connection.connect((err) => {
            if (err) {
                console.error('Error connecting to the database:', err); // very bad
                return;
            }
            console.log('Connected to the database :>'); // very good
            connection.query(query, values, (err, result) => { // Query execution.
                console.log("Registering new user...");

                if (err) { // Check for error. If err is false, then the user has succesfully been registered.
                    console.error("Error registering new user:", err);
                } else {
                    console.log(result);
                    console.log("New user registered successfully!");
                }
            })
        });
    } catch (error) { // Error handling. Prevents application from crashing due to unhandled exceptions.
        console.error("Error hashing password or executing query:", error);
    }
}

// Example usage
const registerQueryEmail = "exampleEmail@email.com";
const registerQueryUsername = "exampleUsername";
const registerQueryPassword = "examplePassword";

registerUserToDB(connection, registerQueryEmail, registerQueryUsername, registerQueryPassword);

//############################################################################

// Function to store results in the database
async function storeResultsInDB(connection, primeComputed, userName, resultIsPrime, perfectEvenOrOdd) {
    try {
        const query = 'INSERT INTO results (prime computed, username, result is prime, perfect even or odd) VALUES (?, ?, ?, ?)';
        const values = [primeComputed, userName, resultIsPrime, perfectEvenOrOdd];
    
        if(!resultIsPrime) {
            console.log("Result is not prime");

            connection.connect((err) => {
                if (err) {
                    console.error('Error connecting to the database:', err); // very bad
                    return;
                }
                console.log('Connected to the database :>'); // very good
                connection.query(query, values, (err, result) => {
                    console.log("Storing results in database...");
                    
                    if (err) {
                        console.error("Error storing results in database:", err);
                    } else {
                        console.log(result);
                        console.log("Results has succesfully been stored in database!");
                    }
                });
            });
            return 1;
        } else {
            console.log("Result is prime and associated perfect number has been checked.");
                
            connection.connect((err) => {
                if (err) {
                    console.error('Error connecting to the database:', err); // very bad
                    return;
                }
                console.log('Connected to the database :>'); // very good
                connection.query(query, values, (err, result) => {
                    console.log("Storing results in database...");

                    if (err) {
                        console.error("Error storing results in database:", err);
                    } else {
                        console.log(result);
                        console.log("Results has succesfully been stored in database!");
                    }
                });
            });
        }
    } catch (error) {
        console.error("Something went wrong:", error);
    }
}

// Example run:
const testPrime = 2;
const testUsername = "exampleUsername";
const testIsPrimeTrue = true;
const testIsPrimeFalse = false;
const testPerfectEven = "Even";
const testPerfectNull = null;

storeResultsInDB(connection, testPrime, testUsername, testIsPrimeTrue, testPerfectEven);
storeResultsInDB(connection, testPrime, testUsername, testIsPrimeFalse, testPerfectNull);

//#############################################################################################################
// Database fetching