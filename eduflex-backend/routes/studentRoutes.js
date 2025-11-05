const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware.js');
const {
  getMyCourses,
  getCourseAssignments,
  submitAssignment,
  getMyGrades,
  getStudentDashboard
} = require('../controllers/studentController.js');

router.use(authenticate);
router.use(authorize('student'));

router.get('/courses', getMyCourses);
router.get('/assignments/:courseId', getCourseAssignments);
router.post('/assignments/:assignmentId/submit', submitAssignment);
router.get('/grades', getMyGrades);
router.get('/dashboard', getStudentDashboard); // ✅ THIS IS ESSENTIAL

module.exports = router;
