// Checkout.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "../styles/Checkout.css";

export default function Checkout({
  darkMode = true,
  token = localStorage.getItem("token") || "",
  authHeader = token ? { Authorization: `Bearer ${token}` } : {},
  setCartItems = () => {},
  setCartCount = () => {},
  setSnackbarKey = () => {},
  setSuccessOpen = () => {},
}) {
  const [step, setStep] = useState(1);

  // Cart
  const [loadingCart, setLoadingCart] = useState(false);
  const [cart, setCart] = useState([]);
  const [deliveryFee] = useState(3.5);
  const [note, setNote] = useState("");

  // Payment
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [showBack, setShowBack] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" | "cash"

  // Shipping
  const [ship, setShip] = useState({
    fullName: "",
    phone: "",
    country: "Jordan",
    city: "",
    area: "",
    street: "",
    building: "",
    apartment: "",
    postalCode: "",
  });

  // Place Order UI
  const [confirmSec, setConfirmSec] = useState(0); // 0=idle
  const confirmTimerRef = useRef(null);
  const holdTimerRef = useRef(null);
  const holdTriggeredRef = useRef(false);
  const submittingRef = useRef(false);
  const [stage, setStage] = useState("idle"); // idle | processing | success
  const lastCountRef = useRef(0);

  /* ---------------- helpers ---------------- */
  const broadcastCartCount = (count) => {
    try {
      window.dispatchEvent(new CustomEvent("cart:count", { detail: count }));
    } catch {}
    patchCartBadgeDom(count); // DOM fallback (in case header doesn't listen to event/props)
  };

  // Imperative fallback for headers that don't subscribe to events/props
  const patchCartBadgeDom = (count) => {
    const badge =
      document.querySelector("[data-cart-badge]") ||
      document.getElementById("cart-badge") ||
      document.querySelector(".cart-icon .badge");
    if (!badge) return;
    if (count > 0) {
      badge.style.display = "inline-flex";
      badge.textContent = String(count);
    } else {
      badge.style.display = "none";
      badge.textContent = "0";
    }
  };

  const computeDiscounted = (price, discount) => {
    const p = Number(price) || 0;
    const d = Number(discount) || 0;
    if (d <= 0) return p;
    if (d > 0 && d <= 1) return +(p * (1 - d)).toFixed(2);
    if (d > 1 && d <= 100) return +(p * (1 - d / 100)).toFixed(2);
    return +Math.max(0, p - d).toFixed(2);
  };

  const normalizeItem = (raw, i) => {
    const p = raw.product || raw;
    const qty = Number(raw.qty || raw.quantity || raw.count || 1);
    const price = Number(p.prodPrice || p.price || 0);
    const discount = Number(p.discount || 0);
    const effectivePrice = computeDiscounted(price, discount);
    return {
      id: raw._id || raw.id || p._id || i,
      cartItemId: raw._id || raw.id || null,
      productId: p._id || raw.productId || null,
      qty,
      prodName: p.prodName || p.name || "Unnamed",
      prodImage: p.prodImage || p.image || "",
      prodPrice: price,
      discount,
      effectivePrice,
      prodDescription: p.prodDescription || "",
      prodCategory: p.prodCategory || null,
      prodBrand: p.prodBrand || "",
      prodStock: Number(p.prodStock ?? 0),
      prodRating: Number(p.prodRating || 0),
      prodReviews: Number(p.prodReviews || 0),
      isFeatured: Boolean(p.isFeatured ?? false),
      isActive: Boolean(p.isActive ?? true),
      tags: Array.isArray(p.tags) ? p.tags : [],
    };
  };

  const subtotal = useMemo(
    () => cart.reduce((s, it) => s + it.effectivePrice * it.qty, 0),
    [cart]
  );
  const total = useMemo(
    () => subtotal + (cart.length ? deliveryFee : 0),
    [subtotal, deliveryFee, cart.length]
  );
  const formatPrice = (n) => (isNaN(n) ? "0.00" : Number(n).toFixed(2));
  const formatCardNumber = (val) => {
    const only = String(val).replace(/\D/g, "").slice(0, 16);
    return only.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };
  const handleCardNumber = (e) => setCardNumber(formatCardNumber(e.target.value));
  const handleExpiry = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
    setExpiry(v);
  };
  const handleCvv = (e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4));

  /* ---------------- load cart ---------------- */
  const refreshCart = async () => {
    const res = await axios.get("http://127.0.0.1:5002/api/cart/get-cart", {
      headers: authHeader,
    });
    const data = res?.data || {};
    const items = data.items || data.cart?.items || data.cart || data.data || [];
    const normalized = items.map((raw, i) => normalizeItem(raw, i));
    setCart(normalized);

    const newCount = normalized.reduce((a, it) => a + it.qty, 0);
    setCartCount(newCount);
    broadcastCartCount(newCount);
    lastCountRef.current = newCount;

    setCartItems(normalized);
    return normalized.length;
  };

  useEffect(() => {
    (async () => {
      setLoadingCart(true);
      try {
        await refreshCart();
      } catch (e) {
        console.error(e);
        alert("Couldn't load your cart. Please refresh.");
      } finally {
        setLoadingCart(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* ---------------- qty control ---------------- */
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const updateQty = (rowId, nextQty) => {
    setCart((prev) => {
      const next = prev.map((it) => {
        if (it.id !== rowId) return it;
        const max = it.prodStock > 0 ? it.prodStock : 99;
        const q = clamp(Number(nextQty || 1), 1, max);
        return { ...it, qty: q };
      });
      const count = next.reduce((a, it) => a + it.qty, 0);
      setCartCount(count);
      broadcastCartCount(count);
      lastCountRef.current = count;
      setCartItems(next);
      return next;
    });
  };

  /* ---------------- navigation & validation ---------------- */
  const nextDisabled = () => {
    if (step === 1) return !cart.length;
    if (step === 2) {
      if (paymentMethod === "cash") return false; // hide & skip card checks
      return (
        !cardNumber ||
        !expiry ||
        !cvv ||
        cardNumber.replace(/\s/g, "").length < 12
      );
    }
    return false;
  };
  const onNext = () => setStep((s) => Math.min(3, s + 1));
  const onBack = () => setStep((s) => Math.max(1, s - 1));

  const isValidPhone = (p) =>
    /^\+?\d{7,15}$/.test(String(p).replace(/[\s-]/g, ""));
  const shippingRequiredMissing = () => {
    if (!ship.fullName?.trim()) return true;
    if (!isValidPhone(ship.phone)) return true;
    if (!ship.city?.trim()) return true;
    if (!ship.street?.trim()) return true;
    return false;
  };

  const formatShipping = (a, noteText) => {
    const parts = [
      a.fullName,
      a.phone,
      a.street,
      a.building && `Bldg ${a.building}`,
      a.apartment && `Apt ${a.apartment}`,
      a.area,
      a.city,
      a.postalCode,
      a.country,
      noteText && `Note: ${noteText}`,
    ].filter(Boolean);
    return parts.join(", ");
  };

  /* ---------------- place order ---------------- */
  const markSuccessUI = () => {
    setCartItems([]);
    setCart([]);
    setStep(1);
    setNote("");
    setCardName("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setShip({
      fullName: "",
      phone: "",
      country: "Jordan",
      city: "",
      area: "",
      street: "",
      building: "",
      apartment: "",
      postalCode: "",
    });
    setSnackbarKey((k) => k + 1);
    setSuccessOpen(true);
    setStage("success");
    setTimeout(() => setStage("idle"), 1200);
  };

  const doPlaceOrder = async () => {
    if (stage !== "idle" || submittingRef.current) return;
    if (shippingRequiredMissing() || !cart.length) return;

    submittingRef.current = true;

    // optimistic: hide badge immediately
    const currentCount = cart.reduce((a, it) => a + it.qty, 0);
    lastCountRef.current = currentCount;
    setCartCount(0);
    broadcastCartCount(0);

    setStage("processing");
    try {
      await axios.post(
        "http://127.0.0.1:5002/api/orders/place-order",
        {
          shippingAddress: formatShipping(ship, note),
          paymentMethod,
        },
        { headers: authHeader }
      );

      markSuccessUI();
    } catch (e) {
      console.error(e?.response?.data || e);
      // Fallback: check the cart — if server already placed the order & cleared cart, treat as success
      try {
        const remaining = await refreshCart();
        if (remaining === 0) {
          markSuccessUI();
          submittingRef.current = false;
          return;
        }
      } catch {}

      // rollback badge & stage on real failure
      setCartCount(lastCountRef.current);
      broadcastCartCount(lastCountRef.current);
      setStage("idle");
      alert(
        e?.response?.data?.message ||
          "Server error placing order"
      );
    }
    submittingRef.current = false;
  };

  /* ---------------- countdown / long-press ---------------- */
  const startCountdown = () => {
    if (shippingRequiredMissing() || !cart.length || stage !== "idle") return;
    clearInterval(confirmTimerRef.current);
    setConfirmSec(3);
    confirmTimerRef.current = setInterval(() => {
      setConfirmSec((s) => {
        if (s <= 1) {
          clearInterval(confirmTimerRef.current);
          doPlaceOrder();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };
  const cancelCountdown = () => {
    clearInterval(confirmTimerRef.current);
    setConfirmSec(0);
  };
  const startHold = () => {
    if (shippingRequiredMissing() || !cart.length || stage !== "idle") return;
    holdTriggeredRef.current = false;
    clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      holdTriggeredRef.current = true;
      cancelCountdown();
      doPlaceOrder();
    }, 1200);
  };
  const endHold = () => {
    clearTimeout(holdTimerRef.current);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className={`au-page ${darkMode ? "au-dark" : ""}`}>
      <div className="au-container">
        <div className="au-stepper">
          <StepBadge active={step >= 1} label="Cart" idx={1} current={step === 1} />
          <StepLine />
          <StepBadge active={step >= 2} label="Payment" idx={2} current={step === 2} />
          <StepLine />
          <StepBadge active={step >= 3} label="Shipping" idx={3} current={step === 3} />
        </div>

        <div className="au-panel">
          {/* STEP 1: CART */}
          {step === 1 && (
            <section className="au-grid">
              <div className="au-card">
                <h2 className="au-h2">Your Cart</h2>
                {loadingCart ? (
                  <div className="au-skeleton-list">
                    <div className="au-skeleton" />
                    <div className="au-skeleton" />
                    <div className="au-skeleton" />
                  </div>
                ) : !cart.length ? (
                  <div className="au-empty">Your cart is empty.</div>
                ) : (
                  <table className="au-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th className="t-center">Qty</th>
                        <th className="t-right">Price</th>
                        <th className="t-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((prod) => (
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
                              <span className="au-img-ph" />
                            )}
                            <span>
                              {prod.prodName}
                              {prod.prodBrand ? (
                                <span className="muted"> — {prod.prodBrand}</span>
                              ) : null}
                            </span>
                          </td>
                          <td className="t-center">
                            <QtyControl
                              qty={prod.qty}
                              min={1}
                              max={prod.prodStock > 0 ? prod.prodStock : 99}
                              onChange={(q) => updateQty(prod.id, q)}
                            />
                          </td>
                          <td className="t-right">
                            {prod.discount > 0 ? (
                              <span title={`Disc: ${prod.discount}`}>
                                {formatPrice(prod.effectivePrice)} JOD
                              </span>
                            ) : (
                              `${formatPrice(prod.prodPrice)} JOD`
                            )}
                          </td>
                          <td className="t-right">
                            {formatPrice(prod.effectivePrice * prod.qty)} JOD
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="au-card">
                <h3 className="au-h3">Order Note</h3>
                <textarea
                  className="au-input"
                  placeholder="Delivery notes (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="au-summary">
                  <div className="row">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)} JOD</span>
                  </div>
                  <div className="row">
                    <span>Delivery</span>
                    <span>{cart.length ? formatPrice(deliveryFee) : "0.00"} JOD</span>
                  </div>
                  <div className="row total">
                    <span>Total</span>
                    <span>{formatPrice(total)} JOD</span>
                  </div>
                </div>
                <div className="au-actions">
                  <button className="au-btn" onClick={onNext} disabled={nextDisabled()}>
                    Continue to Payment
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* STEP 2: PAYMENT */}
          {step === 2 && (
            <section className="au-grid">
              <div className="au-card">
                <h2 className="au-h2">Payment Details</h2>

                {/* hide card UI when cash */}
                {paymentMethod === "card" && (
                  <>
                    <div className={`au-card-preview ${showBack ? "is-back" : ""}`}>
                      <div className="card-face card-front">
                        <div className="brand">VISA</div>
                        <div className="chip" />
                        <div className="num">{cardNumber || "#### #### #### ####"}</div>
                        <div className="meta">
                          <div>
                            <div className="lbl">Card Holder</div>
                            <div className="val">{cardName || "FULL NAME"}</div>
                          </div>
                          <div>
                            <div className="lbl">Expires</div>
                            <div className="val">{expiry || "MM/YY"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="card-face card-back">
                        <div className="mag" />
                        <div className="sign">
                          <span>CVV</span>
                          <div className="cvv">{cvv || "***"}</div>
                        </div>
                      </div>
                    </div>

                    <div className="au-form">
                      <label className="au-label">
                        Card Number
                        <input
                          className="au-input"
                          type="text"
                          inputMode="numeric"
                          placeholder="#### #### #### ####"
                          value={cardNumber}
                          onChange={handleCardNumber}
                          onFocus={() => setShowBack(false)}
                        />
                      </label>

                      <label className="au-label">
                        Card Holder Name
                        <input
                          className="au-input"
                          type="text"
                          placeholder="Full name"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          onFocus={() => setShowBack(false)}
                        />
                      </label>

                      <div className="au-row-2">
                        <label className="au-label">
                          Expiry (MM/YY)
                          <input
                            className="au-input"
                            type="text"
                            inputMode="numeric"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={handleExpiry}
                            onFocus={() => setShowBack(false)}
                          />
                        </label>

                        <label className="au-label">
                          CVV
                          <input
                            className="au-input"
                            type="password"
                            inputMode="numeric"
                            placeholder="***"
                            value={cvv}
                            onChange={handleCvv}
                            onFocus={() => setShowBack(true)}
                            onBlur={() => setShowBack(false)}
                          />
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* Payment method radios */}
                <div className="au-row-2" style={{ marginTop: 8 }}>
                  <label className="au-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                    />
                    <span>Card (Visa)</span>
                  </label>
                  <label className="au-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                    />
                    <span>Cash on Delivery</span>
                  </label>
                </div>

                <div className="au-actions spaced" style={{ marginTop: 12 }}>
                  <button className="au-btn ghost" onClick={onBack}>
                    Back
                  </button>
                  <button className="au-btn" onClick={onNext} disabled={nextDisabled()}>
                    Shipping Details
                  </button>
                </div>
              </div>

              <div className="au-card">
                <h3 className="au-h3">Order Summary</h3>
                <div className="au-summary">
                  <div className="row">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)} JOD</span>
                  </div>
                  <div className="row">
                    <span>Delivery</span>
                    <span>{cart.length ? formatPrice(deliveryFee) : "0.00"} JOD</span>
                  </div>
                  <div className="row total">
                    <span>Total</span>
                    <span>{formatPrice(total)} JOD</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* STEP 3: SHIPPING */}
          {step === 3 && (
            <section className="au-grid">
              {/* LEFT: shipping form */}
              <div className="au-card">
                <h2 className="au-h2">Shipping Details</h2>
                <div className="au-form">
                  <label className="au-label">
                    Full Name *
                    <input
                      className="au-input"
                      type="text"
                      placeholder="Full name"
                      value={ship.fullName}
                      onChange={(e) =>
                        setShip((s) => ({ ...s, fullName: e.target.value }))
                      }
                    />
                  </label>

                  <div className="au-row-2">
                    <label className="au-label">
                      Phone (e.g. +9627...) *
                      <input
                        className="au-input"
                        type="tel"
                        placeholder="+9627XXXXXXXX"
                        value={ship.phone}
                        onChange={(e) =>
                          setShip((s) => ({ ...s, phone: e.target.value }))
                        }
                      />
                    </label>

                    <label className="au-label">
                      Country
                      <input
                        className="au-input"
                        type="text"
                        placeholder="Country"
                        value={ship.country}
                        onChange={(e) =>
                          setShip((s) => ({ ...s, country: e.target.value }))
                        }
                      />
                    </label>
                  </div>

                  <div className="au-row-2">
                    <label className="au-label">
                      City *
                      <input
                        className="au-input"
                        type="text"
                        placeholder="City"
                        value={ship.city}
                        onChange={(e) =>
                          setShip((s) => ({ ...s, city: e.target.value }))
                        }
                      />
                    </label>

                    <label className="au-label">
                      Area
                      <input
                        className="au-input"
                        type="text"
                        placeholder="Area"
                        value={ship.area}
                        onChange={(e) =>
                          setShip((s) => ({ ...s, area: e.target.value }))
                        }
                      />
                    </label>
                  </div>

                  <label className="au-label">
                    Street *
                    <input
                      className="au-input"
                      type="text"
                      placeholder="Street"
                      value={ship.street}
                      onChange={(e) =>
                        setShip((s) => ({ ...s, street: e.target.value }))
                      }
                    />
                  </label>

                  <div className="au-row-2">
                    <label className="au-label">
                      Building
                      <input
                        className="au-input"
                        type="text"
                        placeholder="Building"
                        value={ship.building}
                        onChange={(e) =>
                          setShip((s) => ({ ...s, building: e.target.value }))
                        }
                      />
                    </label>

                    <label className="au-label">
                      Apartment
                      <input
                        className="au-input"
                        type="text"
                        placeholder="Apartment"
                        value={ship.apartment}
                        onChange={(e) =>
                          setShip((s) => ({ ...s, apartment: e.target.value }))
                        }
                      />
                    </label>
                  </div>

                  <label className="au-label">
                    Postal Code
                    <input
                      className="au-input"
                      type="text"
                      placeholder="Postal code"
                      value={ship.postalCode}
                      onChange={(e) =>
                        setShip((s) => ({ ...s, postalCode: e.target.value }))
                      }
                    />
                  </label>

                  <label className="au-label">
                    Delivery Note (optional)
                    <textarea
                      className="au-input"
                      placeholder="e.g. call before arriving..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </label>

                  <div className="au-actions">
                    <button className="au-btn ghost" onClick={onBack}>
                      Back
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT: summary + Place Order */}
              <div className="au-card">
                <h3 className="au-h3">Order Summary</h3>
                <div className="au-items" style={{ marginBottom: 10 }}>
                  {cart.map((prod) => (
                    <div key={prod.id} className="au-item">
                      {prod.prodImage ? (
                        <img
                          src={`http://localhost:5002/uploads/${prod.prodImage}`}
                          alt="prod"
                          width="40"
                          style={{ borderRadius: "6px" }}
                        />
                      ) : (
                        <span className="au-img-ph" />
                      )}
                      <div className="meta">
                        <div className="title">
                          {prod.prodName} {prod.prodBrand ? `— ${prod.prodBrand}` : ""}
                        </div>
                        <div className="muted">Qty: {prod.qty}</div>
                      </div>
                      <div className="price">
                        {formatPrice(prod.effectivePrice * prod.qty)} JOD
                      </div>
                    </div>
                  ))}
                </div>

                <div className="au-summary">
                  <div className="row">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)} JOD</span>
                  </div>
                  <div className="row">
                    <span>Delivery</span>
                    <span>{cart.length ? formatPrice(deliveryFee) : "0.00"} JOD</span>
                  </div>
                  <div className="row total">
                    <span>Total</span>
                    <span>{formatPrice(total)} JOD</span>
                  </div>
                </div>

                <div className="au-summary-actions">
                  {confirmSec > 0 ? (
                    <div className="au-confirm">
                      <div className="txt">Placing in {confirmSec}s…</div>
                      <div className="au-countdown-bar">
                        <span style={{ width: `${((3 - confirmSec) / 3) * 100}%` }} />
                      </div>
                      <button className="au-btn danger" onClick={cancelCountdown}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="au-btn big"
                      disabled={shippingRequiredMissing() || !cart.length || stage === "processing"}
                      onMouseDown={startHold}
                      onMouseUp={endHold}
                      onMouseLeave={endHold}
                      onTouchStart={startHold}
                      onTouchEnd={endHold}
                      onClick={() => {
                        if (holdTriggeredRef.current) return;
                        startCountdown();
                      }}
                    >
                      Place Order
                    </button>
                  )}
                  <div className="au-hint">
                    Long-press to confirm instantly, or click once to start a 3s countdown.
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Overlay */}
      {stage !== "idle" && (
        <div className="au-overlay">
          <div className="au-modal">
            {stage === "processing" ? (
              <>
                <div className="title">Processing Order</div>
                <div className="au-loader" />
              </>
            ) : (
              <>
                <div className="title">Order Placed</div>
                <div className="au-check" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Sub components ---------- */
function StepBadge({ active, label, idx, current }) {
  return (
    <div className={`step-badge ${active ? "active" : ""} ${current ? "current" : ""}`}>
      <span className="idx">{idx}</span>
      <span className="txt">{label}</span>
    </div>
  );
}
function StepLine() {
  return <div className="step-line" />;
}

function QtyControl({ qty = 1, min = 1, max = 99, onChange = () => {} }) {
  const styles = {
    wrap: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      border: "1px solid var(--border)",
      borderRadius: "10px",
      padding: "4px 6px",
      background: "var(--surface)",
    },
    btn: {
      border: "1px solid var(--border)",
      background: "transparent",
      color: "inherit",
      borderRadius: "8px",
      padding: "2px 8px",
      fontWeight: 800,
      cursor: "pointer",
      lineHeight: 1.2,
    },
    input: {
      width: "36px",
      textAlign: "center",
      background: "transparent",
      color: "inherit",
      border: "none",
      outline: "none",
      fontWeight: 700,
    },
  };
  const dec = () => onChange(Math.max(min, Number(qty) - 1));
  const inc = () => onChange(Math.min(max, Number(qty) + 1));
  const onManual = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    const n = v === "" ? min : Number(v);
    onChange(Math.max(min, Math.min(max, n)));
  };
  return (
    <div style={styles.wrap} aria-label="quantity selector">
      <button type="button" onClick={dec} style={styles.btn} aria-label="decrease" disabled={qty <= min}>
        −
      </button>
      <input
        type="text"
        value={qty}
        onChange={onManual}
        style={styles.input}
        inputMode="numeric"
        aria-label="quantity"
      />
      <button type="button" onClick={inc} style={styles.btn} aria-label="increase" disabled={qty >= max}>
        +
      </button>
    </div>
  );
}
