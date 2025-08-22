import React, { useState } from "react";
import "../styles/ContactUs.css";
import { FaInstagram, FaGithub, FaFacebook, FaXTwitter } from "react-icons/fa6";

const API_URL_CREATE = "http://localhost:5002/api/contact/create";

export default function ContactUs({ darkMode }) {
  const [values, setValues] = useState({
    name: "", email: "", phone: "", subject: "", message: ""
  });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const SOCIAL_LINKS = {
    instagram: "https://www.instagram.com/M0_TF/",
    github: "https://github.com/MohammadBTelfah",
    facebook: "https://www.facebook.com/mohammed.telfah.35/",
    x: "https://x.com/m7mdte",
  };

  const socials = [
    { name: "Instagram", icon: <FaInstagram />, href: SOCIAL_LINKS.instagram, desc: "Follow our latest photos and stories" },
    { name: "GitHub", icon: <FaGithub />, href: SOCIAL_LINKS.github, desc: "Explore projects and repositories" },
    { name: "Facebook", icon: <FaFacebook />,  href: SOCIAL_LINKS.facebook, desc: "Join our community and share your thoughts" },
    { name: "X", icon: <FaXTwitter />, href: SOCIAL_LINKS.x, desc: "Tweet with us and follow quick updates" },
  ];

  const handleChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((old) => ({ ...old, [e.target.name]: "", form: "" }));
  };

  const validate = () => {
    const e = {};
    if (!values.name.trim() || values.name.trim().length < 2) e.name = "Full name is required (min 2 chars).";
    if (!values.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = "Please enter a valid email address.";
    if (values.phone && !/^[0-9+\-\s()]+$/.test(values.phone)) e.phone = "Digits and common phone symbols only.";
    if (!values.subject.trim() || values.subject.trim().length < 3) e.subject = "Subject is required (min 3 chars).";
    if (!values.message.trim() || values.message.trim().length < 10) e.message = "Message must be at least 10 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSent(false);
    setErrors({});

    try {
      const res = await fetch(API_URL_CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        if (json.errors?.length) {
          const mapped = {};
          for (const err of json.errors) {
            if (err.path) mapped[err.path] = err.msg || "Invalid value";
          }
          setErrors(mapped);
        } else {
          setErrors({ form: json.error || "Failed to send. Please try again." });
        }
        return;
      }

      setSent(true);
      setValues({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch {
      setErrors({ form: "Could not reach the server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`cu-page ${darkMode ? "cu-dark" : ""}`}>
      <div className="cu-container">
        <header className="cu-header">
          <h1>Contact Us</h1>
          <nav className="cu-top-icons" aria-label="Social media">
            {socials.map((s) => {
              const slug = s.name.toLowerCase().replace(/\s+/g, "");
              return (
                <a
                  key={s.name}
                  href={s.href}
                  className={`cu-top-icon icon-${slug} brand-${slug}`}
                  aria-label={s.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.icon}
                </a>
              );
            })}
          </nav>
        </header>

        <section className="cu-grid">
          <div className="cu-cards">
            {socials.map((s) => {
              const slug = s.name.toLowerCase().replace(/\s+/g, "");
              return (
                <article className={`cu-card animated-border brand-${slug}`} key={s.name}>
                  <div className={`cu-card-icon icon-${slug}`} aria-hidden="true">{s.icon}</div>
                  <h3 className="cu-card-title">{s.name}</h3>
                  <p className="cu-card-desc">{s.desc}</p>
                  <a className="cu-card-link" href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.name === "Facebook" ? "Visit Page" : "Visit Account"}
                  </a>
                </article>
              );
            })}
          </div>

          <div className="cu-form-wrap">
            <form className="cu-form animated-border" onSubmit={handleSubmit} noValidate>
              {sent && <div className="cu-success">Your message has been sent successfully. We will get back to you soon.</div>}
              {errors.form && <div className="cu-error" style={{ marginBottom: 10 }}>{errors.form}</div>}

              <div className="cu-field">
                <label htmlFor="name">Full Name</label>
                <input id="name" name="name" value={values.name} onChange={handleChange} placeholder="Enter your name here" aria-invalid={!!errors.name}/>
                {errors.name && <p className="cu-error">{errors.name}</p>}
              </div>

              <div className="cu-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={values.email} onChange={handleChange} placeholder="example@mail.com" aria-invalid={!!errors.email}/>
                {errors.email && <p className="cu-error">{errors.email}</p>}
              </div>

              <div className="cu-field">
                <label htmlFor="phone">Phone Number (Optional)</label>
                <input id="phone" name="phone" value={values.phone} onChange={handleChange} placeholder="05xxxxxxxx" aria-invalid={!!errors.phone}/>
                {errors.phone && <p className="cu-error">{errors.phone}</p>}
              </div>

              <div className="cu-field">
                <label htmlFor="subject">Subject</label>
                <input id="subject" name="subject" value={values.subject} onChange={handleChange} placeholder="Message subject" aria-invalid={!!errors.subject}/>
                {errors.subject && <p className="cu-error">{errors.subject}</p>}
              </div>

              <div className="cu-field">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={5} value={values.message} onChange={handleChange} placeholder="Type your message…" aria-invalid={!!errors.message}/>
                {errors.message && <p className="cu-error">{errors.message}</p>}
              </div>

              <button type="submit" className="cu-btn" disabled={loading}>
                {loading ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
