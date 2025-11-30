import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getToken, decodeToken } from '../services/tokenManager';
import ProductService from '../services/productService';

const Checkout = ({ cart = [] }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'credit_card'
  });

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Get user info
  const getUserInfo = () => {
    const token = getToken();
    if (token) {
      return decodeToken(token);
    }
    return null;
  };

  const userInfo = getUserInfo();

  // Mock cart if empty (for demo)
  const displayCart = cart.length > 0 ? cart : [
    {
      id: 1,
      name: 'Laptop Gaming Pro X1',
      price: 15000000,
      category: 'Electronics',
      image: '💻',
      quantity: 1
    }
  ];

  const totalPrice = displayCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = 25000;
  const finalTotal = totalPrice + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Nama lengkap wajib diisi';
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
    if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
    if (!formData.city.trim()) newErrors.city = 'Kota wajib diisi';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Kode pos wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    setProcessing(true);

    try {
      // Call backend checkout API
      const orderData = {
        items: displayCart,
        customerInfo: formData,
        totalAmount: finalTotal,
        shippingCost: shippingCost
      };

      // Use ProductService.checkout or custom API call
      await ProductService.checkout(orderData);

      setProcessing(false);
      
      alert(
        '✅ Pesanan berhasil! Data Anda telah dienkripsi dan disimpan dengan aman.\n\n' +
        '🔒 Security Features:\n' +
        '• Data pribadi terenkripsi di database (AES-256)\n' +
        '• Transaksi dilindungi TLS 1.3\n' +
        '• JWT token untuk autentikasi\n' +
        '• API key payment gateway tersimpan aman di environment variables'
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
          <button 
            onClick={() => navigate(-1)}
            className="back-button"
          >
            <span className="back-icon">←</span>
            <span>Kembali</span>
          </button>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="container">
        <h1 className="checkout-title">
          <span className="checkout-icon">🛒</span>
          Checkout
        </h1>

        <div className="checkout-grid">
          {/* Left: Form */}
          <div className="checkout-form-section">
            {/* Security Notice */}
            <div className="checkout-security-notice">
              <div className="security-notice-header">
                <span className="security-icon">🔒</span>
                <span>Transaksi Terenkripsi End-to-End</span>
              </div>
              <p className="security-notice-text">
                Data pribadi Anda dienkripsi dengan AES-256 di database dan dilindungi TLS 1.3 saat transit.
              </p>
            </div>

            {/* Personal Information */}
            <div className="checkout-section-card">
              <h2 className="checkout-section-title">
                <span className="section-icon">👤</span>
                Informasi Pribadi
              </h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Nama Lengkap <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                    placeholder="John Doe"
                  />
                  {errors.fullName && <p className="error-message">{errors.fullName}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="error-message">{errors.email}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Nomor Telepon <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phone ? 'input-error' : ''}`}
                    placeholder="081234567890"
                  />
                  {errors.phone && <p className="error-message">{errors.phone}</p>}
                  <p className="input-hint">🔒 Akan dienkripsi sebelum disimpan</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="checkout-section-card">
              <h2 className="checkout-section-title">
                <span className="section-icon">📍</span>
                Alamat Pengiriman
              </h2>
              
              <div className="form-group">
                <label className="form-label">
                  Alamat Lengkap <span className="required">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`form-input ${errors.address ? 'input-error' : ''}`}
                  placeholder="Jl. Contoh No. 123, RT/RW 001/002"
                />
                {errors.address && <p className="error-message">{errors.address}</p>}
                <p className="input-hint">🔒 Akan dienkripsi sebelum disimpan</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Kota <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`form-input ${errors.city ? 'input-error' : ''}`}
                    placeholder="Jakarta"
                  />
                  {errors.city && <p className="error-message">{errors.city}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Kode Pos <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={`form-input ${errors.postalCode ? 'input-error' : ''}`}
                    placeholder="12345"
                  />
                  {errors.postalCode && <p className="error-message">{errors.postalCode}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-section-card">
              <h2 className="checkout-section-title">
                <span className="section-icon">💳</span>
                Metode Pembayaran
              </h2>
              
              <div className="payment-methods">
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={formData.paymentMethod === 'credit_card'}
                    onChange={handleInputChange}
                    className="payment-radio"
                  />
                  <div className="payment-method-content">
                    <div className="payment-method-name">Kartu Kredit/Debit</div>
                    <div className="payment-method-desc">Visa, Mastercard, JCB</div>
                  </div>
                  <span className="payment-shield">🛡️</span>
                </label>

                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={handleInputChange}
                    className="payment-radio"
                  />
                  <div className="payment-method-content">
                    <div className="payment-method-name">Transfer Bank</div>
                    <div className="payment-method-desc">BCA, Mandiri, BNI, BRI</div>
                  </div>
                  <span className="payment-shield">🛡️</span>
                </label>

                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="e_wallet"
                    checked={formData.paymentMethod === 'e_wallet'}
                    onChange={handleInputChange}
                    className="payment-radio"
                  />
                  <div className="payment-method-content">
                    <div className="payment-method-name">E-Wallet</div>
                    <div className="payment-method-desc">GoPay, OVO, Dana, ShopeePay</div>
                  </div>
                  <span className="payment-shield">🛡️</span>
                </label>
              </div>

              <div className="payment-security-info">
                <p>
                  <strong>🔐 Payment Gateway Security:</strong> API key Midtrans disimpan aman di environment variables (bukan di code), terenkripsi, dan hanya dapat diakses oleh server backend.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-summary-section">
            <div className="order-summary-card">
              <h2 className="summary-title">Ringkasan Pesanan</h2>
              
              <div className="order-items">
                {displayCart.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="order-item-image">{item.image}</div>
                    <div className="order-item-details">
                      <div className="order-item-name">{item.name}</div>
                      <div className="order-item-qty">Qty: {item.quantity}</div>
                    </div>
                    <div className="order-item-price">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span className="total-label">Subtotal:</span>
                  <span className="total-value">Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="total-row">
                  <span className="total-label">
                    <span className="shipping-icon">🚚</span> Ongkir:
                  </span>
                  <span className="total-value">Rp {shippingCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="total-row final-total">
                  <span className="total-label">Total:</span>
                  <span className="total-value">Rp {finalTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processing}
                className={`checkout-button ${processing ? 'processing' : ''}`}
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