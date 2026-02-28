const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const util = require('../utilities');



router.get('/login', util.handleErrors(authController.buildLogin));

router.post('/login', authController.accountLogin);

router.post('/register', 
    authMiddleware.protect, 
    authMiddleware.adminOnly, 
    util.handleErrors(authController.buildRegister)); // only logged-in admins can create accounts

router.get('/me', 
    authMiddleware.protect, 
    util.handleErrors(authController.buildGetMe));
    
router.get('/users', 
    authMiddleware.protect, 
    authMiddleware.adminOnly, 
    util.handleErrors(authController.buildGetUsers));

router.get('/logout', authController.accountLogout);

module.exports = router;