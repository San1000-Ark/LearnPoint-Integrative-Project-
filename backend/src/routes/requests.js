import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * Create class request
 * body: { student_id, skill, message (optional) }
 */
router.post("/", (req, res) => {
  const { student_id, skill, message } = req.body;

  if (!student_id || !skill) {
    return res.status(400).json({ error: "student_id and skill are required" });
  }

  pool.getConnection((err, conn) => {
    if (err) {
      console.error("Connection error:", err);
      return res.status(500).json({ error: "Database connection error" });
    }

    // 1. find subject
    conn.query(
      "SELECT id FROM subjects WHERE subject_name = ?",
      [skill],
      (err, subjectRows) => {
        if (err) {
          conn.release();
          console.error(err);
          return res.status(500).json({ error: "Query error (subjects)" });
        }

        if (subjectRows.length === 0) {
          conn.release();
          return res.status(404).json({ message: "Skill/Subject not found" });
        }

        const subjectId = subjectRows[0].id;

        // 2. find tutor
        conn.query(
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
          [subjectId],
          (err, tutorRows) => {
            if (err) {
              conn.release();
              console.error(err);
              return res.status(500).json({ error: "Query error (tutors)" });
            }

            if (tutorRows.length === 0) {
              conn.release();
              return res.status(404).json({
                message: "No tutors available that meet the requirements",
              });
            }

            const assignedTutor = tutorRows[0];

            // 3. insert in reservation
            conn.query(
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
              [student_id, subjectId, assignedTutor.id],
              (err, result) => {
                conn.release();

                if (err) {
                  console.error(err);
                  return res.status(500).json({ error: "Insert error" });
                }

                res.status(201).json({
                  message: "Class request created successfully",
                  requestId: result.insertId,
                  assignedTutor,
                  status: "ASSIGNED",
                  studentMessage: message || "No message provided (not stored in DB)",
                });
              }
            );
          }
        );
      }
    );
  });
});

/**
 * Reject a request by tutor (Simple rejection + auto-reassign)
 */
router.patch("/:id/reject", (req, res) => {
  const { id } = req.params; // reservation id
  const { tutorId } = req.body; // tutor rejecting the request

  pool.getConnection((err, conn) => {
    if (err) {
      console.error("Connection error:", err);
      return res.status(500).json({ message: "Database connection error" });
    }

    // 1. Get reservation
    conn.query("SELECT * FROM reservation WHERE id = ?", [id], (err, rows) => {
      if (err) {
        conn.release();
        console.error(err);
        return res.status(500).json({ message: "Query error (reservation)" });
      }

      if (rows.length === 0) {
        conn.release();
        return res.status(404).json({ message: "Reservation not found" });
      }

      const reservation = rows[0];

      // 2. Verify tutor
      if (reservation.tutors_id !== Number(tutorId)) {
        conn.release();
        return res
          .status(403)
          .json({ message: "Not authorized to reject this request" });
      }

      // 3. Mark as rejected
      conn.query(
        "UPDATE reservation SET tutors_id = NULL, status = 'REJECTED' WHERE id = ?",
        [id],
        (err) => {
          if (err) {
            conn.release();
            console.error(err);
            return res.status(500).json({ message: "Update error (reject)" });
          }

          // 4. Try to auto-reassign
          conn.query(
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
            [reservation.subjects_id, tutorId],
            (err, tutorRows) => {
              if (err) {
                conn.release();
                console.error(err);
                return res.status(500).json({ message: "Query error (reassign)" });
              }

              if (tutorRows.length > 0) {
                const newTutor = tutorRows[0];
                conn.query(
                  "UPDATE reservation SET tutors_id = ?, status = 'ASSIGNED' WHERE id = ?",
                  [newTutor.id, id],
                  (err) => {
                    conn.release();

                    if (err) {
                      console.error(err);
                      return res
                        .status(500)
                        .json({ message: "Update error (assign)" });
                    }

                    return res.json({
                      message: "Request rejected and reassigned automatically.",
                      reservationId: id,
                      newTutor,
                      status: "ASSIGNED",
                    });
                  }
                );
              } else {
                conn.release();
                res.json({
                  message:
                    "Request rejected. No new tutor available, it remains REJECTED for now.",
                  reservationId: id,
                  status: "REJECTED",
                });
              }
            }
          );
        }
      );
    });
  });
});

export default router;
