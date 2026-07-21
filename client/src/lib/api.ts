export const AUTH_TOKEN_KEY = "hubfit_auth_token";

export function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}
