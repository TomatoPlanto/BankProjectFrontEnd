import config from '../config.js';

function buildApiUrl(endpoint) {
  const baseUrl = config.apiDomain.replace(/\/$/, '');
  const path = endpoint.replace(/^\//, '');
  return `${baseUrl}/${path}`;
}

export async function get(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

export async function post(endpoint, data, options = {}) {
  const url = buildApiUrl(endpoint);
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

export async function put(endpoint, data, options = {}) {
  const url = buildApiUrl(endpoint);
  return fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

export async function del(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

export function getApiUrl(endpoint) {
  return buildApiUrl(endpoint);
}