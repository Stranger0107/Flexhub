const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Assignment description is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },

    // ✅ Professor’s optional file attachments (like PDFs, DOCs, etc.)
    attachmentUrl: {
      type: String,
      default: '', // stored as /uploads/assignments/<courseId>/<filename>
    },

    // ✅ Student submissions (text or file uploads)
    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        submission: String, // can be text or uploaded file path
        grade: {
          type: Number,
          min: 0,
          max: 100,
        },
        feedback: String,
        submittedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
