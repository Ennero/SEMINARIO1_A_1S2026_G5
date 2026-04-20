import api from './api';

export async function getOrCreateDirectRoom(userAId, userBId) {
  const response = await api.post('/chat/direct-room', { userAId, userBId });
  return response.data;
}

export async function fetchChatRooms(userId) {
  const response = await api.get('/chat/rooms', {
    params: { userId },
  });
  return response.data;
}

export async function fetchRoomMessages(roomId, userId) {
  const response = await api.get(`/chat/messages/${roomId}`, {
    params: { userId },
  });
  return response.data;
}

export async function sendChatMessage(payload) {
  const response = await api.post('/chat/messages', payload);
  return response.data;
}
