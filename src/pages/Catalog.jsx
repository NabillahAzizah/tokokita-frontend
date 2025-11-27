import Navbar from "../components/Navbar";
import { getToken, decodeToken } from "../services/tokenManager";

export default function Catalog({ user, MOCK_PRODUCTS, viewedProducts, handleProductView }) {
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
        <div className="catalog-header">
          <h1 className="catalog-title">Katalog Produk</h1>
          <p className="catalog-subtitle">Jelajahi semua produk kami</p>
        </div>

        <div className="product-grid">
          {MOCK_PRODUCTS.map((product) => (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => handleProductView(product)}
            >
              <div className="product-icon">{product.image}</div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-category">{product.category}</p>
              <p className="product-price">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
              <button className="product-button">
                <span className="product-button-icon">👁️</span>
                <span>Lihat Detail</span>
              </button>
            </div>
          ))}
        </div>

        {viewedProducts && viewedProducts.length > 0 && (
          <div className="viewed-products-box">
            <h3 className="viewed-products-header">
              <span className="viewed-products-icon">👁️</span>
              <span>Produk yang Telah Anda Lihat ({viewedProducts.length})</span>
            </h3>

            <div className="viewed-products-list">
              {viewedProducts.map((p) => (
                <span key={p.id} className="viewed-product-tag">
                  {p.image} {p.name}
                </span>
              ))}
            </div>

            <p className="viewed-products-status">
              ✅ {viewedProducts.length} clickstream event telah terkirim dengan aman
            </p>
          </div>
        )}
      </div>
    </div>
  );
}