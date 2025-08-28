// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Config
import pool from './src/config/db.js';

// Rutas
import usersRouter from './src/routes/users.js';
import requestsRouter from './src/routes/requests.js';
import reservationRouter from './src/routes/reservation.js';
import reviewsRouter from './src/routes/reviews.js';
import registerBRouter from './src/routes/registerB.js';
import calendarRoutes from './src/routes/calendar.js';
import subjectsRouter from './src/routes/subjects.js';

// Inicializar variables de entorno
dotenv.config();

// Crear app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoint raíz (para verificar si la API responde)
app.get('/', (req, res) => {
  res.send("API WORKING...");
});

// Rutas principales
app.use('/users', usersRouter);          // Usuarios y login
app.use('/requests', requestsRouter);    // Solicitudes
app.use('/reservation', reservationRouter); // Reservas
app.use('/reviews', reviewsRouter);      // Reseñas
app.use('/registerB', registerBRouter);  // Registro
app.use('/calendar', calendarRoutes);    // Calendario
app.use('/subjects', subjectsRouter);    // Materias

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
