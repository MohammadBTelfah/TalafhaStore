import React, { useEffect, useRef, useState } from "react";
import "../styles/AboutUs.css";
import OrderLoop from "../component/OrderLoop";
import {
  FaTruckFast,
  FaShieldHalved,
  FaHeadset,
  FaRotateLeft,
  FaLeaf,
  FaStar,
  FaBoxesStacked,
  FaUsers,
} from "react-icons/fa6";

function Reveal({ children, delay = 0, className = "", as: Tag = "section" }) {
  const ref = useRef(null);
  const [inview, setInview] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInview(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${inview ? "inview" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

function Counter({
  end = 0,
  duration = 1500,
  decimals = 0,
  suffix = "",
  start = false,
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let rafId;
    if (!start) {
      setVal(0); // لو مش ظاهر القسم، خليه صفر
      return;
    }

    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(end * eased);
      if (p < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [start, end, duration]);

  return (
    <>
      {decimals ? val.toFixed(decimals) : Math.round(val)}
      {suffix}
    </>
  );
}
export default function AboutUs({ darkMode = false }) {
  const values = [
    {
      icon: <FaShieldHalved />,
      title: "Secure Payments",
      desc: "Encrypted checkout and buyer protection on every order.",
    },
    {
      icon: <FaTruckFast />,
      title: "Fast Shipping",
      desc: "Partner couriers with live tracking from cart to door.",
    },
    {
      icon: <FaRotateLeft />,
      title: "Easy Returns",
      desc: "Clear, friendly return policy—zero hassle.",
    },
    {
      icon: <FaHeadset />,
      title: "Real Support",
      desc: "People-first support that actually helps 24/7.",
    },
  ];

  const stats = [
    { icon: <FaBoxesStacked />, end: 12, suffix: "K+", label: "Products", decimals: 0, duration: 1600 },
    { icon: <FaUsers />, end: 28, suffix: "K+", label: "Happy Customers", decimals: 0, duration: 1800 },
    { icon: <FaTruckFast />, end: 48, suffix: "h", label: "Avg. Delivery", decimals: 0, duration: 1600 },
    { icon: <FaStar />, end: 4.9, suffix: "", label: "Rating", decimals: 1, duration: 2000 },
  ];

  const steps = [
    { t: "We curate", d: "We hand-pick items you actually want—quality over noise." },
    { t: "We verify", d: "Trusted suppliers, honest listings, and clear specs." },
    { t: "We deliver", d: "Fast, tracked shipping with careful packaging." },
    { t: "We improve", d: "We ship changes weekly based on your feedback." },
  ];

  const statsRef = useRef(null);
  const [startCount, setStartCount] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartCount(true);      
          io.disconnect();     
        }
      },
      {
        threshold: 0.15,        
        rootMargin: "0px 0px -35% 0px", 
      }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActiveStep((p) => (p + 1) % steps.length), 2000);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <main className={`au-page ${darkMode ? "au-dark" : ""}`}>
      <div className="au-container">
        {/* HERO */}
        <Reveal className="au-hero" as="section">
          <div className="au-hero-copy animated-border">
            <span className="au-kicker">Welcome to Talafha Store</span>
            <h1>Shopping, simplified.</h1>
            <p>
              Talafha Store is a modern e-commerce brand focused on clarity, trust, and speed.
              We bring carefully selected products, secure payments, and quick delivery— all wrapped in a sleek, delightful experience.
            </p>
            <div className="au-hero-bullets">
              <span>
                <FaShieldHalved /> Secure
              </span>
              <span>
                <FaTruckFast /> Fast
              </span>
              <span>
                <FaHeadset /> Helpful
              </span>
              <span>
                <FaLeaf /> Thoughtful
              </span>
            </div>
          </div>
          <div className="au-hero-art animated-border">
            <OrderLoop duration="9s" boxesFrom="right" />
          </div>
        </Reveal>

        <Reveal as="section" className="au-values" delay={80}>
          {values.map((v, i) => (
            <article
              className="au-card animated-border reveal-child"
              style={{ "--i": i }}
              key={v.title}
            >
              <div className="au-card-ico">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </article>
          ))}
        </Reveal>

<Reveal as="section" className="au-stats animated-border" delay={120}>
  <span ref={statsRef} className="io-sentinel" />

  <div className="stagger">
    {stats.map((s, i) => (
      <div className="au-stat reveal-child" style={{ "--i": i }} key={s.label}>
        <div className="au-stat-ico">{s.icon}</div>
        <div className="au-stat-val">
          <Counter
            end={s.end}
            decimals={s.decimals}
            suffix={s.suffix}
            duration={s.duration}
            start={startCount}  
          />
        </div>
        <div className="au-stat-lbl">{s.label}</div>
      </div>
    ))}
  </div>
</Reveal>

        <Reveal as="section" className="au-steps animated-border" delay={120}>
          <h2>How We Work</h2>
          <ol>
            {steps.map((s, i) => (
              <li
                key={i}
                className={`reveal-child ${i === activeStep ? "active" : ""}`}
                style={{ "--i": i }}
              >
                <div className="dot" />
                <div className="content">
                  <h4>{s.t}</h4>
                  <p>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* QUOTES */}
        <Reveal as="section" className="au-quotes" delay={120}>
          {[
            {
              q: "Smooth experience, fast delivery, exactly as described.",
              a: "Lara S.",
            },
            { q: "Support replied in minutes and solved it. 10/10!", a: "Omar H." },
            { q: "My go-to shop for gifts—reliable and stylish.", a: "Rana K." },
          ].map((c, i) => (
            <figure
              className="au-quote animated-border reveal-child"
              style={{ "--i": i }}
              key={i}
            >
              <FaStar className="q-star" />
              <FaStar className="q-star" />
              <FaStar className="q-star" />
              <FaStar className="q-star" />
              <FaStar className="q-star" />
              <blockquote>{c.q}</blockquote>
              <figcaption>— {c.a}</figcaption>
            </figure>
          ))}
        </Reveal>

        {/* OWNER */}
        <Reveal as="section" className="au-owner animated-border" delay={120}>
          <span className="au-owner-badge">Owner</span>
          <img
            src="https://scontent.famm6-1.fna.fbcdn.net/v/t39.30808-6/434036733_2426139024244661_1131875076272113628_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeFipHkc6V8_1NJ-XVb2jxE8UxSyh2xmLd9TFLKHbGYt35h1C_X3elqXrJpOiqtWsuwFhXDb8m284vRk7e9AkgHt&_nc_ohc=cBdgWiXPZt4Q7kNvwFeI2LL&_nc_oc=AdkOFDa9HqO_4sfm87qAgl7UV5NzkebzhqLX-4YppL8ecJlX5FVKg4PPdzeWPbnbu6_TLZzuJyU2kFZqiZDMCtaI&_nc_zt=23&_nc_ht=scontent.famm6-1.fna&_nc_gid=09cw5PIVAX5XJjBJGyOnNw&oh=00_AfVOPErH8F1WWlRLUEq3EpXxPDR9bTcIono4kLKoYHaZtA&oe=68ADD94C"
            alt="Store owner"
            className="au-owner-photo"
          />
          <h3 className="au-owner-name">Mohammed Telfah</h3>
          <p className="au-owner-note">
            Thanks for supporting Talafha Store. Have ideas or special requests? I’d love to hear from you!
          </p>
        </Reveal>
      </div>
    </main>
  );
}
