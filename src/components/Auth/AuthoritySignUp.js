import React from 'react';

const AuthoritySignUp = () => {
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-brand">
          <i className="fas fa-shield-halved"></i>
          <span>Authority Sign Up</span>
        </div>
        <form className="auth-form">
          <input type="text" className="form-control" placeholder="Full Name" />
          <input type="email" className="form-control" placeholder="Email Address" />
          <input type="text" className="form-control" placeholder="Authority ID" />
          <input type="password" className="form-control" placeholder="Password" />
          <input type="password" className="form-control" placeholder="Confirm Password" />
          <button type="submit" className="btn btn-primary">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default AuthoritySignUp;