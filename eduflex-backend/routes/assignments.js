const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  createAssignment,
  getAssignmentsForCourse,
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

  // ⭐ Ensure multer knows the upload folder
  (req, res, next) => {
    req.uploadType = 'assignments';

    // ⭐ FIX: Make courseId available to multer BEFORE file upload
    if (req.body.courseId) {
      req.query.courseId = req.body.courseId;
    }

    next();
  },

  upload.single('file'),   // expects FormData field name = "file"
  createAssignment
);

// ===============================
// GET /api/assignments/course/:courseId
// Get all assignments for a given course
// ===============================
router.get('/course/:courseId', getAssignmentsForCourse);

module.exports = router;
