const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token = req.cookies.jwt;

        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).render('auth/login', {
                title: 'Login',
                message: null,
                error: 'Please login to continue'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        // ✅ Check user exists BEFORE assigning to req/res.locals
        if (!user) {
            res.clearCookie('jwt');
            return res.status(401).render('auth/login', {
                title: 'Login',
                message: null,
                error: 'User no longer exists'
            });
        }

        req.user = user;
        res.locals.user = user;

        next();
    } catch (err) {
        res.clearCookie('jwt'); // ✅ Clear bad/expired cookie so it stops being sent
        return res.status(401).render('auth/login', {
            title: 'Login',
            message: null,
            error: 'Token invalid or expired'
        });
    }
};

const adminOnly = (req, res, next) => {
    // ✅ Guard against req.user being missing (e.g. middleware order mistake)
    if (!req.user || req.user.role !== 'admin') {
        console.log('User role:', req.user ?.role);
        return res.status(403).render('errors/403', {
            title: 'Forbidden',
            message: null,
            error: 'This resource is restricted to admins only'
        });
    }
    next();
};

// ✅ Render a proper error page, not the login page
const handleError = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('errors/500', {
        title: 'Server Error',
        message: null,
        error: 'Something went wrong!'
    });
};

module.exports = {
    protect,
    adminOnly,
    handleError
};




// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const protect = async (req, res, next) => {
//     try {
//         // 1. Check Cookies FIRST (for browser/EJS), then Headers (for API)
//         let token = req.cookies.jwt;

//         if (!token && req.headers.authorization?.startsWith('Bearer')) {
//             token = req.headers.authorization.split(' ')[1];
//         }

//         if (!token) {
//             return res.status(401).render('auth/login', {
//                 title: 'Login',
//                 message: null,
//                 error: 'Please login to continue'
//             });
//         }

//         // 2. Verify & Find User
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // We attach the user to req and res.locals for EJS access
//         req.user = await User.findById(decoded.id).select('-password');
//         res.locals.user = req.user; // Makes <%= user %> available in all templates

//         if (!req.user) {
//             return res.status(401).render('auth/login', {
//                 title: 'Login',
//                 message: null,
//                 error: 'User no longer exists'
//             });
//         }

//         next();
//     } catch (err) {
//         return res.status(401).render('auth/login', {
//             title: 'Login',
//             message: null,
//             error: 'Token invalid or expired'
//         });
//     }
// };
// const adminOnly = (req, res, next) => {
//         if (req.user.role !== 'admin') {
//         console.log('User role:' + req.user.role);
//         return res.status(403).render('auth/login', {
//             title: 'Login',
//             message: null,
//             error: 'This resource is restricted to admins only'
//         });
//     }
//     next();
// };

// const handleError = (err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).render('auth/login', {
//         title: 'Login',
//         message: null,
//         error: 'Something went wrong!'
//     });
// };

// module.exports = {
//     protect,
//     adminOnly,
//     handleError
// };