import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken, decodeToken } from "../services/tokenManager";

export default function Register({ setUser }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      alert('Semua field harus diisi');
      return;
    }

    setLoading(true);

    try {
      // DEMO MODE
      const mockToken = btoa(JSON.stringify({
        userId: '123',
        name: fullName,
        email: email,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
      }));

      setToken(mockToken);
      
      const decoded = decodeToken(mockToken);
      setUser({ 
        name: decoded.name, 
        email: decoded.email 
      });
      
      navigate('/');
    } catch (error) {
      alert('Registrasi gagal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Daftar Akun</h1>
          <p className="register-subtitle">Buat akun baru di TokoKita</p>
        </div>

        <div className="register-form">
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-input"
              placeholder="John Doe"
            />
          </div>

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
              onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="register-button"
          >
            {loading ? 'Loading...' : 'Daftar'}
          </button>
        </div>

        <div className="login-link">
          <button onClick={() => navigate('/login')}>
            Sudah punya akun? Login di sini
          </button>
        </div>
      </div>
    </div>
  );
}