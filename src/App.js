import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header';  // Import the new Header component
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header /> {/* Use Header component */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
