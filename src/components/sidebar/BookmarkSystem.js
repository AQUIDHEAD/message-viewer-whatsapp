import React, { useState } from 'react';
import '../styles/BookmarkSystem.css';

const BookmarkSystem = ({ bookmarks, onJumpToBookmark, onAddNote, onDeleteBookmark }) => {
  const [newNote, setNewNote] = useState('');
  const [selectedBookmark, setSelectedBookmark] = useState(null);

  const handleAddNote = (bookmarkIndex) => {
    if (newNote.trim()) {
      onAddNote(bookmarkIndex, newNote);
      setNewNote('');
      setSelectedBookmark(null);
    }
  };

  return (
    <div className="bookmark-system">
      <h3>Bookmarks</h3>
      <div className="bookmarks-list">
        {bookmarks.length === 0 ? (
          <p className="no-bookmarks">No bookmarks yet</p>
        ) : (
          bookmarks.map((bookmark, index) => (
            <div key={index} className="bookmark-item">
              <div className="bookmark-header">
                <span className="bookmark-date">
                  {new Date(bookmark.timestamp).toLocaleDateString()}
                </span>
                <button 
                  onClick={() => onDeleteBookmark(index)}
                  className="delete-bookmark"
                >
                </button>
              </div>
              
              <div className="bookmark-preview" onClick={() => onJumpToBookmark(bookmark.messageIndex)}>
                {bookmark.message.substring(0, 50)}...
              </div>

              {bookmark.note && (
                <div className="bookmark-note">{bookmark.note}</div>
              )}

              {selectedBookmark === index ? (
                <div className="add-note">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                  />
                  <button onClick={() => handleAddNote(index)}>Add</button>
                </div>
              ) : (
                <button 
                  onClick={() => setSelectedBookmark(index)}
                  className="add-note-button"
                >
                  Add Note
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookmarkSystem;