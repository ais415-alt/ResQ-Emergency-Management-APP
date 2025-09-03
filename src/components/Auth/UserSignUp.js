import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthoritySignUpForm from './AuthoritySignUpForm'; // Assuming you create this
import UserSignUpForm from './UserSignUpForm'; // Assuming you create this

const UserSignUp = () => {
  const [activeTab, setActiveTab] = useState('user');

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="signup-tabs">
          <button
            className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            Sign Up as User
          </button>
          <button
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Sign Up as Admin
          </button>
        </div>

        {activeTab === 'user' ? <UserSignUpForm /> : <AuthoritySignUpForm />}

        <p className="login-link">
          Already have an account? <Link to="/login/user">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default UserSignUp;