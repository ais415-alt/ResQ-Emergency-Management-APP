import React, { useEffect, useState } from 'react';
import { db as firestore } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleAccountStatus = async (userId, isDisabled) => {
    try {
      const userDoc = doc(firestore, 'users', userId);
      await updateDoc(userDoc, {
        disabled: !isDisabled
      });
      setUsers(users.map(user => user.id === userId ? { ...user, disabled: !isDisabled } : user));
    } catch (err) {
      setError('Failed to update user status.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="users-container">
      <h1>Users</h1>
      <div className="feature-section">
        <h2>User List</h2>
        <ul className="users-list">
          {users.map(user => (
            <li key={user.id}>
              {user.name} ({user.email}) - {user.disabled ? 'Disabled' : 'Enabled'}
              <button onClick={() => handleToggleAccountStatus(user.id, user.disabled)}>
                {user.disabled ? 'Enable' : 'Disable'}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="feature-section">
        <h2>Manage Roles</h2>
        <p>A feature to manage user roles will be available here.</p>
      </div>
    </div>
  );
};

export default Users;