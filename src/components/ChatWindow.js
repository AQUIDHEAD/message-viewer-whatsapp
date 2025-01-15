// src/components/ChatWindow.js
import React, { useEffect, useState } from 'react';
import './ChatWindow.css'; // Include your CSS file for styling

const ChatWindow = () => {
  const [allMessages, setAllMessages] = useState([]); // To store all cleaned messages
  const [displayedMessages, setDisplayedMessages] = useState([]); // To store messages currently displayed
  const [currentIndex, setCurrentIndex] = useState(0); // To keep track of the next message index to load

  const MESSAGES_PER_LOAD = 100; // Number of messages to load each time

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
        const initialMessages = lines.slice(0, MESSAGES_PER_LOAD);
        setDisplayedMessages(initialMessages);
        setCurrentIndex(MESSAGES_PER_LOAD);
      } catch (error) {
        console.error('Error fetching or cleaning chat messages:', error);
      }
    };

    fetchChatMessages();
  }, []);

  const loadMoreMessages = () => {
    const nextIndex = currentIndex + MESSAGES_PER_LOAD;
    const nextMessages = allMessages.slice(currentIndex, nextIndex);

    setDisplayedMessages(prevMessages => [...prevMessages, ...nextMessages]);
    setCurrentIndex(nextIndex);
  };

  return (
    <div className="chat-window">
      <h2>Chat Window</h2>
      <div className="chat-messages">
        {displayedMessages.map((line, index) => (
          <p key={index} className="chat-line">{line}</p>
        ))}
      </div>

      {currentIndex < allMessages.length && (
        <button onClick={loadMoreMessages} className="load-more-button">
          Load More Messages
        </button>
      )}
    </div>
  );
};

export default ChatWindow;