import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./src/config/db.js";

// Routes
import usersRouter from "./src/routes/users.js";
import requestsRouter from "./src/routes/requests.js";
import reservationRouter from "./src/routes/reservation.js";
import reviewsRouter from "./src/routes/reviews.js";
import registerBRouter from "./src/routes/registerB.js";
import calendarRoutes from "./src/routes/calendar.js";
import subjectsRouter from "./src/routes/subjects.js";

//load of environment vars
dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoint
app.get("/", (req, res) => {
  res.send("API WORKING...");
});

// Main routes
app.use("/users", usersRouter);
app.use("/requests", requestsRouter);
app.use("/reservation", reservationRouter);
app.use("/reviews", reviewsRouter);
app.use("/registerB", registerBRouter);
app.use("/calendar", calendarRoutes);
app.use("/subjects", subjectsRouter);

//start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});