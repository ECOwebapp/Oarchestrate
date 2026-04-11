import router from "@/router";

export const session = () => {
    const saved = localStorage.getItem('eco_session');
    return saved ? JSON.parse(saved) : null;
};

export const apiFetch = async (endpoint, options = {}) => {

    const savedSession = localStorage.getItem('eco_session');
    const session = savedSession ? JSON.parse(savedSession) : null;
  
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': session ? `Bearer ${session.access_token}` : '',
    };

    // console.log(session?.access_token)
  
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
    });
  
    // Global 401 handling: If any request returns 401, boot the user to Login
    if (response.status === 401) {
      localStorage.removeItem('eco_session');
      router.replace({ name: 'Login' })
    }
  
    return response;
  };