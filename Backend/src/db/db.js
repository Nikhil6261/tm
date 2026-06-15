import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, // Optional: default is 3306
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

// Test the database connection
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
})();

export default pool;
