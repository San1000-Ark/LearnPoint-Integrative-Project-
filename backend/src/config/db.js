// import express from 'express';
// import pool from '../config/db.js'; // use the actually connnection
// import { Router } from 'express';
// import dotenv from "dotenv";

// dotenv.config();


// // Create pool connections
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// export default pool;


import mysql from 'mysql2';
import dotenv from "dotenv";

dotenv.config();

// Create pool connections
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
