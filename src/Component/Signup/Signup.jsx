import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiCheckCircle } from 'react-icons/fi';
import './Signup.css'; // Create this CSS file (similar to Login.css)

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [touched, setTouched] = useState({
    username: false,
    password: false,
    confirmPassword: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateField = useCallback((fieldName, value) => {
    let error = '';

    switch(fieldName) {
      case 'username':
        if (!value.trim()) error = 'Username is required';
        else if (value.length < 3) error = 'Username must be at least 3 characters';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password';
        else if (value !== formData.password) error = 'Passwords do not match';
        break;
      default:
        break;
    }

    return error;
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors = {};

    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      newErrors[field] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      username: true,
      password: true,
      confirmPassword: true
    });

    if (!validateForm()) {
      toast.error('Please fix form errors');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
          'https://usermanagementbackend-v9en.onrender.com/auth/signup',
          {
            username: formData.username,
            password: formData.password
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
      );


      toast.success('Account created successfully!');
      navigate('/login');
    } catch (err) {
      let errorMessage = 'Signup failed. Please try again.';

      if (err.response) {
        if (err.response.status === 409) {
          errorMessage = 'Username already exists';
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = !errors.username && !errors.password && !errors.confirmPassword &&
      formData.username && formData.password && formData.confirmPassword;

  return (
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-card-content">
            <div className="signup-header">
              <div className="signup-icon-container">
                <FiCheckCircle className="signup-icon" />
              </div>
              <h2 className="signup-title">Create Account</h2>
            </div>

            <form onSubmit={handleSubmit} noValidate className="signup-form">
              <div className="signup-form-group">
                <label htmlFor="username" className="signup-label">
                  Username
                </label>
                <div className="signup-input-container">
                  <div className="signup-input-icon">
                    <FiUser />
                  </div>
                  <input
                      id="username"
                      name="username"
                      type="text"
                      className={`signup-input ${
                          touched.username && errors.username ? 'signup-input-error' :
                              touched.username && formData.username ? 'signup-input-valid' : ''
                      }`}
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      minLength="3"
                      required
                      autoFocus
                  />
                </div>
                {touched.username && errors.username && (
                    <span className="signup-error-message">{errors.username}</span>
                )}
              </div>

              <div className="signup-form-group">
                <label htmlFor="password" className="signup-label">
                  Password
                </label>
                <div className="signup-input-container">
                  <div className="signup-input-icon">
                    <FiLock />
                  </div>
                  <input
                      id="password"
                      name="password"
                      type="password"
                      className={`signup-input ${
                          touched.password && errors.password ? 'signup-input-error' :
                              touched.password && formData.password ? 'signup-input-valid' : ''
                      }`}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      minLength="6"
                      required
                  />
                </div>
                {touched.password && errors.password && (
                    <span className="signup-error-message">{errors.password}</span>
                )}
              </div>

              <div className="signup-form-group">
                <label htmlFor="confirmPassword" className="signup-label">
                  Confirm Password
                </label>
                <div className="signup-input-container">
                  <div className="signup-input-icon">
                    <FiLock />
                  </div>
                  <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className={`signup-input ${
                          touched.confirmPassword && errors.confirmPassword ? 'signup-input-error' :
                              touched.confirmPassword && formData.confirmPassword ? 'signup-input-valid' : ''
                      }`}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                  />
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                    <span className="signup-error-message">{errors.confirmPassword}</span>
                )}
              </div>

              <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="signup-button"
              >
                {isLoading ? (
                    <>
                      <span className="signup-spinner" />
                      Creating account...
                    </>
                ) : 'Sign Up'}
              </button>

              <div className="signup-footer">
                Already have an account? <Link to="/login" className="signup-link">Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default Signup;
