// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth";

export default function Register({ setUser }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      alert('Semua field harus diisi');
      return;
    }

    setLoading(true);

    try {
      // 🔐 Panggil backend beneran
      const data = await AuthService.register(fullName, email, password);
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
      alert('Registrasi gagal: ' + (error.message || 'Unknown error'));
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
