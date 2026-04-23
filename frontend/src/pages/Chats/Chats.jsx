import React, { useEffect, useMemo, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { getSessionUser } from '../../services/session';
import { fetchFriends } from '../../services/usersService';
import {
  fetchChatRooms,
  fetchRoomMessages,
  getOrCreateDirectRoom,
  sendChatMessage,
} from '../../services/chatService';

// Initialize socket outside component to avoid multiple connections
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  path: "/socket.io"
});

export default function Chats() {
  const sessionUser = useMemo(() => getSessionUser(), []);
  const [activeFriend, setActiveFriend] = useState(null);
  const [friendsList, setFriendsList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [roomId, setRoomId] = useState(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Register this user as online and listen for presence updates
  useEffect(() => {
    if (!sessionUser?.id) return;
    socket.emit('user_online', sessionUser.id);

    const handleOnlineUsers = (ids) => {
      setOnlineUserIds(new Set(ids.map(String)));
    };
    socket.on('online_users', handleOnlineUsers);
    return () => {
      socket.off('online_users', handleOnlineUsers);
    };
  }, [sessionUser?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function loadData() {
      if (!sessionUser?.id) return;

      try {
        const [friendsData, roomsData] = await Promise.all([
          fetchFriends(sessionUser.id),
          fetchChatRooms(sessionUser.id)
        ]);
        setFriendsList(friendsData.friends || []);
        setChatRooms(roomsData.rooms || []);
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadData();
  }, [sessionUser?.id]);

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      // room field in socket data may be string or number - compare as string
      if (String(data.room) === String(roomId)) {
        setMessages((prevMessages) => {
          if (prevMessages.some((msg) => msg.id === data.id)) return prevMessages;
          return [...prevMessages, data];
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [roomId]);

  const openChat = async (friend) => {
    setActiveFriend(friend);
    setError('');

    try {
      const roomData = await getOrCreateDirectRoom(sessionUser.id, friend.id);
      const currentRoomId = roomData.room?.id;
      setRoomId(currentRoomId);

      // join_room must be a string for socket.io rooms
      socket.emit('join_room', String(currentRoomId));

      const messagesData = await fetchRoomMessages(currentRoomId, sessionUser.id);
      setMessages(messagesData.messages || []);
      
      // Update chatrooms so sidebar stays in sync
      const roomsData = await fetchChatRooms(sessionUser.id);
      setChatRooms(roomsData.rooms || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!roomId || !draft.trim()) return;

    const messageText = draft.trim();
    setDraft('');

    try {
      const response = await sendChatMessage({
        roomId,
        senderId: sessionUser.id,
        message: messageText,
      });

      const newMessage = {
        id: response.chatMessage?.id || Date.now(),
        // room must be string to match socket room
        room: String(roomId),
        sender_id: sessionUser.id,
        message: messageText,
        created_at: new Date().toISOString(),
      };

      // Emit via socket — room field must match what join_room used
      socket.emit('send_message', newMessage);

      setMessages((prev) => [...prev, newMessage]);

    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="min-h-screen w-full pt-24 pb-10 px-4 md:px-8 flex items-center justify-center bg-slate-900 relative font-sans overflow-hidden">
      
      {/* Fondo animado decorativo */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-red-600/20 blur-[130px] rounded-full top-[-10%] right-[-10%] animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] bg-sky-500/20 blur-[120px] rounded-full bottom-[-10%] left-[-10%] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl h-[80vh] flex shadow-2xl rounded-[2rem] overflow-hidden border border-slate-700 bg-slate-800/80 backdrop-blur-xl animate-fade-in-up">

        <div className="w-1/3 min-w-[280px] flex flex-col border-r border-slate-700/50 bg-slate-900/30">

          <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/40">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Chats
            </h2>
            {friendsList.length > 0 && (
              <button onClick={() => setIsModalOpen(true)} className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors border border-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {chatRooms.map(room => {
              // participants may come as JSON strings from PostgreSQL's array_agg
              const rawParticipants = room.participants || [];
              const participants = rawParticipants.map(p => 
                typeof p === 'string' ? JSON.parse(p) : p
              );
              const friend = participants.find(p => Number(p.id) !== Number(sessionUser?.id)) || {};
              return (
              <div 
                key={`room-${room.id}`}
                onClick={() => openChat(friend)}
                className={`flex items-center space-x-4 p-3 rounded-2xl cursor-pointer transition-all duration-200 border 
                  ${activeFriend?.id === friend.id 
                    ? 'bg-slate-700/80 border-slate-500 shadow-lg' 
                    : 'bg-transparent border-transparent hover:bg-slate-700/40 hover:border-slate-600/50'
                  }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-white grid place-items-center font-bold shadow-inner">{String(friend.username || 'U').charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{friend.username}</h3>
                  <p className="text-xs text-slate-400 truncate font-medium">{friend.fullName || friend.full_name}</p>
                </div>
              </div>
            )})}
            {chatRooms.length === 0 ? <p className="text-sm text-slate-500 italic px-2">No tienes conversaciones activas. ¡Agrega amigos para chatear!</p> : null}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-transparent relative">
          {activeFriend ? (
            <div className="flex flex-col h-full animate-fade-in">
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/40 backdrop-blur-md">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-white grid place-items-center font-bold shadow-md">{String(activeFriend.username || 'U').charAt(0).toUpperCase()}</div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-wide">{activeFriend.username}</h2>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      {onlineUserIds.has(String(activeFriend.id)) ? (
                        <>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                          <p className="text-[11px] text-emerald-400 font-medium">En línea</p>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                          <p className="text-[11px] text-slate-500 font-medium">Desconectado</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_id === sessionUser?.id ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-md transition-all
                      ${msg.sender_id === sessionUser?.id 
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white rounded-tr-none shadow-red-500/20' 
                        : 'bg-slate-700 text-white border border-slate-600 rounded-tl-none'}`}>
                      <p>{msg.message}</p>
                      <span className="text-[10px] opacity-60 mt-1.5 block text-right">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-slate-900/40 border-t border-slate-700/50 backdrop-blur-md">
                 <form onSubmit={sendMessage} className="flex items-center space-x-3 bg-slate-800 border border-slate-600 rounded-2xl px-4 py-2 max-w-4xl mx-auto focus-within:border-red-500/50 focus-within:ring-1 focus-within:ring-red-500/50 transition-all shadow-inner">
                    <input 
                      type="text" 
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Escribe un mensaje..." 
                      className="flex-1 bg-transparent border-none text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-0"
                    />
                    <button type="submit" className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50" disabled={!draft.trim()}>
                      <svg className="w-5 h-5 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                 </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
               <div className="w-20 h-20 border-2 border-slate-600 rounded-full flex items-center justify-center mb-6 bg-slate-800/50 shadow-lg">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
               </div>
               <h1 className="text-xl font-bold text-white mb-2">Tus mensajes</h1>
               <p className="text-sm text-slate-400">Selecciona un chat para comenzar a enviar mensajes.</p>
            </div>
          )}
        </div>
      </div>
      {error ? <p className="fixed bottom-4 right-4 bg-red-900/80 backdrop-blur-md border border-red-500/50 text-red-200 text-sm px-4 py-3 rounded-xl shadow-2xl z-50 animate-fade-in-up">{error}</p> : null}
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-800 border border-slate-600 rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-xl font-black text-white mb-4">Nuevo Chat</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {friendsList.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No tienes amigos agregados aún. Agrega nuevos amigos para iniciar un chat.</p>
              ) : (
                friendsList.map(friend => (
                  <button 
                    key={`modal-friend-${friend.id}`}
                    onClick={() => {
                      setIsModalOpen(false);
                      openChat(friend);
                    }}
                    className="w-full flex items-center space-x-4 p-3 rounded-2xl cursor-pointer hover:bg-slate-700/50 border border-transparent hover:border-slate-600/50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-white grid place-items-center font-bold shadow-md">{String(friend.username || 'U').charAt(0).toUpperCase()}</div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{friend.username}</h3>
                      <p className="text-xs text-slate-400">{friend.full_name || friend.fullName}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
