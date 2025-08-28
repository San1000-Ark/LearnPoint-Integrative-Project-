// src/routes/registerB.js
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.post("/register", async (req, res) => {
  const {
    name, last_name, age, email, password, role,
    mode_tutoring, hour_price, description_tutor, is_verified, academic_level
  } = req.body;

  if (!name || !last_name || !age || !email || !password || !role) {
    return res.status(400).json({ message: "All fields and role are required" });
  }

  if (role !== "student" && role !== "tutor") {
    return res.status(400).json({ message: "Role must be 'student' or 'tutor'" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO users (name, last_name, age, email, password, registration_date) VALUES (?, ?, ?, ?, ?, ?)",
      [name, last_name, age, email, password, new Date()]
    );
    const userId = result.insertId;

    if (role === "student") {
      await pool.query("INSERT INTO students (users_id, academic_level) VALUES (?, ?)", [userId, academic_level || "No especificado"]);
    } else {
      await pool.query(
        "INSERT INTO tutors (users_id, mode_tutoring, hour_price, description_tutor, is_verified) VALUES (?, ?, ?, ?, ?)",
        [userId, mode_tutoring || "Online", hour_price || 0, description_tutor || "Sin descripción", is_verified || 'FALSE']
      );
    }

    res.status(201).json({
      message: "User registered successfully",
      user: { id: userId, name, last_name, age, email },
      role
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Email already registered" });
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
