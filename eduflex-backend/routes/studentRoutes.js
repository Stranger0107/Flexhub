// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware.js');

const {
  getMyCourses,
  getAllCourses,
  enrollInCourse,
  getCourseAssignments,
  submitAssignment,
  getMyGrades
} = require('../controllers/studentController.js');

// Require student auth
router.use(authenticate);
router.use(authorize('student'));

// Student enrolled courses
router.get('/courses', getMyCourses);

// Browse all available courses (not limited to enrolled)
router.get('/courses/all', getAllCourses);

// Enroll student in a course
router.post('/courses/:id/enroll', enrollInCourse);

// Assignments routes
router.get('/assignments/:courseId', getCourseAssignments);
router.post('/assignments/:assignmentId/submit', submitAssignment);

// Grades
router.get('/grades', getMyGrades);

module.exports = router;