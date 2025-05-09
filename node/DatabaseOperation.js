//Database pushing (not drugs)
// these will essentially just be SQL queries with placeholders instead of example values
// Export
export { registerUserToDB, storeResultsInDB, getUserProfile, pointAdder, getUserResults, dbConnection };

// Imports
import bcrypt from 'bcrypt';
import { get } from 'http';
import mysql from 'mysql2/promise';

// Create a connection to the database
async function initializeConnection() {
    return await mysql.createConnection({
        host: 'localhost',
        user: 'cs-25-sw-2-13@student.aau.dk',
        password: 'GLz3@eKBVmQXhX3d',
        database: 'cs_25_sw_2_13'
    });
}


// Initialize the connection
const dbConnection = await initializeConnection();

// Function to hash the password and insert a new user into the database
async function registerUserToDB(dbConnection, newUserEmail) { // Function is async, because it involves asynchronous operations,
    try {                                                                                     // such as password hashing and database interactions
        const values = [newUserEmail, 0]; // Use parameterized query. This will help prevent SQL injections.

        console.log("Registering user in the database...");
        await dbConnection.execute( // Insert query. This line is what does the SQL operations and stores the user in the database.
            'INSERT INTO users (email, points) VALUES (?, ?)', values
        );
        console.log("User info has succesfully been stored in the Database!"); // Success.

    } catch (error) { // Error handling. Prevents application from crashing due to unhandled exceptions.
        console.error("Error hashing password or executing query:", error);
        return false;
    }
}

// Function to store results in the database
async function storeResultsInDB(dbConnection, primeComputed, userEmail, resultIsPrime, isEven) {
    try {
        const values = [primeComputed, userEmail, resultIsPrime, isEven]; // Values being stored in the list.

        if (!resultIsPrime) { // Check if the result is prime or not.
            console.log("Result is not prime");

            // Insert query. This stores the values in the database, setting is_even 
            // to be null, because the product of (2^{n-1})2^n-1 is not perfect.
            await dbConnection.execute(
                'INSERT INTO results (exponent, found_by_user, is_mersenne_prime, is_even) VALUES (?, ?, ?, ?)', values
            );
            console.log("Result has successfully been stored in the database!");
            return false;

        } else { // The result is prime
            console.log("Result is prime and associated perfect number has been checked.");
            await dbConnection.execute(
                // Insert query. This stores all the values in the database, 
                // notably, the value of is_even can be either 'Even' or 'Odd'.
                'INSERT INTO results (exponent, found_by_user, is_mersenne_prime, is_even) VALUES (?, ?, ?, ?)', values
            ); // If the value of is_even is 'Odd', the problem has been solved.
            console.log("Result has successfully been stored in the database!");
            return true; // Success
        }
    } catch (error) { // Error handling
        console.error("Something went wrong:", error);
        return false;
    }
}

// Function that fetches information about the userprofile to display it
async function getUserProfile(dbConnection, userEmail) {
    try {
        const [rows] = await dbConnection.execute(              // Select query. This selects the column that matches
            `SELECT * FROM users WHERE email = ?`, [userEmail] // both the username and password provided and stores it in an array.
        );

        if (rows.length > 0) {                 // Checks if the array is empty. if empty, the username has been
            console.log("User data found!");
            console.log(rows[0]); // Log the user data
            return rows[0]; // Return the user data
        } else {
            console.error("User data not found.");    // incorrectly types or it does not exist in the database.
            return false;
        }

    } catch (error) { // Error handling
        console.error("Error checking login:", error);
        return false;
    }
}

async function pointAdder(dbConnection, userEmail, points) {
    try {
        let pointIncrementer =+ points; // Updates the users points based on what the result of the computation is.
        await dbConnection.execute(
            `UPDATE users SET points = points + ? WHERE email = ?`, [pointIncrementer, userEmail] // SQL query that updates the values in the DB
        );
        return true;
    } catch (error) { // Error handling
        console.error("Error adding points:", error);
        return false;
    }
}

async function getUserResults(dbConnection, userEmail) {
    try {
        const [rows] = await dbConnection.execute(
            `SELECT exponent, is_mersenne_prime, is_even, points 
             FROM results 
             WHERE found_by_user = ?`, 
            [username]
        );

        if (rows.length > 0) {
            console.log("User results found:", rows);
            return rows; // Return all tasks
        } else {
            console.log("No results found for the user.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching user results:", error);
        return [];
    }
}
