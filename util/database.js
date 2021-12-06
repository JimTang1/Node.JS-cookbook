const mysql = require('mysql2');

const pool = mysql.createPool({
   host: 'trentonsouth.com',
   user: 'trenton_cookbook',
   database: 'trenton_cookbook',
   password: '0urProj3ct'
});

module.exports = pool.promise();