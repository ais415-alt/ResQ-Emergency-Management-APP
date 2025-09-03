import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Shared/Dashboard.css';
import { database, storage } from '../../firebase';
import { ref as dbRef, onValue, query, orderByChild, equalTo, push } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import Notification from '../Shared/Notification';
import { useAuth } from '../../context/AuthContext';
import IncidentDetailsModal from './IncidentDetailsModal';

const ReportIncident = () => {
  const { currentUser, loading } = useAuth();
  const [incidentType, setIncidentType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [notification, setNotification] = useState(null);
  const [incidentHistory, setIncidentHistory] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const incidentsRef = dbRef(database, 'incidents');
      const userIncidentsQuery = query(
        incidentsRef,
        orderByChild('userId'),
        equalTo(currentUser.uid)
      );
      onValue(userIncidentsQuery, (snapshot) => {
        console.log("Snapshot from Firebase:", snapshot.val());
        const data = snapshot.val();
        if (data) {
          const history = Object.keys(data)
            .map((key) => ({
              id: key,
              ...data[key],
            }))
            .reverse();
          setIncidentHistory(history);
        } else {
          setIncidentHistory([]);
        }
      });
    }
  }, [currentUser]);

  const generateTicketId = () => {
    return `INC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setNotification('You must be logged in to report an incident.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const newTicketId = generateTicketId();
    if (file) {
      const fileRef = storageRef(storage, `incidents/${file.name}`);
      uploadBytes(fileRef, file).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          saveIncident(newTicketId, url);
        });
      });
    } else {
      saveIncident(newTicketId, null);
    }
  };

  const saveIncident = (newTicketId, fileUrl) => {
    const incidentsRef = dbRef(database, 'incidents');
    push(incidentsRef, {
      type: incidentType,
      location,
      description,
      timestamp: new Date().toISOString(),
      status: 'New',
      userId: currentUser.uid,
      ticketId: newTicketId,
      fileUrl: fileUrl,
    }).then(() => {
      setIncidentType('');
      setLocation('');
      setDescription('');
      setFile(null);
      setNotification(`Incident reported successfully! Your Ticket ID is ${newTicketId}`);
      setTimeout(() => setNotification(null), 5000);
    });
  };

  return (
    <div className="dashboard-wrapper">
      <Notification message={notification} />
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2><i className="fas fa-shield-alt"></i> ResQ</h2>
        </div>
        <ul className="sidebar-nav">
          <li><Link to="/user/dashboard"><i className="fas fa-tachometer-alt"></i> Dashboard</Link></li>
          <li><Link to="/user/map"><i className="fas fa-map-marked-alt"></i> Rescue Camps</Link></li>
          <li><Link to="/user/profile"><i className="fas fa-user"></i> Profile</Link></li>
          <li className="active"><Link to="/user/incidents"><i className="fas fa-exclamation-triangle"></i> Report Incident</Link></li>
          <li><Link to="/user/helpline"><i className="fas fa-phone-alt"></i> Helpline</Link></li>
        </ul>
      </aside>
      <div className="main-content">
        <div className="feature-section">
          <h2>Incident Details</h2>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={loading || !currentUser}>
              <div className="form-group">
                <label className="form-label">Incident Type</label>
                <select
                className="form-control"
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
              >
                <option value="">Select a type...</option>
                <option value="Fire">Fire</option>
                <option value="Flood">Flood</option>
                <option value="Medical">Medical Emergency</option>
                <option value="Power Outage">Power Outage</option>
                <option value="Gas Leak">Gas Leak</option>
                <option value="Road Accident">Road Accident</option>
                <option value="Structural Collapse">Structural Collapse</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Central Park, 123 Main Street"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Provide as much detail as possible about the incident."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Upload Photo/Video (Optional)</label>
              <div className="file-upload-area">
                <p>Click to upload or drag and drop</p>
                <p className="file-types">PNG, JPG, MP4 up to 10MB</p>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || !currentUser}>Submit Report</button>
            </fieldset>
          </form>
          {!currentUser && !loading && <p style={{ color: 'var(--text-red-500)', marginTop: '1rem' }}>Please log in to submit a report.</p>}
        </div>
        <div className="feature-section">
          <h2>History</h2>
          <div className="incident-history-list">
            {loading ? (
              <p>Loading history...</p>
            ) : incidentHistory.length > 0 ? (
              incidentHistory.map((incident) => (
                <div key={incident.id} className="incident-card">
                  <div className="incident-card-header">
                    <h4>{incident.type}</h4>
                    <span className={`badge ${incident.status.toLowerCase()}`}>
                      {incident.status}
                    </span>
                  </div>
                  <div className="incident-card-body">
                    <p><strong>Location:</strong> {incident.location}</p>
                    <p><strong>Ticket ID:</strong> {incident.ticketId}</p>
                    <button className="btn btn-secondary" onClick={() => setSelectedIncident(incident)}>View</button>
                  </div>
                </div>
              ))
            ) : (
              <p>You have not reported any incidents yet.</p>
            )}
          </div>
        </div>
      </div>
      <IncidentDetailsModal incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
    </div>
  );
};

export default ReportIncident;