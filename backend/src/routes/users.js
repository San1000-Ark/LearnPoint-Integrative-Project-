// src/routes/users.js
import express from 'express';
import pool from "../config/db.js";

const router = express.Router();

// Ruta para obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "USER NOT FOUND" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para crear un nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { name, last_name, age, email, password, registration_date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO users (name,last_name,age,email,password,registration_date) VALUES (?,?,?,?,?,?)',
      [name, last_name, age, email, password, registration_date || new Date()]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para actualizar un usuario
router.put('/:id', async (req, res) => {
  try {
    const { name, last_name, age, email, password, registration_date } = req.body;
    const [result] = await pool.query(
      'UPDATE users SET name=?, last_name=?, age=?, email=?, password=?, registration_date=? WHERE id=?',
      [name, last_name, age, email, password, registration_date || new Date(), req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "USER NOT FOUND" });
    res.json({ message: "USER UPDATED" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para eliminar un usuario
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "USER NOT FOUND" });
    res.json({ message: "USER ELIMINATED" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
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

    const [rows] = await pool.query(sql, [email, password]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // 👇 Determinar el rol según lo que traiga la BD
    let role = null;
    if (user.studentId) role = "student";
    else if (user.tutorId) role = "tutor";

    if (!role) {
      return res.status(403).json({ message: "User has no role assigned" });
    }

    // 👇 Aquí añadimos studentId y tutorId al objeto que devolvemos
    res.json({
      message: "Login successful",
      role,
      user: {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        tutorId: user.tutorId || null,
        studentId: user.studentId || null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// NUEVA RUTA: Obtener solo estudiantes
router.get("/role/students", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id AS id, u.name, u.last_name, u.age, u.email, u.password
      FROM students s
      JOIN users u ON s.users_id = u.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching students" });
  }
});

// ✅ Obtener todos los tutores
router.get("/role/tutors", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.id AS tutor_id, u.*
      FROM tutors t
      JOIN users u ON t.users_id = u.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tutors" });
  }
});



export default router;
