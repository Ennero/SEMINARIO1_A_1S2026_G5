import api from './api';

export async function registerUser(payload) {
  const response = await api.post('/auth/register', payload);
  return response.data;
}

export async function confirmUser(payload) {
  const response = await api.post('/auth/confirm', payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post('/auth/login', payload);
  return response.data;
}

export async function loginFacial(payload) {
  const response = await api.post('/auth/login-facial', payload);
  return response.data;
}

export async function logoutUser() {
  const response = await api.post('/auth/logout');
  return response.data;
}
