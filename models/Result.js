const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    answers: [Number], // array of selected option indexes e.g [0, 2, 1, 3]
    score: {
        type: Number,
        required: true // number of correct answers
    },
    total: {
        type: Number,
        required: true // total number of questions
    },
    percentage: {
        type: Number, // score / total * 100
        required: true
    },
    timeTaken: {
        type: Number, // seconds the staff spent on the exam
    },
    passed: {
        type: Boolean // we'll calculate this: percentage >= 50
    }
}, {
    timestamps: true
}); // createdAt = when they submitted

// Prevent a staff from taking the same exam twice
resultSchema.index({
    user: 1,
    exam: 1
}, {
    unique: true
});

module.exports = mongoose.model('Result', resultSchema);