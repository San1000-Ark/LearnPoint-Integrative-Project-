import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * 1. Create class request
 * body: { student_id, skill, message (optional) }
 */
router.post("/", async (req, res) => {
  const { student_id, skill, message } = req.body;

  if (!student_id || !skill) {
    return res.status(400).json({ error: "student_id and skill are required" });
  }

  try {
    const conn = await pool.getConnection();

    // 1. Find subject by name (skill)
    const [subjectRows] = await conn.query(
      "SELECT id FROM subjects WHERE subject_name = ?",
      [skill]
    );

    if (subjectRows.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Skill/Subject not found" });
    }

    const subjectId = subjectRows[0].id;

    // 2. Find available tutor with required skill and minimum rating
    const [tutorRows] = await conn.query(
      `
      SELECT t.id, u.name, u.last_name, IFNULL(AVG(r.ranking), 0) as avg_rating
      FROM tutors t
      JOIN users u ON u.id = t.users_id
      JOIN subjects s ON s.tutors_id = t.id
      LEFT JOIN reviews r ON r.tutors_id = t.id
      WHERE s.id = ?
        AND t.is_verified = 'TRUE'
        AND t.mode_tutoring = 'AVAILABLE'
      GROUP BY t.id
      HAVING avg_rating >= 3.5
      ORDER BY avg_rating DESC
      LIMIT 1
      `,
      [subjectId]
    );

    if (tutorRows.length === 0) {
      conn.release();
      return res
        .status(404)
        .json({ message: "No tutors available that meet the requirements" });
    }

    const assignedTutor = tutorRows[0];

    // 3. Store request in reservation table
    const [result] = await conn.query(
      `
      INSERT INTO reservation (
        reservation_date, 
        tutor_availability_id, 
        students_id, 
        subjects_id, 
        tutors_id,
        status
      )
      VALUES (CURDATE(), NULL, ?, ?, ?, 'ASSIGNED')
      `,
      [student_id, subjectId, assignedTutor.id]
    );

    conn.release();

    res.status(201).json({
      message: "Class request created successfully",
      requestId: result.insertId,
      assignedTutor,
      status: "ASSIGNED",
      studentMessage: message || "No message provided (not stored in DB)",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * 2. Reject a request by tutor (Simple rejection + auto-reassign)
 */
router.patch("/:id/reject", async (req, res) => {
  const { id } = req.params; // reservation id
  const { tutorId } = req.body; // tutor rejecting the request

  try {
    const conn = await pool.getConnection();

    // 1. Get the reservation
    const [rows] = await conn.query(
      "SELECT * FROM reservation WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Reservation not found" });
    }

    const reservation = rows[0];

    // 2. Verify tutor is the one assigned
    if (reservation.tutors_id !== Number(tutorId)) {
      conn.release();
      return res
        .status(403)
        .json({ message: "Not authorized to reject this request" });
    }

    // 3. Free the request (mark REJECTED)
    await conn.query(
      "UPDATE reservation SET tutors_id = NULL, status = 'REJECTED' WHERE id = ?",
      [id]
    );

    // 4. Try to auto-assign another tutor
    const [tutorRows] = await conn.query(
      `
      SELECT t.id, u.name, u.last_name, IFNULL(AVG(r.ranking), 0) as avg_rating
      FROM tutors t
      JOIN users u ON u.id = t.users_id
      JOIN subjects s ON s.tutors_id = t.id
      LEFT JOIN reviews r ON r.tutors_id = t.id
      WHERE s.id = ?
        AND t.is_verified = 'TRUE'
        AND t.mode_tutoring = 'AVAILABLE'
        AND t.id <> ?
      GROUP BY t.id
      HAVING avg_rating >= 3.5
      ORDER BY avg_rating DESC
      LIMIT 1
      `,
      [reservation.subjects_id, tutorId]
    );

    if (tutorRows.length > 0) {
      const newTutor = tutorRows[0];
      await conn.query(
        "UPDATE reservation SET tutors_id = ?, status = 'ASSIGNED' WHERE id = ?",
        [newTutor.id, id]
      );

      conn.release();
      return res.json({
        message: "Request rejected and reassigned automatically.",
        reservationId: id,
        newTutor,
        status: "ASSIGNED",
      });
    }

    conn.release();

    // No tutors available → stays in REJECTED
    res.json({
      message:
        "Request rejected. No new tutor available, it remains REJECTED for now.",
      reservationId: id,
      status: "REJECTED",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;