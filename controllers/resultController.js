const Result = require('../models/Result');
const Exam = require('../models/Exam');

// @route  POST /api/exams/:id/submit
// @access Staff only
const submitExam = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    // answers = [2, 0, 1, 3, ...] — array of selected option indexes
    // timeTaken = seconds spent on exam (sent from frontend timer)

    // 1. Check if staff already took this exam
    const alreadyTaken = await Result.findOne({
      user: req.user._id,
      exam: req.params.id
    });
    if (alreadyTaken) {
      return res.status(400).json({ message: 'You have already taken this exam' });
    }

    // 2. Fetch the exam WITH correct answers (no .select() exclusion here)
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    if (!exam.isActive) {
      return res.status(403).json({ message: 'This exam is no longer active' });
    }

    // 3. Validate answers array
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers must be an array' });
    }

    // 4. Score the exam — compare submitted answers to correct answers
    const total = exam.questions.length;
    let score = 0;
    const gradedAnswers = exam.questions.map((question, index) => {
      const submitted = answers[index];           // what the staff chose
      const correct = question.correctAnswer;     // what the right answer is
      const isCorrect = submitted === correct;
      if (isCorrect) score++;

      return {
        questionText: question.text,
        options: question.options,
        submitted,                  // staff's choice index
        correct,                    // correct index
        isCorrect
      };
    });

    // 5. Calculate percentage and pass/fail
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 50;

    // 6. Save result to DB
    const result = await Result.create({
      user: req.user._id,
      exam: req.params.id,
      answers,
      score,
      total,
      percentage,
      timeTaken,
      passed
    });

    // 7. Respond with full breakdown
    res.status(201).json({
      message: passed ? '🎉 Congratulations, you passed!' : 'You did not pass. Keep studying!',
      result: {
        id: result._id,
        score,
        total,
        percentage,
        passed,
        timeTaken,
        gradedAnswers  // full breakdown of each question
      }
    });
  } catch (err) {
    // Handle the unique index violation (duplicate submission attempt)
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already taken this exam' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route  GET /api/results/me
// @access Staff
const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ user: req.user._id })
      .populate('exam', 'title description duration') // get exam title etc
      .sort({ createdAt: -1 }); // newest first

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route  GET /api/results/:id
// @access Staff (own result only) + Admin
const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('exam', 'title description duration questions')
      .populate('user', 'name email');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Staff can only view their own results
    const isOwner = result.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Rebuild graded answers so staff can review what they got right/wrong
    const gradedAnswers = result.exam.questions.map((question, index) => {
      const submitted = result.answers[index];
      const correct = question.correctAnswer;
      return {
        questionText: question.text,
        options: question.options,
        submitted,
        correct,
        isCorrect: submitted === correct
      };
    });

    res.json({ ...result.toObject(), gradedAnswers });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route  GET /api/results
// @access Admin only
const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('user', 'name email')
      .populate('exam', 'title')
      .sort({ createdAt: -1 });

    // Build summary stats for admin dashboard
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;
    const avgScore = total
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / total)
      : 0;

    res.json({
      stats: { total, passed, failed, avgScore },
      results
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { submitExam, getMyResults, getResultById, getAllResults };