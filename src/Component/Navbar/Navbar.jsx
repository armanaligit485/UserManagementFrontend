import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FiUser, FiUsers, FiLogOut } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css'; // For custom styles

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('base64Credentials');
    navigate('/login');
  };

  return (
      <>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
          <div className="container-fluid">
            {/* Left-aligned brand */}
            <Link className="navbar-brand" to="/">
              User Management
            </Link>

            {/* Mobile toggle button */}
            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarContent"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Right-aligned navigation */}
            <div className="collapse navbar-collapse" id="navbarContent">
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link to="/" className="nav-link d-flex align-items-center">
                    <FiUser className="me-2" />
                    <span>Add User</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/listuser" className="nav-link d-flex align-items-center">
                    <FiUsers className="me-2" />
                    <span>List Users</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                      onClick={handleLogout}
                      className="btn btn-outline-light ms-lg-3 d-flex align-items-center"
                  >
                    <FiLogOut className="me-2" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="container mt-4">
          <Outlet />
        </div>
      </>
  );
};

export default Navbar;