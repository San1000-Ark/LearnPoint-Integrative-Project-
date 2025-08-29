import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

//create connections with pool VAR
const pool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit:10,
    queueLimit:0
})

//verification initial connection
pool.getConnection((err,conn)=>{
    if(err){
        console.error("Error to connect Mysql: ", err.message);
    }else{
        console.log("Connnected to Mysql ");
        conn.release();
    }
})

export default pool;