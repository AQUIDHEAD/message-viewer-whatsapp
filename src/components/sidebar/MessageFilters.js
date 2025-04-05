import React from 'react';
import '../styles/MessageFilters.css';

const MessageFilters = ({ users, onFilter, activeFilters }) => {
  const messageTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'text', label: 'Text Only' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' }
  ];

  return (
    <div className="message-filters">
      <h3>Filters</h3>
      <div className="filter-section">
        <label>Message Type</label>
        <select
          value={activeFilters.type}
          onChange={(e) => onFilter({ ...activeFilters, type: e.target.value })}
          className="filter-select"
        >
          {messageTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label>User</label>
        <select
          value={activeFilters.user}
          onChange={(e) => onFilter({ ...activeFilters, user: e.target.value })}
          className="filter-select"
        >
          <option value="all">All Users</option>
          {users.map(user => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MessageFilters;