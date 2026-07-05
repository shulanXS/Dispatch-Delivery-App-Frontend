// Snake -> camel conversion for backend response payloads.
//
// The Spring backend uses a global SNAKE_CASE naming strategy
// (application.yaml -> spring.jackson.property-naming-strategy=SNAKE_CASE),
// so every JSON response is snake_case. The apiClient request interceptor
// already converts outgoing request bodies to snake_case, so this module
// only handles the inbound (response) direction.
//
// We expose a small wrapper so call sites can stay compact.

const UNDERSCORE_RE = /_([a-z0-9])/g;

function camelize(str) {
  return String(str).replace(UNDERSCORE_RE, (_, c) => c.toUpperCase());
}

export function keysToCamel(value) {
  if (Array.isArray(value)) return value.map(keysToCamel);
  if (value && typeof value === 'object' && value.constructor === Object) {
    const out = {};
    for (const k of Object.keys(value)) {
      out[camelize(k)] = keysToCamel(value[k]);
    }
    return out;
  }
  return value;
}

async function call(method, path, body, config) {
  const mod = await import('./client');
  const response = await mod.default.request({
    method,
    url: path,
    ...(config || {}),
    ...(body !== undefined && body !== null
      ? method === 'get' || method === 'delete'
        ? { params: body, data: undefined }
        : { data: body }
      : {}),
  });
  return keysToCamel(response.data);
}

export const get = (path, config) => call('get', path, undefined, config);
export const post = (path, body, config) => call('post', path, body, config);
export const put = (path, body, config) => call('put', path, body, config);
export const del = (path, config) => call('delete', path, undefined, config);