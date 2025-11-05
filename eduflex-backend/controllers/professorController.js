// eduflex-backend/controllers/professorController.js
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');

// ============================
// ✅ Professor Dashboard
// ============================
exports.getProfessorDashboard = async (req, res) => {
  try {
    const courses = await Course.find({ professor: req.user.id });
    const assignments = await Assignment.find({
      course: { $in: courses.map(c => c._id) },
    });

    res.json({
      totalCourses: courses.length,
      totalAssignments: assignments.length,
    });
  } catch (error) {
    console.error('Error in getProfessorDashboard:', error);
    res.status(500).json({ error: 'Server error loading dashboard' });
  }
};

// ============================
// ✅ Get All My Courses
// ============================
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ professor: req.user.id });
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Server error fetching courses' });
  }
};

// ============================
// ✅ Get Specific Course
// ============================
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (String(course.professor) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json(course);
  } catch (err) {
    console.error('Error fetching course:', err);
    res.status(500).json({ error: 'Server error fetching course' });
  }
};

// ============================
// ✅ Create a Course
// ============================
exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newCourse = new Course({
      title,
      description,
      professor: req.user.id,
    });
    const saved = await newCourse.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ error: 'Server error creating course' });
  }
};

// ============================
// ✅ Update Course
// ============================
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (String(course.professor) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(course, req.body);
    const updated = await course.save();
    res.json(updated);
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ error: 'Server error updating course' });
  }
};

// ============================
// ✅ Delete Course
// ============================
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (String(course.professor) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await course.deleteOne();
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Server error deleting course' });
  }
};

// ============================
// ✅ Get Professor Assignments
// ============================
exports.getMyAssignments = async (req, res) => {
  try {
    const courses = await Course.find({ professor: req.user.id });
    const assignments = await Assignment.find({
      course: { $in: courses.map(c => c._id) },
    });
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Server error fetching assignments' });
  }
};

// ============================
// ✅ Grade an Assignment
// ============================
exports.gradeAssignment = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    const submission = assignment.submissions.find(
      (s) => String(s.student) === String(req.body.studentId)
    );
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    submission.grade = grade;
    submission.feedback = feedback;
    await assignment.save();

    res.json({ message: 'Grade updated successfully' });
  } catch (err) {
    console.error('Error grading assignment:', err);
    res.status(500).json({ error: 'Server error grading assignment' });
  }
};

// ============================
// ✅ Update Professor Profile (Permanent)
// ============================
exports.updateProfessorProfile = async (req, res) => {
  try {
    const { name, department, email } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Professor not found' });

    if (name) user.name = name;
    if (department) user.department = department;
    if (email) user.email = email;

    const updatedUser = await user.save();
    const safeUser = updatedUser.toObject();
    delete safeUser.password;

    res.json(safeUser);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
};
