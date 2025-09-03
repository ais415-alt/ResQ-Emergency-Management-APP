import React from 'react';
import { Link } from 'react-router-dom';

const SignUp = () => {
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-brand">
          <i className="fas fa-shield-halved"></i>
          <span>ResQ</span>
        </div>
        <p>Choose your account type to get started.</p>
        <div className="auth-options">
          <Link to="/signup/user" className="btn btn-primary">Sign Up as a User</Link>
          <Link to="/signup/authority" className="btn btn-secondary">Sign Up as an Authority</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;