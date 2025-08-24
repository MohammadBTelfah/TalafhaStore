import React, { useEffect, useRef, useState } from "react";
import { Snackbar, Box } from "@mui/material";

import "../styles/Home.css";
import { useNavigate } from "react-router-dom";

import axios from "axios";
/* -------------------- Reveal-on-scroll hook -------------------- */

function useReveal(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, [options]);
  return ref;
}
const dstyle = (i, step = 90) => ({ "--d": `${i * step}ms` });
/* -------------------------- Hero ------------------------------ */
const slides = [
  {
    title: "Pro Accessories",
    subtitle: "Keyboards, mice, headsets & more",
    img: "https://media.istockphoto.com/id/1170073824/photo/gamer-work-space-concept-top-view-a-gaming-gear-mouse-keyboard-joystick-headset-mobile.jpg?s=612x612&w=0&k=20&c=2d8z6CmJn6R1GaPpJ4HB4J43y4e0wOL4nusPM2Dhq34="
  },
  {
    title: "Powerful Computers",
    subtitle: "Laptops and desktops for work & play",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Fresh Apparel",
    subtitle: "Streetwear, basics, and seasonal drops",
    img: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Books",
    subtitle: "From thrilling novels to insightful non-fiction",
    img: "https://www.shutterstock.com/image-photo/book-open-pages-close-up-600nw-2562942291.jpg"
  }
];
function Hero() {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);
  const ref = useReveal();

  useEffect(() => {
    timer.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), 3500);
    return () => clearInterval(timer.current);
  }, []);
  const current = slides[index];
  return (
    <section className="hero reveal" ref={ref}>
      <div className="hero-bg">
        {slides.map((s, i) => (
          <img key={s.img} src={s.img} alt={s.title} className={`hero-img ${i === index ? "active" : ""}`} />
        ))}
      </div>
      <div className="hero-content">
        <h1 className="brand" data-reveal style={dstyle(0)}>Talafha</h1>
        <p className="subtitle" data-reveal style={dstyle(1)}>{current.subtitle}</p>
        <div className="cta-row" data-reveal style={dstyle(2)}>
          <a href="#featured" className="btn primary">Shop now</a>
          <a href="#categories" className="btn ghost">Browse categories</a>
        </div>
        <div className="hero-pills" aria-hidden data-reveal style={dstyle(3)}>
          {slides.map((_, i) => <span key={i} className={`pill ${i === index ? "active" : ""}`} />)}
        </div>
      </div>
    </section>
  );
}
/* ------------------------- Tagline ----------------------------- */
function Tagline() {
  const ref = useReveal();
  return (
    <section id="tagline" className="tagline reveal" ref={ref} dir="rtl">
      <div className="marquee" data-reveal style={dstyle(0)}>
        <p>Here you can find everything — accessories, computers, fashion, and more — Here you can find everything — accessories, computers, fashion, and more —</p>
      </div>
    </section>
  );
}
/* --------------------- Featured Products ----------------------- */

const currency = (n) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n ?? 0);

