import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, push, onValue } from 'firebase/database';
import Notification from '../Shared/Notification';

const Alerts = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('Earthquake');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState('Low');
  const [notification, setNotification] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);

  useEffect(() => {
    const alertsRef = ref(database, 'alerts');
    onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const history = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).reverse();
        setAlertHistory(history);
      }
    });
  }, []);

  const handleSendAlert = (e) => {
    e.preventDefault();
    const alertsRef = ref(database, 'alerts');
    push(alertsRef, {
      title,
      message,
      type,
      location,
      severity,
      timestamp: new Date().toISOString(),
    }).then(() => {
      setTitle('');
      setMessage('');
      setType('Earthquake');
      setLocation('');
      setSeverity('Low');
      setNotification('Alert Sent');
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      });
    };
  
    return (
      <div>
        <Notification message={notification} />
        <h1>Alerts</h1>
      <div className="feature-section">
        <h2>Create New Alert</h2>
        <form onSubmit={handleSendAlert}>
          <div className="form-group">
            <label className="form-label">Alert Title</label>
            <input type="text" className="form-control" placeholder="e.g., Flash Flood Warning" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Alert Message</label>
            <textarea className="form-control" rows="3" placeholder="Provide details about the disaster and necessary safety measures." value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Disaster Type</label>
              <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                <option>Earthquake</option>
                <option>Flood</option>
                <option>Hurricane</option>
                <option>Tornado</option>
                <option>Wildfire</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" className="form-control" placeholder="e.g., Downtown City, State" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Severity</label>
            <select className="form-control" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
          <button type="submit" className="btn btn-danger">Send Alert</button>
        </form>
      </div>
      <div className="feature-section">
        <h2>Alert History</h2>
        <div className="alert-history" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {alertHistory.length > 0 ? (
            alertHistory.map(alert => (
              <div key={alert.id} className="alert-item">
                <h3>{alert.title}</h3>
                <p>{alert.message}</p>
                <div className="alert-meta">
                  <span>{alert.location}</span>
                  <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  <span className={`badge ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                </div>
              </div>
            ))
          ) : (
            <p>No alerts in history.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;