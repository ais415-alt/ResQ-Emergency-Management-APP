import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../Shared/Dashboard.css';
import './UserProfile.css';

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    dob: '',
    gender: '',
    contactNumber: '',
    familySize: {
      adults: '',
      children: '',
    },
    address: '',
    nationalId: '',
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    emergencyContact: {
      name: '',
      number: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(prevProfile => ({ ...prevProfile, ...docSnap.data() }));
        }
        setLoading(false);
      };
      fetchProfile();
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };


  const handleFamilyChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      familySize: { ...profile.familySize, [name]: value },
    });
  };

  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      emergencyContact: { ...profile.emergencyContact, [name]: value },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), profile, { merge: true });
        setSuccess('Profile updated successfully!');
        window.scrollTo(0, 0);
      } catch (err) {
        setError('Failed to update profile. Please try again.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2><i className="fas fa-shield-alt"></i> ResQ</h2>
        </div>
        <ul className="sidebar-nav">
          <li><Link to="/user/dashboard"><i className="fas fa-tachometer-alt"></i> Dashboard</Link></li>
          <li><Link to="/user/map"><i className="fas fa-map-marked-alt"></i> Rescue Camps</Link></li>
          <li className="active"><Link to="/user/profile"><i className="fas fa-user"></i> Profile</Link></li>
          <li><Link to="/user/incidents"><i className="fas fa-exclamation-triangle"></i> Report Incident</Link></li>
          <li><Link to="/user/chatbot"><i className="fas fa-robot"></i> Help</Link></li>
        </ul>
      </aside>
      <div className="main-content">
        <div className="profile-container">
          <div className="profile-header">
            <h1>User Profile</h1>
          </div>
          <form onSubmit={handleSubmit} className="profile-form">
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <h2>Personal Information</h2>
            <div className="form-section">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" value={profile.fullName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="dob" value={profile.dob} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={profile.gender} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <div className="input-with-prefix">
                  <span>+91</span>
                  <input type="tel" name="contactNumber" value={profile.contactNumber} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Family Size (Adults)</label>
                <input type="number" name="adults" value={profile.familySize.adults} onChange={handleFamilyChange} />
              </div>
              <div className="form-group">
                <label>Family Size (Children)</label>
                <input type="number" name="children" value={profile.familySize.children} onChange={handleFamilyChange} />
              </div>
              <div className="form-group">
                <label>Address / Current Camp or Zone</label>
                <input type="text" name="address" value={profile.address} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>National ID Card Number</label>
                <input type="text" name="nationalId" value={profile.nationalId} onChange={handleChange} />
              </div>
            </div>

            <h2>Medical Information</h2>
            <div className="form-section">
              <div className="form-group">
                <label>Blood Type</label>
                <select name="bloodType" value={profile.bloodType} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="form-group">
                <label>Known Allergies</label>
                <textarea name="allergies" value={profile.allergies} onChange={handleChange} placeholder="None"></textarea>
              </div>
              <div className="form-group">
                <label>Chronic Conditions</label>
                <textarea name="chronicConditions" value={profile.chronicConditions} onChange={handleChange} placeholder="None"></textarea>
              </div>
              <div className="form-group">
                <label>Current Medications</label>
                <textarea name="currentMedications" value={profile.currentMedications} onChange={handleChange} placeholder="None"></textarea>
              </div>
            </div>

            <h2>Emergency Contact</h2>
            <div className="form-section">
              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input type="text" name="name" value={profile.emergencyContact.name} onChange={handleEmergencyContactChange} />
              </div>
              <div className="form-group">
                <label>Emergency Contact Number</label>
                <div className="input-with-prefix">
                  <span>+91</span>
                  <input type="tel" name="number" value={profile.emergencyContact.number} onChange={handleEmergencyContactChange} />
                </div>
              </div>
            </div>

            <button type="submit" className="submit-btn">Update Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;