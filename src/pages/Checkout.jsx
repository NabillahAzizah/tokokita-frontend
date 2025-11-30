// src/pages/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getToken, decodeToken } from '../services/tokenManager';
import ProductService from '../services/productService';

const Checkout = ({ cart = [] }) => {
  const navigate = useNavigate();

  // Sekarang cuma butuh phone & address
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
  });

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Info user dari JWT (buat Navbar)
  const getUserInfo = () => {
    const token = getToken();
    if (token) {
      return decodeToken(token);
    }
    return null;
  };

  const userInfo = getUserInfo();

  // Mock cart kalau belum ada cart prop (biar halaman tetap kelihatan)
  const displayCart =
    cart.length > 0
      ? cart
      : [
          {
            id: 1,
            name: 'Kopi Robusta Strong 250g',
            price: 45000,
            category: 'Coffee',
            image: '☕',
            quantity: 1,
          },
        ];

  const totalPrice = displayCart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const shippingCost = 25000;
  const finalTotal = totalPrice + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Alamat wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      alert('Mohon lengkapi nomor telepon dan alamat pengiriman');
      return;
    }

    setProcessing(true);

    try {
      // Mapping cart ke format yang diminta backend:
      // [{ productId, quantity }]
      const itemsPayload = displayCart.map((item) => ({
        productId: item._id || item.id, // sesuaikan dengan bentuk data produk di FE
        quantity: item.quantity || 1,
      }));

      const payload = {
        items: itemsPayload,
        address: formData.address,
        phone: formData.phone,
      };

      const result = await ProductService.checkout(payload);

      setProcessing(false);

      // Kalau backend mengembalikan midtransRedirectUrl → redirect ke Snap
      if (result && result.midtransRedirectUrl) {
        window.location.href = result.midtransRedirectUrl;
        return;
      }

      // fallback kalau tidak ada URL
      alert(
        '✅ Pesanan berhasil dibuat, namun URL pembayaran tidak ditemukan.\n' +
          'Silakan cek riwayat pesanan Anda.'
      );
      navigate('/');
    } catch (error) {
      console.error('Checkout error:', error);
      setProcessing(false);
      alert('Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.');
    }
  };

  return (
    <div className="page-container">
      <Navbar user={userInfo} />

      {/* Back Button Header */}
      <div className="checkout-header">
        <div className="container">
          <button onClick={() => navigate(-1)} className="back-button">
            <span className="back-icon">←</span>
            <span>Kembali</span>
          </button>
        </div>
      </div>

      <div className="container">
        <h1 className="checkout-title">
          <span className="checkout-icon">🛒</span>
          Checkout
        </h1>

        <div className="checkout-grid">
          {/* Left: Form (sekarang simple) */}
          <div className="checkout-form-section">
            {/* Security Notice */}
            <div className="checkout-security-notice">
              <div className="security-notice-header">
                <span className="security-icon">🔒</span>
                <span>Transaksi Terenkripsi End-to-End</span>
              </div>
              <p className="security-notice-text">
                Nomor telepon dan alamat pengiriman Anda akan dienkripsi di
                database dan dilindungi dengan TLS saat dikirim ke server.
              </p>
            </div>

            {/* Kontak & Alamat */}
            <div className="checkout-section-card">
              <h2 className="checkout-section-title">
                <span className="section-icon">📞</span>
                Kontak & Alamat Pengiriman
              </h2>

              <div className="form-group">
                <label className="form-label">
                  Nomor Telepon <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`form-input ${
                    errors.phone ? 'input-error' : ''
                  }`}
                  placeholder="081234567890"
                />
                {errors.phone && (
                  <p className="error-message">{errors.phone}</p>
                )}
                <p className="input-hint">
                  🔒 Akan dienkripsi sebelum disimpan di database pesanan
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Alamat Lengkap <span className="required">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`form-input ${
                    errors.address ? 'input-error' : ''
                  }`}
                  placeholder="Jl. Contoh No. 123, RT/RW 001/002, Kel/Desa, Kecamatan, Kota/Kabupaten"
                />
                {errors.address && (
                  <p className="error-message">{errors.address}</p>
                )}
                <p className="input-hint">
                  🔒 Disimpan terenkripsi (AES-256) di sisi server
                </p>
              </div>

              <div className="payment-security-info">
                <p>
                  <strong>💳 Pembayaran via Midtrans Snap Sandbox:</strong>{' '}
                  Pilihan metode pembayaran (kartu, transfer, e-wallet) akan
                  muncul di halaman Midtrans setelah Anda menekan{' '}
                  <em>Bayar Sekarang</em>.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Ringkasan Pesanan */}
          <div className="checkout-summary-section">
            <div className="order-summary-card">
              <h2 className="summary-title">Ringkasan Pesanan</h2>

              <div className="order-items">
                {displayCart.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="order-item-image">{item.image}</div>
                    <div className="order-item-details">
                      <div className="order-item-name">{item.name}</div>
                      <div className="order-item-qty">
                        Qty: {item.quantity || 1}
                      </div>
                    </div>
                    <div className="order-item-price">
                      Rp{' '}
                      {(item.price * (item.quantity || 1)).toLocaleString(
                        'id-ID'
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span className="total-label">Subtotal:</span>
                  <span className="total-value">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="total-row">
                  <span className="total-label">
                    <span className="shipping-icon">🚚</span> Ongkir:
                  </span>
                  <span className="total-value">
                    Rp {shippingCost.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="total-row final-total">
                  <span className="total-label">Total:</span>
                  <span className="total-value">
                    Rp {finalTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processing}
                className={`checkout-button ${
                  processing ? 'processing' : ''
                }`}
              >
                {processing ? (
                  <>
                    <span className="spinner"></span>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span className="checkout-button-icon">🔒</span>
                    <span>Bayar Sekarang</span>
                  </>
                )}
              </button>

              <div className="checkout-terms">
                Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
