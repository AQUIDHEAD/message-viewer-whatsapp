import React, { useState } from 'react';
import '../styles/SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    onSearch(value);
  };

  return (
    <div className="search-bar">
      <h3>Search Messages</h3>
      <div className="search-input-container">
        <input
          type="text"
          value={searchText}
          onChange={handleSearch}
          placeholder="Search messages..."
          className="search-input"
        />
        {searchText && (
          <button 
            onClick={() => {
              setSearchText('');
              onSearch('');
            }}
            className="clear-search"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;