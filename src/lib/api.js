import router from "@/router";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

let isHandlingUnauthorized = false;

export const session = () => {
  const saved = localStorage.getItem("eco_session");
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem("eco_session");
    return null;
  }
};

export const apiFetch = async (endpoint, options = {}) => {
  const savedSession = session();
  const token = savedSession?.access_token;
  // const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const defaultHeaders = {
    "Content-Type": "application/json",
    // ...authHeader,
  };

  const isAbsolute = String(endpoint)?.startsWith('http');
  const finalUrl = isAbsolute ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(finalUrl, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
    credentials: 'include'
  });

  // Global 401 handling: If any request returns 401, boot the user to Login
  if (response.status === 401) {
    // localStorage.removeItem("eco_session");
    if (!isHandlingUnauthorized) {
      isHandlingUnauthorized = true;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
      router.replace({ name: "Login" }).finally(() => {
        isHandlingUnauthorized = false;
      });
    }
  }

  return response;
};
