import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth";  

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
      const data = await AuthService.login(email, password);
      // data.user: { id, fullName, email, role }

      setUser({
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
      });

      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Login gagal: ' + (error.message || 'Unknown error'));
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