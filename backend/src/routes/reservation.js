import express from 'express';
import pool from '../config/db.js';

const router=express.Router();

router.post("/reservation", async (req, res) => {
  try {
    const { reservation_date, tutor_availability_id, tutors_id, students_id, subjects_id } = req.body;

    const [result] = await pool.query(
      `INSERT INTO reservation (reservation_date, tutor_availability_id, tutors_id, students_id, subjects_id) 
      VALUES (?, ?, ?, ?, ?)`, [reservation_date, tutor_availability_id, tutors_id, students_id, subjects_id]
    );
    res.json({ message: "Resevation created", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;