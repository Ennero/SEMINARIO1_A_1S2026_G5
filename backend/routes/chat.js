const express = require('express');
const router = express.Router();

// GET /api/chat/rooms
router.get('/rooms', (req, res) => {
  res.json({ message: 'Get chat rooms placeholder' });
});

// GET /api/chat/messages/:room
router.get('/messages/:room', (req, res) => {
  res.json({ message: `Get messages for room ${req.params.room} placeholder` });
});

// POST /api/chat/messages
router.post('/messages', (req, res) => {
  res.json({ message: 'Send message placeholder' });
});

module.exports = router;
