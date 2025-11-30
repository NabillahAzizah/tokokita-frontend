import React from "react";
import { useNavigate } from "react-router-dom"; // NEW

// ===== COMPONENT: Product Card =====
const ProductCard = ({ product, onView }) => {
  const navigate = useNavigate();

   const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Product card clicked:", product);
    
    // Track the view first
    if (onView) {
      onView(product);
    }
    
    // Then navigate to product detail
    const productId = product.id || product._id;
    console.log("Navigating to product:", productId);
    navigate(`/product/${productId}`);
  };

  return (
    <div 
      className="product-card"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-icon">{product.image || '🛍️'}</div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-category">{product.category}</p>
      <p className="product-price">
        Rp {(product.price || 0).toLocaleString('id-ID')}
      </p>
      <button 
        className="product-button"
        onClick={handleClick}
      >
        <span className="product-button-icon">👁️</span>
        <span>Lihat Detail</span>
      </button>
    </div>
  );
};

export default ProductCard;