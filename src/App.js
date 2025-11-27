import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Catalog from "./pages/Catalog";
import Profile from "./pages/Profile";

import PrivateRoute from "./components/PrivateRoute";

import { sendClickEvent } from "./services/clickstream";
import { getToken, clearToken, decodeToken } from "./services/tokenManager";

import ProductService from "./services/productService";
import MOCK_PRODUCTS from "./data/mockProduct";

function App() {
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [viewedProducts, setViewedProducts] = useState([]);

  // Initialize user from token on app load
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = decodeToken(token);
        if (decoded) {
          setUser({
            name: decoded.name,
            email: decoded.email
          });
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        clearToken();
      }
    }
  }, []);

  // Fetch recommendations when user logs in (from backend)
  useEffect(() => {
    const token = getToken();
    if (!token || !user) return;

    ProductService.getRecommendations()
      .then((r) => {
        if (Array.isArray(r) && r.length > 0) {
          console.log('✅ Recommendations from backend:', r);
          setRecommendations(r);
        } else {
          console.log('ℹ️ No recommendations from backend, will use local logic');
        }
      })
      .catch(err => {
        console.error('Failed to fetch recommendations:', err);
      });
  }, [user]);

  // 🔥 LOCAL RECOMMENDATION LOGIC
  // Generate recommendations based on viewed products
  useEffect(() => {
    if (viewedProducts.length === 0) {
      setRecommendations([]);
      return;
    }

    // Get categories from viewed products
    const viewedCategories = [...new Set(viewedProducts.map(p => p.category))];
    
    // Find products from same categories that haven't been viewed
    const recommendedProducts = MOCK_PRODUCTS.filter(product => {
      // Skip if already viewed
      const isViewed = viewedProducts.find(vp => vp.id === product.id);
      if (isViewed) return false;
      
      // Include if from same category as viewed products
      return viewedCategories.includes(product.category);
    });

    // Take max 4 recommendations
    const finalRecommendations = recommendedProducts.slice(0, 4);
    
    console.log('🎯 Local recommendations generated:', {
      viewedProducts: viewedProducts.length,
      viewedCategories,
      recommendations: finalRecommendations.length
    });

    setRecommendations(finalRecommendations);
  }, [viewedProducts]);

  // Handle product view (clickstream)
  const handleProductView = async (product) => {
    console.log('👁️ Product viewed:', product.name);
    
    // Check if product already viewed
    const isAlreadyViewed = viewedProducts.find(p => p.id === product.id);
    
    if (!isAlreadyViewed) {
      setViewedProducts((prev) => {
        const updated = [...prev, product];
        console.log('📊 Total viewed products:', updated.length);
        return updated;
      });
    } else {
      console.log('ℹ️ Product already viewed, skipping...');
    }

    const token = getToken();

    if (token) {
      try {
        await sendClickEvent('view', product);
        console.log('✅ Clickstream event sent successfully');
      } catch (error) {
        console.error('❌ Failed to send clickstream event:', error);
      }
    }
  };

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    clearToken();
    setUser(null);
    setViewedProducts([]);
    setRecommendations([]);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />

        {/* PRIVATE ROUTES */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home
                user={user}
                recommendations={recommendations}
                handleProductView={handleProductView}
              />
            </PrivateRoute>
          }
        />

        <Route
          path="/catalog"
          element={
            <PrivateRoute>
              <Catalog
                user={user}
                MOCK_PRODUCTS={MOCK_PRODUCTS}
                viewedProducts={viewedProducts}
                handleProductView={handleProductView}
              />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile 
                user={user} 
                viewedProducts={viewedProducts} 
                onLogout={handleLogout} 
              />
            </PrivateRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;