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
        ? 'text-white border-b-2 border-red-500' 
        : 'text-slate-400 hover:text-white'
    }`;

  return (
    <nav className="fixed top-0 w-full h-20 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-between px-12 border-b border-slate-800">
      {/* Brand - Restored Typography */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20 transform transition-transform hover:scale-105">
          <span className="text-white font-black text-2xl tracking-tighter">SS</span>
        </div>
        <span className="text-2xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 drop-shadow-md">
          Semi-Social
        </span>
      </div>

      {/* Navigation - Heuristic: Clear focus and hierarchy */}
      <div className="flex space-x-6 items-center">
        <NavLink to="/feed" className={getNavClass}>Inicio</NavLink>
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
