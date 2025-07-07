import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiSave, FiX, FiCheck, FiLoader } from "react-icons/fi";
import './EditUser.css'; // Create this CSS file

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [originalUsername, setOriginalUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(true);

  // Fetch user data
  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
          "https://usermanagementbackend-v9en.onrender.com/users/search",
          { id },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${localStorage.getItem("base64Credentials")}`
            }
          }
      );

      if (data?.length > 0) {
        const user = data[0];
        setFormData({
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
        });
        setOriginalUsername(user.username);
      } else {
        toast.error("User not found");
        navigate("/listuser");
      }
    } catch (error) {
      toast.error("Failed to fetch user data");
      navigate("/listuser");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Check username availability
  const checkUsernameAvailability = useCallback(async (username) => {
    if (!username || username === originalUsername) {
      setUsernameAvailable(true);
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
      setUsernameAvailable(false);
    } finally {
      setIsCheckingUsername(false);
    }
  }, [originalUsername]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkUsernameAvailability(formData.username);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, checkUsernameAvailability]);

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

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errorMsg = "";
    if (!value.trim()) {
      const fieldName = name === "firstName" ? "First name" :
          name === "lastName" ? "Last name" :
              name.charAt(0).toUpperCase() + name.slice(1);
      errorMsg = `${fieldName} is required`;
    } else if (name === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
      errorMsg = "Enter a valid email address";
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

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

    if (!isValid || !usernameAvailable) {
      toast.error("Please fix form errors");
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        ...(formData.username !== originalUsername && { username: formData.username })
      };

      await axios.put(
          `https://usermanagementbackend-v9en.onrender.com/users/${id}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem("authToken")}`
            }
          }
      );

      toast.success("User updated successfully");
      navigate("/listuser");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update user");
    }
  };

  const isFormValid = Object.keys(errors).every(key => !errors[key]) &&
      formData.username &&
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      usernameAvailable;

  if (isLoading) {
    return (
        <div className="edit-user-loading">
          <div className="spinner"></div>
          <span>Loading user data...</span>
        </div>
    );
  }

  return (
      <div className="edit-user-container">
        <div className="edit-user-card">
          <div className="edit-user-header">
            <h2>
              <FiUser className="header-icon" />
              Edit User
            </h2>
            <p className="subtitle">Update user information</p>
          </div>

          <form onSubmit={handleSubmit} className="edit-user-form">
            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-container">
                <input
                    id="username"
                    type="text"
                    name="username"
                    className={`form-input ${
                        touched.username && errors.username ? 'input-error' :
                            touched.username && formData.username ? 'input-valid' : ''
                    }`}
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter username"
                    required
                />
                {formData.username && formData.username !== originalUsername && (
                    <span className="availability-icon">
                  {isCheckingUsername ? (
                      <FiLoader className="spinner-icon" />
                  ) : usernameAvailable ? (
                      <FiCheck className="success-icon" />
                  ) : (
                      <FiX className="error-icon" />
                  )}
                </span>
                )}
              </div>
              {touched.username && errors.username && (
                  <span className="error-message">{errors.username}</span>
              )}
              {formData.username && formData.username !== originalUsername && !isCheckingUsername && (
                  <span className={`availability-message ${
                      usernameAvailable ? 'success' : 'error'
                  }`}>
                {usernameAvailable ? "Username available" : "Username already exists"}
              </span>
              )}
            </div>

            {/* First Name Field */}
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  className={`form-input ${
                      touched.firstName && errors.firstName ? 'input-error' :
                          touched.firstName && formData.firstName ? 'input-valid' : ''
                  }`}
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter first name"
                  required
              />
              {touched.firstName && errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
              )}
            </div>

            {/* Last Name Field */}
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  className={`form-input ${
                      touched.lastName && errors.lastName ? 'input-error' :
                          touched.lastName && formData.lastName ? 'input-valid' : ''
                  }`}
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter last name"
                  required
              />
              {touched.lastName && errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-container">

                <input
                    id="email"
                    type="email"
                    name="email"
                    className={`form-input ${
                        touched.email && errors.email ? 'input-error' :
                            touched.email && formData.email ? 'input-valid' : ''
                    }`}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter email address"
                    required
                />
              </div>
              {touched.email && errors.email && (
                  <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-actions">
              <button
                  type="submit"
                  className="submit-btn"
                  disabled={!isFormValid || isCheckingUsername}
              >
                <FiSave className="btn-icon" />
                Update User
              </button>
              <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate("/listuser")}
              >
                <FiX className="btn-icon" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default EditUser;
