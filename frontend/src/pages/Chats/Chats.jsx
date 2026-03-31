import React, { useState } from 'react';
import fondo from '../../assets/fondoFriends.png';
import p1 from '../../assets/profile1.png';
import p2 from '../../assets/profile2.png';
import p3 from '../../assets/profile3.png';

export default function Chats() {
  const [activeChat, setActiveChat] = useState(null);

  const friendsList = [
    { id: 1, user: "juanperez", name: "Juan Perez", img: p1 },
    { id: 2, user: "marialopez", name: "Maria Lopez", img: p2 },
    { id: 3, user: "carlosdev", name: "Carlos Dev", img: p3 },
    { id: 4, user: "anagomez", name: "Ana Gomez", img: p1 },
  ];

  const chatMessages = [
    { id: 1, text: "Hola, ¿cómo estás?", time: "31/3/2026 18:36", sender: "friend" },
    { id: 2, text: "¡Todo bien! ¿Y tú?", time: "31/3/2026 18:36", sender: "me" },
    { id: 3, text: "Excelente, trabajando en el proyecto de software.", time: "31/3/2026 18:37", sender: "friend" }
  ];

  return (
    <div 
      className="min-h-screen w-full pt-32 pb-10 px-8 flex items-center justify-center bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

      {/* Main Chat Container - Soft Appearance */}
      <div className="relative z-10 w-full max-w-6xl h-[80vh] flex shadow-2xl rounded-3xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-xl animate-soft-appear">
        
        {/* Left Side: Friends List */}
        <div className="w-1/3 min-w-[300px] flex flex-col border-r border-white/10 animate-soft-appear [animation-delay:200ms]">
          
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-4xl font-black text-white tracking-widest drop-shadow-md" style={{fontFamily: "'Comic Sans MS', cursive, sans-serif"}}>
              Chat
            </h2>
            <button className="text-white/60 hover:text-white transition-all bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {friendsList.map(friend => (
              <div 
                key={friend.id}
                onClick={() => setActiveChat(friend)}
                className={`flex items-center space-x-4 p-3 rounded-2xl cursor-pointer transition-all duration-200 border 
                  ${activeChat?.id === friend.id 
                    ? 'bg-white/15 border-white/20' 
                    : 'bg-transparent border-transparent hover:bg-white/5'
                  }`}
              >
                <img src={friend.img} alt={friend.user} className="w-12 h-12 rounded-full border border-white/20" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white truncate">{friend.user}</h3>
                  <p className="text-xs text-white/50 truncate font-medium">{friend.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="flex-1 flex flex-col bg-black/10 relative">
          {activeChat ? (
            <div className="flex flex-col h-full animate-fade-in">
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
                <div className="flex items-center space-x-4">
                  <img src={activeChat.img} alt={activeChat.user} className="w-10 h-10 rounded-full border border-white/20" />
                  <div>
                    <h2 className="text-lg font-bold text-white">{activeChat.user}</h2>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-xs text-white/50">Online</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm transition-all
                      ${msg.sender === 'me' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white/10 text-white border border-white/10 rounded-tl-none'}`}>
                      <p>{msg.text}</p>
                      <span className="text-[10px] opacity-50 mt-1 block text-right">{msg.time.split(' ')[1]}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 bg-white/5 border-t border-white/10">
                 <div className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 max-w-4xl mx-auto focus-within:border-white/30 transition-all">
                    <input 
                      type="text" 
                      placeholder="Escribe un mensaje..." 
                      className="flex-1 bg-transparent border-none text-white text-sm placeholder-white/30 focus:outline-none focus:ring-0"
                    />
                    <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                      <svg className="w-5 h-5 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
               <h1 className="text-2xl font-light text-white mb-4">Selecciona un chat para comenzar</h1>
               <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
