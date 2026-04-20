const express = require('express');
const router = express.Router();
const {
  registerUser,
  confirmRegistration,
  loginUser,
  loginFacial,
  getImageLabels,
  translateContent,
  chatbotMessage,
  logoutUser,
} = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/confirm
router.post('/confirm', confirmRegistration);

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/login-facial
router.post('/login-facial', loginFacial);

// POST /api/auth/labels
router.post('/labels', getImageLabels);

// POST /api/auth/translate
router.post('/translate', translateContent);

// POST /api/auth/chatbot
router.post('/chatbot', chatbotMessage);

// POST /api/auth/logout
router.post('/logout', logoutUser);

module.exports = router;
