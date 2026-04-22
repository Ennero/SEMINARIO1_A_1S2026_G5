import React, { useEffect, useMemo, useState } from 'react';
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
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [requests, setRequests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  const loadData = async () => {
    if (!sessionUser?.id) return;
    setLoading(true);

    try {
      const [usersData, requestsData, friendsData] = await Promise.all([
        fetchUsers(sessionUser.id),
        fetchIncomingRequests(sessionUser.id),
        fetchFriends(sessionUser.id),
      ]);

      // Sort by creation date or id descending to get the latest registered users
      const allUsers = usersData.users || [];
      const validRecommendations = allUsers.filter(u => {
        if (u.friendshipStatus === 'accepted') return false; // Ya son amigos
        return true;
      });
      const sortedRecs = validRecommendations.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setRecommendations(sortedRecs);
      setRequests(requestsData.requests || []);
      setFriends(friendsData.friends || []);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionUser?.id]);

  const filterList = (list) => {
    if (!searchQuery) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(item => 
      (item.username || '').toLowerCase().includes(query) || 
      (item.full_name || item.fullName || '').toLowerCase().includes(query)
    );
  };

  const filteredFriends = filterList(friends);
  const getFilteredRecommendations = () => {
    if (searchQuery) {
      return filterList(recommendations);
    }
    return recommendations.slice(0, 3);
  };
  const filteredRecommendations = getFilteredRecommendations();

  return (
    <div className="min-h-screen w-full pt-24 pb-16 px-6 bg-slate-900 flex flex-col items-center relative overflow-hidden font-sans">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-red-600/20 blur-[130px] rounded-full top-[-10%] right-[-10%] animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] bg-sky-500/20 blur-[120px] rounded-full bottom-[-10%] left-[-10%] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <Toast message={toastMessage} isVisible={toastVisible} type={toastType} onClose={() => setToastVisible(false)} />

      <div className="relative z-10 text-center mb-8 animate-fade-in-up max-w-3xl">
         <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
           Amigos
         </h1>
         <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed tracking-wide">
           Gestiona solicitudes y conecta con tu red.
         </p>
      </div>

      <div className="relative z-10 w-full max-w-5xl mb-8 animate-fade-in-up">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-xl p-4 flex items-center">
          <svg className="w-6 h-6 text-slate-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="Buscar amigos por nombre o usuario..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-slate-500 text-sm md:text-base"
          />
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">

        <div className="flex flex-col animate-fade-in-up [animation-delay:200ms] bg-slate-800/80 backdrop-blur-xl rounded-[2rem] border border-slate-700 shadow-2xl p-6">
          <h2 className="text-xl font-black mb-6 text-white border-b border-slate-700/50 pb-3">
            Solicitudes Pendientes
          </h2>
          <div className="space-y-3">
            {requests.map((req, i) => (
              <div key={`req-${req.id}`} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 transition-all duration-300 group hover:border-slate-600 hover:bg-slate-800" style={{animationDelay: `${(i * 0.1) + 0.3}s`}}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-white grid place-items-center font-black shadow-inner">{String(req.username || 'U').charAt(0).toUpperCase()}</div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">{req.username}</h3>
                    <p className="text-xs text-slate-400 font-medium">{req.full_name}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={async () => {
                      await answerFriendRequest(req.id, sessionUser.id, 'accept');
                      showToast(`${req.username} ahora es tu amigo`, 'success');
                      await loadData();
                    }}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl transition-all border border-emerald-500/20"
                    title="Aceptar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  </button>
                  <button 
                    onClick={async () => {
                      await answerFriendRequest(req.id, sessionUser.id, 'reject');
                      showToast(`${req.username} fue rechazado`, 'error');
                      await loadData();
                    }}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all border border-rose-500/20"
                    title="Rechazar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
            {!loading && requests.length === 0 ? <p className="text-sm text-slate-500 italic px-2">No hay solicitudes pendientes.</p> : null}
          </div>
        </div>

        <div className="flex flex-col animate-fade-in-up [animation-delay:400ms] bg-slate-800/80 backdrop-blur-xl rounded-[2rem] border border-slate-700 shadow-2xl p-6">
          <h2 className="text-xl font-black mb-6 text-white border-b border-slate-700/50 pb-3">
            Nuevos Usuarios
          </h2>
          <div className="space-y-3">
            {filteredRecommendations.map((rec, i) => {
              const myId = Number(sessionUser?.id);
              const isPendingSentByMe = rec.friendshipStatus === 'pending' && Number(rec.friendshipSenderId) === myId;
              const isPendingSentByThem = rec.friendshipStatus === 'pending' && Number(rec.friendshipSenderId) !== myId;

              return (
              <div key={`rec-${rec.id}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800 transition-all duration-300 group" style={{animationDelay: `${(i * 0.1) + 0.5}s`}}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-white grid place-items-center font-black shadow-lg">{String(rec.username || 'U').charAt(0).toUpperCase()}</div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">{rec.username}</h3>
                    <p className="text-xs text-slate-400 font-medium">{rec.fullName}</p>
                  </div>
                </div>
                {isPendingSentByMe ? (
                  <button disabled className="w-full sm:w-auto px-4 py-2 bg-slate-700/50 text-slate-400 font-bold text-xs rounded-xl shadow-md border border-slate-600 cursor-not-allowed transition-all">
                    Solicitud enviada
                  </button>
                ) : isPendingSentByThem ? (
                  <button 
                    onClick={async () => {
                      const reqItem = requests.find(r => Number(r.sender_id) === Number(rec.id));
                      if (reqItem) {
                        try {
                          await answerFriendRequest(reqItem.id, sessionUser.id, 'accept');
                          showToast(`Solicitud aceptada de ${rec.username}`, 'success');
                          await loadData();
                        } catch (err) {
                          showToast(err.message || 'Error al aceptar solicitud', 'error');
                        }
                      } else {
                        showToast('Error: No se encontró la solicitud', 'error');
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md border border-emerald-500 transition-all"
                  >
                    Aceptar solicitud
                  </button>
                ) : (
                  <button 
                    onClick={async () => {
                      await sendFriendRequest(rec.id, sessionUser.id);
                      showToast(`Solicitud enviada a ${rec.username}`, 'success');
                      await loadData();
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow-md border border-slate-600 transition-all"
                  >
                    Agregar
                  </button>
                )}
              </div>
            )})}
            {!loading && filteredRecommendations.length === 0 ? <p className="text-sm text-slate-500 italic px-2">No se encontraron sugerencias.</p> : null}
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col animate-fade-in-up [animation-delay:500ms] bg-slate-800/80 backdrop-blur-xl rounded-[2rem] border border-slate-700 shadow-2xl p-6 mt-4">
          <h2 className="text-xl font-black mb-6 text-white border-b border-slate-700/50 pb-3">
            Mis Amigos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFriends.map((entry) => (
              <div key={`friend-${entry.id}`} className="flex items-center gap-4 bg-slate-900/40 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-4 transition-all">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-600 to-blue-500 text-white grid place-items-center text-sm font-black shadow-lg">{String(entry.username || 'U').charAt(0).toUpperCase()}</div>
                <div>
                  <p className="text-sm font-bold text-white tracking-wide">{entry.username}</p>
                  <p className="text-xs text-slate-400 font-medium">{entry.full_name}</p>
                </div>
              </div>
            ))}
            {!loading && filteredFriends.length === 0 ? <p className="text-sm text-slate-500 italic px-2">No se encontraron amigos.</p> : null}
          </div>
        </div>

      </div>
    </div>
  );
}

