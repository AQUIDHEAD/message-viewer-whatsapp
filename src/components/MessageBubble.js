// src/components/MessageBubble.js
import React from 'react';

const MessageBubble = ({ message }) => {
  // Preprocess the message to remove problematic Unicode characters
  const cleanedMessage = message.replace(/[\u200E\u202F]/g, '');

  // Regular expression to parse the message format
  const regex = /^[[]([^$]+),\s+([^\]]+)\]\s+(?:(.+?):\s+)?(.*)$/mu;
  const match = cleanedMessage.match(regex);

  console.log(match);

  if (match) {
    const [, date, time, user, content] = match;

    // Variables for user and content
    const messageUser = user;
    const messageContent = content;

    // Placeholder logic to determine message type
    let messageType = 'text';
    console.log(`Message from ${messageUser} is of type ${messageType}`);

    // Return the message bubble component
    return (
      <div
        className="message-bubble"
        data-date={date}
        data-time={time}
      >
        <strong>{messageUser}</strong>: {messageContent}
      </div>
    );
  } else {
    // Handle messages that don't match the expected format
    console.warn('Message did not match expected format:', message);
    return (
      <div className="message-bubble">
        {message}
      </div>
    );
  }
};

export default MessageBubble;