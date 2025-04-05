import React from 'react';
import '../styles/MessageLoader.css';

const MessageLoader = ({ messageLoadCount, onLoadCountChange }) => {
  const handleCountChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      onLoadCountChange(value);
    }
  };

  return (
    <div className="message-loader">
      <h3>Messages to Load</h3>
      <div className="loader-controls">
        <input
          type="number"
          min="1"
          value={messageLoadCount}
          onChange={handleCountChange}
          className="load-count-input"
        />
        <button 
          onClick={() => onLoadCountChange('all')}
          className="load-all-button"
        >
          Load All
        </button>
      </div>
      <div className="preset-buttons">
        <button onClick={() => onLoadCountChange(50)}>50</button>
        <button onClick={() => onLoadCountChange(100)}>100</button>
        <button onClick={() => onLoadCountChange(200)}>200</button>
      </div>
    </div>
  );
};

export default MessageLoader;