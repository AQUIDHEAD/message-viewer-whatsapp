import React, { useEffect, useState } from 'react';
import './styles/ChatWindow.css';
import MessageBubble from './MessageBubble';
import Sidebar from './Sidebar';

const { ipcRenderer } = window.require('electron');

// Function to identify unique users from messages
function identifyUsers(messages) {
  const userSet = new Set();
  const userRegex = /^[[][^$]+,\s+[^\]]+\]\s+(.+?):/mu;

  messages.forEach((message) => {
    const match = message.match(userRegex);
    if (match) {
      userSet.add(match[1]); // Add the user to the set
    }
  });

  return Array.from(userSet);
}

const ChatWindow = () => {
  // Existing state
  const [allMessages, setAllMessages] = useState([]);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // New state for additional features
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({ type: 'all', user: 'all' });
  const [messageLoadCount, setMessageLoadCount] = useState(50);

  const MESSAGES_PER_LOAD = 100;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Prompt user to select chat file
        const result = await ipcRenderer.invoke('select-chat-file');
        if (!result) {
          console.log('No chat file selected');
          return;
        }

        const { data, mediaFolderPath } = result;
        console.log('Media folder path:', mediaFolderPath);

        // Process chat data
        const cleanedData = data.replace(/\u200E/g, '');
        const lines = cleanedData.split('\n').filter(line => line.trim() !== '');

        console.log('Loaded messages count:', lines.length);

        setAllMessages(lines);
        setDisplayedMessages(lines.slice(0, messageLoadCount));
        setCurrentIndex(messageLoadCount);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [messageLoadCount]);

  const loadMoreMessages = () => {
    const nextIndex = currentIndex + MESSAGES_PER_LOAD;
    const nextMessages = allMessages.slice(currentIndex, nextIndex);
    console.log('Loading more messages:', nextMessages.length);

    setDisplayedMessages(prevMessages => [...prevMessages, ...nextMessages]);
    setCurrentIndex(nextIndex);
  };

  // Handle date jump
  const handleDateJump = (date) => {
    const messageIndex = allMessages.findIndex(msg => msg.includes(date));
    if (messageIndex !== -1) {
      const startIndex = Math.max(0, messageIndex - 25);
      setDisplayedMessages(allMessages.slice(startIndex, messageIndex + 25));
      setCurrentIndex(messageIndex + 25);
      console.log('Jumped to date:', date, 'at index:', messageIndex);
    }
  };

  // Handle load count change
  const handleLoadCountChange = (count) => {
    if (count === 'all') {
      setDisplayedMessages(allMessages);
      setCurrentIndex(allMessages.length);
      console.log('Loading all messages');
    } else {
      const newCount = parseInt(count);
      setMessageLoadCount(newCount);
      setDisplayedMessages(allMessages.slice(0, newCount));
      setCurrentIndex(newCount);
      console.log('Changed load count to:', newCount);
    }
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term) {
      const filtered = allMessages.filter(msg => 
        msg.toLowerCase().includes(term.toLowerCase())
      );
      console.log('Search results:', filtered.length);
      setFilteredMessages(filtered);
      setDisplayedMessages(filtered);
    } else {
      setFilteredMessages([]);
      setDisplayedMessages(allMessages.slice(0, messageLoadCount));
    }
  };

  // Handle filters
  const handleFilter = ({ type, user }) => {
    setActiveFilters({ type, user });
    let filtered = [...allMessages];
    
    if (type !== 'all') {
      filtered = filtered.filter(msg => {
        switch(type) {
          case 'text':
            return !msg.includes('<attached:');
          case 'image':
            return msg.includes('.jpg') || msg.includes('.webp');
          case 'video':
            return msg.includes('.mp4');
          case 'audio':
            return msg.includes('.opus');
          default:
            return true;
        }
      });
    }
    
    if (user !== 'all') {
      filtered = filtered.filter(msg => msg.includes(user));
    }
    
    console.log('Filtered messages:', filtered.length, 'Type:', type, 'User:', user);
    setFilteredMessages(filtered);
    setDisplayedMessages(filtered.slice(0, messageLoadCount));
  };

  // Bookmark functions
  const handleBookmark = (message, index) => {
    const newBookmark = {
      message,
      messageIndex: index,
      timestamp: new Date().toISOString()
    };
    console.log('Adding bookmark:', newBookmark);
    setBookmarks(prev => [...prev, newBookmark]);
  };

  const handleAddBookmarkNote = (bookmarkIndex, note) => {
    setBookmarks(prev => {
      const newBookmarks = [...prev];
      newBookmarks[bookmarkIndex] = {
        ...newBookmarks[bookmarkIndex],
        note
      };
      console.log('Added note to bookmark:', bookmarkIndex, note);
      return newBookmarks;
    });
  };

  const handleDeleteBookmark = (bookmarkIndex) => {
    console.log('Deleting bookmark:', bookmarkIndex);
    setBookmarks(prev => prev.filter((_, index) => index !== bookmarkIndex));
  };

  const handleJumpToBookmark = (messageIndex) => {
    const startIndex = Math.max(0, messageIndex - 10);
    setDisplayedMessages(allMessages.slice(startIndex, messageIndex + 15));
    setCurrentIndex(messageIndex + 15);
    console.log('Jumped to bookmark at index:', messageIndex);
  };

  // Handle sidebar state
  const handleSidebarToggle = (isOpen) => {
    setIsSidebarOpen(isOpen);
    console.log('Sidebar toggled:', isOpen);
  };

  // Identify users from all messages
  const users = identifyUsers(allMessages);
  console.log('Identified users:', users);

  return (
    <>
      <Sidebar 
        messages={allMessages}
        onDateJump={handleDateJump}
        onLoadCountChange={handleLoadCountChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onBookmark={handleBookmark}
        onJumpToBookmark={handleJumpToBookmark}
        onAddBookmarkNote={handleAddBookmarkNote}
        onDeleteBookmark={handleDeleteBookmark}
        users={users}
        bookmarks={bookmarks}
        messageLoadCount={messageLoadCount}
        activeFilters={activeFilters}
        onToggle={handleSidebarToggle}
      />
      <div className={`chat-window ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <h2>Chat Window</h2>
        {isLoading ? (
          <p>Loading messages...</p>
        ) : (
          <>
            <div className="imessage">
              {displayedMessages.map((line, index) => (
                <MessageBubble 
                  key={index} 
                  message={line} 
                  users={users}
                  onBookmark={() => handleBookmark(line, index)}
                />
              ))}
            </div>

            {currentIndex < allMessages.length && !searchTerm && 
             activeFilters.type === 'all' && activeFilters.user === 'all' && (
              <button onClick={loadMoreMessages} className="load-more-button">
                Load More Messages
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ChatWindow;