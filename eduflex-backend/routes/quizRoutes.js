// eduflex-backend/routes/quizzes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  createQuiz,
  getQuizzesForCourse,
  getQuizById,
  submitQuiz,
} = require('../controllers/quizController');

router.use(authenticate);

// Professor/Admin creates quiz
router.post('/', authorize('professor', 'admin'), createQuiz);

// Get all quizzes for a specific course
router.get('/course/:courseId', getQuizzesForCourse);

// Get a single quiz by ID
router.get('/:quizId', getQuizById);

// Student submits quiz
router.post('/:quizId/submit', authorize('student'), submitQuiz);

module.exports = router;
