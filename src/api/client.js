import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Wire format helpers: backend is locked to SNAKE_CASE.
function snakeToCamelKey(key) {
  return key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function deepCamel(obj) {
  if (Array.isArray(obj)) return obj.map(deepCamel);
  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[snakeToCamelKey(k)] = deepCamel(v);
    }
    return out;
  }
  return obj;
}

function camelToSnakeKey(key) {
  return key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
}

function deepSnake(obj) {
  if (Array.isArray(obj)) return obj.map(deepSnake);
  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[camelToSnakeKey(k)] = deepSnake(v);
    }
    return out;
  }
  return obj;
}

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Send everything as snake_case to match backend naming strategy.
  if (config.data && typeof config.data === 'object') {
    config.data = deepSnake(config.data);
  }
  return config;
});

apiClient.interceptors.response.use(
  (resp) => {
    if (
      resp.config.responseType === 'blob' ||
      resp.config.responseType === 'arraybuffer'
    ) {
      return resp;
    }
    if (resp.data !== undefined) {
      resp.data = deepCamel(resp.data);
    }
    return resp;
  },
  (err) => {
    if (err.response?.status === 401) {
      const state = useAuthStore.getState();
      if (state.token) {
        useAuthStore.setState({ token: null, user: null });
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/signup')
        ) {
          const next =
            window.location.pathname + window.location.search;
          window.location.href = `/login?next=${encodeURIComponent(next)}`;
        }
      }
    }
    err.normalizedMessage = normalizeApiError(err);
    return Promise.reject(err);
  },
);

function normalizeApiError(err) {
  const fallback = '网络异常，请稍后再试';
  if (!err.response) {
    return err.message || fallback;
  }
  const body = err.response.data;
  if (typeof body === 'string' && body.trim().length > 0) {
    return body;
  }
  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.length > 0) {
      return body.message;
    }
    if (typeof body.error === 'string' && body.error.length > 0) {
      return body.error;
    }
    if (Array.isArray(body.errors) && body.errors[0]?.defaultMessage) {
      return body.errors[0].defaultMessage;
    }
  }
  switch (err.response.status) {
    case 400:
      return '请求参数有误';
    case 401:
      return '请先登录';
    case 403:
      return '没有权限';
    case 404:
      return '资源未找到';
    case 409:
      return '状态冲突，请刷新';
    case 500:
      return '服务器开小差了，请稍后再试';
    default:
      return fallback;
  }
}

export default apiClient;
