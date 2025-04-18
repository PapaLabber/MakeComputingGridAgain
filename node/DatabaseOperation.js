//Database pushing (not drugs)
// these will essentially just be SQL queries with placeholders instead of example values

// Imports
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

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
        const values = [newUserEmail, newUserUsername, hashedPassword, 0]; // Use parameterized query. This will help prevent SQL injections.
        
        console.log('Connected to the database :>'); // very good
        await connection.execute(
            'INSERT INTO users (email, username, password, points) VALUES (?, ?, ?, ?)', values
        );
        
    } catch (error) { // Error handling. Prevents application from crashing due to unhandled exceptions.
        console.error("Error hashing password or executing query:", error);
        return false;
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
        const values = [primeComputed, userName, resultIsPrime, perfectEvenOrOdd];
    
        if(!resultIsPrime) {
            console.log("Result is not prime");
            await connection.execute(
                'INSERT INTO results (prime computed, username, result is prime, perfect even or odd) VALUES (?, ?, ?, ?)', values
            );
            console.log("Result has successfully been stored in the database!");
            return false;

        } else {
            console.log("Result is prime and associated perfect number has been checked.");
            await connection.execute(
                'INSERT INTO results (prime computed, username, result is prime, perfect even or odd) VALUES (?, ?, ?, ?)', values
            );
            console.log("Result has successfully been stored in the database!");
            return true;
        }
    } catch (error) {
        console.error("Something went wrong:", error);
        return false;
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
    if (!username || !password) {
        console.error("Username and password are required.");
        return false;
    }

    try {
        const [rows] = await connection.execute(
            'SELECT password FROM users WHERE username = ?', [username]
        );

        if (rows.length === 0) {
            console.error("User not found.");
            return false;
        }

        const hashedPassword = rows[0].password;

        const match = await bcrypt.compare(password, hashedPassword);
        if (match) {
            console.log("Password is correct!");
            return true;
        } else {
            console.error("Password is incorrect.");
            return false;
        }

    } catch (error) {
        console.error("Error checking login:", error);
        return false;
    }
}