import api from "./api";
import TokenManager from "../services/tokenManager";
// ===== SERVICE: Authentication =====
const AuthService = {
  login: async (email, password) => {
    const response = await api.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login gagal');
    
    const data = await response.json();
    TokenManager.setToken(data.token);
    return data;
  },
  
  register: async (name, email, password) => {
    const response = await api.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    
    if (!response.ok) throw new Error('Registrasi gagal');
    
    const data = await response.json();
    TokenManager.setToken(data.token);
    return data;
  },
  
  logout: () => {
    TokenManager.removeToken();
  }
};

export default AuthService;