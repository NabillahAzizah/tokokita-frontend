import TokenManager from "./tokenManager";
import api from "./api";

// ===== SERVICE: Clickstream (Secured) =====
const ClickstreamService = {
  // Mengirim event clickstream ke RabbitMQ via secured HTTPS API
  sendEvent: async (eventType, productData) => {
    const token = TokenManager.getToken();
    
    if (!token || !TokenManager.isTokenValid()) {
      console.warn('Clickstream: No valid token, skipping event');
      return;
    }
    
    const event = {
      userId: TokenManager.decodeToken(token)?.userId,
      eventType, // 'view', 'click', 'add_to_cart', 'checkout'
      productId: productData?.id,
      productName: productData?.name,
      timestamp: new Date().toISOString(),
      sessionId: sessionStorage.getItem('session_id') || crypto.randomUUID()
    };
    
    // Simpan session ID jika belum ada
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', event.sessionId);
    }
    
    try {
      // Kirim ke backend yang akan forward ke RabbitMQ
      await api.request('/api/clickstream/track', {
        method: 'POST',
        body: JSON.stringify(event)
      });
      
      console.log('✅ Clickstream event sent:', event);
    } catch (error) {
      console.error('❌ Failed to send clickstream:', error);
    }
  }
};

// Export both default and named
export const sendClickEvent = ClickstreamService.sendEvent;
export default ClickstreamService;