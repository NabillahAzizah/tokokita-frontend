import Navbar from "../components/Navbar";
import { getToken, decodeToken } from "../services/tokenManager";

export default function Catalog({
  user,
  products = [],
  viewedProducts,
  handleProductView,
  productsLoadedFromAPI,
}) {
  const getUserInfo = () => {
    if (user) return user;

    const token = getToken();
    if (token) {
      return decodeToken(token);
    }
    return null;
  };

  const userInfo = getUserInfo();

  const hasProducts = products && products.length > 0;

  return (
    <div className="page-container">
      <Navbar user={userInfo} />

      <div className="container">
        <div className="catalog-header">
          <h1 className="catalog-title">Katalog Produk</h1>
          <p className="catalog-subtitle">
            Jelajahi semua produk kami
            {productsLoadedFromAPI
              ? " (data dari backend API)"
              : " (menggunakan data mock lokal)"}
          </p>
        </div>

        {hasProducts ? (
          <div className="product-grid">
            {products.map((product) => (
              <div
                key={product.id || product._id}
                className="product-card"
                onClick={() => handleProductView(product)}
              >
                <div className="product-icon">
                  {product.image || "🛍️"}
                </div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">
                  {product.category || "Produk"}
                </p>
                <p className="product-price">
                  Rp {(product.price || 0).toLocaleString("id-ID")}
                </p>
                <button className="product-button">
                  <span className="product-button-icon">👁️</span>
                  <span>Lihat Detail</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h2 className="empty-state-title">Belum ada produk</h2>
            <p className="empty-state-text">
              Produk belum tersedia di sistem. Silakan cek kembali konfigurasi
              backend atau gunakan data mock.
            </p>
          </div>
        )}

        {viewedProducts && viewedProducts.length > 0 && (
          <div className="viewed-products-box">
            <h3 className="viewed-products-header">
              <span className="viewed-products-icon">👁️</span>
              <span>
                Produk yang Telah Anda Lihat ({viewedProducts.length})
              </span>
            </h3>

            <div className="viewed-products-list">
              {viewedProducts.map((p) => (
                <span key={p.id || p._id} className="viewed-product-tag">
                  {p.image || "🛍️"} {p.name}
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
