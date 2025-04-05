import React, { useState } from 'react';
import "./styles/MessageBubble.css";

const MessageBubble = ({ message, users, onBookmark }) => {
  const [showBookmarkOption, setShowBookmarkOption] = useState(false);

  // Existing message parsing code
  const cleanedMessage = message.replace(/[\u200E\u202F]/g, '');
  const regex = /^[[]([^$]+),\s+([^\]]+)\]\s+(?:(.+?):\s+)?(.*)$/mu;
  const match = cleanedMessage.match(regex);

  const handleClick = (e) => {
    e.preventDefault();
    setShowBookmarkOption(true);
  };

  const handleBookmark = () => {
    onBookmark(message);
    setShowBookmarkOption(false);
  };

  // Define renderBookmarkOption before using it
  const renderBookmarkOption = () => (
    <div className="bookmark-option" onClick={(e) => e.stopPropagation()}>
      <button onClick={handleBookmark}>Bookmark</button>
      <button onClick={() => setShowBookmarkOption(false)}>Cancel</button>
    </div>
  );

  if (match) {
    const [, date, time, user, content] = match;
    const messageClass = user === users[0] ? 'from-them' : 'from-me';

    const regexFile = /<attached:\s([\w-]+)\.(opus|webp|mp4|jpg)>/;
    const matchFile = content.match(regexFile);

    if (matchFile) {
      const [, fileName, fileType] = matchFile;
      const completeFile = './files/' + fileName + '.' + fileType;

      switch(fileType) {
        case 'opus':
          return (
            <div style={{padding: '0.4rem'}} onClick={handleClick}>
              <audio className={`imessage ${messageClass}`} data-date={date} data-time={time} src={completeFile} type={fileType} controls />
              {showBookmarkOption && renderBookmarkOption()}
            </div>
          );
        case 'jpg':
        case 'webp':
          return (
            <div style={{padding: '0.4rem'}} onClick={handleClick}>
              <img className={`imessage ${messageClass}`} data-date={date} data-time={time} src={completeFile} alt=''/>
              {showBookmarkOption && renderBookmarkOption()}
            </div>
          );
        case 'mp4':
          return (
            <div style={{padding: '0.4rem'}} onClick={handleClick}>
              <video 
                className={`imessage ${messageClass}`} data-date={date} data-time={time} 
                controls 
                src={completeFile} 
                type="video/mp4" 
              />
              {showBookmarkOption && renderBookmarkOption()}
            </div>
          );
        default:
          break;
      }
    } else {
      return (
        <div className="message-container" onClick={handleClick}>
          <p data-date={date} data-time={time} className={`imessage ${messageClass}`}>
            {user} {content}
          </p>
          {showBookmarkOption && renderBookmarkOption()}
        </div>
      );
    }
  }

  return (
    <div className="message-container" onClick={handleClick}>
      <p className="imessage from-me">{message}</p>
      {showBookmarkOption && renderBookmarkOption()}
    </div>
  );
};

export default MessageBubble;