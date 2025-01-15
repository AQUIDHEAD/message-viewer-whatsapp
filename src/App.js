// src/App.js
import React from 'react';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Message Viewer App</h1>
      </header>
      <main>
        <ChatWindow />
      </main>
    </div>
  );
}

export default App;