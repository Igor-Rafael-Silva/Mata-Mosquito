const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mata_mosquito_db',
    port: process.env.DB_PORT || 3306,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        console.log('Conexão com o banco MySQL estabelecida com sucesso!');
        connection.release();
    })
    .catch(error => {
        console.error(
            'Erro ao conectar ao banco de dados MySQL:',
            error.message
        );
    });

module.exports = pool;