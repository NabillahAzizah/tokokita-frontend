import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { getToken, decodeToken } from "../services/tokenManager";

export default function Home({ user, recommendations, handleProductView }) {
  const navigate = useNavigate();

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

      <div className="container">
        <div className="home-header">
          <h1 className="home-title">
            <span className="home-title-icon">📈</span>
            Rekomendasi untuk Anda
          </h1>
          <p className="home-subtitle">Berdasarkan aktivitas browsing Anda</p>
        </div>

        {recommendations && recommendations.length > 0 ? (
          <>
            <div className="product-grid">
              {recommendations.map((product) => (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                  onView={handleProductView}
                />
              ))}
            </div>

            <div className="clickstream-box">
              <div className="clickstream-header">
                <span className="clickstream-icon">🛡️</span>
                <span>Clickstream Security Active</span>
              </div>
              <p className="clickstream-text">
                Setiap interaksi Anda diamankan dengan JWT authentication
                dan dikirim melalui HTTPS/TLS ke RabbitMQ message broker
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h2 className="empty-state-title">Belum Ada Rekomendasi</h2>
              <p className="empty-state-text">
                Mulai jelajahi produk di katalog untuk mendapatkan rekomendasi personal
              </p>
              <button 
                className="empty-state-button"
                onClick={() => navigate('/catalog')}
              >
                Jelajahi Katalog
              </button>
            </div>

            <div className="info-box">
              <span className="info-icon">💡</span>
              <p className="info-text">
                <strong className="info-label">Info:</strong> Setiap klik produk akan mengirim
                clickstream event yang diamankan dengan JWT token Anda
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}