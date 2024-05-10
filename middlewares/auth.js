// Import necessary modules
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Middleware to authenticate user using JWT token
exports.authenticateUser = (req, res, next) => {
    // Extract token from request headers
    const token = req.headers.authorization;

    // Check if token is provided
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }
        // Attach user information to request object
        req.user = decoded;
        next();
    });
};

// Middleware to check if user has owner role
exports.checkOwnerRole = (req, res, next) => {
    // Check if user has owner role
    if (req.user.role !== 'owner') {
        return res.status(403).json({ message: 'You are not authorized' });
    }
    next();
};
