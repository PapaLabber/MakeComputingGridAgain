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



async function checkLoginInfo(connection, username, password) {
    // Check if the username and password are provided
    if (!username || !password) {
        console.error("Username and password are required.");
        return false;
    }

    try {
        const query = 'SELECT password FROM users WHERE username=?'; // Might not work as a placeholder.
        
        connection.connect((err) => {
            if (err) {
                console.error('Error connecting to the database:', err); // very bad
                return;
            }
            console.log('Connected to the database :>'); // very good

            connection.query(query, [username], (err, result) => {
                
                if (err) {
                    console.error("Error fetching database:", err);
                } else {
                    console.log(result);
                    console.log("connection established!");
                }
            })
        });
    
        if (password === result) { // check if password is correct
            console.log("Password is correct!"); // very good
            return true; // Password is correct, let client side know user is good to go (more code here)
        } else {
            console.error("Password is incorrect! fat motherfucker"); // very bad
            return false; // Password is incorrect, let client side know user is not good to go (more code here)
        }
        
    } catch {
        console.error("Error fetching database:", error);
    }   
}