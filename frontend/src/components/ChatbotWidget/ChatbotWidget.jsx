import React, { useState } from 'react';
import { sendChatbotMessage } from '../../services/aiService';
import { getSessionUser } from '../../services/session';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionUser = getSessionUser();

  const toggleOpen = () => setIsOpen(!isOpen);

  const onAskChatbot = async (event) => {
    event.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setMessages((prev) => [...prev, { text: userMessage, sender: 'user' }]);
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await sendChatbotMessage({
        message: userMessage,
        userId: sessionUser?.id,
      });
      setMessages((prev) => [...prev, { text: response.firstMessage || 'Sin respuesta del bot.', sender: 'bot' }]);
    } catch (requestError) {
      setMessages((prev) => [...prev, { text: `Error: ${requestError.message}`, sender: 'bot', isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] max-h-[70vh] bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🤖</span>
              <h3 className="font-bold tracking-tight">Lex Assistant</h3>
            </div>
            <button onClick={toggleOpen} className="text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-900/30">
            {messages.length === 0 ? (
              <p className="text-slate-400 text-sm text-center mt-10">¡Hola! Soy tu asistente universitario. ¿En qué te puedo ayudar hoy?</p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : msg.isError ? 'bg-red-900/50 border border-red-500/50 text-red-200 rounded-tl-none' : 'bg-slate-700 text-white rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-white max-w-[80%] rounded-2xl rounded-tl-none px-4 py-2 text-sm flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={onAskChatbot} className="p-3 bg-slate-800 border-t border-slate-700/50 flex space-x-2">
            <input 
              type="text" 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              placeholder="Escribe tu pregunta..." 
              className="flex-1 bg-slate-900/50 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
            />
            <button type="submit" disabled={!chatInput.trim() || isLoading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl px-3 py-2 transition-colors">
              <svg className="w-4 h-4 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
        </div>
      )}
      
      <button 
        onClick={toggleOpen}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 ${isOpen ? 'bg-slate-700 text-white border border-slate-600' : 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-blue-500/30'}`}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>
    </div>
  );
}