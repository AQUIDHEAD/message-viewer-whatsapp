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
    const fetchChatMessages = async () => {
      try {
        // Fetch the chat file from the public folder
        const response = await fetch('/files/_chat.txt');
        const data = await response.text();

        // Remove unnecessary Unicode characters like U+200E
        const cleanedData = data.replace(/\u200E/g, '');

        // Split the data into lines and remove empty lines
        const lines = cleanedData.split('\n').filter(line => line.trim() !== '');

        // Update state with all messages
        setAllMessages(lines);

        // Load the first set of messages
        const initialMessages = lines.slice(0, messageLoadCount);
        setDisplayedMessages(initialMessages);
        setCurrentIndex(messageLoadCount);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching or cleaning chat messages:', error);
        setIsLoading(false);
      }
    };

    fetchChatMessages();
  }, [messageLoadCount]);

  // Existing function
  const loadMoreMessages = () => {
    const nextIndex = currentIndex + MESSAGES_PER_LOAD;
    const nextMessages = allMessages.slice(currentIndex, nextIndex);

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
    }
  };

  // Handle load count change
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

  // Handle search
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
    setBookmarks(prev => [...prev, newBookmark]);
  };

  const handleAddBookmarkNote = (bookmarkIndex, note) => {
    setBookmarks(prev => {
      const newBookmarks = [...prev];
      newBookmarks[bookmarkIndex] = {
        ...newBookmarks[bookmarkIndex],
        note
      };
      return newBookmarks;
    });
  };

  const handleDeleteBookmark = (bookmarkIndex) => {
    setBookmarks(prev => prev.filter((_, index) => index !== bookmarkIndex));
  };

  const handleJumpToBookmark = (messageIndex) => {
    const startIndex = Math.max(0, messageIndex - 10);
    setDisplayedMessages(allMessages.slice(startIndex, messageIndex + 15));
    setCurrentIndex(messageIndex + 15);
  };

  // Handle sidebar state
  const handleSidebarToggle = (isOpen) => {
    setIsSidebarOpen(isOpen);
  };

  // Identify users from all messages
  const users = identifyUsers(allMessages);

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