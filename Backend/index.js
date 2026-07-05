import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";
import adminRoutes from "./src/Auth/routes/admin.routes.js";
import productRoutes from "./src/Routes/product.routes.js";
import categoryRoutes from "./src/Routes/category.routes.js";

import path from 'path';
import { fileURLToPath } from 'url';  

dotenv.config();

connectDB();

const app = express();

// ✅ YE 2 LINES ADD KARO - ESM mein __dirname ke liye
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(
    cors({
        origin: process.env.FRONTEND_URL, 
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Ab __dirname chale ga
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/admin", adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});