const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        // 1. Check if token exists in headers
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).render('auth/login', {
                title: 'Login',
                message: 'Please login to continue',
                error: null
            });
        }

        // 2. Extract token (header looks like: "Bearer eyJhbGci...")
        const token = authHeader.split(' ')[1];

        // 3. Verify token — throws error if expired or tampered
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Find the user and attach to request object
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({
                message: 'User no longer exists'
            });
        }

        next(); // ✅ token is valid, move to the route handler
    } catch (err) {
        return res.status(401).json({
            message: 'Token invalid or expired'
        });
    }
};

// Restrict route to admins only — use AFTER protect
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'This resource is restricted to admins only'
        });
    }
    next();
};

const handleError = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
};

module.exports = {
    protect,
    adminOnly,
    handleError
};