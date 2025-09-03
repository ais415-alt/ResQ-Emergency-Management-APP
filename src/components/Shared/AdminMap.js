import React, { useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DrawingManager, StandaloneSearchBox, Polygon, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

const libraries = ['drawing', 'places'];

const AdminMap = forwardRef(({ apiKey, camps, onSelectCamp, onPolygonComplete, center, zoom, drawingMode, zones, onSelectZone, safetyLevel, onDragEnd, onZoomChanged, addCampOnClick, onMapClick }, ref) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const [searchBox, setSearchBox] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [drawnPolygons, setDrawnPolygons] = useState([]);

  useImperativeHandle(ref, () => ({
    clearAllPolygons() {
      drawnPolygons.forEach(polygon => polygon.setMap(null));
      setDrawnPolygons([]);
    },
    resetDrawingMode() {
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setDrawingMode(null);
      }
      if (mapRef.current) {
        mapRef.current.setOptions({
          draggableCursor: '',
          draggingCursor: ''
        });
        const mapContainer = document.getElementById('google-map-script-container');
        if (mapContainer) {
          mapContainer.firstChild.style.cursor = 'default';
        }
      }
    }
  }));

  const onLoad = React.useCallback(function callback(map) {
    mapRef.current = map;
  }, []);

  React.useEffect(() => {
    if (mapRef.current) {
      if (drawingMode) {
        mapRef.current.setOptions({ draggableCursor: 'crosshair', draggingCursor: 'crosshair' });
      } else {
        mapRef.current.setOptions({ draggableCursor: null, draggingCursor: null });
      }
    }
  }, [drawingMode]);

  const onUnmount = React.useCallback(function callback(map) {
    mapRef.current = null;
  }, []);

  const onSearchBoxLoad = (ref) => {
    setSearchBox(ref);
  };

  const onPlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      const bounds = new window.google.maps.LatLngBounds();
      places.forEach(place => {
        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      mapRef.current.fitBounds(bounds);
      const listener = window.google.maps.event.addListener(mapRef.current, "idle", function() {
        if (mapRef.current.getZoom() > 15) mapRef.current.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerId="google-map-script-container"
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onDragEnd={() => {
        if (mapRef.current) {
          const newCenter = mapRef.current.getCenter().toJSON();
          onDragEnd(newCenter);
        }
      }}
      options={{
        gestureHandling: 'greedy',
        minZoom: 3,
        restriction: {
          latLngBounds: {
            north: 85,
            south: -85,
            west: -180,
            east: 180,
          },
          strictBounds: true,
        },
      }}
      onZoomChanged={() => {
        if (mapRef.current) {
          const newZoom = mapRef.current.getZoom();
          onZoomChanged(newZoom);
        }
      }}
      onClick={onMapClick}
    >
      <StandaloneSearchBox
        onLoad={onSearchBoxLoad}
        onPlacesChanged={onPlacesChanged}
      >
        <input
          type="text"
          placeholder="Search for a location"
          style={{
            boxSizing: `border-box`,
            border: `1px solid transparent`,
            width: `240px`,
            height: `32px`,
            padding: `0 12px`,
            borderRadius: `3px`,
            boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
            fontSize: `14px`,
            outline: `none`,
            textOverflow: `ellipses`,
            position: "absolute",
            left: "50%",
            marginLeft: "-120px"
          }}
        />
      </StandaloneSearchBox>
      <DrawingManager
        onLoad={(manager) => (drawingManagerRef.current = manager)}
        onPolygonComplete={(polygon) => {
          setDrawnPolygons(prev => [...prev, polygon]);
          onPolygonComplete(polygon);
        }}
        options={{
          drawingControl: false,
          drawingMode: drawingMode ? window.google.maps.drawing.OverlayType.POLYGON : null,
          polygonOptions: {
            fillColor: safetyLevel === 'Safe' ? 'green' : safetyLevel === 'Caution' ? 'yellow' : 'red',
            fillOpacity: 0.35,
            strokeColor: safetyLevel === 'Safe' ? 'green' : safetyLevel === 'Caution' ? 'yellow' : 'red',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            clickable: false,
            editable: true,
            zIndex: 1,
          },
        }}
      />
      {camps.map((camp) => (
        <Marker
          key={camp.id}
          position={{ lat: camp.latitude, lng: camp.longitude }}
          onClick={() => {
            setSelectedCamp(camp);
            onSelectCamp(camp);
          }}
        >
          {selectedCamp?.id === camp.id && (
            <InfoWindow onCloseClick={() => setSelectedCamp(null)}>
              <div>
                <h4>{camp.name}</h4>
                <p>Capacity: {camp.capacity}</p>
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
      {zones.map((zone) => (
        <Polygon
          key={zone.id}
          path={zone.path}
          options={{
            fillColor: zone.safetyLevel === 'Safe' ? 'green' : zone.safetyLevel === 'Caution' ? 'yellow' : 'red',
            fillOpacity: 0.35,
            strokeColor: zone.safetyLevel === 'Safe' ? 'green' : zone.safetyLevel === 'Caution' ? 'yellow' : 'red',
            strokeOpacity: 0.8,
            strokeWeight: 2,
          }}
          onClick={() => onSelectZone(zone)}
        />
      ))}
      {selectedZone && (
        <>
          <Polygon
            path={selectedZone.path}
            editable={true}
            options={{
              fillColor: selectedZone.safetyLevel === 'Safe' ? 'green' : selectedZone.safetyLevel === 'Caution' ? 'yellow' : 'red',
              fillOpacity: 0.35,
              strokeColor: selectedZone.safetyLevel === 'Safe' ? 'green' : selectedZone.safetyLevel === 'Caution' ? 'yellow' : 'red',
              strokeOpacity: 0.8,
              strokeWeight: 2,
            }}
            onMouseUp={(e) => {
              const newPath = e.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
              onSelectZone({ ...selectedZone, path: newPath });
            }}
          />
          <InfoWindow
            position={selectedZone.path[0]}
            onCloseClick={() => onSelectZone(null)}
          >
            <div>
              <h4>{selectedZone.name}</h4>
              <p>Safety Level: {selectedZone.safetyLevel}</p>
            </div>
          </InfoWindow>
        </>
      )}
    </GoogleMap>
  ) : (
    <div>Loading...</div>
  );
});

export default React.memo(AdminMap);