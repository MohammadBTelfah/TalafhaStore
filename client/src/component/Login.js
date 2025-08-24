import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LoginStyle.css';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import axios from 'axios';

// ⬅️ قاعدة الـ API من env (CRA)
const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5002';

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/users/login`, formData, {
        // لو بتستخدم كوكيز على الدومين نفسه فعّل السطر التالي
        // withCredentials: true,
      });

      localStorage.setItem('token', res.data.token);
      const userRole = res.data.role || (res.data.user && res.data.user.role) || 'user';
      localStorage.setItem('role', userRole);

      setSuccess(true);
      setTimeout(() => {
        const role = res.data.role || res.data.user?.role;
        window.location.href = role === 'admin' ? '/dashboard' : '/';
      }, 2500);
    } catch (err) {
      console.error('Login error:', err.response?.data?.message || err.message);
      setErrorMessage(err.response?.data?.message || 'Password is not correct');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleGoogleLogin = () => {
    window.open(`${API_BASE}/api/users/google`, '_self');
  };

  return (
    <div className="login-page">
      {success && (
        <div className="success-overlay">
          <span className="check-icon">✔</span>
        </div>
      )}

      <div className={`login-container ${success ? 'blur-background' : ''}`}>
        <div className="title">Login</div>
        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <span className="details">Email</span>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={`input-box password-box ${shake ? 'shake' : ''}`}>
            <span className="details">Password</span>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className={errorMessage ? 'error' : ''}
              />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
          </div>

          <Link to="/forgot-password" className="forgot-password-link">
            Forgot password?
          </Link>

          <div className="button">
            <input type="submit" value="Login" />
          </div>
        </form>

        <div className="google-login" onClick={handleGoogleLogin}>
          <FcGoogle size={22} style={{ marginRight: '10px' }} />
          Login with Google
        </div>

        <div className="footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
