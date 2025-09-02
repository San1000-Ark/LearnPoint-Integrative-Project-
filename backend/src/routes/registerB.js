import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// Register Tutor
router.post("/registerTutor", async (req, res) => {
  const {
    name,
    last_name,
    age,
    email,
    password,
    hour_price,
    description,
    subjects,
    working_days,
    from,
    to,
  } = req.body;

  // Valid obligatories fields tutors
  if (
    !name ||
    !last_name ||
    !age ||
    !email ||
    !password ||
    !hour_price ||
    !description ||
    !subjects ||
    !working_days ||
    !from ||
    !to
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Valid if the email exists
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "The email already exists" });
    }

    // Insert in the users table
    const [userResult] = await pool.query(
      "INSERT INTO users (name, last_name, age, email, password) VALUES (?, ?, ?, ?, ?)",
      [name, last_name, age, email, password]
    );
    const userId = userResult.insertId; // get the id of users students

    // Insert in the tutors table
    const [tutorResult] = await pool.query(
      "INSERT INTO tutors (users_id, hour_price, description_tutor) VALUES (?, ?, ?)",
      [userId, hour_price, description]
    );
    const tutorId = tutorResult.insertId; // get the id of users tutors

    // Insert availability tutors
    await pool.query(
      "INSERT INTO tutor_availability (tutors_id, days_availability, start_availability, end_availability) VALUES (?, ?, ?, ?)",
      [tutorId, working_days, from, to]
    );

    // Insert subjects of the tutor
    if (Array.isArray(subjects)) {
      for (const subject of subjects) {
        await pool.query(
          "INSERT INTO subjects (subject_name, tutors_id) VALUES (?, ?)",
          [subject, tutorId]
        );
      }
    }

    res.status(201).json({ message: "Tutor registered successfully" });
  } catch (err) {
    console.error("Error during tutor registration:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Register Student
router.post("/registerStudent", async (req, res) => {
  const { name, last_name, age, email, password } = req.body;

  if (!name || !last_name || !age || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "The email already exists" });
    }

    const [userResult] = await pool.query(
      "INSERT INTO users (name, last_name, age, email, password) VALUES (?, ?, ?, ?, ?)",
      [name, last_name, age, email, password]
    );
    const userId = userResult.insertId; // get the id of users students

    // Insert in the students table
    await pool.query("INSERT INTO students (users_id) VALUES (?)", [userId]);

    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    console.error("Error during student registration:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;