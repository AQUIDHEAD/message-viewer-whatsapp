import React, { useState } from 'react';
import DateNavigation from './sidebar/DateNavigation';
import MessageLoader from './sidebar/MessageLoader';
import SearchBar from './sidebar/SearchBar';
import MessageFilters from './sidebar/MessageFilters';
import BookmarkSystem from './sidebar/BookmarkSystem';
import './styles/Sidebar.css';

const Sidebar = ({ 
  messages, 
  onDateJump, 
  onLoadCountChange, 
  onSearch, 
  onFilter,
  onBookmark,
  onJumpToBookmark,
  onAddBookmarkNote,
  onDeleteBookmark,
  users,
  bookmarks,
  messageLoadCount,
  activeFilters 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button 
        className="sidebar-toggle-button"
        onClick={toggleSidebar}
      >
        ☰
      </button>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <DateNavigation 
            messages={messages}
            onDateJump={onDateJump}
          />

          <MessageLoader 
            messageLoadCount={messageLoadCount}
            onLoadCountChange={onLoadCountChange}
          />

          <SearchBar 
            onSearch={onSearch}
          />

          <MessageFilters 
            users={users}
            onFilter={onFilter}
            activeFilters={activeFilters}
          />

          <BookmarkSystem 
            bookmarks={bookmarks}
            onJumpToBookmark={onJumpToBookmark}
            onAddNote={onAddBookmarkNote}
            onDeleteBookmark={onDeleteBookmark}
          />
        </div>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;