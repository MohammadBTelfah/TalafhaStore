// src/pages/aboutus.js
import React, { useEffect, useRef, useState } from "react";
import "../styles/AboutUs.css";
import OrderLoop from "../component/OrderLoop";
import { FaTruckFast, FaShieldHalved, FaHeadset, FaRotateLeft, FaLeaf, FaStar, FaBoxesStacked, FaUsers } from "react-icons/fa6";

/* ===== Reveal on scroll ===== */
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

/* ===== Counter (كما عملناه سابقاً) ===== */
function Counter({ end = 0, duration = 1200, decimals = 0, suffix = "", start = false }) {
  const [val, setVal] = useState(0);
  const startedRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!start || startedRef.current) return;
    startedRef.current = true;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal((end) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [start, end, duration]);

  return <>{decimals ? val.toFixed(decimals) : Math.round(val)}{suffix}</>;
}

export default function AboutUs({ darkMode = false }) {
  const ownerPhoto = "https://scontent.famm10-1.fna.fbcdn.net/v/t39.30808-6/482344460_2682443528614208_3745235885468521733_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeG1o3fkCH2xI7jWiUqpr_0R6d3Z0H1uuZnp3dnQfW65mQ9itTJfTE5t1_OvsVoCD0iwTt6zT8JbHkCzwE4SKesH&_nc_ohc=7qYf46grkDgQ7kNvwHzZxCk&_nc_oc=Adk1R63XHlC2gPseVUosAOxNNE8rRW3JYIqJzFj19h4xO94XfTQJEA3c1dvuGhNfji9iABKmzUdLHuftq08FvgiS&_nc_zt=23&_nc_ht=scontent.famm10-1.fna&_nc_gid=fgpNpO81r_ogxNJI25oENg&oh=00_AfX8VY1B8CB0JnMMzagmGtMblWgyuQVKmoIJZ-V1wgDMSA&oe=68A64E2E"
  const values = [
    { icon: <FaShieldHalved/>, title: "Secure Payments",  desc: "Encrypted checkout and buyer protection on every order." },
    { icon: <FaTruckFast/>,    title: "Fast Shipping",    desc: "Partner couriers with live tracking from cart to door." },
    { icon: <FaRotateLeft/>,   title: "Easy Returns",     desc: "Clear, friendly return policy—zero hassle." },
    { icon: <FaHeadset/>,      title: "Real Support",     desc: "People-first support that actually helps 24/7." },
  ];

  const stats = [
    { icon: <FaBoxesStacked />, end: 2,  suffix: "K+", label: "Products",        decimals: 0 },
    { icon: <FaUsers />,        end: 8,  suffix: "K+", label: "Happy Customers", decimals: 0 },
    { icon: <FaTruckFast />,    end: 48, suffix: "h",  label: "Avg. Delivery",   decimals: 0 },
    { icon: <FaStar />,         end: 4.9,suffix: "",   label: "Rating",          decimals: 1 },
  ];

  const steps = [
    { t: "We curate",  d: "We hand-pick items you actually want—quality over noise." },
    { t: "We verify",  d: "Trusted suppliers, honest listings, and clear specs." },
    { t: "We deliver", d: "Fast, tracked shipping with careful packaging." },
    { t: "We improve", d: "We ship changes weekly based on your feedback." },
  ];

  /* Counters start when stats section appears */
  const statsRef = useRef(null);
  const [startCount, setStartCount] = useState(false);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStartCount(true); io.disconnect(); }
    }, { threshold: .35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Timeline active hop (اختياري يبقى) */
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActiveStep(p => (p + 1) % steps.length), 2000);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <main className={`au-page ${darkMode ? "au-dark" : ""}`}>
      <div className="au-container">

        {/* HERO */}
        <Reveal className="au-hero" as="section" delay={0}>
          <div className="au-hero-copy animated-border">
            <span className="au-kicker">Welcome to Talafha Store</span>
            <h1>Shopping, simplified.</h1>
            <p>
              Talafha Store is a modern e-commerce brand focused on clarity, trust, and speed.
              We bring carefully selected products, secure payments, and quick delivery— all wrapped in a sleek, delightful experience.
            </p>
            <div className="au-hero-bullets">
              <span><FaShieldHalved /> Secure</span>
              <span><FaTruckFast /> Fast</span>
              <span><FaHeadset /> Helpful</span>
              <span><FaLeaf /> Thoughtful</span>
            </div>
          </div>
          <div className="au-hero-art animated-border">
            <OrderLoop duration="9s" boxesFrom="right" />
          </div>
        </Reveal>

        {/* VALUES */}
        <Reveal as="section" className="au-values" delay={80}>
          {values.map((v, i) => (
            <article className="au-card animated-border reveal-child" style={{"--i": i}} key={v.title}>
              <div className="au-card-ico">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </article>
          ))}
        </Reveal>

        {/* STATS */}
<Reveal as="section" className="au-stats animated-border" delay={120}>
  {/* 👇 سنتمينل 1x1 يُراقَب للدخول */}
  <span ref={statsRef} className="io-sentinel" />
  <div className="stagger">
    {stats.map((s, i) => (
      <div className="au-stat reveal-child" style={{ "--i": i }} key={s.label}>
        <div className="au-stat-ico">{s.icon}</div>
        <div className="au-stat-val">
          <Counter end={s.end} decimals={s.decimals} suffix={s.suffix} start={startCount} />
        </div>
        <div className="au-stat-lbl">{s.label}</div>
      </div>
    ))}
  </div>
</Reveal>


        {/* STEPS */}
        <Reveal as="section" className="au-steps animated-border" delay={120}>
          <h2>How We Work</h2>
          <ol>
            {steps.map((s, i) => (
              <li key={i} className={`reveal-child ${i===activeStep ? "active":""}`} style={{"--i": i}}>
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
            { q: "Smooth experience, fast delivery, exactly as described.", a: "Lara S." },
            { q: "Support replied in minutes and solved it. 10/10!",        a: "Omar H." },
            { q: "My go-to shop for gifts—reliable and stylish.",           a: "Rana K." },
          ].map((c, i) => (
            <figure className="au-quote animated-border reveal-child" style={{"--i": i}} key={i}>
              <FaStar className="q-star" /><FaStar className="q-star" /><FaStar className="q-star" /><FaStar className="q-star" /><FaStar className="q-star" />
              <blockquote>{c.q}</blockquote>
              <figcaption>— {c.a}</figcaption>
            </figure>
          ))}
        </Reveal>

        {/* OWNER */}
        <Reveal as="section" className="au-owner animated-border" delay={120}>
          <span className="au-owner-badge">Owner</span>
          <img src={ownerPhoto} alt="Store owner" className="au-owner-photo" />
          <h3 className="au-owner-name">Mohammed Telfah</h3>
          <p className="au-owner-note">
            Thanks for supporting Talafha Store. Have ideas or special requests? I’d love to hear from you!
          </p>
        </Reveal>

      </div>
    </main>
  );
}
