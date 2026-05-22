import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/auth.route.js';
import notesRoutes from './routes/notes.route.js';

import { prisma } from './config/prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/notes", notesRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Notes Backend API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
  });
}); 

const startServer = async () => {

  try {

    await prisma.$connect();

    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });

  } catch (error) {

    console.log(error);

    process.exit(1);
  }
};

startServer();


