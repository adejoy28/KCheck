const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const util = require('../utilities');



router.get('/login', util.handleErrors(authController.buildLogin));

router.post('/login', authController.accountLogin);

router.get('/register', 
    authMiddleware.protect, 
    util.handleErrors(authController.buildRegister)); // only logged-in admins can create accounts


router.post('/register', 
    authMiddleware.protect, 
    authMiddleware.adminOnly, 
    util.handleErrors(authController.register)); // only logged-in admins can create accounts

router.get('/me', 
    authMiddleware.protect, 
    util.handleErrors(authController.getMe));
    
router.get('/users', 
    authMiddleware.protect, 
    authMiddleware.adminOnly, 
    util.handleErrors(authController.getUsers));

router.get('/logout', authController.accountLogout);

module.exports = router;