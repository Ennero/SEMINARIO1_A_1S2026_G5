import api from './api';

export async function fetchUsers(currentUserId, q = '') {
  const response = await api.get('/users', {
    params: { currentUserId, ...(q ? { q } : {}) },
  });
  return response.data;
}

export async function fetchProfile(userId) {
  const response = await api.get(`/users/${userId}`);
  return response.data;
}

export async function updateProfile(userId, payload) {
  const response = await api.put(`/users/${userId}`, payload);
  return response.data;
}

export async function fetchFriends(userId) {
  const response = await api.get(`/users/${userId}/friends`);
  return response.data;
}

export async function fetchIncomingRequests(userId) {
  const response = await api.get(`/users/${userId}/friend-requests`);
  return response.data;
}

export async function sendFriendRequest(receiverId, senderId) {
  const response = await api.post(`/users/${receiverId}/friend-requests`, { senderId });
  return response.data;
}

export async function answerFriendRequest(requestId, userId, action) {
  const response = await api.patch(`/users/friend-requests/${requestId}`, { userId, action });
  return response.data;
}
