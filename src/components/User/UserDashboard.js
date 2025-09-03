import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../Shared/Alert';
import '../Shared/Dashboard.css';
import UserMap from './UserMap';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { database } from '../../firebase';
import { ref, onValue } from "firebase/database";
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import VCard from 'vcard-creator';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [rescueCamps, setRescueCamps] = useState([]);
  const [zones, setZones] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      };
      fetchUserData();
    }

    const alertsRef = ref(database, 'alerts');
    onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const alertsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setAlerts(alertsList);
      }
    });

    const campsCollection = collection(db, 'camps');
    const campsUnsubscribe = onSnapshot(campsCollection, (snapshot) => {
      if (snapshot.empty) {
        setRescueCamps([]);
      } else {
        const campData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRescueCamps(campData);
      }
    });

    const zonesCollection = collection(db, 'zones');
    const zonesUnsubscribe = onSnapshot(zonesCollection, (snapshot) => {
      if (snapshot.empty) {
        setZones([]);
      } else {
        const zoneData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setZones(zoneData);
      }
    });

    return () => {
      campsUnsubscribe();
      zonesUnsubscribe();
    };
  }, []);

  return (
    <div className="dashboard-wrapper">
      <Alert />
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2><i className="fas fa-shield-alt"></i> ResQ</h2>
        </div>
        <ul className="sidebar-nav">
          <li className="active"><Link to="/user/dashboard"><i className="fas fa-tachometer-alt"></i> Dashboard</Link></li>
          <li><Link to="/user/map"><i className="fas fa-map-marked-alt"></i> Rescue Camps</Link></li>
          <li><Link to="/user/profile"><i className="fas fa-user"></i> Profile</Link></li>
          <li><Link to="/user/incidents"><i className="fas fa-exclamation-triangle"></i> Report Incident</Link></li>
          <li><Link to="/user/chatbot"><i className="fas fa-robot"></i> Help</Link></li>
        </ul>
      </aside>
      <div className="main-content">
        <header className="top-nav">
          <div>
            <i className="fas fa-user"></i> User Dashboard
          </div>
          <div>
            <i className="fas fa-bell"></i>
            <span className="emergency-status">SAFE</span>
          </div>
        </header>
        <section className="dashboard-content">
          <h1>Dashboard</h1>
          <div className="user-dashboard-layout">
            <div className="main-panel">
              <div className="card">
                <h3><i className="fas fa-map-marked-alt"></i> Nearest Rescue Camp</h3>
                <UserMap rescueCamps={rescueCamps} zones={zones} className="UserMap" />
              </div>
            </div>
            <div className="sidebar-panel">
              <div className="card">
                <h3><i className="fas fa-exclamation-triangle"></i> Emergency Alerts</h3>
                {alerts.length > 0 ? (
                  <div className="alert-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {alerts.map(alert => (
                      <div key={alert.id} className="alert-item">
                        <h3>{alert.title}</h3>
                        <p>{alert.message}</p>
                        <div className="alert-meta">
                          <span>{alert.location}</span>
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          <span className={`badge ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No active alerts.</p>
                )}
              </div>
              <div className="card">
                <h3><i className="fas fa-qrcode"></i> Your QR Code</h3>
                {userData ? (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <QRCodeSVG
                      value={(() => {
                        const vCard = new VCard();
                        vCard
                          .addName(userData.fullName)
                          .addPhoneNumber(userData.contactNumber)
                          .addNote(
                            `Blood Type: ${userData.bloodType}\n` +
                            `Allergies: ${userData.allergies}\n` +
                            `Chronic Conditions: ${userData.chronicConditions}\n` +
                            `Emergency Contact: ${userData.emergencyContact.name} (${userData.emergencyContact.number})`
                          );
                        return vCard.toString();
                      })()}
                      size={128}
                    />
                  </div>
                ) : (
                  <p>User data not available.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserDashboard;