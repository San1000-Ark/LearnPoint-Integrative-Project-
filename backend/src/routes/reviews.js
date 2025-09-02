import express from "express";
import pool from "../config/db.js";

const router = express.Router();

//LIST OF TUTORS WITH RANKING
router.get("/ranking", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.name,
        u.last_name,
        AVG(CAST(r.ranking AS UNSIGNED)) AS prom_ranking
      FROM tutors t
      JOIN users u ON t.users_id = u.id
      LEFT JOIN reviews r ON r.tutors_id = t.id
      GROUP BY t.id
      ORDER BY prom_ranking DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//RANKING BY TUTOR_NAME
router.get("/ranking/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const [rows] = await pool.query(
      `
      SELECT 
        u.name AS tutor_name,
        u.last_name AS tutor_last_name,
        AVG(CAST(r.ranking AS UNSIGNED)) AS prom_ranking
      FROM reviews r
      JOIN tutors t ON r.tutors_id = t.id
      JOIN users u ON t.users_id = u.id
      WHERE u.name = ?
      GROUP BY u.id
    `,
      [name]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;