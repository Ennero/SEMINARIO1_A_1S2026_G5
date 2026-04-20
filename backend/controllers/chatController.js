const pool = require('../config/db');

function buildDirectRoomKey(userAId, userBId) {
  const pair = [Number(userAId), Number(userBId)].sort((a, b) => a - b);
  return `direct:${pair[0]}:${pair[1]}`;
}

async function ensureDirectRoom(userAId, userBId) {
  const roomKey = buildDirectRoomKey(userAId, userBId);

  let room = await pool.query('SELECT id, room_key FROM chat_rooms WHERE room_key = $1 LIMIT 1', [roomKey]);
  if (room.rowCount > 0) {
    return room.rows[0];
  }

  room = await pool.query(
    `
      INSERT INTO chat_rooms (room_key, is_direct)
      VALUES ($1, TRUE)
      RETURNING id, room_key
    `,
    [roomKey]
  );

  const roomId = room.rows[0].id;

  await pool.query(
    `
      INSERT INTO chat_room_participants (room_id, user_id)
      VALUES ($1, $2), ($1, $3)
      ON CONFLICT (room_id, user_id) DO NOTHING
    `,
    [roomId, userAId, userBId]
  );

  return room.rows[0];
}

async function getRooms(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const result = await pool.query(
      `
        SELECT r.id, r.room_key, r.is_direct, r.created_at,
               array_agg(json_build_object('id', u.id, 'username', u.username, 'fullName', u.full_name, 'profileImageUrl', u.profile_image_url)) AS participants
        FROM chat_rooms r
        JOIN chat_room_participants p ON p.room_id = r.id
        JOIN chat_room_participants me ON me.room_id = r.id AND me.user_id = $1
        JOIN users u ON u.id = p.user_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({ rooms: result.rows });
  } catch (error) {
    console.error('getRooms error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while listing chat rooms.' });
  }
}

async function getMessages(req, res) {
  try {
    const { room } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const membership = await pool.query(
      'SELECT room_id FROM chat_room_participants WHERE room_id = $1 AND user_id = $2 LIMIT 1',
      [room, userId]
    );

    if (membership.rowCount === 0) {
      return res.status(403).json({ error: 'User is not part of this room.' });
    }

    const result = await pool.query(
      `
        SELECT m.id, m.room_id, m.sender_id, m.message, m.created_at,
               u.username, u.full_name
        FROM chat_messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.room_id = $1
        ORDER BY m.created_at ASC
      `,
      [room]
    );

    return res.status(200).json({ messages: result.rows });
  } catch (error) {
    console.error('getMessages error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while listing messages.' });
  }
}

async function sendMessage(req, res) {
  try {
    const { roomId, senderId, message } = req.body;

    if (!roomId || !senderId || !message) {
      return res.status(400).json({ error: 'roomId, senderId and message are required.' });
    }

    const membership = await pool.query(
      'SELECT room_id FROM chat_room_participants WHERE room_id = $1 AND user_id = $2 LIMIT 1',
      [roomId, senderId]
    );

    if (membership.rowCount === 0) {
      return res.status(403).json({ error: 'User is not part of this room.' });
    }

    const inserted = await pool.query(
      `
        INSERT INTO chat_messages (room_id, sender_id, message)
        VALUES ($1, $2, $3)
        RETURNING id, room_id, sender_id, message, created_at
      `,
      [roomId, senderId, message]
    );

    return res.status(201).json({ message: 'Message sent.', chatMessage: inserted.rows[0] });
  } catch (error) {
    console.error('sendMessage error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while sending message.' });
  }
}

async function getOrCreateDirectRoom(req, res) {
  try {
    const { userAId, userBId } = req.body;

    if (!userAId || !userBId) {
      return res.status(400).json({ error: 'userAId and userBId are required.' });
    }

    if (Number(userAId) === Number(userBId)) {
      return res.status(400).json({ error: 'Direct room requires two different users.' });
    }

    const room = await ensureDirectRoom(userAId, userBId);
    return res.status(200).json({ room });
  } catch (error) {
    console.error('getOrCreateDirectRoom error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while preparing direct room.' });
  }
}

module.exports = {
  getRooms,
  getMessages,
  sendMessage,
  getOrCreateDirectRoom,
};
