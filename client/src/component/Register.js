import React, { useRef, useState } from 'react';
import '../styles/RegStyle.css';
import { useNavigate } from 'react-router-dom';

export default function RegistrationForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageClick = () => {
    fileInputRef.current.click(); // فتح اختيار الصورة عند الضغط على الصورة
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        {/* Title */}
        <div className="title">Registration</div>

        {/* ✅ صورة الرفع */}
        <div className="image-upload" onClick={handleImageClick}>
          <img
            src={
              imagePreview ||
              'https://cdn-icons-png.flaticon.com/512/847/847969.png' // صورة افتراضية
            }
            alt="Profile Preview"
            className="profile-image"
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>

        <div className="content">
          <form action="#">
            <div className="user-details">
              {/* نفس الحقول القديمة */}
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

          {/* رابط تسجيل الدخول */}
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
