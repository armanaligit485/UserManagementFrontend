import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiUser, FiMail, FiLock, FiPlusCircle, FiCheck, FiX } from "react-icons/fi";
import './AddUser.css';

const AddUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validate Field
  const validateField = useCallback((name, value) => {
    let errorMsg = "";

    if (!value.trim()) {
      const fieldName = name === "firstName" ? "First name" :
          name === "lastName" ? "Last name" :
              name.charAt(0).toUpperCase() + name.slice(1);
      errorMsg = `${fieldName} is required`;
    } else {
      if (name === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
        errorMsg = "Enter a valid email address";
      }
      if (name === "password") {
        if (value.length < 8) {
          errorMsg = "Password must be at least 8 characters";
        }

      }
    }

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  }, []);

  useEffect(() => {
    // Improved password strength calculation
    let strength = 0;
    if (formData.password.length >= 8) strength = 1; // Minimum requirement
    if (formData.password.length >= 12) strength = 2;
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[0-9]/.test(formData.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
    setPasswordStrength(Math.min(strength, 4));
  }, [formData.password]);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (touched[name]) {
      validateField(name, value);
    }
  };

  // Handle Blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Check username availability
  const checkUsernameAvailability = useCallback(async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const { data } = await axios.post(
          "https://usermanagementbackend-v9en.onrender.com/users/search",
          { username },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${localStorage.getItem("base64Credentials")}`
            }
          }
      );
      setUsernameAvailable(!data.some(user => user.username === username));
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkUsernameAvailability(formData.username);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, checkUsernameAvailability]);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const newTouched = {};
    Object.keys(formData).forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Validate all fields
    let isValid = true;
    const newErrors = {};

    Object.keys(formData).forEach(field => {
      const fieldValid = validateField(field, formData[field]);
      if (!fieldValid) isValid = false;
    });

    if (!isValid) {
      toast.error("Please fix form errors");
      return;
    }

    if (usernameAvailable === false) {
      toast.error("Username is already taken");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(
          "https://usermanagementbackend-v9en.onrender.com/users",
          formData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem("authToken")}`
            }
          }
      );
      toast.success("User added successfully");
      setFormData({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      setErrors({});
      setTouched({});
      setUsernameAvailable(null);
      setPasswordStrength(0);
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(error.response?.data?.message || "Failed to add user");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = Object.keys(errors).every(key => !errors[key]) &&
      formData.username &&
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.password &&
      passwordStrength >= 2;

  return (
      <div className="add-user-container">
        <div className="add-user-card">
          <div className="add-user-header">
            <div className="add-user-icon-container">
              <FiPlusCircle className="add-user-icon" />
            </div>
            <h2 className="add-user-title">Add New User</h2>
            <p className="add-user-subtitle">Fill in the details to create a new user account</p>
          </div>

          <form onSubmit={handleSubmit} className="add-user-form">
            {/* Username Field */}
            <div className="add-user-form-group">
              <label htmlFor="username" className="add-user-label">
                Username
              </label>
              <div className="add-user-input-container">
                <div className="add-user-input-icon">
                  <FiUser />
                </div>
                <input
                    id="username"
                    type="text"
                    name="username"
                    className={`add-user-input ${
                        touched.username && errors.username ? 'add-user-input-error' :
                            touched.username && formData.username ? 'add-user-input-valid' : ''
                    }`}
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter username (min 3 chars)"
                    minLength="3"
                    required
                />
                {formData.username && (
                    <span className="add-user-availability-icon">
                  {isCheckingUsername ? (
                      <span className="add-user-spinner-small" />
                  ) : usernameAvailable === true ? (
                      <FiCheck className="text-success" />
                  ) : usernameAvailable === false ? (
                      <FiX className="text-error" />
                  ) : null}
                </span>
                )}
              </div>
              {touched.username && errors.username && (
                  <span className="add-user-error-message">{errors.username}</span>
              )}
              {formData.username && !isCheckingUsername && (
                  <span className={`add-user-availability-message ${
                      usernameAvailable === true ? 'text-success' :
                          usernameAvailable === false ? 'text-error' : ''
                  }`}>
                {usernameAvailable === true ? "Username available" :
                    usernameAvailable === false ? "Username taken" : ""}
              </span>
              )}
            </div>

            {/* First Name Field */}
            <div className="add-user-form-group">
              <label htmlFor="firstName" className="add-user-label">
                First Name
              </label>
              <div className="add-user-input-container">
                <div className="add-user-input-icon">
                  <FiUser />
                </div>
                <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    className={`add-user-input ${
                        touched.firstName && errors.firstName ? 'add-user-input-error' :
                            touched.firstName && formData.firstName ? 'add-user-input-valid' : ''
                    }`}
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter first name"
                    required
                />
              </div>
              {touched.firstName && errors.firstName && (
                  <span className="add-user-error-message">{errors.firstName}</span>
              )}
            </div>

            {/* Last Name Field */}
            <div className="add-user-form-group">
              <label htmlFor="lastName" className="add-user-label">
                Last Name
              </label>
              <div className="add-user-input-container">
                <div className="add-user-input-icon">
                  <FiUser />
                </div>
                <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    className={`add-user-input ${
                        touched.lastName && errors.lastName ? 'add-user-input-error' :
                            touched.lastName && formData.lastName ? 'add-user-input-valid' : ''
                    }`}
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter last name"
                    required
                />
              </div>
              {touched.lastName && errors.lastName && (
                  <span className="add-user-error-message">{errors.lastName}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="add-user-form-group">
              <label htmlFor="email" className="add-user-label">
                Email
              </label>
              <div className="add-user-input-container">
                <div className="add-user-input-icon">
                  <FiMail />
                </div>
                <input
                    id="email"
                    type="email"
                    name="email"
                    className={`add-user-input ${
                        touched.email && errors.email ? 'add-user-input-error' :
                            touched.email && formData.email ? 'add-user-input-valid' : ''
                    }`}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter email address"
                    required
                />
              </div>
              {touched.email && errors.email && (
                  <span className="add-user-error-message">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="add-user-form-group">
              <label htmlFor="password" className="add-user-label">
                Password
              </label>
              <div className="add-user-input-container">
                <div className="add-user-input-icon">
                  <FiLock />
                </div>
                <input
                    id="password"
                    type="password"
                    name="password"
                    className={`add-user-input ${
                        touched.password && errors.password ? 'add-user-input-error' :
                            touched.password && formData.password ? 'add-user-input-valid' : ''
                    }`}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter password (min 8 chars)"
                    minLength="8"
                    required
                />
              </div>

              {/* Password Strength Meter */}
              {(formData.password) && (
                  <div className="password-strength-container">
                    <div className="password-strength-meter">
                      {[1, 2, 3, 4].map((level) => (
                          <div
                              key={level}
                              className={`strength-bar ${
                                  passwordStrength >= level ? `strength-${passwordStrength}` : ''
                              }`}
                          />
                      ))}
                    </div>
                    <span className={`strength-text strength-${passwordStrength}`}>
                    {passwordStrength === 0 && 'Weak'}
                      {passwordStrength === 1 && 'Fair'}
                      {passwordStrength === 2 && 'Good'}
                      {passwordStrength === 3 && 'Strong'}
                      {passwordStrength === 4 && 'Very Strong'}
                  </span>
                  </div>
              )}

              {touched.password && errors.password && (
                  <span className="add-user-error-message">{errors.password}</span>
              )}

              {/* Password Hints */}
              <div className="password-hints">
                <span className={formData.password.length >= 8 ? 'hint-valid' : 'hint-invalid'}>
                  ✓ At least 8 characters
                </span>
                <span className={/[A-Z]/.test(formData.password) ? 'hint-valid' : 'hint-invalid'}>
                  ✓ One uppercase letter
                </span>
                <span className={/[0-9]/.test(formData.password) ? 'hint-valid' : 'hint-invalid'}>
                  ✓ One number
                </span>
                <span className={/[^A-Za-z0-9]/.test(formData.password) ? 'hint-valid' : 'hint-invalid'}>
                  ✓ One special character
                </span>
              </div>
            </div>

            <button
                type="submit"
                className="add-user-button"
                disabled={!isFormValid || isLoading || usernameAvailable === false}
            >
              {isLoading ? (
                  <>
                    <span className="add-user-spinner" />
                    Adding User...
                  </>
              ) : 'Add User'}
            </button>
          </form>
        </div>
      </div>
  );
};

export default AddUser;
