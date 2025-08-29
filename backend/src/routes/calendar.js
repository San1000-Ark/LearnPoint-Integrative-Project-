import express from "express";
import db from "../config/db.js";

const router = express.Router();

/**
 * ===============================
 * GET EVENTS (TUTORING SESSIONS)
 * ===============================
 * Filters by userId and role (tutor or student).
 * Example: GET /calendar/events?userId=2&role=tutor
 */
router.get("/events", async (req, res) => {
  const { userId, role } = req.query;

  try {
    let sql = `
      SELECT 
        r.id,
        s.subject_name,
        tu.name AS tutor_name,
        st.name AS student_name,
        r.start_datetime AS start,
        r.end_datetime AS end,
        r.tutors_id,
        r.students_id,
        r.subjects_id,
        r.jitsi_link
      FROM reservation r
      JOIN subjects s ON r.subjects_id = s.id
      JOIN users tu ON r.tutors_id = tu.id
      LEFT JOIN students st_table ON r.students_id = st_table.id
      LEFT JOIN users st ON st_table.users_id = st.id
    `;

    const values = [];

    if (role === "tutor") {
      sql += " WHERE r.tutors_id = ?";
      values.push(userId);
    } else if (role === "student") {
      sql += " WHERE r.students_id = ?";
      values.push(userId);
    }

    const [rows] = await db.query(sql, values);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error getting events:", err);
    res.status(500).json({ error: "Error getting events" });
  }
});

/**
 * ===============================
 * CREATE TUTORING SESSION
 * ===============================
 * Only tutors can create tutoring sessions.
 */
router.post("/events", async (req, res) => {
  try {
    console.log("📥 Body received:", req.body);

    const {
      start_datetime,
      end_datetime,
      tutors_id,
      students_id,
      subjects_id,
      jitsi_link,
    } = req.body;

    if (!start_datetime || !end_datetime || !tutors_id || !subjects_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [result] = await db.query(
      `INSERT INTO reservation 
        (start_datetime, end_datetime, tutors_id, students_id, subjects_id, jitsi_link)
        VALUES (?, ?, ?, ?, ?, ?)`,
      [
        start_datetime,
        end_datetime,
        tutors_id,
        students_id || null,
        subjects_id,
        jitsi_link || null,
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("❌ Error creating event:", err);
    res.status(500).json({ error: "Error creating event" });
  }
});

/**
 * ===============================
 * EDIT TUTORING SESSION
 * ===============================
 */
router.put("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      start_datetime,
      end_datetime,
      students_id,
      subjects_id,
      jitsi_link,
    } = req.body;

    await db.query(
      `UPDATE reservation 
        SET start_datetime = ?, end_datetime = ?, students_id = ?, subjects_id = ?, jitsi_link = ?
        WHERE id = ?`,
      [
        start_datetime,
        end_datetime,
        students_id || null,
        subjects_id,
        jitsi_link || null,
        id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error editing event:", err);
    res.status(500).json({ error: "Error editing event" });
  }
});

/**
 * ===============================
 * DELETE TUTORING SESSION
 * ===============================
 */
router.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`DELETE FROM reservation WHERE id = ?`, [id]);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting event:", err);
    res.status(500).json({ error: "Error deleting event" });
  }
});

export default router;