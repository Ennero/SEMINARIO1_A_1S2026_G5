import React from 'react';
import { useNavigate } from 'react-router-dom';
import imgNotFound from '../../assets/fotoNotFound.png';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fdfdfd] p-6 text-center relative overflow-hidden">
      {/* Background decoration elements - Minimalist */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

      <div className="relative z-10 mb-6 animate-soft-appear">
        <h1 className="text-8xl md:text-9xl font-black text-blue-600/20 tracking-tighter absolute -top-20 left-1/2 -translate-x-1/2 select-none" style={{fontFamily: "'Comic Sans MS', cursive, sans-serif"}}>
          404
        </h1>
        <div className="flex justify-center relative">
           <div className="absolute inset-0 bg-blue-50/30 blur-[150px] rounded-full"></div>
           <img 
             src={imgNotFound} 
             alt="Página No Encontrada" 
             className="w-[350px] md:w-[600px] xl:w-[780px] max-w-[90vw] drop-shadow-2xl z-10 animate-float-subtle relative transform hover:scale-[1.02] transition-transform duration-700" 
           />
        </div>
      </div>

      <div className="animate-soft-appear [animation-delay:400ms] flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-black text-cafeto-dark mb-8 drop-shadow-sm" style={{fontFamily: "'Comic Sans MS', cursive, sans-serif"}}>
          ¡Upps! Te has perdido en el camino
        </h2>
        <button 
          onClick={() => navigate('/')}
          className="relative z-10 bg-blue-600 text-white font-bold text-xl px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:bg-blue-700 active:scale-95 transition-all duration-500"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}

