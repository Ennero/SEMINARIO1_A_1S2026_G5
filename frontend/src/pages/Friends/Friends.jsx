import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast/Toast';
import { getSessionUser } from '../../services/session';
import {
  answerFriendRequest,
  fetchFriends,
  fetchIncomingRequests,
  fetchUsers,
  sendFriendRequest,
} from '../../services/usersService';

export default function Friends() {
  const sessionUser = useMemo(() => getSessionUser(), []);
  const navigate = useNavigate();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const [requests, setRequests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Buscador universal ───────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // usuario seleccionado del dropdown
  const searchDebounceRef = useRef(null);
  const searchRef = useRef(null);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // ── Carga principal ───────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!sessionUser?.id) return;
    setLoading(true);
    try {
      const [requestsData, friendsData, recData] = await Promise.all([
        fetchIncomingRequests(sessionUser.id),
        fetchFriends(sessionUser.id),
        fetchUsers(sessionUser.id),
      ]);
      setRequests(requestsData.requests || []);
      setFriends(friendsData.friends || []);

      const allUsers = recData.users || [];
      // "Nuevos usuarios" = no aceptados
      setRecommendations(
        allUsers.filter(u => u.friendshipStatus !== 'accepted').slice(0, 3)
      );
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [sessionUser?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Buscador: busca en el backend con debounce ────────────────────────────────
  const onSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSelectedUser(null);

    if (!val.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await fetchUsers(sessionUser.id, val.trim());
        setSearchResults(data.users || []);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Selección de usuario del dropdown ────────────────────────────────────────
  const onSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.username);
    setShowDropdown(false);
  };

  // ── Acción desde el panel de usuario seleccionado ────────────────────────────
  const isFriend = (user) => user?.friendshipStatus === 'accepted';
  const isPendingByMe = (user) =>
    user?.friendshipStatus === 'pending' && Number(user.friendshipSenderId) === Number(sessionUser?.id);
  const isPendingByThem = (user) =>
    user?.friendshipStatus === 'pending' && Number(user.friendshipSenderId) !== Number(sessionUser?.id);

  const handleGoToChat = () => {
    navigate('/chats');
  };

  const handleSendRequest = async (user) => {
    try {
      await sendFriendRequest(user.id, sessionUser.id);
      showToast(`Solicitud enviada a ${user.username}`, 'success');
      await loadData();
      // refresh selected user state
      const data = await fetchUsers(sessionUser.id, user.username);
      const refreshed = (data.users || []).find(u => Number(u.id) === Number(user.id));
      if (refreshed) setSelectedUser(refreshed);
    } catch (err) {
      showToast(err.message || 'Error al enviar solicitud', 'error');
    }
  };

  const handleAcceptFromSearch = async (user) => {
    const reqItem = requests.find(r => Number(r.sender_id) === Number(user.id));
    if (!reqItem) {
      // reload requests first
      const reqData = await fetchIncomingRequests(sessionUser.id);
      const fresh = (reqData.requests || []).find(r => Number(r.sender_id) === Number(user.id));
      if (!fresh) { showToast('No se encontró la solicitud', 'error'); return; }
      await answerFriendRequest(fresh.id, sessionUser.id, 'accept');
    } else {
      await answerFriendRequest(reqItem.id, sessionUser.id, 'accept');
    }
    showToast(`${user.username} ahora es tu amigo 🎉`, 'success');
    await loadData();
    const data = await fetchUsers(sessionUser.id, user.username);
    const refreshed = (data.users || []).find(u => Number(u.id) === Number(user.id));
    if (refreshed) setSelectedUser(refreshed);
  };

  // ── Status badge para combobox ────────────────────────────────────────────────
  const getUserStatusInfo = (user) => {
    if (isFriend(user)) return { label: 'Amigo · Ir al chat →', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: '💬' };
    if (isPendingByMe(user)) return { label: 'Solicitud enviada', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: '⏳' };
    if (isPendingByThem(user)) return { label: 'Te envió solicitud · Aceptar', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30', icon: '✉️' };
    return { label: 'Enviar solicitud', color: 'text-slate-400', bg: 'bg-slate-700/40 border-slate-600/30', icon: '➕' };
  };

  return (
    <div className="min-h-screen w-full pt-24 pb-16 px-6 bg-slate-900 flex flex-col items-center relative overflow-hidden font-sans">
      {/* BG Decorativo */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-red-600/20 blur-[130px] rounded-full top-[-10%] right-[-10%] animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] bg-sky-500/20 blur-[120px] rounded-full bottom-[-10%] left-[-10%] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <Toast message={toastMessage} isVisible={toastVisible} type={toastType} onClose={() => setToastVisible(false)} />

      {/* Título */}
      <div className="relative z-10 text-center mb-8 animate-fade-in-up max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">Amigos</h1>
        <p className="text-lg text-slate-400 font-medium leading-relaxed">Gestiona solicitudes y conecta con tu red.</p>
      </div>

      {/* ── Buscador universal ─── */}
      <div className="relative z-10 w-full max-w-5xl mb-8 animate-fade-in-up" ref={searchRef}>
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar usuario por nombre o @usuario en toda la plataforma…"
            value={searchQuery}
            onChange={onSearchChange}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-slate-500 text-sm"
          />
          {searchLoading ? (
            <svg className="w-4 h-4 text-slate-400 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : searchQuery ? (
            <button onClick={() => { setSearchQuery(''); setSelectedUser(null); setShowDropdown(false); setSearchResults([]); }} className="text-slate-500 hover:text-slate-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          ) : null}
        </div>

        {/* Dropdown de resultados */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-4 pt-3 pb-1">Usuarios encontrados — selecciona uno</p>
            {searchResults.map((user) => {
              const status = getUserStatusInfo(user);
              return (
                <button
                  key={`search-${user.id}`}
                  onClick={() => onSelectUser(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/60 transition-colors text-left group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-white grid place-items-center font-bold text-sm flex-shrink-0 shadow-md">
                    {String(user.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">@{user.username}</p>
                    <p className="text-xs text-slate-400 truncate">{user.fullName}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${status.bg} ${status.color} flex-shrink-0 whitespace-nowrap`}>
                    {status.icon} {status.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {showDropdown && searchResults.length === 0 && !searchLoading && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 px-4 py-5 text-center">
            <p className="text-sm text-slate-500 italic">No se encontraron usuarios con ese nombre o @usuario.</p>
          </div>
        )}
      </div>

      {/* ── Panel de acción para usuario seleccionado ─── */}
      {selectedUser && (
        <div className="relative z-10 w-full max-w-5xl mb-6 animate-fade-in-up">
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-600 shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-white grid place-items-center font-black text-xl shadow-lg flex-shrink-0">
              {String(selectedUser.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-black text-white">@{selectedUser.username}</p>
              <p className="text-sm text-slate-400">{selectedUser.fullName}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {isFriend(selectedUser) ? (
                <button
                  onClick={handleGoToChat}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 border border-emerald-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Ir al chat
                </button>
              ) : isPendingByMe(selectedUser) ? (
                <span className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500/10 text-amber-400 font-bold text-sm rounded-xl border border-amber-500/30 cursor-not-allowed">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Solicitud enviada
                </span>
              ) : isPendingByThem(selectedUser) ? (
                <button
                  onClick={() => handleAcceptFromSearch(selectedUser)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-sky-500/20 border border-sky-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  Aceptar solicitud
                </button>
              ) : (
                <button
                  onClick={() => handleSendRequest(selectedUser)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-red-500/20 border border-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                  Enviar solicitud de amistad
                </button>
              )}
              <button onClick={() => { setSelectedUser(null); setSearchQuery(''); }} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-sm rounded-xl transition-all border border-slate-600">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Grid principal ─── */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">

        {/* Solicitudes Pendientes */}
        <div className="flex flex-col animate-fade-in-up [animation-delay:200ms] bg-slate-800/80 backdrop-blur-xl rounded-[2rem] border border-slate-700 shadow-2xl p-6">
          <h2 className="text-xl font-black mb-6 text-white border-b border-slate-700/50 pb-3">
            Solicitudes Pendientes
            {requests.length > 0 && (
              <span className="ml-2 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">{requests.length}</span>
            )}
          </h2>
          <div className="space-y-3">
            {requests.map((req, i) => (
              <div key={`req-${req.id}`} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800 transition-all" style={{ animationDelay: `${(i * 0.1) + 0.3}s` }}>
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-white grid place-items-center font-black shadow-inner">
                    {String(req.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">@{req.username}</h3>
                    <p className="text-xs text-slate-400">{req.full_name}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={async () => {
                      try {
                        await answerFriendRequest(req.id, sessionUser.id, 'accept');
                        showToast(`${req.username} ahora es tu amigo 🎉`, 'success');
                        await loadData();
                      } catch (err) {
                        showToast(err.message || 'Error al aceptar', 'error');
                      }
                    }}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl transition-all border border-emerald-500/20"
                    title="Aceptar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await answerFriendRequest(req.id, sessionUser.id, 'reject');
                        showToast(`Solicitud de @${req.username} rechazada`, 'error');
                        await loadData();
                      } catch (err) {
                        showToast(err.message || 'Error al rechazar', 'error');
                      }
                    }}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all border border-rose-500/20"
                    title="Rechazar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
            {!loading && requests.length === 0 && (
              <p className="text-sm text-slate-500 italic px-2">No hay solicitudes pendientes.</p>
            )}
          </div>
        </div>

        {/* Nuevos Usuarios */}
        <div className="flex flex-col animate-fade-in-up [animation-delay:400ms] bg-slate-800/80 backdrop-blur-xl rounded-[2rem] border border-slate-700 shadow-2xl p-6">
          <h2 className="text-xl font-black mb-6 text-white border-b border-slate-700/50 pb-3">Nuevos Usuarios</h2>
          <div className="space-y-3">
            {recommendations.map((rec, i) => {
              const myId = Number(sessionUser?.id);
              const isPendingSentByMe = rec.friendshipStatus === 'pending' && Number(rec.friendshipSenderId) === myId;
              const isPendingSentByThem = rec.friendshipStatus === 'pending' && Number(rec.friendshipSenderId) !== myId;

              return (
                <div key={`rec-${rec.id}`} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800 transition-all" style={{ animationDelay: `${(i * 0.1) + 0.5}s` }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-white grid place-items-center font-black shadow-lg">
                      {String(rec.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">@{rec.username}</h3>
                      <p className="text-xs text-slate-400">{rec.fullName}</p>
                    </div>
                  </div>
                  {isPendingSentByMe ? (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold">Enviado</span>
                  ) : isPendingSentByThem ? (
                    <button
                      onClick={async () => {
                        const reqItem = requests.find(r => Number(r.sender_id) === Number(rec.id));
                        if (reqItem) {
                          try {
                            await answerFriendRequest(reqItem.id, sessionUser.id, 'accept');
                            showToast(`Solicitud de @${rec.username} aceptada`, 'success');
                            await loadData();
                          } catch (err) {
                            showToast(err.message || 'Error al aceptar', 'error');
                          }
                        }
                      }}
                      className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 px-3 py-1.5 rounded-xl font-bold transition-all"
                    >
                      Aceptar
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          await sendFriendRequest(rec.id, sessionUser.id);
                          showToast(`Solicitud enviada a @${rec.username}`, 'success');
                          await loadData();
                        } catch (err) {
                          showToast(err.message || 'Error al enviar', 'error');
                        }
                      }}
                      className="text-[10px] bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 px-3 py-1.5 rounded-xl font-bold transition-all"
                    >
                      Agregar
                    </button>
                  )}
                </div>
              );
            })}
            {!loading && recommendations.length === 0 && (
              <p className="text-sm text-slate-500 italic px-2">No hay nuevos usuarios disponibles.</p>
            )}
          </div>
        </div>

        {/* Mis Amigos */}
        <div className="md:col-span-2 flex flex-col animate-fade-in-up [animation-delay:500ms] bg-slate-800/80 backdrop-blur-xl rounded-[2rem] border border-slate-700 shadow-2xl p-6 mt-4">
          <h2 className="text-xl font-black mb-6 text-white border-b border-slate-700/50 pb-3">
            Mis Amigos
            {friends.length > 0 && (
              <span className="ml-2 text-xs bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full px-2 py-0.5">{friends.length}</span>
            )}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((entry) => (
              <button
                key={`friend-${entry.id}`}
                onClick={() => navigate('/chats')}
                className="flex items-center gap-4 bg-slate-900/40 border border-slate-700/50 hover:border-emerald-500/40 hover:bg-slate-800/80 rounded-2xl p-4 transition-all text-left group"
                title="Ir al chat"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-600 to-blue-500 text-white grid place-items-center text-sm font-black shadow-lg">
                  {String(entry.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">@{entry.username}</p>
                  <p className="text-xs text-slate-400">{entry.full_name}</p>
                </div>
                <svg className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            ))}
            {!loading && friends.length === 0 && (
              <p className="text-sm text-slate-500 italic px-2 col-span-3">Aún no tienes amigos. ¡Usa el buscador para encontrarlos!</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
