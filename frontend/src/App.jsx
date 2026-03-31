import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Placeholder page components
const Login = () => <div><h1>Login</h1><p>Login page placeholder</p></div>;
const Register = () => <div><h1>Register</h1><p>Register page placeholder</p></div>;
const Feed = () => <div><h1>Feed</h1><p>Feed page placeholder</p></div>;
const Profile = () => <div><h1>Profile</h1><p>Profile page placeholder</p></div>;
const Chat = () => <div><h1>Chat</h1><p>Chat page placeholder</p></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Feed />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
