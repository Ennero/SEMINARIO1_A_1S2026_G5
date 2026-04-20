import React, { useEffect, useMemo, useState } from 'react';
import { getSessionUser } from '../../services/session';
import { fetchFriends } from '../../services/usersService';
import {
  fetchRoomMessages,
  getOrCreateDirectRoom,
  sendChatMessage,
} from '../../services/chatService';

export default function Chats() {
  const sessionUser = useMemo(() => getSessionUser(), []);
  const [activeFriend, setActiveFriend] = useState(null);
  const [friendsList, setFriendsList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadFriends() {
      if (!sessionUser?.id) return;

      try {
        const { friends } = await fetchFriends(sessionUser.id);
        setFriendsList(friends || []);
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadFriends();
  }, [sessionUser?.id]);

  const openChat = async (friend) => {
    setActiveFriend(friend);
    setError('');

    try {
      const roomData = await getOrCreateDirectRoom(sessionUser.id, friend.id);
      const currentRoomId = roomData.room?.id;
      setRoomId(currentRoomId);

      const messagesData = await fetchRoomMessages(currentRoomId, sessionUser.id);
      setMessages(messagesData.messages || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!roomId || !draft.trim()) return;

    try {
      await sendChatMessage({
        roomId,
        senderId: sessionUser.id,
        message: draft.trim(),
      });
      setDraft('');
      const messagesData = await fetchRoomMessages(roomId, sessionUser.id);
      setMessages(messagesData.messages || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="min-h-screen w-full pt-24 pb-10 px-4 md:px-8 flex items-center justify-center bg-[radial-gradient(circle_at_top_right,#f6efe8,#fff,#f2ebe2)] relative">
      <div className="relative z-10 w-full max-w-6xl h-[80vh] flex shadow-xl rounded-3xl overflow-hidden border border-slate-200 bg-white animate-soft-appear">

        <div className="w-1/3 min-w-[280px] flex flex-col border-r border-slate-200 animate-soft-appear [animation-delay:200ms]">

          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-3xl font-black text-cafeto-dark tracking-tight">
              Chat
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {friendsList.map(friend => (
              <div 
                key={friend.id}
                onClick={() => openChat(friend)}
                className={`flex items-center space-x-4 p-3 rounded-2xl cursor-pointer transition-all duration-200 border 
                  ${activeFriend?.id === friend.id 
                    ? 'bg-cafeto-light border-cafeto-orange/40' 
                    : 'bg-transparent border-transparent hover:bg-slate-100'
                  }`}
              >
                <div className="w-12 h-12 rounded-full bg-cafeto-dark text-white grid place-items-center font-bold">{String(friend.username || 'U').charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-cafeto-dark truncate">{friend.username}</h3>
                  <p className="text-xs text-slate-500 truncate font-medium">{friend.full_name}</p>
                </div>
              </div>
            ))}
            {friendsList.length === 0 ? <p className="text-sm text-slate-500">Aun no tienes amigos para chatear.</p> : null}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white relative">
          {activeFriend ? (
            <div className="flex flex-col h-full animate-fade-in">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 backdrop-blur-md">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-cafeto-dark text-white grid place-items-center font-semibold">{String(activeFriend.username || 'U').charAt(0).toUpperCase()}</div>
                  <div>
                    <h2 className="text-lg font-bold text-cafeto-dark">{activeFriend.username}</h2>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <p className="text-xs text-slate-500">Disponible</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[linear-gradient(180deg,#fff,#f7f7f7)]">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_id === sessionUser?.id ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm transition-all
                      ${msg.sender_id === sessionUser?.id 
                        ? 'bg-cafeto-dark text-white rounded-tr-none' 
                        : 'bg-slate-200 text-slate-800 border border-slate-300 rounded-tl-none'}`}>
                      <p>{msg.message}</p>
                      <span className="text-[10px] opacity-60 mt-1 block text-right">{new Date(msg.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200">
                 <form onSubmit={sendMessage} className="flex items-center space-x-3 bg-white border border-slate-300 rounded-2xl px-4 py-2 max-w-4xl mx-auto focus-within:border-cafeto-orange transition-all">
                    <input 
                      type="text" 
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Escribe un mensaje..." 
                      className="flex-1 bg-transparent border-none text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-0"
                    />
                    <button type="submit" className="p-2 text-slate-500 hover:text-cafeto-dark hover:bg-slate-100 rounded-xl transition-all">
                      <svg className="w-5 h-5 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                 </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-70">
               <h1 className="text-2xl font-light text-cafeto-dark mb-4">Selecciona un chat para comenzar</h1>
               <div className="w-16 h-16 border-2 border-slate-300 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
               </div>
            </div>
          )}
        </div>
      </div>
      {error ? <p className="fixed bottom-4 right-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2 rounded-lg">{error}</p> : null}
    </div>
  );
}
