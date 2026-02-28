const Exam = require('../models/Exam');

// @route  POST /api/exams
// @access Admin only
const createExam = async (req, res) => {
    try {
        const {
            title,
            description,
            duration,
            questions
        } = req.body;

        // Basic validation
        if (!questions || questions.length < 1) {
            return res.status(400).json({
                message: 'Exam must have at least one question'
            });
        }

        const exam = await Exam.create({
            title,
            description,
            duration,
            questions,
            createdBy: req.user._id // comes from protect middleware
        });

        res.status(201).json({
            message: 'Exam created successfully',
            exam
        });
    } catch (err) {
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
};

// @route  GET /api/exams
// @access Staff + Admin
const getExams = async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : {
            isActive: true
        };

        // Admins see all exams. Staff only see active ones.
        const exams = await Exam.find(filter)
            .populate('createdBy', 'name email') // replace ObjectId with name & email
            .select('-questions.correctAnswer') // NEVER send correct answers to client
            .sort({
                createdAt: -1
            });

        res.json(exams);
    } catch (err) {
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
};

// @route  GET /api/exams/:id
// @access Staff + Admin
const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('createdBy', 'name')
            .select('-questions.correctAnswer'); // strip correct answers

        if (!exam) {
            return res.status(404).json({
                message: 'Exam not found'
            });
        }

        // Staff can't access inactive exams
        if (!exam.isActive && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'This exam is not available'
            });
        }

        res.json(exam);
    } catch (err) {
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
};

// @route  PUT /api/exams/:id
// @access Admin only
const updateExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            req.body, {
                new: true,
                runValidators: true
            } // return updated doc & run schema validators
        );

        if (!exam) {
            return res.status(404).json({
                message: 'Exam not found'
            });
        }

        res.json({
            message: 'Exam updated',
            exam
        });
    } catch (err) {
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
};

// @route  PATCH /api/exams/:id/toggle
// @access Admin only
const toggleExamStatus = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({
                message: 'Exam not found'
            });
        }

        exam.isActive = !exam.isActive;
        await exam.save();

        res.json({
            message: `Exam ${exam.isActive ? 'activated' : 'deactivated'}`,
            isActive: exam.isActive
        });
    } catch (err) {
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
};

// @route  DELETE /api/exams/:id
// @access Admin only
const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);
        if (!exam) {
            return res.status(404).json({
                message: 'Exam not found'
            });
        }

        res.json({
            message: 'Exam deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
};

module.exports = {
    createExam,
    getExams,
    getExamById,
    updateExam,
    toggleExamStatus,
    deleteExam
};