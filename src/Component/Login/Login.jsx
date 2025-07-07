import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import './Login.css'; // Create this CSS file (see below)

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    username: false,
    password: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateField = useCallback((fieldName, value) => {
    let error = '';
    if (!value.trim()) {
      error = fieldName === 'username' ? 'Username is required' : 'Password is required';
    } else if (fieldName === 'password' && value.length < 6) {
      error = 'Password must be at least 6 characters';
    }
    return error;
  }, []);

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
    const newErrors = { username: '', password: '' };

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

    setTouched({ username: true, password: true });

    if (!validateForm()) {
      toast.error('Please fix form errors');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
          'https://usermanagementbackend-v9en.onrender.com/auth/login',
          {
            username: formData.username,
            password: formData.password
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
      );

      const { token, userId } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('base64Credentials', btoa(`${formData.username}:${formData.password}`));

      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';

      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = !errors.username && !errors.password && formData.username && formData.password;

  return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-card-content">
            <div className="login-header">
              <div className="login-icon-container">
                <FiLogIn className="login-icon" />
              </div>
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="login-form">
              <div className="login-form-group">
                <label htmlFor="username" className="login-label">
                  Username
                </label>
                <div className="login-input-container">
                  <div className="login-input-icon">
                    <FiUser />
                  </div>
                  <input
                      id="username"
                      name="username"
                      type="text"
                      className={`login-input ${
                          touched.username && errors.username ? 'login-input-error' :
                              touched.username && formData.username ? 'login-input-valid' : ''
                      }`}
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      autoFocus
                  />
                </div>
                {touched.username && errors.username && (
                    <span className="login-error-message">{errors.username}</span>
                )}
              </div>

              <div className="login-form-group">
                <label htmlFor="password" className="login-label">
                  Password
                </label>
                <div className="login-input-container">
                  <div className="login-input-icon">
                    <FiLock />
                  </div>
                  <input
                      id="password"
                      name="password"
                      type="password"
                      className={`login-input ${
                          touched.password && errors.password ? 'login-input-error' :
                              touched.password && formData.password ? 'login-input-valid' : ''
                      }`}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      minLength="6"
                  />
                </div>
                {touched.password && errors.password && (
                    <span className="login-error-message">{errors.password}</span>
                )}
              </div>

              <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="login-button"
              >
                {isLoading ? (
                    <>
                      <span className="login-spinner" />
                      Signing in...
                    </>
                ) : 'Sign in'}
              </button>

              <div className="login-footer">
                Don't have an account? <Link to="/signup" className="login-link">Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default Login;
