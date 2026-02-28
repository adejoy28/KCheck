const express = require('express');
const router = express.Router();
const {
    submitExam,
    getMyResults,
    getResultById,
    getAllResults
} = require('../controllers/resultController');
const {
    protect,
    adminOnly
} = require('../middleware/auth');

router.use(protect);

router.get('/', adminOnly, getAllResults); // admin sees all results + stats
router.get('/me', getMyResults); // staff sees their own history
router.get('/:id', getResultById); // staff/admin sees one result detail

module.exports = router;