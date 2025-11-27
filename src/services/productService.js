import api from './api';

const ProductService = {
  getRecommendations: async () => {
    const response = await api.request('/api/products/recommendations');
    if (!response.ok) return [];
    return await response.json();
  },

  getAllProducts: async () => {
    const response = await api.request('/api/products');
    if (!response.ok) return [];
    return await response.json();
  },

  checkout: async (items) => {
    const response = await api.request('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ items })
    });

    if (!response.ok) throw new Error('Checkout gagal');
    return await response.json();
  }
};

export default ProductService;