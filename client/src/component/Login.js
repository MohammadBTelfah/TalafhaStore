import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LoginStyle.css';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import axios from 'axios';

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5002/api/users/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role || res.data.user?.role);

      setSuccess(true);
      setTimeout(() => {
        const role = res.data.role || res.data.user?.role;
        window.location.href = role === 'admin' ? '/dashboard' : '/';
      }, 2500);
    } catch (err) {
      console.error('Login error:', err.response?.data?.message || err.message);
      alert(err.response?.data?.message || 'Login failed.');
    }
  };

  const handleGoogleLogin = () => {
    window.open('http://localhost:5002/api/users/google', '_self');
  };

  return (
    <div className="login-page">
      {success && (
        <div className="success-overlay">
          <div className="circle">
            <span className="check">✓</span>
          </div>
        </div>
      )}

      <div className={`login-container ${success ? 'blurred' : ''}`}>
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

          <div className="input-box password-box">
            <span className="details">Password</span>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
          </div>

          <div className="forgot-password">
            <a href="#">Forgot password?</a>
          </div>

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
