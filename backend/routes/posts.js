const express = require('express');
const router = express.Router();

// GET /api/posts
router.get('/', (req, res) => {
  res.json({ message: 'Get all posts placeholder' });
});

// GET /api/posts/:id
router.get('/:id', (req, res) => {
  res.json({ message: `Get post ${req.params.id} placeholder` });
});

// POST /api/posts
router.post('/', (req, res) => {
  res.json({ message: 'Create post placeholder' });
});

// PUT /api/posts/:id
router.put('/:id', (req, res) => {
  res.json({ message: `Update post ${req.params.id} placeholder` });
});

// DELETE /api/posts/:id
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete post ${req.params.id} placeholder` });
});

module.exports = router;
