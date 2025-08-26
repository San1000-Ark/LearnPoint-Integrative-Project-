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
    const {full_name,age,email,password,registration_date}=req.body;
    pool.query('INSERT INTO users (full_name,age,email,password,registration_date) VALUES (?,?,?,?,?)',[full_name,age,email,password,registration_date],(err,results)=>{
        if(err) return res.status(500).json({error: err.message});
        res.json({message:  "USER CREATED!"})
    })
})

//PUT update users
router.put('/:id',(req,res)=>{
    const {id}=req.params;
    const {full_name,age,email,password,registration_date}=req.body;
    pool.query('UPDATE users SET full_name=?, age=?, email=?, password=?, registration_date=?',[full_name,age,email,password,registration_date,id],(err,results)=>{
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

export default router;