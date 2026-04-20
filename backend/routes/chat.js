const express = require('express');
const router = express.Router();
const {
  getRooms,
  getMessages,
  sendMessage,
  getOrCreateDirectRoom,
} = require('../controllers/chatController');

// GET /api/chat/rooms
router.get('/rooms', getRooms);

// POST /api/chat/direct-room
router.post('/direct-room', getOrCreateDirectRoom);

// GET /api/chat/messages/:room
router.get('/messages/:room', getMessages);

// POST /api/chat/messages
router.post('/messages', sendMessage);

module.exports = router;
