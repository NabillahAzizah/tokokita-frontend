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

  // Fetch recommendations when user logs in
  useEffect(() => {
    const token = getToken();
    if (!token || !user) return;

    ProductService.getRecommendations().then((r) => {
      if (Array.isArray(r)) setRecommendations(r);
    }).catch(err => {
      console.error('Failed to fetch recommendations:', err);
    });
  }, [user]);

  // Handle product view (clickstream)
  const handleProductView = async (product) => {
    // Check if product already viewed
    const isAlreadyViewed = viewedProducts.find(p => p.id === product.id);
    
    if (!isAlreadyViewed) {
      setViewedProducts((prev) => [...prev, product]);
    }

    const token = getToken();

    if (token) {
      try {
        await sendClickEvent('view', product);
      } catch (error) {
        console.error('Failed to send clickstream event:', error);
      }
    }
  };

  const handleLogout = () => {
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