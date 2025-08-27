import express from 'express';
import pool from '../config/db.js'; // connection to MySQL

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    try {
        const { name, last_name, age, email, password } = req.body;

        // Validate obligatory fields
        if (!name || !last_name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Validate if email already exists
        const [userExists] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            return res.status(400).json({ error: "The email already exists" });
        }
        
        // Insert into the database
        await pool.query(
            'INSERT INTO users (name, last_name, age, email, password, registration_date) VALUES (?, ?, ?, ?, ?, NOW())',
            [name, last_name, age , email, password]
        );

        // Success response
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Error in /register:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;

