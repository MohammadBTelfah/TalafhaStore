import React, { useEffect, useRef, useState } from "react";
import "../styles/Home.css";
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

/* --------------------------- Hero ------------------------------ */
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
        <h1 className="brand">Talafha</h1>
        <p className="subtitle">{current.subtitle}</p>
        <div className="cta-row">
          <a href="#featured" className="btn primary">Shop now</a>
          <a href="#categories" className="btn ghost">Browse categories</a>
        </div>
        <div className="hero-pills" aria-hidden>
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
      <div className="marquee">
        <p>Here you can find everything — accessories, computers, fashion, and more — Here you can find everything — accessories, computers, fashion, and more —</p>
      </div>
    </section>
  );
}

/* --------------------- Featured Products ----------------------- */

const currency = (n) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n ?? 0);

// يبني رابط الصورة الصحيح من اسم الملف القادم من الـ API
function getImageUrl(fileName) {
  if (!fileName) return "https://via.placeholder.com/400x300?text=No+Image";
  return `http://127.0.0.1:5002/uploads/${fileName.replace(/^\/+/, "")}`;
}

function FeaturedProducts() {
  const ref = useReveal();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const src = axios.CancelToken.source();
    setLoading(true);
    setErr("");

    axios
      .get("http://127.0.0.1:5002/api/products/featured", { cancelToken: src.token })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const normalized = data.map((p) => ({
          id: p._id,
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

  return (
    <section id="featured" className="section reveal" ref={ref}>
      <div className="section-head">
        <h2>Featured products</h2>
        <p>Curated picks from Talafha — quality gear at friendly prices.</p>
      </div>

      {err && <div className="error">{err}</div>}
      {!loading && items.length === 0 && (
        <p style={{ color: "#fff" }}>No featured products yet.</p>
      )}

      <div className="grid products">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <article className="card product skeleton" key={`s${i}`}>
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
          : items.map((p) => (
              <article className="card product" key={p.id}>
                <div className="thumb">
                  <img
                    src={p.img}
                    alt={p.name}
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                  />
                  {p.tag ? <span className="chip">{p.tag}</span> : null}
                </div>
                <div className="meta">
                  <h3>{p.name}</h3>
                  <p className="price">{currency(p.price)}</p>
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

/* -------------------------- Categories ------------------------- */
const cats = [
  { name: "Accessories", img: "https://images.unsplash.com/photo-1511715282305-7db2114b0c49?q=80&w=1000&auto=format&fit=crop" },
  { name: "Computers",   img: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1000&auto=format&fit=crop" },
  { name: "Apparel",     img: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1000&auto=format&fit=crop" },
  { name: "Smart Home",  img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop" }
];

function Categories() {
  const ref = useReveal();
  return (
    <section id="categories" className="section reveal" ref={ref}>
      <div className="section-head">
        <h2>Shop by category</h2>
        <p>Discover what’s trending across the Talafha marketplace.</p>
      </div>
      <div className="grid categories">
        {cats.map((c) => (
          <a className="card category" href="#" key={c.name}>
            <img src={c.img} alt={c.name} />
            <div className="overlay"><h3>{c.name}</h3></div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ------------------------ Testimonials ------------------------- */
const quotes = [
  { name: "Nadia S.", text: "Great prices and quick delivery. Talafha became my first stop." },
  { name: "Omar T.",  text: "Love the selection — got a laptop and a hoodie in one order!" },
  { name: "Laila R.", text: "Support was super helpful. Smooth checkout and returns." }
];

function Testimonials() {
  const ref = useReveal();
  return (
    <section className="section reveal" ref={ref}>
      <div className="section-head">
        <h2>People love Talafha</h2>
        <p>Real feedback from happy shoppers.</p>
      </div>
      <div className="grid testimonials">
        {quotes.map((q) => (
          <blockquote className="card quote" key={q.name}>
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
      <div className="newsletter card">
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

/* --------------------------- Home ------------------------------ */
export default function Home({ darkMode }) {
  const theme = darkMode ? "dark" : "light";
  return (
    <div className="talafha-home" data-theme={theme}>
      <Hero />
      <Tagline />
      <FeaturedProducts />
      <Categories />
      <Testimonials />
      <Newsletter />
    </div>
  );
}
