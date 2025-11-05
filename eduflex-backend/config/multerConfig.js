const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dynamic storage for course materials and assignments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.uploadType || 'materials'; // default folder
    const courseId = req.params.id || req.body.courseId;
    const uploadDir = path.join(__dirname, '..', 'uploads', type, courseId || 'general');

    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
  ];

  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type! Only PDF, DOC, PPT, and images allowed.'));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
