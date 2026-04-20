import api from './api';

export async function getImageLabels(payload) {
  const response = await api.post('/auth/labels', payload);
  return response.data;
}

export async function translateContent(payload) {
  const response = await api.post('/auth/translate', payload);
  return response.data;
}

export async function sendChatbotMessage(payload) {
  const response = await api.post('/auth/chatbot', payload);
  return response.data;
}
