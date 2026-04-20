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

      setRecommendations(usersData.users || []);
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

  return (
    <div className="min-h-screen w-full pt-24 pb-16 px-6 bg-[linear-gradient(135deg,#f8f1eb,#fff,#f4efe8)] flex flex-col items-center relative overflow-hidden">

      <Toast message={toastMessage} isVisible={toastVisible} type={toastType} onClose={() => setToastVisible(false)} />

      <div className="relative z-10 text-center mb-12 animate-soft-appear max-w-3xl">
         <h1 className="text-5xl md:text-6xl font-black text-cafeto-dark mb-4 tracking-tight">
           Amigos
         </h1>
         <p className="text-lg md:text-xl text-slate-600 font-semibold leading-relaxed tracking-wide">
           Gestiona solicitudes y conecta con tu red.
         </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">

        <div className="flex flex-col animate-soft-appear [animation-delay:200ms] bg-white rounded-2xl border border-slate-200 shadow p-4">
          <h2 className="text-xl font-black mb-4 text-cafeto-dark border-b border-slate-200 pb-2">
            Solicitudes Pendientes
          </h2>
          <div className="space-y-4">
            {requests.map((req, i) => (
              <div key={`req-${req.id}`} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 transition-all duration-300 group" style={{animationDelay: `${(i * 0.1) + 0.3}s`}}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-cafeto-dark text-white grid place-items-center font-bold">{String(req.username || 'U').charAt(0).toUpperCase()}</div>
                  <div>
                    <h3 className="text-base font-bold text-cafeto-dark">{req.username}</h3>
                    <p className="text-xs text-slate-500 font-medium">{req.full_name}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={async () => {
                      await answerFriendRequest(req.id, sessionUser.id, 'accept');
                      showToast(`${req.username} ahora es tu amigo`, 'success');
                      await loadData();
                    }}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all"
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
                    className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all"
                    title="Rechazar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
            {!loading && requests.length === 0 ? <p className="text-sm text-slate-500">No hay solicitudes pendientes.</p> : null}
          </div>
        </div>

        <div className="flex flex-col animate-soft-appear [animation-delay:400ms] bg-white rounded-2xl border border-slate-200 shadow p-4">
          <h2 className="text-xl font-black mb-4 text-cafeto-dark border-b border-slate-200 pb-2">
            Sugerencias
          </h2>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div key={`rec-${rec.id}`} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all duration-300 group" style={{animationDelay: `${(i * 0.1) + 0.5}s`}}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-cafeto-red text-white grid place-items-center font-bold">{String(rec.username || 'U').charAt(0).toUpperCase()}</div>
                  <div>
                    <h3 className="text-base font-bold text-cafeto-dark">{rec.username}</h3>
                    <p className="text-xs text-slate-500 font-medium">{rec.fullName}</p>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    await sendFriendRequest(rec.id, sessionUser.id);
                    showToast(`Solicitud enviada a ${rec.username}`, 'success');
                  }}
                  className="px-3 py-2 bg-cafeto-dark hover:bg-cafeto-base text-white font-bold text-sm rounded-xl transition-all"
                >
                  Enviar Solicitud
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col animate-soft-appear [animation-delay:500ms] bg-white rounded-2xl border border-slate-200 shadow p-4">
          <h2 className="text-xl font-black mb-4 text-cafeto-dark border-b border-slate-200 pb-2">
            Amigos
          </h2>
          <div className="space-y-2">
            {friends.map((entry) => (
              <div key={`friend-${entry.id}`} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <div className="w-9 h-9 rounded-full bg-cafeto-dark text-white grid place-items-center text-sm font-bold">{String(entry.username || 'U').charAt(0).toUpperCase()}</div>
                <div>
                  <p className="text-sm font-bold text-cafeto-dark">{entry.username}</p>
                  <p className="text-xs text-slate-500">{entry.full_name}</p>
                </div>
              </div>
            ))}
            {!loading && friends.length === 0 ? <p className="text-sm text-slate-500">Todavia no tienes amigos.</p> : null}
          </div>
        </div>

      </div>
    </div>
  );
}

