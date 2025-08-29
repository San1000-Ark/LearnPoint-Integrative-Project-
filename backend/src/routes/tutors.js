import express from "express";
import pool from "../config/db.js";

const router = express.Router();

//  Listar todos los tutores con su información básica
router.get("/", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const [rows] = await conn.query(`
      SELECT t.id, u.name, u.last_name, u.email, t.description_tutor
      FROM tutors t
      JOIN users u ON u.id = t.users_id
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error en GET /tutors:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (conn) conn.release();
  }
});

export default router;
