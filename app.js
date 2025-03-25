import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dbConnection } from "./database/dbConnection.js";
import messageRouter from "./routes/messageRouter.js";
import userRouter from "./routes/userRoutes.js";

dotenv.config({ path: "./config/config.env" });

const app = express();

app.use(
  cors({
    origin: "https://dplbutibori.in",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Add the root route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Use your existing routes
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);

dbConnection();

export default app;
