const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  addComment,
  translatePostText,
} = require('../controllers/postsController');

// GET /api/posts
router.get('/', getPosts);

// GET /api/posts/:id
router.get('/:id', getPostById);

// POST /api/posts
router.post('/', createPost);

// POST /api/posts/:id/comments
router.post('/:id/comments', addComment);

// POST /api/posts/:id/translate
router.post('/:id/translate', translatePostText);

// PUT /api/posts/:id
router.put('/:id', updatePost);

// DELETE /api/posts/:id
router.delete('/:id', deletePost);

module.exports = router;
