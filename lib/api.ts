export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://bcn-housing-backend.onrender.com";

export async function fetchFromBackend(endpoint: string, options: RequestInit = {}) {
  const url = `${BACKEND_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || "后端服务请求失败");
  }

  return response.json();
}