function getImageUrl(fileName) {
  if (!fileName) return "https://via.placeholder.com/400x300?text=No+Image";
  return `http://127.0.0.1:5002/uploads/${fileName.replace(/^\/+/, "")}`;
}
function FeaturedProducts() {
  
  const ref = useReveal();
  const navigate = useNavigate();            // ✅ لازم هنا
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const showSnack = (msg, severity = "success") => {
    setSnack({ open: true, msg, severity });
  };
  useEffect(() => {
    const src = axios.CancelToken.source();
    setLoading(true);
    setErr("");

    axios
      .get("http://127.0.0.1:5002/api/products/featured", { cancelToken: src.token })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const normalized = data.map((p) => ({
          id: p._id,                         // ← نحفظه باسم id
          name: p.prodName,
          price: p.prodPrice,
          img: getImageUrl(p.prodImage),
          tag: p.tags?.[0] ?? "",
        }));
        setItems(normalized);
      })
      .catch((e) => {
        if (!axios.isCancel(e)) setErr(e.message || "Failed to load products");
      })
      .finally(() => setLoading(false));

    return () => src.cancel("unmounted");
  }, []);

  // ✅ Add to cart للهوم
    const addToCart = async (productId, qty = 1) => {
    try {
      const raw = localStorage.getItem("token") || "";
      const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;
      if (!token) {
        showSnack("Please login first.", "error");
        return;
      }

      const quantity = Math.max(1, Number(qty) || 1);
      await axios.post(
        "http://127.0.0.1:5002/api/cart/add-to-cart",
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🔔 تحديت عداد السلة مباشرة
      window.dispatchEvent(new CustomEvent("cart:delta", { detail: { delta: quantity } }));

showSnack("proudct add sucsessfly"); // نفس تهجئتك المطلوبة 🙂
    } catch (e) {
      console.error("AddToCart (home) error:", e?.response?.data || e);
      showSnack("❌ Failed to add product", "error");
    }
  };

  return (
       <section id="featured" className="section reveal" ref={ref}>
      <div className="section-head">
        <h2 data-reveal style={dstyle(0)}>Featured products</h2>
        <p data-reveal style={dstyle(1)}>Curated picks from Talafha — quality gear at friendly prices.</p>
      </div>


      {err && <div className="error" data-reveal style={dstyle(2)}>{err}</div>}
      {!loading && items.length === 0 && (
        <p style={{ ...dstyle(3), color: "#fff" }} data-reveal>No featured products yet.</p>
      )}

      <div className="grid products">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <article className="card product skeleton" key={`s${i}`} data-reveal style={dstyle(i)}>
                <div className="thumb" />
                <div className="meta">
                  <div className="sk-line w-70" />
                  <div className="sk-line w-40" />
                  <div className="row">
                    <div className="sk-btn" />
                    <div className="sk-btn ghost" />
                  </div>
                </div>
              </article>
            ))
          : items.map((p, i) => (
              <article className="card product" key={p.id} data-reveal style={dstyle(i)}>
                <div className="thumb">
                  <img
                    src={p.img}
                    alt={p.name}
                    onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x300?text=No+Image"; }}
                  />
                  {p.tag ? <span className="chip">{p.tag}</span> : null}
                </div>

                <div className="meta">
                  <h3>{p.name}</h3>
                  <p className="price">{currency(p.price)}</p>

                  <div className="btn-row">
                    {/* ✅ Add to cart */}
                    <button className="btn cart" onClick={() => addToCart(p.id)}>Add to Cart</button>

                    {/* ✅ كل منتج يروح لصفحة الـ products بــ id الخاص فيه */}
                   <button
                  className="btn details"
                      onClick={() => navigate(`/products?productId=${encodeURIComponent(p.id)}`)}
                      >
                     See Details
                        </button>

                  </div>
                </div>
              </article>
            ))}
      </div>
    <Snackbar
  open={snack.open}
  autoHideDuration={3000}
  onClose={() => setSnack((s) => ({ ...s, open: false }))}
  anchorOrigin={{ vertical: "top", horizontal: "center" }}
>
  <Box
    sx={{
      bgcolor: "rgba(255,255,255,0.08)",
      color: "#fff",
      px: 2.5,
      py: 1.75,
      borderRadius: "18px",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.20)",
      boxShadow:
        "0 10px 35px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.06)",
      display: "flex",
      alignItems: "center",
      gap: 2,
      minWidth: 320,
      maxWidth: "min(92vw, 560px)",
      position: "relative",
      // لمسة توهج أخضر خفيف مثل الصورة
      "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        borderRadius: "18px",
        boxShadow:
          "0 0 0 1px rgba(34,197,94,.45), 0 0 28px rgba(34,197,94,.18) inset",
        pointerEvents: "none",
      },
      fontWeight: 800,
      fontSize: "1rem",
      letterSpacing: ".2px",
    }}
  >
    <span style={{ whiteSpace: "pre-line" }}>{snack.msg}</span>

    <button
      onClick={() => setSnack((s) => ({ ...s, open: false }))}
      style={{
        marginLeft: "auto",
        width: 38,
        height: 38,
        borderRadius: 12,
        background: "rgba(0,0,0,.35)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,.28)",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        outline: "none",
      }}
      aria-label="Close"
      title="Close"
    >
      ✕
    </button>
  </Box>
</Snackbar>
    </section>
    
  );
  
}

/* -------------------------- Categories ------------------------- */
const IMG_MAP = {
  laptop:
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop",
  electronic:
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
  electronics:
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
  book:
    "https://www.shutterstock.com/image-photo/book-open-pages-close-up-600nw-2562942291.jpg",
  books:
    "https://www.shutterstock.com/image-photo/book-open-pages-close-up-600nw-2562942291.jpg",
  accessories:
    "https://media.istockphoto.com/id/1170073824/photo/gamer-work-space-concept-top-view-a-gaming-gear-mouse-keyboard-joystick-headset-mobile.jpg?s=612x612&w=0&k=20&c=2d8z6CmJn6R1GaPpJ4HB4J43y4e0wOL4nusPM2Dhq34=",
  accessrois:
    "https://media.istockphoto.com/id/1170073824/photo/gamer-work-space-concept-top-view-a-gaming-gear-mouse-keyboard-joystick-headset-mobile.jpg?s=612x612&w=0&k=20&c=2d8z6CmJn6R1GaPpJ4HB4J43y4e0wOL4nusPM2Dhq34=",
  men:
    "https://cdn.shopify.com/s/files/1/2294/8559/files/A_Guide_To_Men_s_Summer_Clothing-01.jpg?v=1746471733",
    games:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCax-aU61KsvyTSQE-IBwMylLqX5LG8QCmdg&s",
    sports:
    "https://t4.ftcdn.net/jpg/05/53/86/01/360_F_553860129_ijFLSAeTvZ8Qpk8z4h9B9bzBKxWjrvUZ.jpg",
    beauty:
    "https://images.preview.ph/preview/resize/images/2021/12/22/preview-beauty-awards-skincare-nm.webp"
};

