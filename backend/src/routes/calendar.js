// backend/src/routes/calendar.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

/**
 * Obtener todas las tutorías (eventos)
 */
router.get("/events", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.id,
        CONCAT('Tutoría de ', s.subject_name) AS title,
        r.start_datetime AS start,
        r.end_datetime AS end,
        r.tutors_id,
        r.students_id,
        r.subjects_id
      FROM reservation r
      JOIN subjects s ON r.subjects_id = s.id
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo eventos:", err);
    res.status(500).json({ error: "Error obteniendo eventos" });
  }
});

/**
 * Crear una tutoría (solo tutor)
 */
router.post("/events", async (req, res) => {
  try {
    console.log("📥 Body recibido:", req.body);

    const { start_datetime, end_datetime, tutors_id, students_id, subjects_id } =
      req.body;

    if (!start_datetime || !end_datetime || !tutors_id || !subjects_id) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const [result] = await db.query(
      `INSERT INTO reservation (start_datetime, end_datetime, tutors_id, students_id, subjects_id)
       VALUES (?, ?, ?, ?, ?)`,
      [start_datetime, end_datetime, tutors_id, students_id || null, subjects_id]
    );

    res.json({ id: result.insertId });
  } catch (err) {
    console.error("Error creando evento:", err);
    res.status(500).json({ error: "Error creando evento" });
  }
});

/**
 * Editar una tutoría
 */
router.put("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { start_datetime, end_datetime, students_id, subjects_id } = req.body;

    await db.query(
      `UPDATE reservation 
       SET start_datetime = ?, end_datetime = ?, students_id = ?, subjects_id = ?
       WHERE id = ?`,
      [start_datetime, end_datetime, students_id || null, subjects_id, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error editando evento:", err);
    res.status(500).json({ error: "Error editando evento" });
  }
});

/**
 * Eliminar tutoría
 */
router.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`DELETE FROM reservation WHERE id = ?`, [id]);

    res.json({ success: true });
  } catch (err) {
    console.error("Error eliminando evento:", err);
    res.status(500).json({ error: "Error eliminando evento" });
  }
});

export default router;
