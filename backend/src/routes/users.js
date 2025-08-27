import express, { json } from 'express';
import pool from "../config/db.js";

const router=express.Router();

//GET all users
router.get('/',(req,res)=>{
    pool.query("SELECT * FROM users",(err,results)=>{
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    })
})

//GET user by ID
router.get('/:id',(req,res)=>{
    const {id}=req.params;
    pool.query('SELECT * FROM users WHERE id=?',[id],(err,results)=>{
        if(err) return res.status(500).json({error: err.message});
        if(results.length===0) return res.status(404).json({message: "USER NOT FOUND..."})
            res.json(results[0])
    })
})

//POST create new user
router.post('/',(req,res)=>{
const {name,last_name,age,email,password,registration_date}=req.body;
    pool.query('INSERT INTO users (name,last_name,age,email,password,registration_date) VALUES (?,?,?,?,?)',[name,last_name,age,email,password,registration_date],(err,results)=>{
        if(err) return res.status(500).json({error: err.message});
        res.json({message:  "USER CREATED!"})
    })
})

//PUT update users
router.put('/:id',(req,res)=>{
    const {id}=req.params;
    const {name,last_name,age,email,password,registration_date}=req.body;
    pool.query('UPDATE users SET name=?, last_name=?, age=?, email=?, password=?, registration_date=?',[name,last_name,age,email,password,registration_date,id],(err,results)=>{
        if(err) return res.status(500).json({err: err.message});
        if(results.affectedRows===0) return res.status(404).json({message: "USER NOT FOUND..."})
            res.json({message: "USER UPDATED"})
    })
})

//DELETE users
router.delete('/:id',(req,res)=>{
    const {id}=req.params;
    pool.query('DELETE FROM users WHERE id=?',[id],(err,results)=>{
        if(err) return res.status(500).json({error: err.message});
        if(results.affectedRows===0) return res.status(404).json({message: "CLIENT NOT FOUND..."})
            res.json({message: "USER ELIMINATED"});
    })
})

// POST login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    pool.query(sql, [email], (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        if (results.length === 0) return res.status(401).json({ message: "User not found" });

        const user = results[0];

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // We verify if you are a tutor or a student
        const userId = user.id;

        const queryRole = `
            SELECT 'student' as role FROM students WHERE users_id = ?
            UNION
            SELECT 'tutor' as role FROM tutors WHERE users_id = ?
        `;

        pool.query(queryRole, [userId, userId], (error, roleResults) => {
            if (error) return res.status(500).json({ error: error.message });

            if (roleResults.length === 0) {
                return res.status(403).json({ message: "User has no role assigned" });
            }

            const role = roleResults[0].role;

            // We do not send the password in the response.
            delete user.password;

            res.json({
                message: "Login successful",
                user,
                role
            });
        });
    });
});

export default router;