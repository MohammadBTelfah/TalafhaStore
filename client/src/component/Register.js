import React, { useRef, useState } from 'react';
import '../styles/RegStyle.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

export default function RegistrationForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('password', formData.password);
    data.append('address', 'N/A'); // ممكن تعدل العنوان

    if (fileInputRef.current.files[0]) {
      data.append('profileImage', fileInputRef.current.files[0]);
    }

    try {
      const res = await axios.post('http://127.0.0.1:5002/api/users/register', data);
      alert('Registered successfully');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="title">Registration</div>

        <div className="image-upload" onClick={handleImageClick}>
          <img
            src={imagePreview || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'}
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
          <form onSubmit={handleSubmit}>
            <div className="user-details">
              <div className="input-box">
                <span className="details">Full Name</span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="input-box">
                <span className="details">Username</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="input-box">
                <span className="details">Email</span>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="input-box">
                <span className="details">Phone Number</span>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your number"
                  required
                />
              </div>

              <div className="input-box password-box">
                <span className="details">Password</span>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                  <span onClick={() => setShowPassword(!showPassword)} className="eye-icon">
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </span>
                </div>
              </div>

              <div className="input-box password-box">
                <span className="details">Confirm Password</span>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="eye-icon"
                  >
                    {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </span>
                </div>
              </div>
            </div>

            <div className="button">
              <input type="submit" value="Register" />
            </div>
          </form>

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
