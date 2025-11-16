const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  createAssignment,
  getAssignmentsForCourse,
  getAssignmentById, // <-- Added this
  deleteAssignment, // <-- Added this
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

  upload.single('file'), // expects FormData field name = "file"
  createAssignment
);

// ===============================
// GET /api/assignments/course/:courseId
// Get all assignments for a given course
// ===============================
router.get('/course/:courseId', getAssignmentsForCourse);

// ===============================
// GET /api/assignments/:id
// Get a single assignment by its ID
// =Labels:
// ===============================
router.get(
  '/:id',
  authenticate, // Auth is already applied by router.use(), but explicit is fine
  getAssignmentById
);

// ===============================
// DELETE /api/assignments/:id
// Delete an assignment
// ===============================
router.delete(
  '/:id',
  authorize('professor', 'admin'), // Only profs/admins can delete
  deleteAssignment
);

module.exports = router;