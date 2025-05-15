import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Player from './components/Player';
import Controller from './components/Controller';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Controller />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </Router>
  );
}

export default App;
