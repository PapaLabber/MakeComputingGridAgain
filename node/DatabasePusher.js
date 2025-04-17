// these will essentially just be SQL queries with placeholders instead of example values

// consider hashing passwords before inserting lol
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(newUserPassword, 10);


function registerUserToDB(newUserEmail, newUserUsername, newUserPassword) {
    `INSERT INTO users (email, username, password, points)
    VALUES  ('${newUserEmail}', '${newUserUsername}', '${newUserPassword}', 0)`; // new users have 0 points
}

// example query using registerUserToDB

let registerQueryEmail = "exampleEmail@email.com";
let registerQueryUsername = "exampleUsername";
let registerQueryPassword = "examplePassword";

// actual query ----- values for the variables above should be fetched from the frontend
connection.query(registerUserToDB(registerQueryEmail, registerQueryUsername, registerQueryPassword), (err, result) => {
    console.log("Registering new user...");

    if (err) {
        console.error("Error creating registering new user:", err); // very bad
    } else {
        console.log(result);
        console.log("New user registered :>"); // very good
    }
});