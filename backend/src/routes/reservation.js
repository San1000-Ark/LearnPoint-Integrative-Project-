import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET for FullCalendar
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id, r.reservation_date, r.start_time,
             t.id as tutor_id, s.id as student_id, sub.id as subject_id,
             u_t.full_name as tutor, u_s.full_name as student, sub.subject_name as subject
      FROM reservations r
      JOIN tutors t ON r.tutor_id = t.i
      JOIN users u_t ON u_t.id = t.users_id
      JOIN students s ON r.student_id = s.id
      JOIN users u_s ON u_s.id = s.users_id
      JOIN subjects sub ON r.subject_id = sub.id
    `);

    const reservation = rows.map((r) => ({
      id: r.id,
      title: `${r.student} - ${r.subject}`,
      start: `${r.reservation_date}T${r.start_time}`,
      extendedProps: {
        tutor: r.tutor,
        student: r.student,
        subject: r.subject,
      },
    }));

    res.json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching reservations" });
  }
});

// POST
router.post("/", async (req, res) => {
  const { reservation_date, start_time, tutor_id, student_id, subject_id } =
    req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO reservations (reservation_date, start_time, tutor_id, student_id, subject_id)
       VALUES (?, ?, ?, ?, ?)`,
      [reservation_date, start_time, tutor_id, student_id, subject_id]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating reservation" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM reservations WHERE id = ?", [req.params.id]);
    res.json({ message: "Reservation deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting reservation" });
  }
});

export default router;