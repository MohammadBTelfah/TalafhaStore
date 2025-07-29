import React from 'react';
import '../styles/RegStyle.css';
import { useNavigate } from 'react-router-dom';

export default function RegistrationForm() {
  const navigate = useNavigate();

  return (
    <div className="register-page">
      <div className="container">
        {/* Title section */}
        <div className="title">Registration</div>
        <div className="content">
          {/* Registration form */}
          <form action="#">
            <div className="user-details">
              <div className="input-box">
                <span className="details">Full Name</span>
                <input type="text" placeholder="Enter your name" required />
              </div>
              <div className="input-box">
                <span className="details">Username</span>
                <input type="text" placeholder="Enter your username" required />
              </div>
              <div className="input-box">
                <span className="details">Email</span>
                <input type="text" placeholder="Enter your email" required />
              </div>
              <div className="input-box">
                <span className="details">Phone Number</span>
                <input type="text" placeholder="Enter your number" required />
              </div>
              <div className="input-box">
                <span className="details">Password</span>
                <input type="password" placeholder="Enter your password" required />
              </div>
              <div className="input-box">
                <span className="details">Confirm Password</span>
                <input type="password" placeholder="Confirm your password" required />
              </div>
            </div>

            {/* Submit button */}
            <div className="button">
              <input type="submit" value="Register" />
            </div>
          </form>

          {/* ✅ رابط تسجيل الدخول */}
          <div className="footer">
            Already have an account?{' '}
            <span
              style={{ color: '#9b59b6', cursor: 'pointer', fontWeight: '500' }}
              onClick={() => navigate('/login')}
            >
              Sign in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
