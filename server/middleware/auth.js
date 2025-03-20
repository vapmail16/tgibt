const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        return res.status(401).json({ 
            message: err.name === 'TokenExpiredError' 
                ? "Token has expired" 
                : "Invalid token"
        });
    }
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

// Middleware to verify token but continue if not present
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        }
        next();
    } catch (err) {
        // Continue without user info if token is invalid
        next();
    }
};

module.exports = {
    authenticateToken,
    isAdmin,
    optionalAuth
}; 