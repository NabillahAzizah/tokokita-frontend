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
  const [products, setProducts] = useState(MOCK_PRODUCTS); // default dummy
  const [productsLoadedFromAPI, setProductsLoadedFromAPI] = useState(false);
  const [hasBackendRecommendations, setHasBackendRecommendations] = useState(false);

  // 🛒 Fetch semua produk dari backend (dengan fallback ke MOCK_PRODUCTS)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getAllProducts();

        if (Array.isArray(data) && data.length > 0) {
          console.log("✅ Products from backend:", data);
          setProducts(data);
          setProductsLoadedFromAPI(true);
        } else {
          console.log(
            "ℹ️ No products from backend, using MOCK_PRODUCTS as fallback"
          );
          setProducts(MOCK_PRODUCTS);
          setProductsLoadedFromAPI(false);
        }
      } catch (err) {
        console.error("❌ Failed to fetch products, using MOCK_PRODUCTS:", err);
        setProducts(MOCK_PRODUCTS);
        setProductsLoadedFromAPI(false);
      }
    };

    fetchProducts();
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
          setHasBackendRecommendations(true); // pakai rekomendasi backend
        } else {
          console.log(
            "ℹ️ No recommendations from backend, will use local logic"
          );
          setHasBackendRecommendations(false); // backend tidak ada, pakai lokal
        }
      })
      .catch((err) => {
        console.error("Failed to fetch recommendations:", err);
        setHasBackendRecommendations(false); // error → pakai lokal
      });
  }, [user]);

  // 🔥 LOCAL RECOMMENDATION LOGIC (fallback)
  useEffect(() => {
    // kalau sudah ada rekomendasi dari backend, jangan override dengan lokal
    if (hasBackendRecommendations) {
      console.log("✅ Using backend recommendations, skip local logic");
      return;
    }

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
  }, [viewedProducts, hasBackendRecommendations]);

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
    setHasBackendRecommendations(false);
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
                products={products}
                viewedProducts={viewedProducts}
                handleProductView={handleProductView}
                productsLoadedFromAPI={productsLoadedFromAPI}
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
