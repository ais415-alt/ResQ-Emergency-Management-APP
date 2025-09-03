import React from 'react';
import { Link } from 'react-router-dom';
import '../Shared/Dashboard.css';

const AuthorityDashboard = () => {
  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2><i className="fas fa-shield-alt"></i> ResQ</h2>
        </div>
        <ul className="sidebar-nav">
          <li className="sidebar-header">Map & Location Tools</li>
          <li><Link to="/authority/camps"><i className="fas fa-campground"></i> Camps</Link></li>
          <li><Link to="/authority/zones"><i className="fas fa-draw-polygon"></i> Zones</Link></li>
          <li><Link to="/authority/incidents"><i className="fas fa-exclamation-triangle"></i> Incidents</Link></li>
          <li><Link to="/authority/resources"><i className="fas fa-truck"></i> Resources</Link></li>
          <li><Link to="/authority/users-on-map"><i className="fas fa-map-marker-alt"></i> Users on Map</Link></li>

          <li className="sidebar-header">Data Management</li>
          <li><Link to="/authority/alerts"><i className="fas fa-bullhorn"></i> Alerts</Link></li>
          <li><Link to="/authority/rations"><i className="fas fa-qrcode"></i> Rations</Link></li>

          <li className="sidebar-header">User & System</li>
          <li><Link to="/authority/users"><i className="fas fa-users"></i> Users</Link></li>
          <li><Link to="/authority/reports"><i className="fas fa-file-alt"></i> Reports</Link></li>
          <li><Link to="/authority/settings"><i className="fas fa-cog"></i> Settings</Link></li>
          <li><Link to="/authority/chatbot"><i className="fas fa-robot"></i> Chatbot</Link></li>
        </ul>
      </aside>
      <div className="main-content">
        <header className="top-nav">
          <div>
            <i className="fas fa-exclamation-triangle"></i> Emergency Management
          </div>
          <div>
            <i className="fas fa-bell"></i>
            <span className="emergency-status">ACTIVE</span>
          </div>
        </header>
        <section className="dashboard-content">
          <h1>Emergency Dashboard</h1>
          {/* Dashboard content will go here */}
        </section>
      </div>
    </div>
  );
};

export default AuthorityDashboard;