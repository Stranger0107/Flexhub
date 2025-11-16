const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    questions: [
      {
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctOption: { type: Number, required: true },
      },
    ],
    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        answers: [Number],
        score: Number,
        total: Number,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
