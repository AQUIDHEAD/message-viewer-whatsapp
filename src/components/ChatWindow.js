import React, { useEffect, useState } from 'react';
import './styles/ChatWindow.css';
import MessageBubble from './MessageBubble';
import Sidebar from './Sidebar';

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

// Function to extract dates from messages
function extractDates(messages) {
  const dateSet = new Set();
  const dateRegex = /^\[([^,]+)/;

  messages.forEach((message) => {
    const match = message.match(dateRegex);
    if (match) {
      dateSet.add(match[1].trim());
    }
  });

  return Array.from(dateSet).sort();
}

const ChatWindow = () => {
  // Existing state
  const [allMessages, setAllMessages] = useState([]);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // New state for additional features
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({ type: 'all', user: 'all' });
  const [messageLoadCount, setMessageLoadCount] = useState(50);

  const MESSAGES_PER_LOAD = 100;

  useEffect(() => {
    const fetchChatMessages = async () => {
      try {
        const response = await fetch('/files/_chat.txt');
        const data = await response.text();
        const cleanedData = data.replace(/\u200E/g, '');
        const lines = cleanedData.split('\n').filter(line => line.trim() !== '');
        console.log('Fetched Messages:', lines); // Add this debug line
        setAllMessages(lines);
        setDisplayedMessages(lines.slice(0, MESSAGES_PER_LOAD));
        setCurrentIndex(MESSAGES_PER_LOAD);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching chat messages:', error);
        setIsLoading(false);
      }
    };
  
    fetchChatMessages();
  }, []);

  // Existing function
  const loadMoreMessages = () => {
    const nextIndex = currentIndex + MESSAGES_PER_LOAD;
    const nextMessages = allMessages.slice(currentIndex, nextIndex);

    setDisplayedMessages(prevMessages => [...prevMessages, ...nextMessages]);
    setCurrentIndex(nextIndex);
  };

  // New functions for additional features
  const handleDateJump = (date) => {
    const messageIndex = allMessages.findIndex(msg => msg.includes(date));
    if (messageIndex !== -1) {
      const startIndex = Math.max(0, messageIndex - 25);
      setDisplayedMessages(allMessages.slice(startIndex, messageIndex + 25));
      setCurrentIndex(messageIndex + 25);
    }
  };

  const handleLoadCountChange = (count) => {
    if (count === 'all') {
      setDisplayedMessages(allMessages);
      setCurrentIndex(allMessages.length);
    } else {
      const newCount = parseInt(count);
      setMessageLoadCount(newCount);
      setDisplayedMessages(allMessages.slice(0, newCount));
      setCurrentIndex(newCount);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term) {
      const filtered = allMessages.filter(msg => 
        msg.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredMessages(filtered);
      setDisplayedMessages(filtered);
    } else {
      setFilteredMessages([]);
      setDisplayedMessages(allMessages.slice(0, messageLoadCount));
    }
  };

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
    
    setFilteredMessages(filtered);
    setDisplayedMessages(filtered.slice(0, messageLoadCount));
  };

  const handleBookmark = (messageIndex, note = '') => {
    const newBookmark = {
      messageIndex,
      message: allMessages[messageIndex],
      note,
      timestamp: new Date().toISOString()
    };
    setBookmarks(prev => [...prev, newBookmark]);
  };

  const handleJumpToBookmark = (messageIndex) => {
    const startIndex = Math.max(0, messageIndex - 10);
    setDisplayedMessages(allMessages.slice(startIndex, messageIndex + 15));
    setCurrentIndex(messageIndex + 15);
  };

  // Add these functions in the ChatWindow component
  const handleAddBookmarkNote = (bookmarkIndex, note) => {
    setBookmarks(prevBookmarks => {
      const newBookmarks = [...prevBookmarks];
      newBookmarks[bookmarkIndex] = {
        ...newBookmarks[bookmarkIndex],
        note
      };
      return newBookmarks;
    });
  };

  const handleDeleteBookmark = (bookmarkIndex) => {
    setBookmarks(prevBookmarks => 
      prevBookmarks.filter((_, index) => index !== bookmarkIndex)
    );
  };

  // Identify users from all messages
  const users = identifyUsers(allMessages);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Add this function to handle sidebar state
  const handleSidebarToggle = (isOpen) => {
    setIsSidebarOpen(isOpen);
  };

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
                  onBookmark={() => handleBookmark(index)}
                />
              ))}
            </div>

            {currentIndex < allMessages.length && !searchTerm && activeFilters.type === 'all' && activeFilters.user === 'all' && (
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