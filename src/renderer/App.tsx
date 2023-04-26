import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import Controller from './pages/Controller';
import 'antd/dist/reset.css';
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/control" element={<Controller />} />
      </Routes>
    </Router>
  );
}
