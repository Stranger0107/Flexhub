const Quiz = require('../models/Quiz');
const Course = require('../models/Course');

// ==============================================
// 🎯 Create a new quiz
// POST /api/quizzes
// ==============================================
const createQuiz = async (req, res) => {
  try {
    const { title, courseId, questions } = req.body;

    if (!title || !courseId || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Title, course, and questions are required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    // Only the professor of the course or admin can create
    if (
      req.user.role !== 'admin' &&
      String(course.professor) !== String(req.user.id)
    ) {
      return res.status(403).json({
        message: 'You are not authorized to create quizzes for this course.',
      });
    }

    const quiz = new Quiz({
      title,
      course: courseId,
      questions,
      createdBy: req.user.id,
    });

    await quiz.save();
    res.status(201).json({ message: 'Quiz created successfully.', quiz });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Server error creating quiz.' });
  }
};

// ==============================================
// 📋 Get all quizzes for a course
// GET /api/quizzes/course/:courseId
// ==============================================
const getQuizzesForCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const quizzes = await Quiz.find({ course: courseId }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Server error fetching quizzes.' });
  }
};

module.exports = { createQuiz, getQuizzesForCourse };

