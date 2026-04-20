const crypto = require('crypto');
const pool = require('../config/db');
const { uploadImageAsset, normalizeBase64 } = require('../aws-services/imageUpload');

function hashPasswordMd5(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

function mapUser(row) {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    email: row.email,
    dpi: row.dpi,
    profileImageUrl: row.profile_image_url,
    createdAt: row.created_at,
  };
}

async function getAllUsers(req, res) {
  try {
    const { currentUserId } = req.query;

    const baseQuery = `
      SELECT u.id, u.username, u.full_name, u.email, u.dpi, u.profile_image_url, u.created_at
      FROM users u
      WHERE ($1::int IS NULL OR u.id <> $1)
      ORDER BY u.created_at DESC
    `;

    const users = await pool.query(baseQuery, [currentUserId ? Number(currentUserId) : null]);
    return res.status(200).json({ users: users.rows.map(mapUser) });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while listing users.' });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await pool.query(
      `
        SELECT id, username, full_name, email, dpi, profile_image_url, created_at
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    if (user.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ user: mapUser(user.rows[0]) });
  } catch (error) {
    console.error('getUserById error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while loading the user.' });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { fullName, dpi, username, password, imageBase64, fileName, contentType } = req.body;

    const existing = await pool.query('SELECT id, email, profile_image_url FROM users WHERE id = $1 LIMIT 1', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let imageUrl = existing.rows[0].profile_image_url;
    if (imageBase64) {
      imageUrl = await uploadImageAsset({
        imageBase64: normalizeBase64(imageBase64),
        fileName: fileName || `profile-${id}-${Date.now()}.jpg`,
        contentType: contentType || 'image/jpeg',
        email: existing.rows[0].email,
        prefix: 'profiles',
      });
    }

    const passwordMd5 = password ? hashPasswordMd5(password) : null;

    const result = await pool.query(
      `
        UPDATE users
        SET
          full_name = COALESCE($1, full_name),
          dpi = COALESCE($2, dpi),
          username = COALESCE($3, username),
          password_md5 = COALESCE($4, password_md5),
          profile_image_url = COALESCE($5, profile_image_url)
        WHERE id = $6
        RETURNING id, username, full_name, email, dpi, profile_image_url, created_at
      `,
      [
        fullName || null,
        dpi || null,
        username || null,
        passwordMd5,
        imageUrl,
        id,
      ]
    );

    return res.status(200).json({ message: 'User updated.', user: mapUser(result.rows[0]) });
  } catch (error) {
    console.error('updateUser error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while updating user.' });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deleted = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (deleted.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ message: 'User deleted.' });
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while deleting user.' });
  }
}

async function sendFriendRequest(req, res) {
  try {
    const { id: receiverId } = req.params;
    const { senderId } = req.body;

    if (!senderId) {
      return res.status(400).json({ error: 'senderId is required.' });
    }

    if (Number(senderId) === Number(receiverId)) {
      return res.status(400).json({ error: 'Cannot send a friend request to yourself.' });
    }

    const requestResult = await pool.query(
      `
        INSERT INTO friendships (sender_id, receiver_id, status)
        VALUES ($1, $2, 'pending')
        ON CONFLICT (sender_id, receiver_id)
        DO UPDATE SET status = 'pending', responded_at = NULL
        RETURNING id, sender_id, receiver_id, status, created_at
      `,
      [senderId, receiverId]
    );

    return res.status(201).json({ message: 'Friend request sent.', request: requestResult.rows[0] });
  } catch (error) {
    console.error('sendFriendRequest error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while sending friend request.' });
  }
}

async function listIncomingRequests(req, res) {
  try {
    const { id: userId } = req.params;
    const result = await pool.query(
      `
        SELECT f.id, f.sender_id, f.receiver_id, f.status, f.created_at,
               u.username, u.full_name, u.profile_image_url
        FROM friendships f
        JOIN users u ON u.id = f.sender_id
        WHERE f.receiver_id = $1 AND f.status = 'pending'
        ORDER BY f.created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({ requests: result.rows });
  } catch (error) {
    console.error('listIncomingRequests error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while listing friend requests.' });
  }
}

async function answerFriendRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { userId, action } = req.body;

    if (!userId || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'userId and action (accept/reject) are required.' });
    }

    const status = action === 'accept' ? 'accepted' : 'rejected';
    const result = await pool.query(
      `
        UPDATE friendships
        SET status = $1, responded_at = NOW()
        WHERE id = $2 AND receiver_id = $3 AND status = 'pending'
        RETURNING id, sender_id, receiver_id, status, responded_at
      `,
      [status, requestId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pending friend request not found for this user.' });
    }

    return res.status(200).json({ message: `Friend request ${status}.`, request: result.rows[0] });
  } catch (error) {
    console.error('answerFriendRequest error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while answering friend request.' });
  }
}

async function listFriends(req, res) {
  try {
    const { id: userId } = req.params;
    const result = await pool.query(
      `
        SELECT
          CASE WHEN f.sender_id = $1 THEN u2.id ELSE u1.id END AS id,
          CASE WHEN f.sender_id = $1 THEN u2.username ELSE u1.username END AS username,
          CASE WHEN f.sender_id = $1 THEN u2.full_name ELSE u1.full_name END AS full_name,
          CASE WHEN f.sender_id = $1 THEN u2.profile_image_url ELSE u1.profile_image_url END AS profile_image_url,
          f.id AS friendship_id,
          f.created_at AS connected_at
        FROM friendships f
        JOIN users u1 ON u1.id = f.sender_id
        JOIN users u2 ON u2.id = f.receiver_id
        WHERE (f.sender_id = $1 OR f.receiver_id = $1)
          AND f.status = 'accepted'
        ORDER BY f.created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({ friends: result.rows });
  } catch (error) {
    console.error('listFriends error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while listing friends.' });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  sendFriendRequest,
  listIncomingRequests,
  answerFriendRequest,
  listFriends,
};
