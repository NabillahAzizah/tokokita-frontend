// src/App.js
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Catalog from "./pages/Catalog";
import Profile from "./pages/Profile";

import PrivateRoute from "./components/PrivateRoute";

import { sendClickEvent } from "./services/clickstream";
import {
  getToken,
  clearToken,
  decodeToken,
  isTokenValid,
} from "./services/tokenManager";

import ProductService from "./services/productService";
import MOCK_PRODUCTS from "./data/mockProduct";

function App() {
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [viewedProducts, setViewedProducts] = useState([]);

  // ✅ Initialize user from token + localStorage on app load
  useEffect(() => {
    const token = getToken();
    const storedUser = localStorage.getItem("tk_user");

    // kalau tidak ada token atau token sudah tidak valid → bersihkan semua
    if (!token || !isTokenValid()) {
      clearToken();
      localStorage.removeItem("tk_user");
      return;
    }

    // kalau ada user yang sudah disimpan di localStorage
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("tk_user");
      }
    } else {
      // fallback minimal user dari payload JWT (kalau suatu saat mau dipakai)
      const decoded = decodeToken(token);
      if (decoded && decoded.userId) {
        setUser({
          id: decoded.userId,
          name: decoded.name || "User",
          email: decoded.email || "",
          role: decoded.role || "user",
        });
      }
    }
  }, []);

  // 🔗 Fetch recommendations from backend when user logs in
  useEffect(() => {
    const token = getToken();
    if (!token || !user) return;

    ProductService.getRecommendations()
      .then((r) => {
        if (Array.isArray(r) && r.length > 0) {
          console.log("✅ Recommendations from backend:", r);
          setRecommendations(r);
        } else {
          console.log(
            "ℹ️ No recommendations from backend, will use local logic"
          );
        }
      })
      .catch((err) => {
        console.error("Failed to fetch recommendations:", err);
      });
  }, [user]);

  // 🔥 LOCAL RECOMMENDATION LOGIC (fallback)
  useEffect(() => {
    if (viewedProducts.length === 0) {
      setRecommendations([]);
      return;
    }

    // Ambil kategori dari produk yang pernah dilihat
    const viewedCategories = [
      ...new Set(viewedProducts.map((p) => p.category)),
    ];

    // Cari produk lain di kategori yang sama tapi belum pernah dilihat
    const recommendedProducts = MOCK_PRODUCTS.filter((product) => {
      const isViewed = viewedProducts.find((vp) => vp.id === product.id);
      if (isViewed) return false;

      return viewedCategories.includes(product.category);
    });

    const finalRecommendations = recommendedProducts.slice(0, 4);

    console.log("🎯 Local recommendations generated:", {
      viewedProducts: viewedProducts.length,
      viewedCategories,
      recommendations: finalRecommendations.length,
    });

    setRecommendations(finalRecommendations);
  }, [viewedProducts]);

  // 📡 Handle product view + kirim clickstream
  const handleProductView = async (product) => {
    console.log("👁️ Product viewed:", product.name);

    const isAlreadyViewed = viewedProducts.find((p) => p.id === product.id);

    if (!isAlreadyViewed) {
      setViewedProducts((prev) => {
        const updated = [...prev, product];
        console.log("📊 Total viewed products:", updated.length);
        return updated;
      });
    } else {
      console.log("ℹ️ Product already viewed, skipping...");
    }

    const token = getToken();

    if (token) {
      try {
        await sendClickEvent("view", product);
        console.log("✅ Clickstream event sent successfully");
      } catch (error) {
        console.error("❌ Failed to send clickstream event:", error);
      }
    }
  };

  const handleLogout = () => {
    console.log("🚪 Logging out...");
    clearToken();
    localStorage.removeItem("tk_user");
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
