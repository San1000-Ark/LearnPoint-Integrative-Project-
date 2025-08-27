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
// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const sql = `
    SELECT u.id, u.name, u.last_name, u.email, u.password,
           s.id AS studentId,
           t.id AS tutorId
    FROM users u
    LEFT JOIN students s ON u.id = s.users_id
    LEFT JOIN tutors t ON u.id = t.users_id
    WHERE u.email = ? AND u.password = ?
  `;

  pool.query(sql, [email, password], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    let role = null;

    if (user.studentId) {
      role = "student";
    } else if (user.tutorId) {
      role = "tutor";
    }

    if (!role) {
      return res.status(403).json({ message: "User has no role assigned" });
    }

    // Login exitoso
    res.json({
      message: "Login successful",
      role: role,
      user: {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        
      },
    });
  });
});


export default router;