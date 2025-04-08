import React from "react";

import { useNavigate } from "react-router-dom";
const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-dark text-white">
        <h1 className="display-1 fw-bold text-danger">404</h1>
        <p className="fs-4">Oops! The page you’re looking for doesn’t exist.</p>
        <button className="btn btn-danger btn-lg" onClick={() => navigate("/")}>
          Go Back Home
        </button>
      </div>
    </>
  );
};

export default PageNotFound;
