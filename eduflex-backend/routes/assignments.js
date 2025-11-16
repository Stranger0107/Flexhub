const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  createAssignment,
  getAssignmentsForCourse,
  getAssignmentById,
  deleteAssignment,
} = require('../controllers/assignmentController');

// All routes need authentication
router.use(authenticate);

// ===============================
// POST /api/assignments
// Create assignment + upload file
// ===============================
router.post(
  '/',
  authorize('professor', 'admin'),

  // ⭐ FIX: Pass courseId BEFORE multer runs
  (req, res, next) => {
    req.uploadType = 'assignments';

    // Read courseId from HEADER, not body
    const courseId = req.headers['x-course-id'];

    if (courseId) {
      req.query.courseId = courseId;  // multer will use this
    }

    next();
  },

  upload.single('file'),   // field name MUST be "file"
  createAssignment
);

// ===============================
// GET /api/assignments/course/:courseId
// ===============================
router.get('/course/:courseId', getAssignmentsForCourse);

// ===============================
// GET /api/assignments/:id
// ===============================
router.get('/:id', getAssignmentById);

// ===============================
// DELETE /api/assignments/:id
// ===============================
router.delete('/:id', authorize('professor', 'admin'), deleteAssignment);

module.exports = router;
