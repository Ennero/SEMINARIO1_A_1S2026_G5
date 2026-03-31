import React, { useState } from 'react';
import Toast from '../../components/Toast/Toast';
import fondo from '../../assets/fondoFriends.png';
import p1 from '../../assets/profile1.png';
import p2 from '../../assets/profile2.png';
import p3 from '../../assets/profile3.png';

export default function Friends() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  const requests = [
    { id: 1, user: "juanperez", name: "Juan Perez", img: p1 },
    { id: 2, user: "marialopez", name: "Maria Lopez", img: p2 },
  ];

  const recommendations = [
    { id: 3, user: "cooldev", name: "Carlos Dev", img: p3 },
    { id: 4, user: "anagomez", name: "Ana Gomez", img: p1 },
  ];

  return (
    <div 
      className="min-h-screen w-full pt-32 pb-16 px-6 bg-cover bg-center bg-no-repeat bg-fixed flex flex-col items-center relative overflow-hidden"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

      <Toast message={toastMessage} isVisible={toastVisible} type={toastType} onClose={() => setToastVisible(false)} />
      
      {/* Header - Restored Typography & Soft Appearance */}
      <div className="relative z-10 text-center mb-12 animate-soft-appear max-w-3xl">
         <h1 className="text-6xl md:text-8xl font-black text-white mb-4 drop-shadow-xl tracking-tight" style={{fontFamily: "'Comic Sans MS', cursive, sans-serif"}}>
           Amigos
         </h1>
         <p className="text-xl md:text-2xl text-white/90 font-bold drop-shadow-lg leading-relaxed tracking-wide">
           Conecta con otros usuarios de forma rápida e intuitiva.
         </p>
      </div>

      {/* Grid Layout - Soft Appearance with Delays */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
        
        {/* Solicitudes */}
        <div className="flex flex-col animate-soft-appear [animation-delay:200ms]">
          <h2 className="text-2xl font-black mb-8 text-white drop-shadow-md border-b border-white/10 pb-2">
            Solicitudes Pendientes
          </h2>
          <div className="space-y-4">
            {requests.map((req, i) => (
              <div key={`req-${req.id}`} className="flex items-center justify-between bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5 hover:bg-white/20 transition-all duration-300 group" style={{animationDelay: `${(i * 0.1) + 0.3}s`}}>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                     <img src={req.img} alt={req.user} className="w-14 h-14 rounded-full object-cover border-2 border-white/40 shadow-md group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{req.user}</h3>
                    <p className="text-sm text-white/70 font-medium">{req.name}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => showToast(`${req.user} ahora es tu amigo`, 'success')}
                    className="p-2 bg-white/10 hover:bg-green-500/80 text-white rounded-xl transition-all border border-white/10"
                    title="Aceptar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  </button>
                  <button 
                    onClick={() => showToast(`${req.user} fue rechazado`, 'error')}
                    className="p-2 bg-white/10 hover:bg-red-500/80 text-white rounded-xl transition-all border border-white/10"
                    title="Rechazar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="flex flex-col animate-soft-appear [animation-delay:400ms]">
          <h2 className="text-2xl font-black mb-8 text-white drop-shadow-md border-b border-white/10 pb-2">
            Sugerencias
          </h2>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div key={`rec-${rec.id}`} className="flex items-center justify-between bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5 hover:bg-white/20 transition-all duration-300 group" style={{animationDelay: `${(i * 0.1) + 0.5}s`}}>
                <div className="flex items-center space-x-4">
                  <img src={rec.img} alt={rec.user} className="w-14 h-14 rounded-full object-cover border-2 border-white/40 shadow-md group-hover:scale-105 transition-transform" />
                  <div>
                    <h3 className="text-lg font-bold text-white">{rec.user}</h3>
                    <p className="text-sm text-white/70 font-medium">{rec.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => showToast(`A ${rec.user} se le envió la solicitud`, 'success')}
                  className="px-4 py-2 bg-white/15 hover:bg-white/30 text-white font-bold text-sm rounded-xl transition-all border border-white/10"
                >
                  Enviar Solicitud
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

