const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok) throw new Error(data?.error || data?.message || "Something went wrong");
  return data;
}
