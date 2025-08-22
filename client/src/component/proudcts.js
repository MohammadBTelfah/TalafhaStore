// src/pages/ProductsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/products.css";

const API_BASE = "http://localhost:5002";
const IMG_BASE = "http://localhost:5002/uploads";

export default function ProductsPage({ darkMode }) {
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // UI state
  const [query, setQuery] = useState("");
   const [sort, setSort] = useState("newest");
  const [priceMax, setPriceMax] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("all");

  // Modal
  const [active, setActive] = useState(null);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, text: "", variant: "success" });
  const showSnack = (text, variant = "success", ms = 2500) => {
    setSnack({ open: true, text, variant });
    window.clearTimeout(showSnack._t);
    showSnack._t = window.setTimeout(() => setSnack((s) => ({ ...s, open: false })), ms);
  };

  // Helpers
  const getImageUrl = (fileName) => {
    if (!fileName) return "https://via.placeholder.com/800x600?text=No+Image";
    return `${IMG_BASE}/${String(fileName).replace(/\\/g, "/")}`;
  };
  const sameId = (a, b) => String(a || "").toLowerCase() === String(b || "").toLowerCase();

  // ✅ شارة الستوك
  const stockClass = (n) => {
    const s = Number(n ?? 0);
    if (s <= 0) return "stock-badge out";
    if (s <= 5) return "stock-badge low";
    return "stock-badge in";
  };
  const stockText = (n) => {
    const s = Number(n ?? 0);
    if (s <= 0) return "Out of stock";
    if (s === 1) return "Only 1 left";
    if (s <= 5) return `${s} left`;
    return `In stock (${s})`;
  };

  // Fetchers
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/products/getall`);
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/categories/getAll`);
      setCats(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Effects
  useEffect(() => {
    const urlCat = searchParams.get("category");
    if (urlCat) setSelectedCatId(urlCat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };
    run();
  }, []);

  // Filter + sort
  const shown = useMemo(() => {
    let list = [...products];

    if (selectedCatId !== "all") {
      list = list.filter((p) => {
        const pc = p.prodCategory;
        const pid = typeof pc === "object" && pc !== null ? pc._id : pc;
        return sameId(pid, selectedCatId);
      });
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          String(p.prodName || "").toLowerCase().includes(q) ||
          String(p.prodDescription || "").toLowerCase().includes(q)
      );
    }

    if (priceMax !== "" && !Number.isNaN(Number(priceMax))) {
      const mx = Number(priceMax);
      list = list.filter((p) => Number(p.prodPrice || 0) <= mx);
    }

    if (sort === "price-asc") {
      list.sort((a, b) => Number(a.prodPrice || 0) - Number(b.prodPrice || 0));
    } else if (sort === "price-desc") {
      list.sort((a, b) => Number(b.prodPrice || 0) - Number(a.prodPrice || 0));
    } else if (sort === "name") {
      list.sort((a, b) =>
        String(a.prodName || "").localeCompare(String(b.prodName || ""))
      );
    } else if (sort === "newest") {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [products, selectedCatId, query, priceMax, sort]);

  // Cart + Snackbar
  const addToCart = async (product, qty = 1) => {
    try {
      const raw = localStorage.getItem("token") || "";
      const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;
      if (!token) {
        showSnack("Please login first.", "error", 2500);
        return;
      }
      const quantity = Math.max(1, Number(qty) || 1);
      await axios.post(
        "http://127.0.0.1:5002/api/cart/add-to-cart",
        { productId: product._id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      try {
        window.dispatchEvent(new CustomEvent("cart:delta", { detail: { delta: quantity } }));
        if (typeof window.onCartDelta === "function") window.onCartDelta(quantity);
        localStorage.setItem("__cart_delta_ping__", String(Date.now()));
      } catch {}
      showSnack("proudct add sucsessfly", "success", 2200);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to add product";
      console.error("AddToCart error:", e?.response?.data || e);
      showSnack(msg, "error", 3000);
    }
  };

  const selectCategory = (catValue) => {
    setSelectedCatId(catValue);
    const sp = new URLSearchParams(searchParams);
    if (catValue === "all") sp.delete("category");
    else sp.set("category", catValue);
    navigate({ search: `?${sp.toString()}` }, { replace: true });
  };

  // Render
  return (
    <div className={`au-page ${darkMode ? "au-dark" : ""}`}>
      <div className="products-wrap">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>Categories</h3>
          <div className="cat-list">
            <button
              className={`cat-btn ${selectedCatId === "all" ? "active" : ""}`}
              onClick={() => selectCategory("all")}
            >
              All
            </button>
            {cats.map((c) => {
              const id = c._id || c.id;
              const label = c.name || c.title || "Category";
              return (
                <button
                  key={String(id)}
                  className={`cat-btn ${selectedCatId === String(id) ? "active" : ""}`}
                  onClick={() => selectCategory(String(id))}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content */}
        <main>
          <div className="header-bar">
            <div className="search">
              <input
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="name">Name (A–Z)</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>

            <div className="range">
              <span>Max JD</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 200"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="select"
                style={{ width: 120 }}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card-skel skel" />
              ))}
            </div>
          ) : (
            <div className="grid">
              {shown.map((p) => (
                <div key={p._id} className="card">
                  {/* ✅ شارة الستوك ترجع هنا */}
                  <div className={stockClass(p.prodStock)}>{stockText(p.prodStock)}</div>

                  <div className="thumb">
                    <img src={getImageUrl(p.prodImage)} alt={p.prodName} />
                  </div>
                  <div className="body">
                    <div className="title">{p.prodName}</div>
                    <div className="price">JD {Number(p.prodPrice || 0).toFixed(2)}</div>
                    <div className="actions">
                      <button className="btn" onClick={() => setActive(p)}>See Details</button>
                      <button className="btn cta" onClick={() => addToCart(p)}>Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {active && (
        <div className="modal-backdrop" onClick={() => setActive(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setActive(null)}>✕</button>

            <div className="modal-media">
              <img src={getImageUrl(active.prodImage)} alt={active.prodName} />
            </div>

            <div className="modal-body">
              {/* العنوان/السعر + شارة الستوك يمين */}
              <div className="modal-row">
                <div>
                  <div className="modal-title">{active.prodName}</div>
                  <div className="price">JD {Number(active.prodPrice || 0).toFixed(2)}</div>
                </div>
                <div className={stockClass(active.prodStock)}>{stockText(active.prodStock)}</div>
              </div>

              <div className="modal-desc">
                {active.prodDescription || "No description provided."}
              </div>
              <div className="modal-actions">
                <button className="btn cta" onClick={() => addToCart(active)}>Add to Cart</button>
                <button className="btn" onClick={() => setActive(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snack.open && (
        <div className={`au-snack ${snack.variant}`}>
          <span className="au-snack-text">{snack.text}</span>
          <button className="au-snack-x" onClick={() => setSnack((s) => ({ ...s, open: false }))}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
