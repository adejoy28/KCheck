const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Question text is required']
    },
    options: {
        type: [String], // array of 4 option strings
        validate: {
            validator: (arr) => arr.length >= 2,
            message: 'At least 2 options are required'
        }
    },
    correctAnswer: {
        type: Number, // index of the correct option (0, 1, 2, or 3)
        required: true
    }
});

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Exam title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    duration: {
        type: Number, // duration in minutes
        required: [true, 'Duration is required'],
        min: 1
    },
    questions: [questionSchema], // embedded questions array
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // reference to the admin who created it
        required: true
    },
    isActive: {
        type: Boolean,
        default: true // admin can deactivate exams
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Exam', examSchema);