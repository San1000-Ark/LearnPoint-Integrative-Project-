import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './src/config/db.js';
import usersRouter from './src/routes/users.js';
import requestsRouter from './src/routes/requests.js';
import reservationRouter from './src/routes/reservation.js';//
import reviewsRouter from './src/routes/reviews.js';
import registerBRouter from './src/routes/registerB.js';

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
app.use('/requests', requestsRouter);
app.use('/reservation',reservationRouter);
app.use('/reviews',reviewsRouter);
app.use('/registerB',registerBRouter);

//start server
const PORT=process.env.PORT;
app.listen(PORT,()=>{
    console.log(`server initilized on http://localhost:${PORT}`);  
})
