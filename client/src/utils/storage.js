const AUTH_TOKEN_KEY = 'smartquiz_token';
const AUTH_USER_KEY = 'smartquiz_user';
const CSRF_TOKEN_KEY = 'smartquiz_csrf';

export function setAuthData(token, user, csrfToken = null) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  if (csrfToken) localStorage.setItem(CSRF_TOKEN_KEY, csrfToken);
}

export function clearAuthData() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(CSRF_TOKEN_KEY);
}

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredCsrfToken() {
  const stored = localStorage.getItem(CSRF_TOKEN_KEY);
  if (stored) return stored;

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith('smartquiz_csrf='));
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
}

export function getStoredUser() {
  const userString = localStorage.getItem(AUTH_USER_KEY);
  if (!userString) return null;

  try {
    return JSON.parse(userString);
  } catch (_error) {
    clearAuthData();
    return null;
  }
}
