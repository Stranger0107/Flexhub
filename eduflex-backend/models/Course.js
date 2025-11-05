// eduflex-backend/models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ FIXED
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Course', courseSchema);
