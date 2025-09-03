import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer, Marker, Polygon } from '@react-google-maps/api';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import './RescueCampMap.css';

const libraries = ['places'];

const RescueCampMap = () => {
  const [rescueCamps, setRescueCamps] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [nearestCamp, setNearestCamp] = useState(null);
  const [directions, setDirections] = useState(null);
  const [showDirections, setShowDirections] = useState(true);
  const [zones, setZones] = useState([]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }

    const campsCollection = collection(db, 'camps');
    const campsUnsubscribe = onSnapshot(campsCollection, (snapshot) => {
      if (!snapshot.empty) {
        const campData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRescueCamps(campData);
      }
    });

    const zonesCollection = collection(db, 'zones');
    const zonesUnsubscribe = onSnapshot(zonesCollection, (snapshot) => {
      if (!snapshot.empty) {
        const zoneData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            path: data.path,
            color: data.color,
          };
        });
        setZones(zoneData);
      }
    });

    return () => {
      campsUnsubscribe();
      zonesUnsubscribe();
    };
  }, []);

  useEffect(() => {
    if (userLocation && rescueCamps.length > 0) {
      let closestCamp = null;
      let minDistance = Infinity;

      rescueCamps.forEach(camp => {
        const distance = Math.sqrt(
          Math.pow(camp.latitude - userLocation.lat, 2) +
          Math.pow(camp.longitude - userLocation.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestCamp = { lat: camp.latitude, lng: camp.longitude };
        }
      });
      setNearestCamp(closestCamp);
    }
  }, [userLocation, rescueCamps]);

  const center = useMemo(() => userLocation || { lat: 20.5937, lng: 78.9629 }, [userLocation]);
  const options = {
    zoomControl: true,
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <Link to="/user/dashboard" className="back-to-dashboard-button">
        <i className="fas fa-arrow-left"></i> Back to Dashboard
      </Link>
      <div className="rescue-camp-layout">
        <div className="map-panel">
          <GoogleMap
            mapContainerStyle={{ height: '100%', width: '100%' }}
            center={center}
            zoom={userLocation ? 12 : 5}
            options={options}
          >
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }}
              />
            )}
            {showDirections && userLocation && nearestCamp && (
              <DirectionsService
                options={{
                  destination: nearestCamp,
                  origin: userLocation,
                  travelMode: 'DRIVING'
                }}
                callback={(response) => {
                  if (response !== null) {
                    setDirections(response);
                  }
                }}
              />
            )}
            {showDirections && directions && (
              <DirectionsRenderer
                options={{
                  directions: directions,
                  suppressMarkers: true
                }}
              />
            )}
            {rescueCamps.map(camp => (
              <Marker
                key={camp.id}
                position={{ lat: camp.latitude, lng: camp.longitude }}
                title={camp.name}
              />
            ))}
            {zones.map(zone => (
              <Polygon
                key={zone.id}
                paths={zone.path}
                options={{
                  fillColor: zone.color,
                  fillOpacity: 0.4,
                  strokeColor: zone.color,
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                }}
              />
            ))}
          </GoogleMap>
        </div>
        <div className="info-panel">
          <button onClick={() => setShowDirections(!showDirections)} className="nav-button">
            {showDirections ? 'Hide Navigation' : 'Show Navigation'}
          </button>
          <h2>Rescue Camps</h2>
          <div className="camp-list">
            {rescueCamps.length > 0 ? (
              rescueCamps.map(camp => (
                <div key={camp.id} className="camp-details-container">
                  <h3>{camp.name}</h3>
                  <div className="detail-item">
                    <span className="detail-label">Contact:</span>
                    <span className="detail-value">{camp.contact}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Capacity:</span>
                    <span className="detail-value">{camp.capacity}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Food Supply:</span>
                    <span className="detail-value">{camp.foodSupply}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Water Supply:</span>
                    <span className="detail-value">{camp.waterSupply}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Medical Supply:</span>
                    <span className="detail-value">{camp.medicalSupply}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No camps available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescueCampMap;