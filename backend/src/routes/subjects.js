import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Get all subjects
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, subject_name FROM subjects ORDER BY subject_name"
    );
    console.log("Subjects fetched:", rows);
    res.json(rows);
  } catch (err) {
    console.error("Error getting subjects:", err);
    res.status(500).json({ error: "Error getting subjects" });
  }
});

// Get a subject by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM subjects WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Subject not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new matter
router.post("/", async (req, res) => {
  try {
    const { subject_name } = req.body;
    if (!subject_name) {
      return res.status(400).json({ error: "Subject name is required" });
    }

    const [result] = await db.query(
      "INSERT INTO subjects (subject_name) VALUES (?)",
      [subject_name]
    );
    res.status(201).json({ id: result.insertId, subject_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;