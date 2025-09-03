import React, { useState } from 'react';
import AdminMap from '../Shared/AdminMap';

const UserMap = ({ rescueCamps, zones, className }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  return (
    <div className={className} style={{ width: '100%' }}>
      <AdminMap
        apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        camps={rescueCamps}
        zones={zones}
        center={userLocation || { lat: -3.745, lng: -38.523 }}
        zoom={12}
        onSelectCamp={setSelectedCamp}
        onSelectZone={setSelectedZone}
        onDragEnd={() => {}}
        onZoomChanged={() => {}}
        addCampOnClick={false}
        onMapClick={() => {}}
      />
    </div>
  );
};

export default UserMap;