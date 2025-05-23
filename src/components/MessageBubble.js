import React, { useState, useEffect } from 'react';
import "./styles/MessageBubble.css";

const { ipcRenderer } = window.require('electron');

const MessageBubble = ({ message, users, onBookmark }) => {
    const [showBookmarkOption, setShowBookmarkOption] = useState(false);
    const [mediaPath, setMediaPath] = useState('');

    // Preprocess the message to remove problematic Unicode characters
    const cleanedMessage = message.replace(/[\u200E\u202F]/g, '');

    // Regular expression to parse the message format
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

    const getMediaPath = async (fileName) => {
        try {
            const filePath = await ipcRenderer.invoke('get-media-file', fileName);
            if (filePath) {
                console.log('Media file found:', filePath);
                return `file://${filePath}`;
            }
            console.error('Media file not found:', fileName);
            return '';
        } catch (error) {
            console.error('Error getting media path:', error);
            return '';
        }
    };

    useEffect(() => {
        if (match) {
            const [, , , , content] = match;
            const regexFile = /<attached:\s([\w-]+)\.(opus|webp|mp4|jpg)>/;
            const matchFile = content.match(regexFile);
            
            if (matchFile) {
                const [, fileName, fileType] = matchFile;
                getMediaPath(`${fileName}.${fileType}`).then(path => {
                    console.log('Setting media path to:', path);
                    setMediaPath(path);
                });
            }
        }
    }, [match]);

    // Debug media path changes
    useEffect(() => {
        console.log('Media path updated:', mediaPath);
    }, [mediaPath]);

    const renderBookmarkOption = () => (
        <div className="bookmark-option" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleBookmark}>Bookmark</button>
            <button onClick={() => setShowBookmarkOption(false)}>Cancel</button>
        </div>
    );

    if (!match) {
        return (
            <div className="message-container" onClick={handleClick}>
                <p className="imessage from-me">{message}</p>
                {showBookmarkOption && renderBookmarkOption()}
            </div>
        );
    }

    const [, date, time, user, content] = match;
    const messageClass = user === users[0] ? 'from-them' : 'from-me';

    const regexFile = /<attached:\s([\w-]+)\.(opus|webp|mp4|jpg)>/;
    const matchFile = content.match(regexFile);

    if (!matchFile) {
        return (
            <div className="message-container" onClick={handleClick}>
                <p data-date={date} data-time={time} className={`imessage ${messageClass}`}>
                    {user} {content}
                </p>
                {showBookmarkOption && renderBookmarkOption()}
            </div>
        );
    }

    const [, fileName, fileType] = matchFile;

    switch(fileType) {
        case 'opus':
            return (
                <div style={{padding: '0.4rem'}} onClick={handleClick}>
                    <audio 
                        className={`imessage ${messageClass}`} 
                        data-date={date} 
                        data-time={time} 
                        src={mediaPath} 
                        type="audio/ogg" 
                        controls 
                        onError={(e) => console.error('Audio load error:', e)}
                    />
                    {showBookmarkOption && renderBookmarkOption()}
                </div>
            );
        case 'jpg':
        case 'webp':
            return (
                <div style={{padding: '0.4rem'}} onClick={handleClick}>
                    <img 
                        className={`imessage ${messageClass}`} 
                        data-date={date} 
                        data-time={time} 
                        src={mediaPath} 
                        alt=''
                        onError={(e) => console.error('Image load error:', e)}
                    />
                    {showBookmarkOption && renderBookmarkOption()}
                </div>
            );
        case 'mp4':
            return (
                <div style={{padding: '0.4rem'}} onClick={handleClick}>
                    <video 
                        className={`imessage ${messageClass}`} 
                        data-date={date} 
                        data-time={time} 
                        controls 
                        src={mediaPath} 
                        type="video/mp4"
                        onError={(e) => console.error('Video load error:', e)}
                    />
                    {showBookmarkOption && renderBookmarkOption()}
                </div>
            );
        default:
            return (
                <div className="message-container" onClick={handleClick}>
                    <p data-date={date} data-time={time} className={`imessage ${messageClass}`}>
                        {user} {content}
                    </p>
                    {showBookmarkOption && renderBookmarkOption()}
                </div>
            );
    }
};

export default MessageBubble;