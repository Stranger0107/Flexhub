const Notification = require('../models/Notification');
const { io } = require('../server'); // ensure server.js exports io

async function sendNotification(studentId, title, message, type='other', relatedId = null) {
  if (!studentId) return null;
  const notif = await Notification.create({
    studentId, title, message, type, relatedId
  });
  // emit to student room; if not connected, DB still stores notification
  io.to(`student:${studentId}`).emit('notification', notif);
  return notif;
}

module.exports = sendNotification;
