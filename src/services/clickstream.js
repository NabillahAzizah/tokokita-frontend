// src/services/clickstream.js
import TokenManager from './tokenManager';
import api from './api';

const SESSION_KEY = 'session_id';

// Buat atau ambil sessionId per browser session
function getOrCreateSessionId() {
  let sid = sessionStorage.getItem(SESSION_KEY);

  if (!sid) {
    sid =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    sessionStorage.setItem(SESSION_KEY, sid);
  }

  return sid;
}

const ClickstreamService = {
  /**
   * Kirim event clickstream ke backend.
   * action = 'view' | 'click' | 'add_to_cart' | 'purchase'
   * productData minimal harus punya id atau _id
   */
  sendEvent: async (action, productData, extraMetadata = {}) => {
    const token = TokenManager.getToken();

    // endpoint clickstream butuh login → wajib ada token valid
    if (!token || !TokenManager.isTokenValid()) {
      console.warn('Clickstream: No valid token, skipping event');
      return;
    }

    const decoded = TokenManager.decodeToken(token);
    const userId = decoded?.userId;

    const sessionId = getOrCreateSessionId();

    const productId = productData?.id || productData?._id;
    const productName = productData?.name;

    if (!productId) {
      console.warn('Clickstream: Missing productId, event skipped');
      return;
    }

    const payload = {
      sessionId,
      productId,
      action,
      timestamp: new Date().toISOString(),
      userId,
      metadata: {
        productName,
        ...extraMetadata,
      },
    };

    try {
      // backend route: POST /api/clickstream
      await api.request('/api/clickstream', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('✅ Clickstream event sent:', payload);
    } catch (error) {
      console.error('❌ Failed to send clickstream:', error);
    }
  },
};

// Export default dan named export
export const sendClickEvent = ClickstreamService.sendEvent;
export default ClickstreamService;
