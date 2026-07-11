import { post } from './snake';

// POST /auth/login  -> { token, user }
export function login(email, password) {
  return post('/auth/login', { email, password });
}

// POST /auth/signup  -> { token, user }
// Backend expects: { name, email, password, address }
export function register(payload) {
  return post('/auth/signup', payload);
}