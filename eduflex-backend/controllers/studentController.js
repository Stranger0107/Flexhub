// controllers/studentController.js
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');

const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user.id })
      .populate('professor', 'name email')
      .select('title description professor');

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
};

const getCourseAssignments = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (!course.students.map(s => s.toString()).includes(req.user.id))
      return res.status(403).json({ message: 'You are not enrolled in this course' });

    const assignments = await Assignment.find({ course: req.params.courseId })
      .select('title description dueDate submissions');

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching assignments' });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const { submission } = req.body;

    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const course = await Course.findById(assignment.course);

    if (!course.students.map(s => s.toString()).includes(req.user.id))
      return res.status(403).json({ message: 'Not enrolled in this course' });

    const existing = assignment.submissions.find(s => s.student.toString() === req.user.id);

    if (existing) {
      existing.submission = submission;
      existing.submittedAt = Date.now();
    } else {
      assignment.submissions.push({
        student: req.user.id,
        submission,
        submittedAt: Date.now()
      });
    }

    await assignment.save();
    res.json({ message: 'Submission successful', assignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error submitting assignment' });
  }
};

const getMyGrades = async (req, res) => {
  try {
    const assignments = await Assignment.find({ 'submissions.student': req.user.id })
      .populate('course', 'title');

    const grades = assignments.map(a => {
      const studentSubmission = a.submissions.find(s => s.student.toString() === req.user.id);
      return {
        assignmentId: a._id,
        assignmentTitle: a.title,
        course: a.course.title,
        grade: studentSubmission?.grade ?? null,
        submitted: !!studentSubmission?.submission,
        feedback: studentSubmission?.feedback ?? null
      };
    });

    res.json(grades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching grades' });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('professor', 'name email')
      .select('title description professor');

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching course list' });
  }
};

const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.students.map(s => s.toString()).includes(req.user.id))
      return res.status(400).json({ message: 'Already enrolled in this course' });

    course.students.push(req.user.id);
    await course.save();

    res.json({ message: 'Successfully enrolled', course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error enrolling in course' });
  }
};

module.exports = {
  getMyCourses,
  getCourseAssignments,
  submitAssignment,
  getMyGrades,
  getAllCourses,
  enrollInCourse
};
