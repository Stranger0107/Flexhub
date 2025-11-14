const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const path = require('path');

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
// @route   POST /api/student/assignments/:id/submit
// @access  Private (Student)
const submitAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id; // Matches route /assignments/:id/submit
    console.log(`📝 [Controller] Submit called. Assignment: ${assignmentId}, User: ${req.user.id}`);
    
    // Debug Logs
    if (req.file) console.log(`📂 [Controller] File received: ${req.file.filename}`);
    else console.log(`⚠️ [Controller] No file in req.file`);
    
    const body = req.body || {};
    let submissionContent = null;

    // 1. Handle File
    if (req.file) {
      // Construct URL path relative to project root
      // We saved to: uploads/submissions/:id/filename
      submissionContent = `/uploads/submissions/${assignmentId}/${req.file.filename}`;
    } 
    // 2. Handle Text
    else {
      submissionContent = body.submission || body.textSubmission || body.text;
    }

    if (!submissionContent) {
      console.error("❌ [Controller] No content. Body:", body);
      return res.status(400).json({ message: 'No submission content provided (file or text).' });
    }

    // Find Assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Find Course & Check Enrollment
    const course = await Course.findById(assignment.course);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const userId = req.user.id || req.user._id;
    const isEnrolled = course.students.some(id => id.toString() === userId.toString());

    if (!isEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Update Submission Array
    const existingIndex = assignment.submissions.findIndex(s => s.student.toString() === userId.toString());

    if (existingIndex !== -1) {
      assignment.submissions[existingIndex].submission = submissionContent;
      assignment.submissions[existingIndex].submittedAt = Date.now();
    } else {
      assignment.submissions.push({
        student: userId,
        submission: submissionContent,
        submittedAt: Date.now(),
      });
    }

    await assignment.save();
    console.log("✅ [Controller] Saved successfully.");
    res.json({ message: 'Assignment submitted successfully', assignment });

  } catch (error) {
    console.error('🔥 Error in submitAssignment:', error);
    res.status(500).json({ message: 'Server error saving submission', error: error.message });
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

    const courses = await Course.find({ students: studentId });
    const assignments = await Assignment.find({
      course: { $in: courses.map((c) => c._id) },
    });

    const pendingAssignments = assignments.filter(
      (a) => !a.submissions.some((s) => String(s.student) === studentId)
    ).length;

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

// @desc    Get all assignments from enrolled courses
// @route   GET /api/student/assignments
// @access  Private (Student)
const getMyAssignments = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrolledCourses = await Course.find({ students: studentId }).select('_id');

    if (enrolledCourses.length === 0) {
      return res.status(200).json([]);
    }

    const assignments = await Assignment.find({
      course: { $in: enrolledCourses.map(c => c._id) },
    })
      .populate('course', 'title')
      .sort({ dueDate: 1 })
      .lean();

    const processedAssignments = assignments.map(a => {
        const mySubmission = a.submissions ? a.submissions.find(s => String(s.student) === String(studentId)) : null;
        let status = 'pending';
        let grade = null;
        let submission = null;

        if (mySubmission) {
            submission = mySubmission.submission;
            if (mySubmission.grade !== undefined && mySubmission.grade !== null) {
                status = 'graded';
                grade = mySubmission.grade;
            } else {
                status = 'submitted';
            }
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        if (a.attachmentUrl && !a.attachmentUrl.startsWith('http')) {
            a.attachmentUrl = `${baseUrl}${a.attachmentUrl}`;
        }

        return {
            assignmentId: a._id,
            title: a.title,
            description: a.description,
            course: a.course ? a.course.title : 'Unknown Course',
            courseId: a.course ? a.course._id : null,
            due: a.dueDate,
            attachmentUrl: a.attachmentUrl,
            status,
            grade,
            submission
        };
    });

    res.json(processedAssignments);
  } catch (error) {
    console.error('Error in getMyAssignments:', error);
    res.status(500).json({ message: 'Server error fetching assignments' });
  }
};


module.exports = {
  getMyCourses,
  getCourseAssignments,
  submitAssignment,
  getMyGrades,
  getStudentDashboard,
  getMyAssignments
};