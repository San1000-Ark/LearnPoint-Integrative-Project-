import express from 'express';
import pool from '../config/db.js'; // config of database connection
import { Router } from 'express';

const router = express.Router();
// register Student
router.post('/registerStudent', (req, res) => {
    const { name, last_name, age, email, password } = req.body;

    // Validate required fields
    if (!name || !last_name || !age || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Validate if the email already exists
    pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error("Error during SELECT query:", err);
            return res.status(500).json({ error: "Server error" });
        }
        if (results.length > 0) {
            return res.status(400).json({ error: "The email already exists" });
        }

        // Insert into the users table
        pool.query('INSERT INTO users (name, last_name, age, email, password) VALUES (?, ?, ?, ?, ?)',
        [name, last_name, age, email, password], (err, userResult) => {
            if (err) {
                console.error("Error during INSERT into users:", err);
                return res.status(500).json({ error: "Server error" });
            }

            const userId = userResult.insertId;

            // Insert into the students table
            pool.query('INSERT INTO students (users_id) VALUES (?)', [userId], (err, studentResult) => {
                if (err) {
                    console.error("Error during INSERT into students:", err);
                    return res.status(500).json({ error: "Server error" });
                }

                res.status(201).json({ message: "Student registered successfully" });
            });
        });
    });
});


// register Tutor
router.post('/registerTutor', (req, res) => {
    const { name, last_name, age, email, password, hour_price, description, subjects, working_days, from, to } = req.body;

    // valid obligatories fields tutors
    if (!name || !last_name || !age || !email || !password || !hour_price || !description || !subjects || !working_days || !from || !to) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Valid if the email are exist
    pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error("Error during SELECT query:", err);
            return res.status(500).json({ error: "Server error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: "The email already exists" });
        }

        // insert in the users table
        pool.query('INSERT INTO users (name, last_name, age, email, password) VALUES (?, ?, ?, ?, ?)', 
        [name, last_name, age, email, password], (err, userResult) => {
            if (err) {
                console.error("Error during INSERT into users:", err);
                return res.status(500).json({ error: "Server error" });
            }

            const userId = userResult.insertId;  // get the id of users students

            // insert in the tutors table
            pool.query('INSERT INTO tutors (users_id, hour_price, description_tutor) VALUES (?, ?, ?)', 
            [userId, hour_price, description], (err, tutorResult) => {
                if (err) {
                    console.error("Error during INSERT into tutors:", err);
                    return res.status(500).json({ error: "Server error" });
                }

                const tutorId = tutorResult.insertId;  // get the id of users tutors

                // Insert availability tutors
                pool.query('INSERT INTO tutor_availability (tutors_id, days_availability, start_availability, end_availability) VALUES (?, ?, ?, ?)', 
                [tutorId, working_days, from, to], (err, availabilityResult) => {
                    if (err) {
                        console.error("Error during INSERT into tutor_availability:", err);
                        return res.status(500).json({ error: "Server error" });
                    }

                    // Inserts of subjects of the tutors
                    subjects.forEach(subject => {
                        pool.query('INSERT INTO subjects (subject_name, tutors_id) VALUES (?, ?)', 
                        [subject, tutorId], (err, subjectResult) => {
                            if (err) {
                                console.error("Error during INSERT into subjects:", err);
                                return res.status(500).json({ error: "Server error" });
                            }
                        });
                    });

                    // GG
                    res.status(201).json({ message: "Tutor registered successfully" });
                });
            });
        });
    });
});

export default router;
