import React from 'react';
import '../Shared/Dashboard.css';

const IncidentDetailsModal = ({ incident, onClose }) => {
  if (!incident) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Incident Details</h2>
        <p><strong>Ticket ID:</strong> {incident.ticketId}</p>
        <p><strong>Type:</strong> {incident.type}</p>
        <p><strong>Location:</strong> {incident.location}</p>
        <p><strong>Description:</strong> {incident.description}</p>
        {incident.fileUrl && (
          <div className="incident-file">
            {incident.fileUrl.includes('.mp4') ? (
              <video src={incident.fileUrl} controls width="100%" />
            ) : (
              <img src={incident.fileUrl} alt="Incident" width="100%" />
            )}
          </div>
        )}
        <p><strong>Reported At:</strong> {new Date(incident.timestamp).toLocaleString()}</p>
        <p><strong>Status:</strong> <span className={`badge ${incident.status.toLowerCase()}`}>{incident.status}</span></p>
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default IncidentDetailsModal;