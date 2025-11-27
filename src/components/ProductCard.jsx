import React from "react";
import { Eye } from "lucide-react";
// ===== COMPONENT: Product Card =====
const ProductCard = ({ product, onView }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 cursor-pointer"
      onClick={() => onView(product)}
    >
      <div className="text-6xl mb-4 text-center">{product.image}</div>
      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-3">{product.category}</p>
      <p className="text-blue-600 font-bold text-xl">
        Rp {product.price.toLocaleString('id-ID')}
      </p>
      <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2">
        <Eye size={16} />
        <span>Lihat Detail</span>
      </button>
    </div>
  );
};

export default ProductCard;