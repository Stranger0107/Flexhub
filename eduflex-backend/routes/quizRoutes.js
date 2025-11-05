const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { createQuiz, getQuizzesForCourse } = require('../controllers/quizController');

router.use(authenticate);

// Professors and admins can create
router.post('/', authorize('professor', 'admin'), createQuiz);

// Everyone enrolled in the course (student/professor/admin) can view
router.get('/course/:courseId', getQuizzesForCourse);

module.exports = router;
