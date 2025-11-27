import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken, decodeToken } from "../services/tokenManager";

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Email dan password harus diisi');
      return;
    }

    setLoading(true);

    try {
      // DEMO MODE: Skip actual API call
      const mockToken = btoa(JSON.stringify({
        userId: '123',
        name: email.split('@')[0],
        email: email,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
      }));

      setToken(mockToken);
      
      const decoded = decodeToken(mockToken);
      setUser({ 
        name: decoded.name, 
        email: decoded.email 
      });
      
      navigate('/');
    } catch (error) {
      alert('Login gagal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icons">
            <span className="icon-cart">🛒</span>
            <span className="icon-lock">🔒</span>
          </div>
          <h1 className="login-title">TokoKita</h1>
          <p className="login-subtitle">Secured E-commerce Platform</p>
        </div>

        <div className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="user@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </div>

        <div className="register-link">
          <button onClick={() => navigate('/register')}>
            Belum punya akun? Daftar di sini
          </button>
        </div>

        <div className="security-box">
          <div className="security-title">
            <span className="security-icon">🛡️</span>
            <span>Security Features:</span>
          </div>
          <ul className="security-list">
            <li>JWT Authentication</li>
            <li>HTTPS/TLS Encryption</li>
            <li>Secured Clickstream Events</li>
          </ul>
        </div>
      </div>
    </div>
  );
}