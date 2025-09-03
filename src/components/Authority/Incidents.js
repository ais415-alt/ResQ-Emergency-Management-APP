import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, onValue, update } from 'firebase/database';
import '../Shared/Dashboard.css';

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const incidentsRef = ref(database, 'incidents');
    onValue(incidentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const incidentsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).reverse();
        setIncidents(incidentsList);
      }
    });
  }, []);

  const handleStatusChange = (id, status) => {
    const incidentRef = ref(database, `incidents/${id}`);
    update(incidentRef, { status });
  };

  return (
    <div>
      <h1>Incidents</h1>
      <div className="feature-section">
        <h2>User Reports</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Type</th>
              <th>Location</th>
              <th>Description</th>
              <th>Reported At</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map(incident => (
              <tr key={incident.id}>
                <td>{incident.ticketId}</td>
                <td>{incident.type}</td>
                <td>{incident.location}</td>
                <td>{incident.description}</td>
                <td>{new Date(incident.timestamp).toLocaleString()}</td>
                <td>
                  <span className={`badge ${incident.status.toLowerCase().replace(' ', '-')}`}>{incident.status}</span>
                </td>
                <td>
                  <select
                    className="form-control"
                    value={incident.status}
                    onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Incidents;