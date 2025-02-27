import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="App-header">
      <h1>Government Contract Visualization</h1>
      <button className="home-button" onClick={() => navigate('/')}>
        Home
      </button>
    </header>
  );
}

export default Header;
