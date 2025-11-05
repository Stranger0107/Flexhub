const Course = require('../models/Course');
const Assignment = require('../models/Assignment');

// @desc    Get all courses a student is enrolled in
// @route   GET /api/student/courses
// @access  Private (Student)
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user.id });
    res.json(courses);
  } catch (error) {
    console.error('Error in getMyCourses:', error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
};

// @desc    Get all assignments for a specific course
// @route   GET /api/student/assignments/:courseId
// @access  Private (Student)
const getCourseAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId });
    res.json(assignments);
  } catch (error) {
    console.error('Error in getCourseAssignments:', error);
    res.status(500).json({ message: 'Server error fetching assignments' });
  }
};

// @desc    Submit work for an assignment
// @route   POST /api/student/assignments/:assignmentId/submit
// @access  Private (Student)
const submitAssignment = async (req, res) => {
  try {
    const { submission } = req.body; // e.g., file URL or text
    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is enrolled in the course
    const course = await Course.findById(assignment.course);
    if (!course.students.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Add or update submission
    const existingIndex = assignment.submissions.findIndex((s) =>
      s.student.equals(req.user.id)
    );

    if (existingIndex !== -1) {
      // Update submission
      assignment.submissions[existingIndex].submission = submission;
      assignment.submissions[existingIndex].submittedAt = Date.now();
    } else {
      // New submission
      assignment.submissions.push({
        student: req.user.id,
        submission,
        submittedAt: Date.now(),
      });
    }

    await assignment.save();
    res.json({ message: 'Submission saved successfully', assignment });
  } catch (error) {
    console.error('Error in submitAssignment:', error);
    res.status(500).json({ message: 'Server error saving submission' });
  }
};

// @desc    View all my grades
// @route   GET /api/student/grades
// @access  Private (Student)
const getMyGrades = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      'submissions.student': req.user.id,
    }).populate('course', 'title');

    const grades = assignments.map((a) => {
      const sub = a.submissions.find((s) => s.student.equals(req.user.id));
      return {
        assignmentId: a._id,
        assignmentTitle: a.title,
        course: a.course?.title || 'Untitled Course',
        grade: sub.grade ?? null,
        submitted: Boolean(sub.submission),
      };
    });

    res.json(grades);
  } catch (error) {
    console.error('Error in getMyGrades:', error);
    res.status(500).json({ message: 'Server error fetching grades' });
  }
};

// @desc    Get student dashboard stats
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch all courses student is enrolled in
    const courses = await Course.find({ students: studentId });

    // Fetch assignments from those courses
    const assignments = await Assignment.find({
      course: { $in: courses.map((c) => c._id) },
    });

    // Count pending assignments
    const pendingAssignments = assignments.filter(
      (a) => !a.submissions.some((s) => String(s.student) === studentId)
    ).length;

    // Calculate average grade
    const allGrades = assignments.flatMap((a) =>
      a.submissions
        .filter(
          (s) => String(s.student) === studentId && s.grade != null
        )
        .map((s) => s.grade)
    );

    const averageGrade =
      allGrades.length > 0
        ? (allGrades.reduce((sum, g) => sum + g, 0) / allGrades.length).toFixed(2)
        : 0;

    res.json({
      totalCourses: courses.length,
      pendingAssignments,
      averageGrade,
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({ message: 'Server error fetching dashboard' });
  }
};

module.exports = {
  getMyCourses,
  getCourseAssignments,
  submitAssignment,
  getMyGrades,
  getStudentDashboard, // ✅ must be exported
};