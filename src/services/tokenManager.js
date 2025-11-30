const TokenManager = {
  setToken: (token) => {
    try {
      localStorage.setItem('jwt_token', token);
    } catch (error) {
      console.error('Failed to set token:', error);
    }
  },
  
  getToken: () => {
    try {
      return localStorage.getItem('jwt_token');
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  },
  
  removeToken: () => {
    try {
      localStorage.removeItem('jwt_token');
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  },
  
  decodeToken: (token) => {
    try {
      if (!token) return null;
      
      // For base64 encoded mock tokens
      if (!token.includes('.')) {
        const decoded = JSON.parse(atob(token));
        return decoded;
      }
      
      // For JWT tokens
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  },
  
  isTokenValid: () => {
    try {
      const token = TokenManager.getToken();
      if (!token) return false;
      
      const decoded = TokenManager.decodeToken(token);
      if (!decoded || !decoded.exp) return false;
      
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      console.error('Failed to validate token:', error);
      return false;
    }
  }
};

// Export both default and named exports
export const getToken = TokenManager.getToken;
export const setToken = TokenManager.setToken;
export const removeToken = TokenManager.removeToken;
export const clearToken = TokenManager.removeToken; // alias
export const decodeToken = TokenManager.decodeToken;
export const isTokenValid = TokenManager.isTokenValid;

export default TokenManager;