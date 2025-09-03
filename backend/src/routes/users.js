import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Route to get all users
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get a user by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "USER NOT FOUND" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Path to create a new user
router.post("/", async (req, res) => {
  try {
    const { name, last_name, age, email, password, registration_date } =
      req.body;
    const [result] = await db.query(
      "INSERT INTO users (name,last_name,age,email,password,registration_date) VALUES (?,?,?,?,?,?)",
      [name, last_name, age, email, password, registration_date || new Date()]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Path to update a user
router.put("/:id", async (req, res) => {
  try {
    const { name, last_name, age, email, password, registration_date } =
      req.body;
    const [result] = await db.query(
      "UPDATE users SET name=?, last_name=?, age=?, email=?, password=?, registration_date=? WHERE id=?",
      [
        name,
        last_name,
        age,
        email,
        password,
        registration_date || new Date(),
        req.params.id,
      ]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "USER NOT FOUND" });
    res.json({ message: "USER UPDATED" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Path to delete a user
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM users WHERE id=?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "USER NOT FOUND" });
    res.json({ message: "USER ELIMINATED" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const sql = `
      SELECT u.id, u.name, u.last_name, u.email,
             s.id AS studentId,
             t.id AS tutorId
      FROM users u
      LEFT JOIN students s ON u.id = s.users_id
      LEFT JOIN tutors t ON u.id = t.users_id
      WHERE u.email = ? AND u.password = ?
    `;

    const [rows] = await db.query(sql, [email, password]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // Determine the role based on what the database brings
    let role = null;
    if (user.studentId) role = "student";
    else if (user.tutorId) role = "tutor";

    if (!role) {
      return res.status(403).json({ message: "User has no role assigned" });
    }

    // Here we add studentId and tutorId to the object we return
    res.json({
      message: "Login successful",
      role,
      user: {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        tutorId: user.tutorId || null,
        studentId: user.studentId || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NEW ROUTE: Get only students
// GET /users/role/students
router.get("/role/students", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, u.name, u.last_name, u.id AS users_id
      FROM students s
      JOIN users u ON s.users_id = u.id
    `);
    res.json(
      rows.map((r) => ({
        id: r.id,
        name: r.name + " " + r.last_name,
        users_id: r.users_id,
      }))
    );
  } catch (err) {
    console.error("Error getting students:", err);
    res.status(500).json({ error: "Error getting students" });
  }
});

// Get all tutors
router.get("/role/tutors", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.id, u.name, u.last_name, u.email, t.description_tutor
      FROM tutors t
      JOIN users u ON u.id = t.users_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tutors" });
  }
});

// Route to get user by username
router.get("/byUsername/:username", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      req.params.username,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "USER NOT FOUND" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;