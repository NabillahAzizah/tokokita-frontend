import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getToken, decodeToken } from '../services/tokenManager';
import MOCK_PRODUCTS from '../data/mockProduct';

const ProductDetail = ({ products = [], onAddToCart, handleProductView }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Get user info
  const getUserInfo = () => {
    const token = getToken();
    if (token) {
      return decodeToken(token);
    }
    return null;
  };

  const userInfo = getUserInfo();

  // Combine products from props and MOCK_PRODUCTS
  const allProducts = products.length > 0 ? products : MOCK_PRODUCTS;

  // Find product by ID
  const product = allProducts.find(p => {
    const productId = p.id || p._id;
    return productId == id; // Use == for type coercion
  });

  console.log("Product Detail - ID from URL:", id);
  console.log("Available products:", allProducts);
  console.log("Found product:", product);

  const displayProduct = product || {
    id: parseInt(id) || 1,
    name: 'Produk Tidak Ditemukan',
    price: 0,
    category: 'Unknown',
    image: '❓',
    description: 'Produk yang Anda cari tidak ditemukan. Silakan kembali ke katalog.',
    specs: [
      'Produk tidak tersedia',
      'Silakan pilih produk lain'
    ],
    stock: 0,
    rating: 0,
    reviews: 0
  };

  // Add default specs if not present
  if (product && !product.specs) {
    displayProduct.specs = [
      `Kategori: ${product.category}`,
      `Stok tersedia: ${product.stock || 15} unit`,
      'Garansi resmi 1 tahun',
      'Gratis ongkir untuk pembelian di atas Rp 100.000',
      'Bisa COD (Cash on Delivery)',
      'Tersedia cicilan 0%'
    ];
    displayProduct.stock = product.stock || 15;
    displayProduct.rating = product.rating || 4.5;
    displayProduct.reviews = product.reviews || 50;
  }

  const handleAddToCart = () => {
    if (displayProduct.stock === 0) {
      alert('Maaf, produk ini sedang habis.');
      return;
    }
    
    if (onAddToCart) {
      onAddToCart({ ...displayProduct, quantity });
    }
    
    // Track product view
    if (handleProductView) {
      handleProductView(displayProduct);
    }

    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      navigate('/checkout');
    }, 1000);
  };

  const incrementQuantity = () => {
    if (quantity < (displayProduct.stock || 99)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // If product not found, show warning
  if (!product) {
    console.warn("⚠️ Product not found for ID:", id);
  }

  return (
    <div className="page-container">
      <Navbar user={userInfo} />

      {/* Back Button Header */}
      <div className="product-detail-header">
        <div className="container">
          <button 
            onClick={() => navigate('/catalog')}
            className="back-button"
          >
            <span className="back-icon">←</span>
            <span>Kembali ke Katalog</span>
          </button>
        </div>
      </div>

      {/* Product Detail Content */}
      <div className="container">
        <div className="product-detail-card">
          <div className="product-detail-grid">
            {/* Left: Image & Info */}
            <div className="product-detail-left">
              <div className="product-detail-image-container">
                <span className="product-detail-image">
                  {displayProduct.image || '🛍️'}
                </span>
              </div>
              
              <div className="product-detail-info">
                <div className="product-stock-info">
                  <span className="stock-icon">📦</span>
                  <span>Stok tersedia: <strong>{displayProduct.stock || 0} unit</strong></span>
                </div>
                
                <div className="product-rating-info">
                  <div className="star-rating">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={i < Math.floor(displayProduct.rating || 0) ? 'star-filled' : 'star-empty'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span>{displayProduct.rating || 0} ({displayProduct.reviews || 0} reviews)</span>
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div className="product-detail-right">
              <div className="product-detail-header-section">
                <span className="product-category-badge">
                  {displayProduct.category || 'Produk'}
                </span>
                <h1 className="product-detail-name">
                  {displayProduct.name}
                </h1>
                <p className="product-detail-price">
                  Rp {(displayProduct.price || 0).toLocaleString('id-ID')}
                </p>
                <p className="product-detail-description">
                  {displayProduct.description || 'Deskripsi produk tidak tersedia.'}
                </p>
              </div>

              {/* Specifications */}
              {displayProduct.specs && displayProduct.specs.length > 0 && (
                <div className="product-specs-section">
                  <h3 className="specs-title">Spesifikasi:</h3>
                  <ul className="specs-list">
                    {displayProduct.specs.map((spec, idx) => (
                      <li key={idx} className="spec-item">
                        <span className="spec-check">✓</span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity Selector */}
              {displayProduct.stock > 0 && (
                <div className="quantity-section">
                  <label className="quantity-label">Jumlah:</label>
                  <div className="quantity-controls">
                    <button
                      onClick={decrementQuantity}
                      className="quantity-button"
                    >
                      -
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="quantity-button"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={displayProduct.stock === 0}
                className={`add-to-cart-button ${addedToCart ? 'added' : ''} ${displayProduct.stock === 0 ? 'disabled' : ''}`}
              >
                {displayProduct.stock === 0 ? (
                  <>
                    <span className="cart-icon">❌</span>
                    <span>Stok Habis</span>
                  </>
                ) : addedToCart ? (
                  <>
                    <span className="cart-icon">✓</span>
                    <span>Ditambahkan ke Keranjang!</span>
                  </>
                ) : (
                  <>
                    <span className="cart-icon">🛒</span>
                    <span>Tambah ke Keranjang</span>
                  </>
                )}
              </button>

              {/* Security Info */}
              <div className="product-security-box">
                <div className="security-header">
                  <span className="security-icon">🛡️</span>
                  <span>Transaksi Aman</span>
                </div>
                <ul className="security-features">
                  <li>✓ Terenkripsi dengan TLS/HTTPS</li>
                  <li>✓ Data dilindungi JWT Authentication</li>
                  <li>✓ Payment gateway tersertifikasi PCI-DSS</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;