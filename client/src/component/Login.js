import React from 'react';
import { Link } from 'react-router-dom';

import '../styles/LoginStyle.css'; // تأكد من وجود هذا الملف

export default function LoginForm() {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="title">Login</div>
        <form>
          <div className="input-box">
            <span className="details">Email</span>
            <input type="email" placeholder="Enter your email" required />
          </div>
          <div className="input-box">
            <span className="details">Password</span>
            <input type="password" placeholder="Enter your password" required />
          </div>
          <div className="forgot-password">
            <a href="#">Forgot password?</a>
          </div>
          <div className="button">
            <input type="submit" value="Login" />
          </div>
        </form>

        <div className="footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
        
      </div>
    </div>
  );
}
