import api from './client.js';

/**
 * @param {{ email: string; password: string }} body
 */
export function login(body) {
  return api.post('/auth/login', body);
}

/**
 * @param {{ name: string; email: string; password: string }} body
 */
export function register(body) {
  return api.post('/auth/register', body);
}

export function getMe() {
  return api.get('/auth/me');
}
