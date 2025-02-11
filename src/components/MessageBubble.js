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

    const regexFile = /<attached:\s([\w-]+)\.(opus|webp|mp4|jpg)>/;
    const matchFile = messageContent.match(regexFile);

    // Placeholder logic to determine message type
    let messageType = 'text';

    if (matchFile) {
      const [, fileName, fileType] = matchFile;

      const completeFile = './files/' + fileName + '.' + fileType;

      switch(fileType) {
        case 'opus':
          messageType = 'audio';
          // Make a new audio message bubble
          return (
            <div
              className="audio-bubble"
              data-date={date}
              data-time={time}
            >
              <audio
                src={completeFile}
                type={fileType}
                controls="true"
                autoPlay="false"
                loop="false"
              ></audio>
            </div>
          );
        case 'jpg' || 'webp':
          messageType = 'image';
          // Make a new image message bubble
          return (
            <div
              className="image-bubble"
              data-date={date}
              data-time={time}
            >
              <img
                src={completeFile}
                alt='image'
              />
            </div>
          );
        case 'mp4':
          messageType = 'video';
          // Make a new video message bubble
          return (
            <div
              className="video-bubble"
              data-date={date}
              data-time={time}
            >
              <video
                controls
                src={completeFile}
                type="video/mp4"
              />
            </div>
          );
      }
      
    } else {
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
    }
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