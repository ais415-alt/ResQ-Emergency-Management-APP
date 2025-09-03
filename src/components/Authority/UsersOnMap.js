import React, { useEffect, useState } from 'react';
import { db as firestore } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import LiveUsersMap from './LiveUsersMap';
import './Users.css';
import '../Shared/Dashboard.css';
import AdminLayout from '../Shared/AdminLayout';

const UsersOnMap = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zones, setZones] = useState([]);
  const [camps, setCamps] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedCamp, setSelectedCamp] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
        setFilteredUsers(usersList);

        const zonesCollection = collection(firestore, 'zones');
        const zonesSnapshot = await getDocs(zonesCollection);
        const zonesList = zonesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setZones(zonesList);

        const campsCollection = collection(firestore, 'camps');
        const campsSnapshot = await getDocs(campsCollection);
        const campsList = campsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCamps(campsList);

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = users;

    if (selectedZone) {
      // This is a placeholder for zone filtering logic.
      // You'll need to implement how to determine if a user is in a zone.
    }

    if (selectedCamp) {
      // This is a placeholder for camp filtering logic.
      // You'll need to implement how to determine if a user is in a camp.
    }

    if (searchTerm) {
      result = result.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phone && user.phone.includes(searchTerm))
      );
    }

    setFilteredUsers(result);
  }, [selectedZone, selectedCamp, searchTerm, users]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="main-content">
        <h1>Users on Map</h1>
        <div className="users-on-map-wrapper">
          <div className="map-container">
            <LiveUsersMap users={filteredUsers} />
          </div>
          <div className="users-on-map-sidebar">
            <div className="feature-section">
              <h2>User Search</h2>
              <input
                type="text"
                placeholder="Search by name, email, or phone"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-control"
              />
              <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)} className="form-control">
                <option value="">Filter by Zone</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
              <select value={selectedCamp} onChange={e => setSelectedCamp(e.target.value)} className="form-control">
                <option value="">Filter by Camp</option>
                {camps.map(camp => (
                  <option key={camp.id} value={camp.id}>{camp.name}</option>
                ))}
              </select>
            </div>
            <div className="feature-section">
              <h2>Location History (User-specific)</h2>
              <p>A feature to view the location history of a specific user will be available here.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UsersOnMap;