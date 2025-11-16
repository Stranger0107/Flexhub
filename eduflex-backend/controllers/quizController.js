const Quiz = require('../models/Quiz');
const Course = require('../models/Course');

const createQuiz = async (req, res) => {
  try {
    const { title, questions, courseId } = req.body;
    if (!title || !courseId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (
      req.user.role !== 'admin' &&
      String(course.professor) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const quiz = new Quiz({ title, questions, course: courseId });
    await quiz.save();

    res.status(201).json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating quiz' });
  }
};

const getQuizzesForCourse = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching quizzes' });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    res.json({
      ...quiz.toObject(),
      currentUserId: req.user.id, // send to frontend
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error fetching quiz' });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Prevent duplicate attempts
    const already = quiz.submissions.find(
      (s) => s.student.toString() === req.user.id
    );

    if (already) {
      return res.status(400).json({ message: "You already attempted this quiz" });
    }

    const score = answers.reduce(
      (acc, ans, i) => acc + (ans === quiz.questions[i].correctOption ? 1 : 0),
      0
    );

    quiz.submissions.push({
      student: req.user.id,
      answers,
      score,
      total: quiz.questions.length,
    });

    await quiz.save();

    res.json({ score, total: quiz.questions.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error submitting quiz' });
  }
};

module.exports = {
  createQuiz,
  getQuizzesForCourse,
  getQuizById,
  submitQuiz,
};
