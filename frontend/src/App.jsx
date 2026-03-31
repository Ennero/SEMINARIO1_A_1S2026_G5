import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import Friends from './pages/Friends/Friends';
import Chats from './pages/Chats/Chats';
import NotFound from './pages/NotFound/NotFound';

// Placeholder page components for remaining routes
const Login = () => <div className="pt-24 text-center"><h1>Login</h1></div>;
const Register = () => <div className="pt-24 text-center"><h1>Register</h1></div>;
const Feed = () => <div className="pt-24 text-center"><h1>Home / Feed</h1></div>;
const Profile = () => <div className="pt-24 text-center"><h1>Profile</h1></div>;

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected/Main Routes requiring NavBar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Feed />} />
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
