import apiClient from './client';

// Snake -> camel conversion happens once, in apiClient's response
// interceptor (client.js). This module just exposes thin wrappers so
// call sites can stay compact without spelling out the HTTP verb.

async function call(method, path, body, config) {
  const response = await apiClient.request({
    method,
    url: path,
    ...(config || {}),
    ...(body !== undefined && body !== null
      ? method === 'get' || method === 'delete'
        ? { params: body, data: undefined }
        : { data: body }
      : {}),
  });
  return response.data;
}

export const get = (path, config) => call('get', path, undefined, config);
export const post = (path, body, config) => call('post', path, body, config);
export const put = (path, body, config) => call('put', path, body, config);
export const del = (path, config) => call('delete', path, undefined, config);