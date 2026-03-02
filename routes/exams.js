
const express = require('express');
const router = express.Router();
const {
    createExam,
    getExams,
    getExamById,
    updateExam,
    toggleExamStatus,
    deleteExam
} = require('../controllers/examController');
const {
    protect,
    adminOnly
} = require('../middleware/auth');
const util = require('../utilities');
const {
    submitExam
} = require('../controllers/resultController');


router.get('/', util.handleErrors(getExams)); // staff + admin
router.get('/:id', util.handleErrors(getExamById)); // staff + admin
router.post('/', adminOnly, util.handleErrors(createExam)); // admin only
router.put('/:id', adminOnly, util.handleErrors(updateExam)); // admin only
router.patch('/:id/toggle', adminOnly, util.handleErrors(toggleExamStatus)); // admin only
router.delete('/:id', adminOnly, util.handleErrors(deleteExam)); // admin only

router.post('/:id/submit', submitExam); // already protected by router.use(protect)

module.exports = router;