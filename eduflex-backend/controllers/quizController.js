// eduflex-backend/controllers/quizController.js
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');

// ✅ Create quiz (professor or admin)
const createQuiz = async (req, res) => {
  try {
    const { title, questions, courseId } = req.body;
    if (!title || !courseId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Only course professor or admin can create quizzes
    if (
      req.user.role !== 'admin' &&
      String(course.professor) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: 'Unauthorized to create quiz' });
    }

    const quiz = new Quiz({
      title,
      questions,
      course: courseId,
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    console.error('Error creating quiz:', err);
    res.status(500).json({ message: 'Server error creating quiz' });
  }
};

// ✅ Get all quizzes for a course
const getQuizzesForCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const quizzes = await Quiz.find({ course: courseId }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ message: 'Server error fetching quizzes' });
  }
};

// ✅ Get single quiz by ID
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ message: 'Server error fetching quiz' });
  }
};

// ✅ Submit quiz (student)
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Invalid answers length' });
    }

    const score = answers.reduce(
      (acc, ans, i) => acc + (ans === quiz.questions[i].correctOption ? 1 : 0),
      0
    );

    const submission = {
      student: req.user.id,
      answers,
      score,
      total: quiz.questions.length,
    };

    quiz.submissions.push(submission);
    await quiz.save();

    res.json({
      message: 'Quiz submitted successfully',
      score,
      total: quiz.questions.length,
    });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    res.status(500).json({ message: 'Server error submitting quiz' });
  }
};

module.exports = {
  createQuiz,
  getQuizzesForCourse,
  getQuizById,
  submitQuiz,
};
