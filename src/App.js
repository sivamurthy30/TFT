import React from 'react';
import Main from './Main';
import './App.css';

function App() {
  return (
    <div className="App">
      <img
        src="/text-box.png"
        alt="Logo"
        className="app-logo-top-left"
        onClick={() => window.location.reload()}
        style={{ cursor: 'pointer' }}
      />
      <span className="app-gif-tooltip-wrapper">
        <img src="/0-Keyboard-Computer-3840x2160-unscreen.gif" alt="Keyboard Animation" className="app-gif-top-right" loop autoPlay />
        <span className="app-gif-tooltip">Typing Keyboard</span>
      </span>
      <Main />
    </div>
  );
}

export default App;
