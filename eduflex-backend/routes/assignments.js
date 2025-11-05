// eduflex-backend/routes/assignments.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { createAssignment, getAssignmentsForCourse } = require('../controllers/assignmentController');

router.use(authenticate);

// professor creates assignment
router.post('/', authorize('professor'), createAssignment);

// get all assignments for a specific course
router.get('/course/:courseId', getAssignmentsForCourse);

module.exports = router;
