const USER_KEY = 'semi_social_user';
const TOKENS_KEY = 'semi_social_tokens';

export function saveSession({ user, tokens }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user || null));
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens || null));
}

export function getSessionUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getSessionTokens() {
  const raw = localStorage.getItem(TOKENS_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function hasSession() {
  return Boolean(getSessionUser());
}

export function clearSession() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKENS_KEY);
}
