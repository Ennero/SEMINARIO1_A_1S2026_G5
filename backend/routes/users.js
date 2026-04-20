const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  sendFriendRequest,
  listIncomingRequests,
  answerFriendRequest,
  listFriends,
} = require('../controllers/usersController');

// GET /api/users
router.get('/', getAllUsers);

// GET /api/users/:id
router.get('/:id', getUserById);

// GET /api/users/:id/friends
router.get('/:id/friends', listFriends);

// GET /api/users/:id/friend-requests
router.get('/:id/friend-requests', listIncomingRequests);

// POST /api/users/:id/friend-requests
router.post('/:id/friend-requests', sendFriendRequest);

// PATCH /api/users/friend-requests/:requestId
router.patch('/friend-requests/:requestId', answerFriendRequest);

// PUT /api/users/:id
router.put('/:id', updateUser);

// DELETE /api/users/:id
router.delete('/:id', deleteUser);

module.exports = router;
