import React, { useRef, useState } from 'react';
import '../styles/RegStyle.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

let debounceTimeout;
const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:5002";


export default function RegistrationForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

    const checkUsername = async (username) => {
    if (username.trim().length < 4) return;

    try {
      const res = await axios.post(`${API_BASE}/api/users/check-username`, { username });
      setUsernameAvailable(res.data.available);
      setErrors(prev => ({
        ...prev,
        username: res.data.available ? '' : 'Username already exists.',
      }));
    } catch (err) {
      console.error('Username check failed:', err);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'username') {
      clearTimeout(debounceTimeout);

      if (value.trim() === '') {
        setUsernameAvailable(null);
        setErrors(prev => ({ ...prev, username: '' }));
        return;
      }

      debounceTimeout = setTimeout(() => {
        checkUsername(value);
      }, 500);
    }

    if (name === 'email') {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(value) ? '' : 'Please enter a valid email address.',
      }));
    }

    if (name === 'password') {
      setErrors(prev => ({
        ...prev,
        password: validatePassword(value) ? '' : 'Password must include at least one uppercase, one lowercase, one number, and be at least 8 characters long.',
      }));
    }

    if (name === 'confirmPassword') {
      setErrors(prev => ({
        ...prev,
        confirmPassword: value === formData.password ? '' : 'Passwords do not match.',
      }));
    }
  };

  const handleImageClick = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !validatePassword(formData.password) ||
      formData.password !== formData.confirmPassword ||
      !validateEmail(formData.email) ||
      usernameAvailable === false
    ) return;

    setIsSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'confirmPassword') data.append(key, value);
    });
    data.append('address', 'N/A');
    if (fileInputRef.current.files[0]) {
      data.append('profileImage', fileInputRef.current.files[0]);
    }

        try {
      await axios.post(`${API_BASE}/api/users/register`, data);
      setSuccessMessage("Registration successful! Please check your email to verify your account.");
      setFormData({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
      setImagePreview(null);
      setUsernameAvailable(null);
    } catch (err) {
      console.error(err);
      setSuccessMessage("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      {successMessage && (
        <div className="success-overlay">
          <div className="check-icon">
            <span>✓</span>
          </div>
        </div>
      )}
      <div className={`container ${successMessage ? 'blur-background' : ''}`}>
        <div className="title">Registration</div>
        <div className="image-upload" onClick={handleImageClick}>
          <img
            src={imagePreview || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'}
            alt="Profile Preview"
            className="profile-image"
          />
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
        </div>

        <div className="content">
          <form onSubmit={handleSubmit}>
            <div className="user-details">
              {/* Full Name, Username, Email, Phone */}
              {['fullName', 'username', 'email', 'phone'].map((field) => (
                <div className="input-box" key={field}>
                  <span className="details">{field.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    placeholder={`Enter your ${field}`}
                    className={
                      field === 'username'
                        ? errors.username
                          ? 'error'
                          : usernameAvailable === true
                          ? 'success'
                          : ''
                        : errors[field]
                        ? 'error'
                        : formData[field] && !errors[field]
                        ? 'success'
                        : ''
                    }
                    required
                  />
                  {field === 'username' && usernameAvailable === true && (
                    <p style={{ color: '#2ecc71', fontSize: '13px', marginTop: '4px' }}>✓ Username is available.</p>
                  )}
                  {errors[field] && <p className="error-text">{errors[field]}</p>}
                </div>
              ))}

              <div className="input-box password-box">
                <span className="details">Password</span>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={
                      errors.password
                        ? 'error'
                        : formData.password && validatePassword(formData.password)
                        ? 'success'
                        : ''
                    }
                      placeholder="Enter your password"

                    required
                  />
                  <span onClick={() => setShowPassword(!showPassword)} className="eye-icon">
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </span>
                </div>
                {errors.password && <p className="error-text">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="input-box password-box">
                <span className="details">Confirm Password</span>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={
                      errors.confirmPassword
                        ? 'error'
                        : formData.confirmPassword && formData.confirmPassword === formData.password
                        ? 'success'
                        : ''
                    }
                    placeholder='Confirm your password'
                    required
                  />
                  <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="eye-icon">
                    {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </span>
                </div>
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="button">
              <input type="submit" value={isSubmitting ? 'Registering...' : 'Register'} disabled={isSubmitting} />
            </div>
          </form>

          {successMessage && <div className="footer success-text">{successMessage}</div>}
          {!successMessage && (
            <div className="footer">
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} style={{ color: '#9b59b6', cursor: 'pointer', fontWeight: '500' }}>
                Sign in
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
