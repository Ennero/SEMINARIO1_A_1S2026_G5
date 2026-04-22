import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hasSession } from '../../services/session';

export default function Home() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Si ya tiene sesión, mandarlo al feed automáticamente
    if (hasSession()) {
      navigate('/feed', { replace: true });
    }
    // Activar animacion suave al montar
    setTimeout(() => setIsVisible(true), 100);
  }, [navigate]);

  return (
    <main className="min-h-screen bg-slate-900 overflow-hidden font-sans relative flex flex-col items-center justify-center">
      {/* Fondo animado decorativo */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-[500px] h-[500px] bg-cafeto-red/20 blur-[100px] rounded-full top-[-10%] left-[-10%] animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] bg-sky-500/20 blur-[100px] rounded-full bottom-[-10%] right-[-10%] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <section className={`relative z-10 max-w-5xl w-full mx-auto px-6 py-20 text-center transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
          Bienvenido a <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 drop-shadow-xl">Semi-Social</span>
        </h1>
        <p className="text-lg md:text-2xl text-slate-300 font-light max-w-2xl mx-auto mb-12">
          La red social moderna diseñada para la comunidad de la Facultad de Ingeniería. 
          Conecta, comparte y comunícate utilizando el poder de la nube tecnológica.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16 text-left">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700 hover:border-slate-500 transition-colors">
            <div className="text-red-400 text-3xl mb-4">🌍</div>
            <h3 className="text-xl font-bold text-white mb-2">Múltiples Idiomas</h3>
            <p className="text-slate-400 text-sm">Comparte tus publicaciones y conecta con personas de otras culturas mediante traducción automática.</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700 hover:border-slate-500 transition-colors">
            <div className="text-red-400 text-3xl mb-4">🤳</div>
            <h3 className="text-xl font-bold text-white mb-2">Ingreso Seguro</h3>
            <p className="text-slate-400 text-sm">Entra a tu cuenta rápido y fácil usando solo tu rostro de forma segura y sin contraseñas.</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700 hover:border-slate-500 transition-colors">
            <div className="text-red-400 text-3xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-white mb-2">Asistente Virtual</h3>
            <p className="text-slate-400 text-sm">Resuelve dudas sobre la facultad y recibe ayuda al instante de nuestro asistente inteligente.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-full shadow-lg shadow-red-500/30 transform hover:-translate-y-1 transition-all duration-300">
            Iniciar Sesión
          </Link>
          <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold rounded-full transform hover:-translate-y-1 transition-all duration-300">
            Crear Cuenta
          </Link>
        </div>
      </section>

      <footer className="absolute bottom-4 text-slate-500 text-sm">
        &copy; 2026 - Seminario de Sistemas 1 - Grupo 6
      </footer>
    </main>
  );
}
