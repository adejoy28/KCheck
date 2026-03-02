const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

/* ****************************************
 *  Deliver Register View
 * ************************************ */
const buildRegister = async (req, res) => {
    res.render('auth/register', {
        title: 'Register',
        message: null,
        error: null
    });
};

/* ****************************************
 *  Process login request
 * ************************************ */
const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            email
        });
        if (existingUser) {
            return res.status(400).json({
                message: 'Email already registered'
            });
        }

        // Create user — password gets hashed automatically via pre('save') hook
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        res.status(201).json({
            message: 'Staff account created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
};

/* ****************************************
 *  Deliver login View
 * ************************************ */
const buildLogin = async (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        message: null,
        error: null
    });
};

/* ****************************************
 *  Process login request
 * ************************************ */
const accountLogin = async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body;

        console.log("Login attempt:", {
            username,
            password,
        });

        // 1. Basic validation
        if (!username || !password) {
            return res.status(400).render("auth/login", {
                title: 'Login',
                message: null,
                error: 'Username and password are required'
            });
        }

        // 2. Find user by email
        const user = await User.findOne({
            username
        });
        if (!user) {
            return res.status(401).render("auth/login", {
                title: 'Login',
                message: null,
                error: 'Invalid username or password'
            });
        }

        // 3. Compare password using our model method
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).render("auth/login", {
                title: 'Login',
                message: null,
                error: 'Invalid username or password'
            });
        }

        // 4. Generate token and respond
        const token = generateToken(user._id);

        // Set JWT cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Store user session
        req.session.user = {
            id: user._id,
            name: user.name,
            username: user.username,
            role: user.role
        };

        res.redirect("/");
        console.log("Login successful:", {
            userId: user._id,
            username: user.username,
            role: user.role
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).render("auth/login", {
            title: 'Login',
            message: null,
            error: 'Server error'
        });
    }
};


/* ****************************************
 *  Deliver profile View
 * ************************************ */
const getMe = async (req, res) => {
    // req.user is already attached by protect middleware
    res.json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
    });
};

// @route  GET /api/auth/users
// @access Protected (admin only)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
};


/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
    // Clear JWT cookie
    res.clearCookie("jwt");
    
    // Clear session
    req.session.destroy();
    
    res.render("auth/login", {
        title: 'Login',
        message: 'You have been successfully logged out.',
        error: null
    })
}


module.exports = {
    buildLogin,
    buildRegister,
    register,
    accountLogin,
    getMe,
    getUsers,
    accountLogout
};