import React, { useState, useEffect, useRef } from 'react';
import Notification from '../Shared/Notification';
import './Camps.css';
import AdminMap from '../Shared/AdminMap';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';

const Camps = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [mapCenter, setMapCenter] = useState({ lat: -3.745, lng: -38.523 });
  const [zoomLevel, setZoomLevel] = useState(5);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    capacity: '',
  });
  const [zones, setZones] = useState([]);
  const [zoneName, setZoneName] = useState('');
  const [safetyLevel, setSafetyLevel] = useState('Safe');
  const [zonePath, setZonePath] = useState([]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [polygon, setPolygon] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [activeTab, setActiveTab] = useState('camps');
  const [addCampOnClick, setAddCampOnClick] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [zoneDetails, setZoneDetails] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [isCampModalOpen, setIsCampModalOpen] = useState(false);
  const [campDetails, setCampDetails] = useState(null);
  const [isAddCampModalOpen, setIsAddCampModalOpen] = useState(false);
  const mapRef = useRef();

  useEffect(() => {
    const campsCollection = collection(db, 'camps');
    const unsubscribeCamps = onSnapshot(campsCollection, (snapshot) => {
      const campData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCamps(campData);
      setLoading(false);
    });

    const zonesCollection = collection(db, 'zones');
    const unsubscribeZones = onSnapshot(zonesCollection, (snapshot) => {
      const zoneData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setZones(zoneData);
    });

    return () => {
      unsubscribeCamps();
      unsubscribeZones();
    };
  }, []);

  useEffect(() => {
    if (selectedZone) {
      setZoneName(selectedZone.name);
      setSafetyLevel(selectedZone.safetyLevel);
      setZonePath(selectedZone.path);
    } else {
      setZoneName('');
      setSafetyLevel('Safe');
      setZonePath([]);
    }
  }, [selectedZone]);

  useEffect(() => {
    if (selectedCamp) {
      setFormData({
        name: selectedCamp.name,
        latitude: selectedCamp.latitude,
        longitude: selectedCamp.longitude,
        capacity: selectedCamp.capacity,
      });
    }
  }, [selectedCamp]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddCamp = async () => {
    if (
      !formData.name ||
      !formData.latitude ||
      !formData.longitude ||
      !formData.capacity
    ) {
      alert('Please fill in all fields');
      return;
    }

    const newCamp = {
      name: formData.name,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      capacity: parseInt(formData.capacity),
      createdAt: new Date(),
    };

    const campsCollection = collection(db, 'camps');
    await addDoc(campsCollection, newCamp);
    setMapCenter({ lat: newCamp.latitude, lng: newCamp.longitude });
    setZoomLevel(15);
    setFormData({ name: '', latitude: '', longitude: '', capacity: '' });
    setNotification({ message: 'Camp added successfully!', type: 'success' });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleUpdateCamp = async () => {
    if (!selectedCamp) return;

    const campDoc = doc(db, 'camps', selectedCamp.id);
    const updatedData = {
      name: formData.name,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      capacity: parseInt(formData.capacity),
    };

    await updateDoc(campDoc, updatedData);
    setSelectedCamp(null);
    setFormData({ name: '', latitude: '', longitude: '', capacity: '' });
    setNotification({
      message: 'Camp updated successfully!',
      type: 'success',
    });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleDeleteCamp = async (campToDelete) => {
    if (!campToDelete) return;
    const campDoc = doc(db, 'camps', campToDelete.id);
    await deleteDoc(campDoc);
    if (selectedCamp && selectedCamp.id === campToDelete.id) {
      setSelectedCamp(null);
    }
    setCamps(prevCamps => prevCamps.filter(camp => camp.id !== campToDelete.id));
    setNotification({
      message: 'Camp deleted successfully!',
      type: 'success',
    });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleSelectCamp = (camp) => {
    setSelectedCamp(camp);
    setActiveTab('camps');
  };

  const handlePolygonComplete = (polygon) => {
    const path = polygon.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
    setZonePath(path);
    setPolygon(polygon);
    setDrawingMode(false);
  };

  const handleUndo = () => {
    if (polygon) {
      const path = polygon.getPath();
      if (path.getLength() > 0) {
        path.pop();
      }
    }
  };

  const handleCreateZone = async () => {
    if (!zoneName || zonePath.length === 0) {
      alert('Please enter a zone name and draw a zone on the map.');
      return;
    }

    const newZone = {
      name: zoneName,
      safetyLevel,
      path: zonePath,
      createdAt: new Date(),
    };

    const zonesCollection = collection(db, 'zones');
    const docRef = await addDoc(zonesCollection, newZone);
    setZones([...zones, { id: docRef.id, ...newZone }]);
    setZoneName('');
    setSafetyLevel('Safe');
    setZonePath([]);
    setPolygon(null);
    setSelectedZone(null);
    if (mapRef.current) {
      mapRef.current.resetDrawingMode();
    }
    setDrawingMode(false);
  };

  const handleDeleteZone = async (zoneToDelete) => {
    if (!zoneToDelete) return;
    const zoneDoc = doc(db, 'zones', zoneToDelete.id);
    await deleteDoc(zoneDoc);
    if (selectedZone && selectedZone.id === zoneToDelete.id) {
      setSelectedZone(null);
    }
    setZones(prevZones => prevZones.filter(zone => zone.id !== zoneToDelete.id));
    if (mapRef.current) {
      mapRef.current.clearAllPolygons();
    }
  };

  const handleClearHistory = async (collectionName) => {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    const deletePromises = [];
    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    await Promise.all(deletePromises);

    if (collectionName === 'camps') {
      setCamps([]);
    } else if (collectionName === 'zones') {
      setZones([]);
      if (mapRef.current) {
        mapRef.current.clearAllPolygons();
      }
    }
  };

  return (
    <div className="camps-wrapper">
      <Notification
        message={notification.message}
        type={notification.type}
      />
      <div className="map-container">
        {!loading && (
          <AdminMap
            ref={mapRef}
            apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            camps={camps}
            onSelectCamp={handleSelectCamp}
            center={mapCenter}
            zoom={zoomLevel}
            onDragEnd={(newCenter) => setMapCenter(newCenter)}
            onZoomChanged={(newZoom) => setZoomLevel(newZoom)}
            onPolygonComplete={handlePolygonComplete}
            drawingMode={drawingMode}
            addCampOnClick={addCampOnClick}
            onMapClick={(e) => {
              if (addCampOnClick) {
                setFormData({
                  ...formData,
                  latitude: e.latLng.lat(),
                  longitude: e.latLng.lng(),
                });
                setIsAddCampModalOpen(true);
              }
            }}
            zones={zones}
            onSelectZone={(zone) => {
              setSelectedZone(zone);
              setSafetyLevel(zone.safetyLevel);
              setActiveTab('zones');
            }}
            safetyLevel={safetyLevel}
          />
        )}
      </div>
      <div className="camps-sidebar">
        <div className="operations-tabs">
          <button
            className={`tab-btn ${activeTab === 'camps' ? 'active' : ''}`}
            onClick={() => setActiveTab('camps')}
          >
            Camps
          </button>
          <button
            className={`tab-btn ${activeTab === 'zones' ? 'active' : ''}`}
            onClick={() => setActiveTab('zones')}
          >
            Zones
          </button>
        </div>
        {activeTab === 'camps' && (
          <div className="feature-section">
            <h2>Camp Operations</h2>
            <div className="form-group">
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Camp Name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                name="latitude"
                className="form-control"
                placeholder="Latitude"
                value={formData.latitude}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="longitude"
                className="form-control"
                placeholder="Longitude"
                value={formData.longitude}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                name="capacity"
                className="form-control"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={handleInputChange}
              />
            </div>
            <div className="btn-group">
              <button
                className={`btn ${addCampOnClick ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => {
                  setAddCampOnClick(!addCampOnClick);
                  if (addCampOnClick) {
                    setFormData({ ...formData, latitude: '', longitude: '' });
                  }
                }}
              >
                {addCampOnClick ? 'Cancel' : 'Add Camp on Click'}
              </button>
              <button className="btn btn-primary" onClick={handleAddCamp} disabled={addCampOnClick}>
                Add Camp
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleUpdateCamp}
                disabled={!selectedCamp}
              >
                Update Camp
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteCamp(selectedCamp)}
                disabled={!selectedCamp}
              >
                Delete Camp
              </button>
            </div>
          </div>
        )}
        {activeTab === 'zones' && (
          <div className="feature-section">
            <h2>Zone Operations</h2>
            <div className="form-group">
              <label className="form-label">Zone Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Downtown Safe Zone"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Safety Level</label>
              <select
                className="form-control"
                value={safetyLevel}
                onChange={(e) => setSafetyLevel(e.target.value)}
              >
                <option>Safe</option>
                <option>Caution</option>
                <option>Danger</option>
              </select>
            </div>
            <div className="btn-group">
              <button
                className="btn btn-secondary"
                onClick={() => setDrawingMode(!drawingMode)}
                disabled={!zoneName}
              >
                {drawingMode ? 'Cancel Drawing' : 'Draw Zone'}
              </button>
              <button className="btn btn-secondary" onClick={handleUndo} disabled={!polygon}>
                Undo
              </button>
              <button className="btn btn-primary" onClick={handleCreateZone} disabled={!zoneName}>
                Create Zone
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteZone(selectedZone)} disabled={!selectedZone}>
                Delete Zone
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="history-section">
        <div className="history-box">
          <div className="history-header">
            <h2>Camp History</h2>
            <button className="btn-clear-history" onClick={() => handleClearHistory('camps')}>Clear History</button>
          </div>
          <ul className="history-list">
            {camps.map((camp) => (
              <li key={camp.id} className="history-item" onClick={() => handleSelectCamp(camp)}>
                <div className="history-item-content">
                  <h3>{camp.name}</h3>
                  <p>Capacity: {camp.capacity} | Lat: {camp.latitude}, Lng: {camp.longitude}</p>
                </div>
                <div className="history-item-actions">
                  <button className="btn-view-details" onClick={(e) => { e.stopPropagation(); setCampDetails(camp); setIsCampModalOpen(true); }}>View Details</button>
                  <button className="btn-delete-entry" onClick={(e) => { e.stopPropagation(); handleDeleteCamp(camp); }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="history-box">
          <div className="history-header">
            <h2>Zone History</h2>
            <button className="btn-clear-history" onClick={() => handleClearHistory('zones')}>Clear History</button>
          </div>
          <ul className="history-list">
            {zones.map((zone) => (
              <li key={zone.id} className={`history-item ${zone.safetyLevel?.toLowerCase()}`} onClick={() => setSelectedZone(zone)}>
                <div className="history-item-content">
                  <h3>{zone.name}</h3>
                  <p>Safety Level: {zone.safetyLevel}</p>
                </div>
                <div className="history-item-actions">
                  <button className="btn-view-details" onClick={(e) => { e.stopPropagation(); setZoneDetails(zone); setIsZoneModalOpen(true); }}>View Details</button>
                  <button className="btn-delete-entry" onClick={(e) => { e.stopPropagation(); handleDeleteZone(zone); }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {isZoneModalOpen && zoneDetails && (
        <div className="modal-overlay" onClick={() => setIsZoneModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Zone Details</h2>
            <p><strong>Name:</strong> {zoneDetails.name}</p>
            <p><strong>Safety Level:</strong> {zoneDetails.safetyLevel}</p>
            <p><strong>Time of Creation:</strong> {zoneDetails.createdAt ? zoneDetails.createdAt.toDate().toLocaleString() : 'Not available'}</p>
            <p><strong>Coordinates:</strong></p>
            <ul>
              {zoneDetails.path.map((coord, index) => (
                <li key={index}>Lat: {coord.lat.toFixed(4)}, Lng: {coord.lng.toFixed(4)}</li>
              ))}
            </ul>
            <button className="btn btn-secondary" onClick={() => setIsZoneModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
      {isCampModalOpen && campDetails && (
        <div className="modal-overlay" onClick={() => setIsCampModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Camp Details</h2>
            <p><strong>Name:</strong> {campDetails.name}</p>
            <p><strong>Capacity:</strong> {campDetails.capacity}</p>
            <p><strong>Time of Creation:</strong> {campDetails.createdAt ? campDetails.createdAt.toDate().toLocaleString() : 'Not available'}</p>
            <p><strong>Coordinates:</strong></p>
            <p>Lat: {campDetails.latitude.toFixed(4)}, Lng: {campDetails.longitude.toFixed(4)}</p>
            <button className="btn btn-secondary" onClick={() => setIsCampModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
      {isAddCampModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCampModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Camp</h2>
            <div className="form-group">
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Camp Name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                name="capacity"
                className="form-control"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={handleInputChange}
              />
            </div>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={() => {
                handleAddCamp();
                setIsAddCampModalOpen(false);
              }}>
                Save Camp
              </button>
              <button className="btn btn-secondary" onClick={() => setIsAddCampModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Camps;