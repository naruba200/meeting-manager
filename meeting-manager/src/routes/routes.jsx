// src/route.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserList from '../pages/UserList.jsx';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserList />} />
        <Route path="/user-list" element={<UserList />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;