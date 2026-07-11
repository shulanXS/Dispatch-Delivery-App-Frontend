import { get, put } from './snake';

// GET /users/{id}  -> UserResponse
export function getUser(id) {
  return get(`/users/${id}`);
}

// GET /users  -> for debug only.
export function listUsers() {
  return get('/users');
}

// PUT /users/{id}  body { name, address }
export function updateUser(id, payload) {
  return put(`/users/${id}`, payload);
}