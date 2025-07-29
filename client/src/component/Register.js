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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === 'password') {
      if (!validatePassword(e.target.value)) {
        setErrors((prev) => ({
          ...prev,
          password:
            'Password must include at least one uppercase, one lowercase, one number, and be at least 8 characters long.',
        }));
      } else {
        setErrors((prev) => ({ ...prev, password: '' }));
      }
    }

    if (e.target.name === 'confirmPassword') {
      if (e.target.value !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: 'Passwords do not match.',
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
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

    if (!validatePassword(formData.password)) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('password', formData.password);
    data.append('address', 'N/A');

    if (fileInputRef.current.files[0]) {
      data.append('profileImage', fileInputRef.current.files[0]);
    }

    try {
      await axios.post('http://127.0.0.1:5002/api/users/register', data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      {success && (
        <div className="success-overlay">
          <div className="check-icon">
            <span>✓</span>
          </div>
        </div>
      )}

      <div className={`container ${success ? 'blur-background' : ''}`}>
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
              {['fullName', 'username', 'email', 'phone'].map((field) => (
                <div className="input-box" key={field}>
                  <span className="details">{field.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    placeholder={`Enter your ${field}`}
                    required
                  />
                </div>
              ))}

              {/* Password */}
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
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="eye-icon"
                  >
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
                        : formData.confirmPassword &&
                          formData.confirmPassword === formData.password
                        ? 'success'
                        : ''
                    }
                    required
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="eye-icon"
                  >
                    {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </span>
                </div>
                {errors.confirmPassword && (
                  <p className="error-text">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="button">
              <input type="submit" value={isSubmitting ? 'Registering...' : 'Register'} disabled={isSubmitting} />
            </div>
          </form>

          <div className="footer">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} style={{ color: '#9b59b6', cursor: 'pointer', fontWeight: '500' }}>
              Sign in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
