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

    const json = await response.json();
    // backend: { success: true, data: [...] }
    if (json && Array.isArray(json.data)) {
      return json.data;
    }

    console.warn("Unexpected /api/products response format:", json);
    return [];
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
