import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dbConnection } from "./database/dbConnection.js";
import messageRouter from "./routes/messageRouter.js";

const app = express();

dotenv.config({ path: "./config/config.env" });

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use(express.json()); // Middleware to parse JSON request body
app.use(express.urlencoded({ extended: true })); // For URL-encoded data

app.use("/api/v1/message", messageRouter);

dbConnection();

export default app;
