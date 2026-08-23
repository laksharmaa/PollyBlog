import { authStorage } from "../utils/storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function api(path, options = {}) {
  const { retry = true, ...requestOptions } = options;
  const token = authStorage.getToken();
  const headers = { ...(requestOptions.body ? { "Content-Type": "application/json" } : {}), ...(requestOptions.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${path}`, { ...requestOptions, headers });
  let data = null;
  try { data = await response.json(); } catch { data = null; }

  if (response.status === 401 && retry && path !== "/refresh") {
    const refreshToken = authStorage.getRefreshToken();
    if (refreshToken) {
      const refreshResponse = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      let refreshData = null;
      try { refreshData = await refreshResponse.json(); } catch { refreshData = null; }

      if (refreshResponse.ok) {
        authStorage.setTokens(refreshData);
        return api(path, { ...requestOptions, retry: false, headers: { ...(requestOptions.headers || {}) } });
      }
    }

    authStorage.clear();
    window.location.assign(`/login?from=${encodeURIComponent(window.location.pathname)}`);
  }

  if (!response.ok) throw new Error(data?.error || data?.message || "Something went wrong");
  return data;
}
