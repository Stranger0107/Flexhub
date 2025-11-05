const Course = require('../models/Course');
const User = require('../models/User'); // Needed for checking roles/existence

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Admin, Professor)
const createCourse = async (req, res) => {
  try {
    const { title, description, professor: professorIdFromBody } = req.body;

    let professorId;

    if (req.user.role === 'professor') {
      // Professor creates their own course
      professorId = req.user.id;
    } else if (req.user.role === 'admin' && professorIdFromBody) {
      // Admin assigns professor
      const assignedProfessor = await User.findById(professorIdFromBody);
      if (!assignedProfessor || assignedProfessor.role !== 'professor') {
        return res.status(400).json({ message: 'Invalid professor ID provided' });
      }
      professorId = professorIdFromBody;
    } else if (req.user.role === 'admin' && !professorIdFromBody) {
      return res.status(400).json({ message: 'Admin must assign a professor ID when creating a course' });
    } else {
      return res.status(403).json({ message: 'Unauthorized role for course creation' });
    }

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const course = new Course({ title, description, professor: professorId });
    await course.save();

    const populatedCourse = await Course.findById(course._id).populate('professor', 'name email');

    res.status(201).json(populatedCourse);
  } catch (error) {
    console.error("Create Course Error:", error);
    res.status(500).json({ message: 'Server error creating course' });
  }
};

// @desc    Get all courses (for student & professor to view)
// @route   GET /api/courses
// @access  Private
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('professor', 'name email');
    res.json(courses);
  } catch (error) {
    console.error("Get All Courses Error:", error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
};

// @desc    Enroll a student in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (Admin, Professor)
const enrollStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Only professor of the course or admin can enroll a student
    if (req.user.role === 'professor' && !course.professor.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to enroll students in this course' });
    }

    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'Student ID required' });

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student ID or user is not a student' });
    }

    if (!course.students.map(id => id.toString()).includes(studentId)) {
      course.students.push(studentId);
      await course.save();
    }

    const populatedCourse = await Course.findById(course._id)
      .populate('professor', 'name email')
      .populate('students', 'name email');

    res.json(populatedCourse);
  } catch (error) {
    console.error("Enroll Student Error:", error);
    res.status(500).json({ message: 'Server error enrolling student' });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Admin or owning Professor)
const updateCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isOwner = course.professor.equals(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'User not authorized to update this course' });
    }

    if (title) course.title = title;
    if (description) course.description = description;

    await course.save();

    const populatedCourse = await Course.findById(course._id).populate('professor', 'name email');
    res.json(populatedCourse);

  } catch (error) {
    console.error("Update Course Error:", error);
    res.status(500).json({ message: 'Server error updating course' });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Admin or owning Professor)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isOwner = course.professor.equals(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'User not authorized to delete this course' });
    }

    await course.deleteOne();
    res.json({ message: 'Course removed successfully' });

  } catch (error) {
    console.error("Delete Course Error:", error);
    res.status(500).json({ message: 'Server error deleting course' });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  enrollStudent,
  updateCourse,
  deleteCourse
};
