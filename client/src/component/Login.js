import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LoginStyle.css';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = () => {
    console.log('Login with Google clicked');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="title">Login</div>
        <form>
          <div className="input-box">
            <span className="details">Email</span>
            <input type="email" placeholder="Enter your email" required />
          </div>

          {/* Password with Eye */}
          <div className="input-box password-box">
            <span className="details">Password</span>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
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
