import React from 'react';
import "./styles/MessageBubble.css";

const MessageBubble = ({ message, users }) => {
  // Preprocess the message to remove problematic Unicode characters
  const cleanedMessage = message.replace(/[\u200E\u202F]/g, '');

  // Regular expression to parse the message format
  const regex = /^[[]([^$]+),\s+([^\]]+)\]\s+(?:(.+?):\s+)?(.*)$/mu;
  const match = cleanedMessage.match(regex);

  if (match) {
    const [, date, time, user, content] = match;

    // Determine the CSS class based on the user
    const messageClass = user === users[0] ? 'from-them' : 'from-me';

    console.log(messageClass);

    const regexFile = /<attached:\s([\w-]+)\.(opus|webp|mp4|jpg)>/;
    const matchFile = content.match(regexFile);

    if (matchFile) {
      const [, fileName, fileType] = matchFile;
      const completeFile = './files/' + fileName + '.' + fileType;

      switch(fileType) {
        case 'opus':
          return (
            <div style={{padding: '0.4rem'}}>
              <audio className={`imessage ${messageClass}`} data-date={date} data-time={time} src={completeFile} type={fileType} controls />
            </div>
          );
        case 'jpg':
        case 'webp':
          return (
            <div style={{padding: '0.4rem'}}>
              <img className={`imessage ${messageClass}`} data-date={date} data-time={time} src={completeFile} alt=''/>
            </div>
          );
        case 'mp4':
          return (
            <div style={{padding: '0.4rem'}}>
              <video 
                className={`imessage ${messageClass}`} data-date={date} data-time={time} 
                controls 
                src={completeFile} 
                type="video/mp4" 
              />
            </div>
          );
        default:
          break;
      }
    } else {
      return (
          <p data-date={date} data-time={time} className={`imessage ${messageClass}`}>{user} {content}</p>
      );
    }
  } else {
    return (
        <p className="imessage from-me">{message}</p>
    );
  }
};

export default MessageBubble;