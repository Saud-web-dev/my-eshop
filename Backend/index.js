import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";
import adminRoutes from "./src/Auth/routes/admin.routes.js";

dotenv.config();

connectDB();

const app = express();

// Middlewares
app.use(
    cors({
        origin: process.env.FRONTEND_URL, 
        credentials: true,
    })
);
app.use(express.json());

app.use(cookieParser());

app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});