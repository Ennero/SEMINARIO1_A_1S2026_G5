import api from './api';

export async function fetchPosts(params = {}) {
  const response = await api.get('/posts', { params });
  return response.data;
}

export async function createPost(payload) {
  const response = await api.post('/posts', payload);
  return response.data;
}

export async function addPostComment(postId, payload) {
  const response = await api.post(`/posts/${postId}/comments`, payload);
  return response.data;
}

export async function translatePostText(postId, payload) {
  const response = await api.post(`/posts/${postId}/translate`, payload);
  return response.data;
}
