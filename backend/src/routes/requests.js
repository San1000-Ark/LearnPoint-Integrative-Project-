import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// CREATE REQUEST

router.post("/", async (req, res) => {
  try {
    const { student_id, tutor_id, message } = req.body;
    if (!student_id || !tutor_id)
      return res
        .status(400)
        .json({ error: "student_id and tutor_id are required" });

    const [studentRows] = await pool.query(
      "SELECT id, users_id FROM students WHERE id = ?",
      [student_id]
    );
    const [tutorRows] = await pool.query(
      "SELECT id, users_id FROM tutors WHERE id = ?",
      [tutor_id]
    );

    if (!studentRows.length)
      return res.status(404).json({ error: "Student not found" });
    if (!tutorRows.length)
      return res.status(404).json({ error: "Tutor not found" });

    const [result] = await pool.query(
      "INSERT INTO requests (student_id, tutor_id, status, message) VALUES (?, ?, 'pending', ?)",
      [student_id, tutor_id, message || null]
    );

    res.status(201).json({
      message: "Request created",
      requestId: result.insertId,
      student_user_id: studentRows[0].users_id,
      tutor_user_id: tutorRows[0].users_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET / REQUESTS

router.get("/", async (req, res) => {
  try {
    const { tutor_id, student_id } = req.query;

    let query = `
      SELECT r.id, r.status, r.student_id, r.tutor_id, r.message,
             su.name AS student_name, su.last_name AS student_last_name,
             tu.name AS tutor_name, tu.last_name AS tutor_last_name,
             st.users_id AS student_user_id,
             tt.users_id AS tutor_user_id
      FROM requests r
      JOIN students st ON st.id = r.student_id
      JOIN users su ON su.id = st.users_id
      JOIN tutors tt ON tt.id = r.tutor_id
      JOIN users tu ON tu.id = tt.users_id
    `;

    const params = [];
    if (tutor_id) {
      query += " WHERE r.tutor_id = ?";
      params.push(tutor_id);
    } else if (student_id) {
      query += " WHERE r.student_id = ?";
      params.push(student_id);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ACCEPT REJECT REQUEST

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tutor_id, status } = req.body;

    if (!tutor_id || !["accepted", "rejected"].includes(status))
      return res.status(400).json({ error: "Invalid tutor_id or status" });

    // Obtain the application and validate the tutor
    const [rows] = await pool.query(
      `SELECT r.*, 
              s.id AS student_db_id,          -- ← Changed: id of students
              t.id AS tutor_db_id,            -- ← Changed: id of tutors
              s.users_id AS student_user_id, 
              t.users_id AS tutor_user_id,
              su.name AS student_name,
              su.last_name AS student_last_name,
              tu.name AS tutor_name,
              tu.last_name AS tutor_last_name
       FROM requests r
       JOIN students s ON s.id = r.student_id
       JOIN tutors t ON t.id = r.tutor_id
       JOIN users su ON su.id = s.users_id
       JOIN users tu ON tu.id = t.users_id
       WHERE r.id = ? AND r.tutor_id = ?`,
      [id, tutor_id]
    );

    if (!rows.length)
      return res
        .status(404)
        .json({ error: "Request not found or tutor mismatch" });

    if (rows[0].status !== "pending")
      return res.status(400).json({ error: "Request already processed" });

    // Update status
    await pool.query("UPDATE requests SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    res.json({
      message: `Request ${status} successfully`,
      student_db_id: rows[0].student_db_id,
      tutor_db_id: rows[0].tutor_db_id,
      student_user_id: rows[0].student_user_id,
      tutor_user_id: rows[0].tutor_user_id,
      student_name: rows[0].student_name,
      student_last_name: rows[0].student_last_name,
      tutor_name: rows[0].tutor_name,
      tutor_last_name: rows[0].tutor_last_name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM requests WHERE id = ?", [
      id,
    ]);

    if (!rows.length)
      return res.status(404).json({ error: "Request not found" });
    if (rows[0].status !== "pending")
      return res
        .status(400)
        .json({ error: "Only pending requests can be cancelled" });

    await pool.query("DELETE FROM requests WHERE id = ?", [id]);
    res.json({ message: "Request cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;