
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './src/config/db.js';
import usersRouter from './src/routes/users.js';
//load of environment vars
dotenv.config();
const app=express();

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send("API WORKING... ");
})

//routes
app.use('/users',usersRouter);

//start server
const PORT=process.env.PORT;
app.listen(PORT,()=>{
    console.log(`server initilized on http://localhost:${PORT}`);  
})
