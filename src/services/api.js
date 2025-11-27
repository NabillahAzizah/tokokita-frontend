import TokenManager from "../services/tokenManager";

// ===== SERVICE: API Configuration =====
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const api = {
  // Interceptor untuk menambahkan JWT ke setiap request
  request: async (endpoint, options = {}) => {
    const token = TokenManager.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token && TokenManager.isTokenValid()) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      
      if (response.status === 401) {
        TokenManager.removeToken();
        window.location.href = '/login';
      }
      
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

export default api;