import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { clearSession } from '../../services/session';

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const getNavClass = ({ isActive }) => 
    `relative px-4 py-2 font-semibold text-base transition-all duration-300 ${
      isActive 
        ? 'text-white border-b-2 border-white' 
        : 'text-white/60 hover:text-white'
    }`;

  return (
    <nav className="fixed top-0 w-full h-20 bg-black/40 backdrop-blur-md z-50 flex items-center justify-between px-12 border-b border-white/5">
      {/* Brand - Restored Typography */}
      <div className="flex items-center space-x-4">
        <img src={logo} alt="Logo" className="h-14 w-auto object-contain transition-transform hover:scale-110" />
        <span className="text-2xl font-black tracking-wider text-white drop-shadow-md" style={{fontFamily: "'Comic Sans MS', cursive, sans-serif"}}>
          Semi-Social
        </span>
      </div>

      {/* Navigation - Heuristic: Clear focus and hierarchy */}
      <div className="flex space-x-6 items-center">
        <NavLink to="/" className={getNavClass}>Inicio</NavLink>
        <NavLink to="/profile" className={getNavClass}>Perfil</NavLink>
        <NavLink to="/friends" className={getNavClass}>Amigos</NavLink>
        <NavLink to="/chats" className={getNavClass}>Chats</NavLink>
        
        {/* Logout - Balanced and clear action */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-5 py-2 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-red-500/80 transition-all border border-white/10 ml-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Salir</span>
        </button>
      </div>
    </nav>
  );
}
