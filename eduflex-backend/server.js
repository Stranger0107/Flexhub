const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables first
dotenv.config();

// Connect to MongoDB
connectDB(process.env.MONGO_URI);

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---
app.use('/api/auth', require('./routes/authRouters'));
app.use('/api/admin', require('./routes/admin.js'));
app.use('/api/professor', require('./routes/professorRoutes.js'));
app.use('/api/student', require('./routes/studentRoutes.js'));
app.use('/api/courses', require('./routes/courses.js'));
app.use('/api/assignments', require('./routes/assignments.js'));

// ✅ Test route
app.get('/', (req, res) => {
  res.send('EduFlex API is running...');
});

// ✅ Quiz routes
app.use('/api/quizzes', require('./routes/quizRoutes.js'));

// ✅ Handle 404 (must come last)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
