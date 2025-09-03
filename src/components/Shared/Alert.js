import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, onValue } from "firebase/database";

const Alert = () => {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const alertsRef = ref(database, 'alerts');
    onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const latestAlert = Object.values(data).pop();
        setAlert(latestAlert);
        setTimeout(() => {
          setAlert(null);
        }, 5000);
      }
    });
  }, []);

  if (!alert) {
    return null;
  }

  return (
    <div className="alert-overlay">
      <div className="alert-box">
        <h1>{alert.title}</h1>
        <p>{alert.message}</p>
      </div>
    </div>
  );
};

export default Alert;