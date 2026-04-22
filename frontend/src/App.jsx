import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import Friends from './pages/Friends/Friends';
import Chats from './pages/Chats/Chats';
import NotFound from './pages/NotFound/NotFound';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Feed from './pages/Feed/Feed';
import Profile from './pages/Profile/Profile';
import { hasSession } from './services/session';
import Home from './pages/Home/Home';

const ProtectedRoute = ({ children }) => {
  if (!hasSession()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Layout with global navbar
const MainLayout = () => {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected/Main Routes requiring NavBar */}
        <Route
          element={(
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          )}
        >
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/chats" element={<Chats />} />
        </Route>
        
        {/* 404 Route without NavBar */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