const imgFor = (name = "product") => {
  const key = String(name).toLowerCase().trim();
  return (
    IMG_MAP[key] ||
    `https://source.unsplash.com/900x600/?${encodeURIComponent(key)},product`
  );
};

function Categories() {
  const ref = useReveal();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://127.0.0.1:5002/api/categories/getAll");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.categories || data?.data || [];
        setCats(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section id="categories" className="section reveal" ref={ref}>
      <div className="section-head">
        <h2 data-reveal style={dstyle(0)}>Shop by category</h2>
        <p data-reveal style={dstyle(1)}>Discover what’s trending across the Talafha marketplace.</p>
      </div>

      <div className="grid categories">
        {(loading ? Array.from({ length: 5 }) : cats).map((c, i) => {
          const name = loading ? "" : c?.name || "Category";
          const img = loading ? "" : imgFor(name);
          return (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a
              className="card category"
              data-reveal
              style={{ ...dstyle(i), position: "relative", overflow: "hidden", borderRadius: 16, height: 220, boxShadow: "0 18px 40px rgba(0,0,0,.25)", background: "#3b3f4a" }}
href={loading ? "#" : `/products?category=${encodeURIComponent(c?._id || name)}`}
              key={loading ? i : c?._id || name}
            >
              {!loading && (
                <>
                  <img
                    src={img}
                    alt={name}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(10px)", transform: "scale(1.08)", display: "block" }}
                    onError={(e) => { e.currentTarget.src = "https://source.unsplash.com/900x600/?product"; }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                      background: "linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.45) 100%)",
                    }}
                  >
                    <h3 style={{ color: "#fff", margin: 0, fontWeight: 700, textTransform: "capitalize", letterSpacing: ".5px" }}>{name}</h3>
                  </div>
                </>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------ Testimonials ------------------------- */
const quotes = [
  { name: "Nadia S.", text: "Great prices and quick delivery. Talafha became my first stop." },
  { name: "Omar T.",  text: "Love the selection — got a laptop and a hoodie in one order!" },
  { name: "Laila R.", text: "Support was super helpful. Smooth checkout and returns." },
  { name: "Noor H.",  text: "Item matched the photos perfectly. Quality exceeded expectations." },
];

function Testimonials() {
  const ref = useReveal();
  return (
    <section className="section reveal" ref={ref}>
      <div className="section-head">
        <h2 data-reveal style={dstyle(0)}>People love Talafha</h2>
        <p data-reveal style={dstyle(1)}>Real feedback from happy shoppers.</p>
      </div>
      <div className="grid testimonials">
        {quotes.map((q, i) => (
          <blockquote className="card quote" key={q.name} data-reveal style={dstyle(i)}>
            <p>“{q.text}”</p>
            <footer>— {q.name}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

/* ------------------------- Newsletter ------------------------- */
function Newsletter() {
  const ref = useReveal();
  return (
    <section id="newsletter" className="section reveal" ref={ref}>
      <div className="newsletter card" data-reveal style={dstyle(0)}>
        <div>
          <h2>Get exclusive deals</h2>
          <p>Join the Talafha list for drops, discounts, and weekly picks.</p>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="newsletter-form">
          <input type="email" placeholder="Enter your email" aria-label="Email" required />
          <button className="btn primary">Subscribe</button>
        </form>
      </div>
    </section>
  );
}

/* --------------------- Perks (Benefits) --------------------- */
function Perks() {
  const ref = useReveal();
  const perks = [
    { icon: "🚚", title: "Free shipping", text: "On orders over $50" },
    { icon: "↩️", title: "Easy returns",  text: "30-day hassle-free" },
    { icon: "🕑", title: "24/7 support",  text: "We’re here anytime" },
    { icon: "🔒", title: "Secure checkout", text: "SSL & trusted payments" },
  ];
  return (
    <section id="perks" className="section reveal" ref={ref}>
      <ul className="grid perks">
        {perks.map((p, i) => (
          <li className="card perk" key={p.title} data-reveal style={{ ...dstyle(i), textAlign:"center", padding:16 }}>
            <div style={{fontSize:28, marginBottom:8}} aria-hidden>{p.icon}</div>
            <h3 style={{margin:0}}>{p.title}</h3>
            <p style={{opacity:.8, marginTop:6}}>{p.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* --------------------- Flash Deal (Countdown) --------------------- */
function FlashDeal() {
  const ref = useReveal();
  const [left, setLeft] = useState(0);
  const endsAt = useRef(new Date(Date.now() + 1000 * 60 * 60 * 24 * 2)); // بعد يومين

  useEffect(() => {
    const t = setInterval(() => setLeft(endsAt.current - new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const s = Math.max(0, Math.floor(left / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return (
    <section className="section reveal" ref={ref}>
      <div
        className="card flash-deal"
        data-reveal
        style={{
          background: "linear-gradient(135deg, #71b7e6, #9b59b6)",
          color: "#fff",
          padding: "30px 40px",
          borderRadius: "18px",
          textAlign: "center",
          boxShadow: "0 12px 30px rgba(0,0,0,.25)",
        }}
      >
        <h2 style={{ margin: "0 0 10px", fontSize: "1.8rem", fontWeight: "800" }}>
          ⚡ Flash Deals
        </h2>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: "1.3rem",
            fontFamily: "'Courier New', monospace",
            letterSpacing: "1px",
          }}
        >
          Ends in {d}d {h}h {m}m {sec}s
        </p>
        <a
          href="/deals"
          style={{
            padding: "10px 22px",
            borderRadius: "12px",
            fontWeight: "700",
            fontSize: "1rem",
            background: "#fff",
            color: "#9b59b6",
            textDecoration: "none",
            boxShadow: "0 6px 16px rgba(0,0,0,.2)",
            transition: "all .2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Shop Deals
        </a>
      </div>
    </section>
  );
}
/* --------------------- Recently Viewed --------------------- */
function RecentlyViewed() {
  const ref = useReveal();
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("recentProducts") || "[]";
      setItems(JSON.parse(raw));
    } catch {  }
  }, []);

  if (items.length === 0) return null;

  const currency = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n ?? 0);

  return (
    <section id="recent" className="section reveal" ref={ref}>
      <div className="section-head">
        <h2 data-reveal style={dstyle(0)}>Recently viewed</h2>
        <p data-reveal style={dstyle(1)}>Pick up where you left off.</p>
      </div>
      <div className="grid products">
        {items.slice(0, 6).map((p, i) => (
          <article className="card product" key={p.id} data-reveal style={dstyle(i)}>
            <div className="thumb">
              <img src={p.img} alt={p.name} loading="lazy"
                   onError={(e)=>{e.currentTarget.src="https://via.placeholder.com/400x300?text=No+Image";}} />
            </div>
            <div className="meta">
              <h3>{p.name}</h3>
              {p.price != null && <p className="price">{currency(p.price)}</p>}
              <div className="row">
                <button className="btn small primary">Add to cart</button>
                <button className="btn small ghost">View details</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* --------------------- FAQ (Accordion) --------------------- */
function FAQ() {
  const ref = useReveal();
  const faqs = [
    { q: "How long is shipping?", a: "Usually 2–5 business days depending on your location." },
    { q: "What’s the return policy?", a: "Returns within 30 days in original condition for a full refund." },
    { q: "Which payments are accepted?", a: "Visa, MasterCard, PayPal, and cash on delivery in select areas." },
  ];
  return (
    <section id="faq" className="section reveal" ref={ref}>
      <div className="section-head">
        <h2 data-reveal style={dstyle(0)}>FAQ</h2>
        <p data-reveal style={dstyle(1)}>Quick answers to common questions.</p>
      </div>
      <div className="grid" style={{gridTemplateColumns:"1fr"}}>
        {faqs.map((f, i) => (
          <details key={f.q} className="card" data-reveal style={{ ...dstyle(i), padding:"14px 18px" }}>
            <summary style={{cursor:"pointer", fontWeight:600}}>{f.q}</summary>
            <p style={{marginTop:8, opacity:.9}}>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* --------------------------- Home ------------------------------ */
export default function Home({ darkMode }) {
  const theme = darkMode ? "dark" : "light";
  return (
    <div className="talafha-home" data-theme={theme}>
      <Hero />
      <Tagline />
      <Perks />
      <FlashDeal />
      <FeaturedProducts />
      <Categories />
      <RecentlyViewed />
      <Testimonials />
      <FAQ />
      <Newsletter />
    </div>
  );
}
