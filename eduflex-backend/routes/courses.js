const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware.js');
const {
  createCourse,
  getAllCourses,
  getCourseById,      // ✅ include this line
  enrollStudent,
  unenrollStudent,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

// ✅ Require authentication for all routes
router.use(authenticate);

// ================================
// 📘 COURSE MANAGEMENT ROUTES
// ================================

// Create Course (Professor or Admin)
router.post('/', authorize('professor', 'admin'), createCourse);

// Get All Courses (Any logged-in user)
router.get('/', getAllCourses);

// Update Course (Professor who owns it or Admin)
router.put('/:id', authorize('professor', 'admin'), updateCourse);

// Delete Course (Professor who owns it or Admin)
router.delete('/:id', authorize('professor', 'admin'), deleteCourse);

// ================================
// 🎓 ENROLLMENT ROUTES
// ================================

// Enroll a Student (Student self, or Professor/Admin)
router.post('/:id/enroll', authorize('student', 'professor', 'admin'), enrollStudent);

// Unenroll a Student (Student self, or Professor/Admin)
router.post('/:id/unenroll', authorize('student', 'professor', 'admin'), unenrollStudent);

router.get('/:id', getCourseById);


// ================================
// Export Router
// ================================
module.exports = router;
