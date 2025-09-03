import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

const UserSignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState(null);
  const [passwordShown, setPasswordShown] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        role: 'user',
      });
      navigate('/user/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSignUp}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="social-login">
        <p>Register with:</p>
        <div className="social-buttons">
          <button className="social-btn"><i className="fab fa-google"></i> Google</button>
        </div>
      </div>
      <p className="divider">Or</p>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">First Name</label>
          <div className="input-wrapper">
            <i className="fas fa-user input-icon"></i>
            <input
              type="text"
              className="form-control"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <div className="input-wrapper">
            <i className="fas fa-user input-icon"></i>
            <input
              type="text"
              className="form-control"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
      </div>
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
            type={passwordShown ? 'text' : 'password'}
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <i
            className={`fas ${passwordShown ? "fa-eye" : "fa-eye-slash"} input-icon password-icon`}
            onClick={togglePasswordVisibility}
          ></i>
        </div>
        <p className="form-text">Minimum length is 8 characters.</p>
      </div>
      <button type="submit" className="btn btn-primary">Sign Up</button>
      <p className="login-link">
        By creating an account, you agree to the <Link to="/terms">Terms of Service</Link>. We'll occasionally send you account-related emails.
      </p>
    </form>
  );
};

export default UserSignUpForm;
      <p className="login-link">
        Already have an account? <Link to="/">Login</Link>
      </p>