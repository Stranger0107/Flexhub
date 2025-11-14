const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const {
  getProfessorDashboard,
  getMyCourses,
  getMyAssignments,
  getCourseById,
  gradeAssignment,
  updateProfessorProfile,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadStudyMaterial,
} = require('../controllers/professorController');

const { authenticate, authorize } = require('../middleware/authMiddleware.js');

// Protect all routes — only for professors
router.use(authenticate);
router.use(authorize('professor'));

// --- Dashboard ---
router.get('/dashboard', getProfessorDashboard);

// --- Profile ---
router.put('/profile', updateProfessorProfile);

// --- Courses ---
router.get('/courses', getMyCourses);
router.post('/courses', createCourse);
router.get('/courses/:id', getCourseById);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// ✅ Added 'upload.single' middleware here
router.post('/courses/:id/materials', upload.single('file'), uploadStudyMaterial);

// --- Assignments ---
router.get('/assignments', getMyAssignments);
router.post('/assignments/:id/grade', gradeAssignment);

module.exports = router;