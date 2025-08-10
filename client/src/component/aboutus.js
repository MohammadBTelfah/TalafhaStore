// AboutUs.jsx
import React from "react";
import "../styles/AboutUs.css";
import {
  FaTruckFast, FaShieldHalved, FaHeadset, FaRotateLeft,
  FaLeaf, FaStar, FaBoxesStacked, FaUsers
} from "react-icons/fa6";

export default function AboutUs({ darkMode }) {
  const STORE = "Talafha Store";
  const OWNER = "Mohammed Telfah";
  const ownerPhoto = "https://scontent.famm6-1.fna.fbcdn.net/v/t39.30808-6/434036733_2426139024244661_1131875076272113628_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFipHkc6V8_1NJ-XVb2jxE8UxSyh2xmLd9TFLKHbGYt35h1C_X3elqXrJpOiqtWsuwFhXDb8m284vRk7e9AkgHt&_nc_ohc=ssu8WN06w4kQ7kNvwGNB82C&_nc_oc=AdncgcCzaPp2nZqoW8mF8tfsWikOLI8fFvmJxkw_hbU27wXD_NOR8EgxDrE5nbymgxy0pPB2ifrviMJlRR2Xe4t2&_nc_zt=23&_nc_ht=scontent.famm6-1.fna&_nc_gid=xDe9kdMzuMN5kT225HXpkQ&oh=00_AfURDWo85-MDpVKBE0Y6UvI3odRLXIwZoSxlQgf2Pupv5Q&oe=689EE84C"; // كما هو

  const stats = [
    { icon: <FaBoxesStacked/>, value: "2K+", label: "Products" },
    { icon: <FaUsers/>,        value: "8K+", label: "Happy Customers" },
    { icon: <FaTruckFast/>,    value: "48h", label: "Avg. Delivery" },
    { icon: <FaStar/>,         value: "4.9", label: "Rating" },
  ];

  const values = [
    { icon: <FaShieldHalved/>, title: "Secure Payments",  desc: "Encrypted checkout and buyer protection on every order." },
    { icon: <FaTruckFast/>,    title: "Fast Shipping",    desc: "Partnered couriers and live updates from cart to door." },
    { icon: <FaRotateLeft/>,   title: "Easy Returns",     desc: "Clear, friendly return policy—zero hassle." },
    { icon: <FaHeadset/>,      title: "Real Support",     desc: "People-first support that actually helps 24/7." },
  ];

  const steps = [
    { t: "We curate",  d: "We hand-pick items you actually want—quality over noise." },
    { t: "We verify",  d: "Trusted suppliers, honest listings, and clear specs." },
    { t: "We deliver", d: "Fast, tracked shipping with careful packaging." },
    { t: "We improve", d: "We ship changes weekly based on your feedback." },
  ];

  const quotes = [
    { q: "Smooth experience, fast delivery, exactly as described.", a: "Lara S." },
    { q: "Support replied in minutes and solved it. 10/10!", a: "Omar H." },
    { q: "My go-to shop for gifts—reliable and stylish.", a: "Rana K." },
  ];

  return (
    <main className={`au-page ${darkMode ? "au-dark" : ""}`}>
      {/* HERO */}
      <section className="au-hero">
        <div className="au-hero-copy">
          <span className="au-kicker">Welcome to {STORE}</span>
          <h1>Shopping, simplified.</h1>
          <p>
            {STORE} is a modern e-commerce brand focused on clarity, trust, and speed.
            We bring carefully selected products, secure payments, and quick delivery—
            all wrapped in a sleek, delightful experience.
          </p>
          <div className="au-hero-bullets">
            <span><FaShieldHalved/>&nbsp;Secure</span>
            <span><FaTruckFast/>&nbsp;Fast</span>
            <span><FaHeadset/>&nbsp;Helpful</span>
            <span><FaLeaf/>&nbsp;Thoughtful</span>
          </div>
        </div>
        <div className="au-hero-art animated-border">
          <div className="au-blob b1"></div>
          <div className="au-blob b2"></div>
          <div className="au-blob b3"></div>
        </div>
      </section>

      {/* VALUES */}
      <section className="au-values">
        {values.map((v) => (
          <article className="au-card animated-border" key={v.title}>
            <div className="au-card-ico">{v.icon}</div>
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </article>
        ))}
      </section>

      {/* STATS */}
      <section className="au-stats animated-border">
        {stats.map((s) => (
          <div className="au-stat" key={s.label}>
            <div className="au-stat-ico">{s.icon}</div>
            <div className="au-stat-val">{s.value}</div>
            <div className="au-stat-lbl">{s.label}</div>
          </div>
        ))}
      </section>

      {/* TIMELINE */}
      <section className="au-steps animated-border">
        <h2>How We Work</h2>
        <ol>
          {steps.map((s, i) => (
            <li key={i}>
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
        {quotes.map((c, i) => (
          <figure className="au-quote animated-border" key={i}>
            <FaStar className="q-star"/><FaStar className="q-star"/><FaStar className="q-star"/><FaStar className="q-star"/><FaStar className="q-star"/>
            <blockquote>{c.q}</blockquote>
            <figcaption>— {c.a}</figcaption>
          </figure>
        ))}
      </section>

      {/* OWNER */}
      <section className="au-owner animated-border">
        <div className="au-owner-badge">Owner</div>
        <img src={ownerPhoto} alt="Store owner" className="au-owner-photo" />
        <h3 className="au-owner-name">{OWNER}</h3>
        <p className="au-owner-note">
          Thanks for supporting {STORE}. Have ideas or special requests? I’d love to hear from you!
        </p>
      </section>
    </main>
  );
}
