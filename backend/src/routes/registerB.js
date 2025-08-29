import express from 'express';
import pool from '../config/db.js'; // connection to MySQL
import { Router } from 'express';

const router = express.Router();

// Register user
router.post("/register", (req, res) => {
  const {
    name,
    last_name,
    age,
    email,
    password,
    role,
    mode_tutoring,
    hour_price,
    description_tutor,
    is_verified,
    academic_level
  } = req.body;

  if (!name || !last_name || !age || !email || !password || !role) {
    return res.status(400).json({ message: "All fields and role are required" });
  }

  if (role !== "student" && role !== "tutor") {
    return res
      .status(400)
      .json({ message: "Role must be 'student' or 'tutor'" });
  }

  // 1. Insertar en users
  const sqlUser =
    "INSERT INTO users (name, last_name, age, email, password, registration_date) VALUES (?, ?, ?, ?, ?, ?)";

  pool.query(sqlUser, [name, last_name, age, email, password], (error, result) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Email already registered" });
      }
      return res.status(500).json({ error: error.message });
    }

    const userId = result.insertId;

    // 2. Insertar en students o tutors
    let sqlRole, values;

    if (role === "student") {
      sqlRole =
        "INSERT INTO students (users_id, academic_level) VALUES (?, ?)";
      values = [userId, academic_level || "No especificado"];
    } else {
      sqlRole =
        "INSERT INTO tutors (users_id, mode_tutoring, hour_price, description_tutor, is_verified) VALUES (?, ?, ?, ?, ?)";
      values = [
        userId,
        mode_tutoring || "Online",
        hour_price || 0,
        description_tutor || "Sin descripción",
        is_verified || 'FALSE'
      ];
    }

    pool.query(sqlRole, values, (error2) => {
      if (error2) {
        return res.status(500).json({ error: error2.message });
      }

      // 3. Respuesta
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: userId,
          name,
          last_name,
          age,
          email,
        },
        role,
      });
    });
  });
});


export default router;

