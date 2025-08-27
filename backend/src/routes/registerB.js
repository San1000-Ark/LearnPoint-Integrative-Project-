import express from 'express';
import pool from '../config/db.js'; // connection to MySQL

const router = express.Router();

// Register user
router.post("/register", (req, res) => {
  const { name, last_name, age, email, password } = req.body;

  if (!name || !last_name || !age || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "INSERT INTO users (name, last_name, age, email, password) VALUES (?, ?, ?, ?, ?)";
  pool.query(sql, [name, last_name, age, email, password], (error, result) => {
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ message: "User registered", id: result.insertId });
  });
});

export default router;

