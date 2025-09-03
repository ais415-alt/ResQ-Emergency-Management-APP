import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { database } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { Link } from 'react-router-dom';
import UserMap from '../User/UserMap';

const Home = () => {
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [rescueCamps, setRescueCamps] = useState([]);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    const alertsRef = ref(database, 'alerts');
    onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const alertsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).reverse();
        setAlerts(alertsList);
      }
    });

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
    <div>
      <h1>Home</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Current Alerts</h2>
          <p>Latest active alerts for immediate review.</p>
          <div className="alert-history" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {alerts.length > 0 ? (
              alerts.map(alert => (
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
              <p>No active alerts.</p>
            )}
          </div>
          <Link to="/authority/alerts" className="btn btn-primary" style={{ marginTop: '1rem' }}>View All Alerts</Link>
        </div>
        <div className="dashboard-card">
          <h2>New Incidents</h2>
          <p>Reports filed by users requiring attention.</p>
          <div className="incident-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {incidents.length > 0 ? (
              incidents.map(incident => (
                <div key={incident.id} className="incident-item alert-item">
                  <h3>{incident.type}</h3>
                  <p>{incident.description}</p>
                  <div className="alert-meta">
                    <span>{incident.location}</span>
                    <span>{new Date(incident.timestamp).toLocaleString()}</span>
                    <span className={`badge ${incident.status.toLowerCase()}`}>{incident.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No new incidents.</p>
            )}
          </div>
          <Link to="/authority/incidents" className="btn btn-primary" style={{ marginTop: '1rem' }}>View All Incidents</Link>
        </div>
        <div className="dashboard-card">
          <h2>Updated Map</h2>
          <p>Interactive map with real-time data.</p>
          {useMemo(() => <UserMap rescueCamps={rescueCamps} zones={zones} />, [rescueCamps, zones])}
        </div>
        <div className="dashboard-card">
          <h2>Disaster Analytics</h2>
          <p>Monitor and analyze disaster-related data.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;