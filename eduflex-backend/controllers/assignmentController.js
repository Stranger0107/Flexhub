// eduflex-backend/controllers/assignmentController.js
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private (Professor)
const createAssignment = async (req, res) => {
  try {
    const { title, description, course, dueDate } = req.body;

    const courseObj = await Course.findById(course);
    if (!courseObj) return res.status(404).json({ message: 'Course not found' });

    // Ensure only the professor who owns this course can add assignments
    if (String(courseObj.professor) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only create assignments for your own courses' });
    }

    const assignment = new Assignment({
      title,
      description,
      course,
      dueDate,
      submissions: [],
    });

    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ message: 'Server error creating assignment' });
  }
};

// @desc    Get all assignments for a specific course
// @route   GET /api/assignments/course/:courseId
// @access  Private
const getAssignmentsForCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId });
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ message: 'Server error fetching assignments' });
  }
};

module.exports = {
  createAssignment,
  getAssignmentsForCourse,
};
