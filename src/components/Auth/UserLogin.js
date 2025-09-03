import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        if (role === 'admin') {
          navigate('/authority/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="social-login">
          <p>Login with:</p>
          <div className="social-buttons">
            <button className="social-btn"><i className="fab fa-google"></i> Google</button>
          </div>
        </div>
        <p className="divider">Or</p>
        <form className="signup-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <i className="fas fa-envelope input-icon"></i>
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <i className="fas fa-lock input-icon"></i>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i className="fas fa-eye-slash input-icon password-icon"></i>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <p className="login-link">
          Don't have an account? <Link to="/signup/user">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default UserLogin;