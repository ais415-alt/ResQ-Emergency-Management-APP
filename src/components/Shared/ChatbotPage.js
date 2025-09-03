import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Chatbot from './Chatbot';
import './ChatbotPage.css';

const ChatbotPage = () => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="chatbot-page-container">
      <div className="chatbot-content-wrapper">
        <aside className="chatbot-sidebar">
          <div className="sidebar-header">
            <Link to="/dashboard" className="home-link">Dashboard</Link>
            <button className="new-chat-button"><i className="fas fa-plus"></i> New Chat</button>
          </div>
          <div className="sidebar-content">
            <div className="chat-history-box">
              <div className="chat-history-item">
                <p className="history-title">Medical Chat</p>
                <p className="history-date">2023-01-15</p>
              </div>
              <div className="chat-history-item">
                <p className="history-title">Disaster Plan</p>
                <p className="history-date">2023-01-14</p>
              </div>
              <div className="chat-history-item">
                <p className="history-title">Alert System Query</p>
                <p className="history-date">2023-01-12</p>
              </div>
              <div className="chat-history-item">
                <p className="history-title">Medical Chat</p>
                <p className="history-date">2023-01-15</p>
              </div>
              <div className="chat-history-item">
                <p className="history-title">Disaster Plan</p>
                <p className="history-date">2023-01-14</p>
              </div>
              <div className="chat-history-item">
                <p className="history-title">Alert System Query</p>
                <p className="history-date">2023-01-12</p>
              </div>
            </div>
          </div>
        </aside>
        <main className="chatbot-main">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <i className="fas fa-robot"></i>
              <h2>AI Assistant</h2>
            </div>
            <div className="chatbot-header-right">
              <button
                className="helpline-button"
                onClick={() => setShowPopup(true)}
              >
                <i className="fas fa-phone-alt"></i> Helpline
              </button>
            </div>
          </div>
          <div className="chatbot-greeting">
            <h2>Welcome to the AI Assistant!</h2>
            <p>Feel free to ask me anything. I'm here to help you get the information you need, whether it's a quick question or a detailed query.</p>
          </div>
          <div className="chatbot-wrapper">
            <Chatbot />
          </div>
        </main>
      </div>
      {showPopup && (
        <div className="helpline-popup-overlay">
          <div className="helpline-popup">
            <h3>Coming Soon!</h3>
            <p>Our AI-powered helpline will be available soon.</p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotPage;