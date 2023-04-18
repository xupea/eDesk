import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Master';
import Controller from './pages/Slave';
import 'antd/dist/reset.css';
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/control" element={<Controller />} />
      </Routes>
    </Router>
  );
}
