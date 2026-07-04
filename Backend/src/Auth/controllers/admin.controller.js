import User from "../../model/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Signup
export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                msg: "All fields (name, email, password) are required",
            });
        }

        // Check if any user already exists
        const existingAdmin = await User.findOne();

        if (existingAdmin) {
            return res.status(403).json({
                success: false,
                msg: "Admin account already exists. Signup is not allowed.",
            });
        }

        // Check if email already exists (additional safety)
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                msg: "Email already registered",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create only one admin
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin",
        });

        // Generate token
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.JWT_ADMIN_SECRET,
            {
                expiresIn: "7d",
            }
        );

        // Set cookie
        res.cookie("adminMiddleware", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        // ✅ Send user data back to frontend to store in localStorage
        return res.status(201).json({
            success: true,
            msg: "Admin created successfully",
            user: userResponse,
            token: token, // Send token for localStorage
        });

    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                msg: "Email already exists",
            });
        }
        return res.status(500).json({
            success: false,
            msg: error.message,
        });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                msg: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                msg: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.JWT_ADMIN_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.cookie("adminMiddleware", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        // ✅ Send user data and token for localStorage
        res.status(200).json({
            success: true,
            msg: "Login successful",
            user: userResponse,
            token: token, // Send token for localStorage
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message,
        });
    }
};

// Logout
export const logout = async (req, res) => {
    try {
        res.clearCookie("adminMiddleware", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        res.status(200).json({
            success: true,
            msg: "Logout successful",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message,
        });
    }
};

// ✅ NEW: Get Current User (from token)
export const getCurrentUser = async (req, res) => {
    try {
        // Get token from cookie or header
        const token = req.cookies.adminMiddleware || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                msg: "Not authenticated",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
        
        // Find user
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user: user,
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                msg: "Invalid token",
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                msg: "Token expired",
            });
        }
        res.status(500).json({
            success: false,
            msg: error.message,
        });
    }
};