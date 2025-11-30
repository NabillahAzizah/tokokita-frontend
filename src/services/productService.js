// src/services/productService.js
import api from './api';

const ProductService = {
  /**
   * Ambil rekomendasi produk dari backend.
   * Backend: GET /api/products/recommendations
   * Response: [ product, product, ... ]
   */
  getRecommendations: async () => {
    const response = await api.request('/api/products/recommendations');
    if (!response.ok) return [];
    // backend langsung kirim array produk
    return await response.json();
  },

  /**
   * Ambil semua produk.
   * Backend: GET /api/products
   * Response: { success: true, data: [...] }
   */
  getAllProducts: async (search) => {
    const query = search && search.trim() !== '' ? `?search=${encodeURIComponent(search.trim())}` : '';
    const response = await api.request(`/api/products${query}`);
    if (!response.ok) return [];

    const json = await response.json();
    // backend: { success: true, data: [...] }
    if (json && Array.isArray(json.data)) {
      return json.data;
    }

    console.warn('Unexpected /api/products response format:', json);
    return [];
  },

  /**
   * Ambil detail satu produk.
   * Backend: GET /api/products/:id
   * Response: { success: true, data: {...} }
   */
  getProductById: async (productId) => {
    const response = await api.request(`/api/products/${productId}`);
    if (!response.ok) {
      throw new Error('Gagal mengambil detail produk');
    }

    const json = await response.json();
    if (!json || json.success !== true) {
      throw new Error(json?.message || 'Produk tidak ditemukan');
    }

    return json.data;
  },

  /**
   * Checkout: kirim keranjang + alamat + no hp.
   *
   * Backend: POST /api/checkout
   * Payload:
   * {
   *   items: [{ productId, quantity }],
   *   address: string,
   *   phone: string
   * }
   *
   * Response:
   * {
   *   message,
   *   orderId,
   *   invoiceNumber,
   *   paymentStatus,        // "WAITING_PAYMENT" dll
   *   midtransRedirectUrl,  // URL snap sandbox
   *   order                 // (opsional, tergantung backend)
   * }
   */
  checkout: async ({ items, address, phone }) => {
    const response = await api.request('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items,
        address,
        phone,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.message || 'Checkout gagal');
    }

    const json = await response.json();
    return json;
  },

  /**
   * (Fase berikutnya) Ambil semua order user login.
   * Backend: GET /api/orders
   * Response: array order
   */
  getOrders: async () => {
    const response = await api.request('/api/orders');
    if (!response.ok) {
      throw new Error('Gagal mengambil daftar pesanan');
    }
    return await response.json();
  },

  /**
   * (Fase berikutnya) Ambil detail satu order.
   * Backend: GET /api/orders/:id
   * Response: objek order
   */
  getOrderById: async (orderId) => {
    const response = await api.request(`/api/orders/${orderId}`);
    if (!response.ok) {
      throw new Error('Gagal mengambil detail pesanan');
    }
    return await response.json();
  },
};

export default ProductService;
