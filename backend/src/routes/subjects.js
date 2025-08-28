// src/routes/subjects.js
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * Obtener todas las materias
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, subject_name
      FROM subjects;
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo materias:", err);
    res.status(500).json({ error: "Error obteniendo materias" });
  }
});

export default router;