const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig'); // ✅ Multer setup
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  createAssignment,
  getAssignmentsForCourse,
} = require('../controllers/assignmentController');

// ✅ All routes require authentication
router.use(authenticate);

// ✅ Create a new assignment (professor or admin only)
// Supports file upload like PDFs, DOCs, etc.
router.post(
  '/',
  authorize('professor', 'admin'),
  (req, res, next) => {
    req.uploadType = 'assignments'; // tells multer to store in uploads/assignments/
    next();
  },
  upload.single('file'), // expecting a "file" field in FormData
  createAssignment
);

// ✅ Get all assignments for a specific course (for students, professors, admins)
router.get('/course/:courseId', getAssignmentsForCourse);

module.exports = router;
