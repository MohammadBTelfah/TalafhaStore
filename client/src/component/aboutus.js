// src/pages/aboutus.js
import React, { useEffect, useRef, useState } from "react";
import "../styles/AboutUs.css";
import OrderLoop from "../component/OrderLoop";

import {
  FaTruckFast, FaShieldHalved, FaHeadset, FaRotateLeft,
  FaLeaf, FaStar, FaBoxesStacked, FaUsers
} from "react-icons/fa6";

/* ===== Count-Up that starts on view ===== */
function Counter({ end = 0, duration = 1200, decimals = 0, prefix = "", suffix = "", start = false }) {
  const [val, setVal] = useState(0);
  const startedRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!start || startedRef.current) return;
    startedRef.current = true;

    const startTs = performance.now();
    const from = 0;

    const step = (t) => {
      const progress = Math.min((t - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = from + (end - from) * eased;
      setVal(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [start, end, duration]);

  const formatted = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();
  return <>{prefix}{formatted}{suffix}</>;
}

export default function AboutUs({ darkMode = false }) {
  const STORE = "Talafha Store";
  const OWNER = "Mohammed Telfah";
  const ownerPhoto =
    "https://scontent.famm6-1.fna.fbcdn.net/v/t39.30808-6/434036733_2426139024244661_1131875076272113628_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFipHkc6V8_1NJ-XVb2jxE8UxSyh2xmLd9TFLKHbGYt35h1C_X3elqXrJpOiqtWsuwFhXDb8m284vRk7e9AkgHt&_nc_ohc=ssu8WN06w4kQ7kNvwGNB82C&_nc_oc=AdncgcCzaPp2nZqoW8mF8tfsWikOLI8fFvmJxkw_hbU27wXD_NOR8EgxDrE5nbymgxy0pPB2ifrviMJlRR2Xe4t2&_nc_zt=23&_nc_ht=scontent.famm6-1.fna&_nc_gid=xDe9kdMzuMN5kT225HXpkQ&oh=00_AfURDWo85-MDpVKBE0Y6UvI3odRLXIwZoSxlQgf2Pupv5Q&oe=689EE84C";

  /* STATS (targets + suffixes) */
  const stats = [
    { icon: <FaBoxesStacked />, end: 2,   suffix: "K+", label: "Products",        decimals: 0 },
    { icon: <FaUsers />,        end: 8,   suffix: "K+", label: "Happy Customers", decimals: 0 },
    { icon: <FaTruckFast />,    end: 48,  suffix: "h",  label: "Avg. Delivery",   decimals: 0 },
    { icon: <FaStar />,         end: 4.9, suffix: "",   label: "Rating",          decimals: 1 },
  ];

  /* Start counters when stats enter viewport */
  const statsRef = useRef(null);
  const [startCount, setStartCount] = useState(false);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartCount(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Timeline data */
  const steps = [
    { t: "We curate",  d: "We hand-pick items you actually want—quality over noise." },
    { t: "We verify",  d: "Trusted suppliers, honest listings, and clear specs." },
    { t: "We deliver", d: "Fast, tracked shipping with careful packaging." },
    { t: "We improve", d: "We ship changes weekly based on your feedback." },
  ];

  /* Active step that hops every 2s */
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setActiveStep((p) => (p + 1) % steps.length);
    }, 2000);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <main className={`au-page ${darkMode ? "au-dark" : ""}`}>
      <div className="au-container">
        {/* HERO */}
        <section className="au-hero">
          <div className="au-hero-copy animated-border">
            <span className="au-kicker">Welcome to {STORE}</span>
            <h1>Shopping, simplified.</h1>
            <p>
              {STORE} is a modern e-commerce brand focused on clarity, trust, and speed.
              We bring carefully selected products, secure payments, and quick delivery—
              all wrapped in a sleek, delightful experience.
            </p>
            <div className="au-hero-bullets">
              <span><FaShieldHalved /> Secure</span>
              <span><FaTruckFast /> Fast</span>
              <span><FaHeadset /> Helpful</span>
              <span><FaLeaf /> Thoughtful</span>
            </div>
          </div>

          <div className="au-hero-art animated-border">
            {/* 🚚 Truck + boxes animation */}
            <OrderLoop duration="9s" boxesFrom="right" />
          </div>
        </section>

        {/* VALUES */}
        <section className="au-values">
          {[
            { icon: <FaShieldHalved/>, title: "Secure Payments",  desc: "Encrypted checkout and buyer protection on every order." },
            { icon: <FaTruckFast/>,    title: "Fast Shipping",    desc: "Partner couriers with live tracking from cart to door." },
            { icon: <FaRotateLeft/>,   title: "Easy Returns",     desc: "Clear, friendly return policy—zero hassle." },
            { icon: <FaHeadset/>,      title: "Real Support",     desc: "People-first support that actually helps 24/7." },
          ].map((v) => (
            <article className="au-card animated-border" key={v.title}>
              <div className="au-card-ico">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </article>
          ))}
        </section>

        {/* STATS (animated on view) */}
        <section className="au-stats animated-border" ref={statsRef}>
          {stats.map((s) => (
            <div className="au-stat" key={s.label}>
              <div className="au-stat-ico">{s.icon}</div>
              <div className="au-stat-val">
                <Counter end={s.end} decimals={s.decimals} suffix={s.suffix} start={startCount} />
              </div>
              <div className="au-stat-lbl">{s.label}</div>
            </div>
          ))}
        </section>

        {/* TIMELINE (step highlight every 2s) */}
        <section className="au-steps animated-border">
          <h2>How We Work</h2>
          <ol>
            {steps.map((s, i) => (
              <li key={i} className={i === activeStep ? "active" : ""}>
                <div className="dot" />
                <div className="content">
                  <h4>{s.t}</h4>
                  <p>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* QUOTES */}
        <section className="au-quotes">
          {[
            { q: "Smooth experience, fast delivery, exactly as described.", a: "Lara S." },
            { q: "Support replied in minutes and solved it. 10/10!",        a: "Omar H." },
            { q: "My go-to shop for gifts—reliable and stylish.",           a: "Rana K." },
          ].map((c, i) => (
            <figure className="au-quote animated-border" key={i}>
              <FaStar className="q-star" /><FaStar className="q-star" /><FaStar className="q-star" /><FaStar className="q-star" /><FaStar className="q-star" />
              <blockquote>{c.q}</blockquote>
              <figcaption>— {c.a}</figcaption>
            </figure>
          ))}
        </section>

        {/* OWNER */}
        <section className="au-owner animated-border">
          <span className="au-owner-badge">Owner</span>
          <img src={ownerPhoto} alt="Store owner" className="au-owner-photo" />
          <h3 className="au-owner-name">{OWNER}</h3>
          <p className="au-owner-note">
            Thanks for supporting {STORE}. Have ideas or special requests? I’d love to hear from you!
          </p>
        </section>
      </div>
    </main>
  );
}
