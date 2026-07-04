import jwt from "jsonwebtoken";

const adminMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.authToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                msg: "Authentication required",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({
                success: false,
                msg: "Access denied",
            });
        }

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            msg: "Invalid or expired token",
        });
    }
};

export default adminMiddleware;