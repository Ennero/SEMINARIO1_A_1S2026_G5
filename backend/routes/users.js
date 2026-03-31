const express = require('express');
const router = express.Router();

// GET /api/users
router.get('/', (req, res) => {
  res.json({ message: 'Get all users placeholder' });
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  res.json({ message: `Get user ${req.params.id} placeholder` });
});

// PUT /api/users/:id
router.put('/:id', (req, res) => {
  res.json({ message: `Update user ${req.params.id} placeholder` });
});

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete user ${req.params.id} placeholder` });
});

module.exports = router;
