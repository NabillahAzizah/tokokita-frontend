import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getToken, decodeToken } from "../services/tokenManager";

export default function Profile({ user, viewedProducts, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getUserInfo = () => {
    if (user) return user;
    
    const token = getToken();
    if (token) {
      return decodeToken(token);
    }
    return null;
  };

  const userInfo = getUserInfo();

  return (
    <div className="page-container">
      <Navbar user={userInfo} />

      <div className="container profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {userInfo?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{userInfo?.name || 'User'}</h1>
              <p className="profile-email">{userInfo?.email || 'user@example.com'}</p>
            </div>
          </div>

          <hr className="profile-divider" />

          <div className="session-section">
            <h3 className="session-title">Session Information</h3>
            <div className="session-info-box">
              <div className="session-info-row">
                <span className="session-label">Token Status:</span>
                <span className="session-value valid">✅ Valid</span>
              </div>
              <div className="session-info-row">
                <span className="session-label">Products Viewed:</span>
                <span className="session-value">{viewedProducts?.length || 0}</span>
              </div>
              <div className="session-info-row">
                <span className="session-label">Security:</span>
                <span className="session-value secure">🔒 JWT + TLS</span>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-button">
            <span className="logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}