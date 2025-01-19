import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import './App.css';
import ZoneList from "./pages/components/ZoneList";
import SystemManagement from "./pages/components/SystemManagement";
import LocalDomain from "./pages/components/LocalDomain";

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <Link to="/system-management">系统管理</Link>
          <Link to="/forwarding">转发</Link>
          <Link to="/local-domain">本地域名</Link>
        </nav>
        <Routes>
          <Route path="/system-management" element={<SystemManagement />} />
          <Route path="/forwarding" element={<ZoneList />} />
          <Route path="/local-domain" element={<LocalDomain />} />
          <Route path="/" element={<SystemManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
