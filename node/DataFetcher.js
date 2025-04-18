const mysql = require('mysql2');

// create a connection to DB
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'cs-25-sw-2-13@student.aau.dk',
    password: 'GLz3@eKBVmQXhX3d',
    database: 'cs_25_sw_2_13' // given DB name
});

async function test(connection, username, password) {
    
}