// OrderHistory.jsx (deep-unwrap fix + fixed table columns)
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../styles/OrderHistory.css";

export default function OrderHistory({
  darkMode = true,
  token = localStorage.getItem("token") || "",
  authHeader = token ? { Authorization: `Bearer ${token}` } : {},
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({}); // {orderId: bool}

  const toggle = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const computeDiscounted = (price, discount) => {
    const p = Number(price) || 0;
    const d = Number(discount) || 0;
    if (d <= 0) return p;
    if (d > 0 && d <= 1) return +(p * (1 - d)).toFixed(2);
    if (d > 1 && d <= 100) return +(p * (1 - d / 100)).toFixed(2);
    return +Math.max(0, p - d).toFixed(2);
  };

  const normalizeItem = (raw, idx) => {
    const p = raw.product || raw; // يدعم شكل {product, qty} أو سناب شوت المنتج
    const qty = Number(raw.qty || raw.quantity || 1);
    const price = Number(p.prodPrice || p.price || 0);
    const discount = Number(p.discount || 0);
    const effectivePrice = computeDiscounted(price, discount);
    return {
      id: raw._id || raw.id || p._id || idx,
      productId: p._id || raw.productId || null,
      qty,
      prodName: p.prodName || p.name || "Unnamed",
      prodImage: p.prodImage || p.image || "",
      prodPrice: price,
      discount,
      effectivePrice,
      prodBrand: p.prodBrand || "",
      prodStock: Number(p.prodStock ?? 0),
      tags: Array.isArray(p.tags) ? p.tags : [],
    };
  };

  const formatPrice = (n) => (isNaN(n) ? "0.00" : Number(n).toFixed(2));
  const shortId = (id = "") => String(id).slice(-6).toUpperCase();
  const niceDate = (d) => (d ? new Date(d).toLocaleString() : "");

  // ------- Deep unwrap: يلقط أول Array تشبه طلبات حتى لو كانت عميقة -------
  const looksLikeOrder = (o) =>
    o &&
    typeof o === "object" &&
    (Array.isArray(o.items) ||
      "total" in o ||
      "status" in o ||
      "shippingAddress" in o ||
      "paymentMethod" in o);

  const findOrderArrayDeep = (node, depth = 0) => {
    if (!node || depth > 4) return null;
    if (Array.isArray(node)) {
      if (node.length === 0) return node;
      if (node.some(looksLikeOrder)) return node;
      return null;
    }
    if (typeof node === "object") {
      const keysPref = [
        "orders",
        "data",
        "myOrders",
        "result",
        "rows",
        "items",
        "docs",
        "payload",
        "response",
        "list",
      ];
      for (const k of keysPref) {
        if (k in node) {
          const found = findOrderArrayDeep(node[k], depth + 1);
          if (found) return found;
        }
      }
      for (const v of Object.values(node)) {
        const found = findOrderArrayDeep(v, depth + 1);
        if (found) return found;
      }
    }
    return null;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://127.0.0.1:5002/api/orders/my-orders",
        { headers: authHeader }
      );
      const raw = res?.data ?? [];
      const list =
        (Array.isArray(raw) ? raw : findOrderArrayDeep(raw)) || [];

      const normalized = (list || []).map((o, i) => {
        const itemsRaw = o.items || o.orderItems || o.products || [];
        const items = itemsRaw.map(normalizeItem);
        const itemsSubtotal = items.reduce(
          (s, it) => s + it.effectivePrice * it.qty,
          0
        );
        const delivery = Number(o.deliveryFee ?? o.shipping ?? o.delivery ?? 0);
        const total = Number(
          o.total ?? o.totalPrice ?? itemsSubtotal + delivery
        );
        return {
          ...o,
          _idx: i,
          items,
          itemsSubtotal,
          delivery,
          total,
        };
      });

      setOrders(normalized);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert("Couldn't load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const counts = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) =>
      String(o.status || o.state || "").toLowerCase().includes("deliv")
    ).length;
    const pending = orders.filter((o) => {
      const s = String(o.status || o.state || "").toLowerCase();
      return s.includes("pend") || s.includes("proc");
    }).length;
    return { total, delivered, pending };
  }, [orders]);

  return (
    <div className={`au-page au-orders ${darkMode ? "au-dark" : ""}`}>
      <div className="au-container">
        <div className="orders-header">
          <h1 className="title">Order History</h1>
          <div className="chips">
            <span className="chip">All: {counts.total}</span>
            <span className="chip">Pending: {counts.pending}</span>
            <span className="chip">Delivered: {counts.delivered}</span>
          </div>
        </div>

        {loading ? (
          <div className="au-skeleton-list">
            <div className="au-skeleton" />
            <div className="au-skeleton" />
            <div className="au-skeleton" />
          </div>
        ) : orders.length === 0 ? (
          <div className="au-empty-card au-card">
            <div className="empty-title">No orders yet</div>
            <div className="empty-sub">
              When you place an order, it will show up here.
            </div>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((o) => (
              <div key={o._id || o._idx} className="au-card order-card">
                <div className="order-head">
                  <div className="left">
                    <div className="row1">
                      <span className="order-id">
                        Order #{shortId(o._id || o.id)}
                      </span>
                      {o.status || o.state ? (
                        <span
                          className={`status-chip ${String(
                            o.status || o.state
                          ).toLowerCase()}`}
                        >
                          {o.status || o.state}
                        </span>
                      ) : null}
                    </div>
                    <div className="row2 muted">
                      {niceDate(o.createdAt || o.date)}
                    </div>
                  </div>
                  <div className="right">
                    <div className="total">
                      <span className="muted">Total</span>
                      <span className="sum">{formatPrice(o.total)} JOD</span>
                    </div>
                    <button
                      className="au-btn ghost"
                      onClick={() => toggle(o._id || o._idx)}
                    >
                      {expanded[o._id || o._idx] ? "Hide Items" : "View Items"}
                    </button>
                  </div>
                </div>

                <div
                  className={`order-body ${
                    expanded[o._id || o._idx] ? "open" : ""
                  }`}
                >
                  {/* ===== جدول بنفس التصميم لكن أعمدة ثابتة لاصطفاف دقيق ===== */}
                  <table className="au-table au-table-fixed">
                    <colgroup>
                      <col style={{ width: "52%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "16%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "12%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th className="t-center">Qty</th>
                        <th className="t-right">Price</th>
                        <th className="t-right">Discount</th>
                        <th className="t-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {o.items.map((prod) => (
                        <tr key={prod.id}>
                          <td className="t-product">
                            {prod.prodImage ? (
                              <img
                                src={`http://localhost:5002/uploads/${prod.prodImage}`}
                                alt="prod"
                                width="40"
                                style={{ borderRadius: "6px" }}
                              />
                            ) : (
                              <span className="img-ph" />
                            )}
                            <span className="prod-title">
                              {prod.prodName}
                              {prod.prodBrand ? (
                                <span className="muted"> — {prod.prodBrand}</span>
                              ) : null}
                            </span>
                          </td>
                          <td className="t-center">{prod.qty}</td>
                          <td className="t-right">
                            {formatPrice(prod.prodPrice)} JOD
                          </td>
                          <td className="t-right">
                            {prod.discount ? String(prod.discount) : "0"}
                          </td>
                          <td className="t-right">
                            {formatPrice(prod.effectivePrice * prod.qty)} JOD
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="order-summary">
                    <div className="row">
                      <span>Items Subtotal</span>
                      <span>{formatPrice(o.itemsSubtotal)} JOD</span>
                    </div>
                    <div className="row">
                      <span>Delivery</span>
                      <span>{formatPrice(o.delivery)} JOD</span>
                    </div>
                    <div className="row total">
                      <span>Total</span>
                      <span>{formatPrice(o.total)} JOD</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
