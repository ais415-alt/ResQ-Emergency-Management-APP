import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1rem',
  overflow: 'hidden'
};

const center = {
  lat: 20.5937,
  lng: 78.9629
};

const LiveUsersMap = ({ users }) => {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
      >
        {users.map(user => (
          user.location && (
            <Marker
              key={user.id}
              position={{ lat: user.location.latitude, lng: user.location.longitude }}
              title={user.name}
            />
          )
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default LiveUsersMap;