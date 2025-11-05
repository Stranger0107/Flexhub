// eduflex-backend/controllers/professorController.js
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');

// Dashboard
const getProfessorDashboard = async (req, res) => {
  try {
    const courses = await Course.find({ professor: req.user.id }).populate('students', 'name');
    const assignments = await Assignment.find({ course: { $in: courses.map(c => c._id) } }).populate('course', 'title');
    res.json({ courses, assignments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// My Courses
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ professor: req.user.id }).populate('students', 'name email');
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// My Assignments
const getMyAssignments = async (req, res) => {
  try {
    const courses = await Course.find({ professor: req.user.id }).select('_id');
    const courseIds = courses.map(c => c._id);
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title')
      .populate('submissions.student', 'name');
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Single Course
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      professor: req.user.id
    }).populate('students', 'name email');
    
    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Grade Assignment
const gradeAssignment = async (req, res) => {
  try {
    const { studentId, grade, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const submission = assignment.submissions.find(
      (sub) => sub.student.toString() === studentId
    );

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedAt = Date.now();
    await assignment.save();

    res.json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Profile
const updateProfessorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    const updatedUser = await user.save();
    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create Course
const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description)
      return res.status(400).json({ message: 'Title and description are required' });

    const newCourse = new Course({
      title,
      description,
      professor: req.user.id
    });

    const createdCourse = await newCourse.save();
    res.status(201).json(createdCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating course' });
  }
};

// Update Course
const updateCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.professor.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    course.title = title || course.title;
    course.description = description || course.description;

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating course' });
  }
};

// Delete Course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.professor.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    await Assignment.deleteMany({ course: course._id });
    await course.deleteOne();
    
    res.json({ message: 'Course and related assignments deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting course' });
  }
};

module.exports = {
  getProfessorDashboard,
  getMyCourses,
  getMyAssignments,
  getCourseById,
  gradeAssignment,
  updateProfessorProfile,
  createCourse,
  updateCourse,
  deleteCourse
};
