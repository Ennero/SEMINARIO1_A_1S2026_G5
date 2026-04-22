import { useEffect, useState } from 'react';
import { getSessionUser, saveSession } from '../../services/session';
import { fetchProfile, updateProfile } from '../../services/usersService';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function stripPrefix(dataUrl) {
  return String(dataUrl || '').replace(/^data:image\/[a-zA-Z+.-]+;base64,/, '');
}

export default function Profile() {
  const [sessionUser, setSessionUser] = useState(getSessionUser());
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    dpi: '',
    username: '',
    password: '',
  });
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!sessionUser?.id) return;

      try {
        const { user } = await fetchProfile(sessionUser.id);
        setForm({
          fullName: user.fullName || '',
          dpi: user.dpi || '',
          username: user.username || '',
          password: '',
        });
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    load();
  }, [sessionUser?.id]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setImageDataUrl(dataUrl);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!sessionUser?.id) return;

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        fullName: form.fullName,
        dpi: form.dpi,
        username: form.username,
      };

      if (form.password) {
        payload.password = form.password;
      }

      if (imageDataUrl) {
        payload.imageBase64 = stripPrefix(imageDataUrl);
        payload.contentType = 'image/jpeg';
        payload.fileName = `profile-${sessionUser.id}-${Date.now()}.jpg`;
      }

      const { user } = await updateProfile(sessionUser.id, payload);
      setSessionUser(user);
      saveSession({ user, tokens: null });
      setMessage('Perfil actualizado correctamente.');
      setForm((prev) => ({ ...prev, password: '' }));
      setImageDataUrl('');
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 bg-slate-900 relative font-sans">
      {/* Background orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-red-600/20 blur-[130px] rounded-full top-[-10%] right-[-10%] animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] bg-sky-500/20 blur-[120px] rounded-full bottom-[-10%] left-[-10%] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <section className="relative z-10 max-w-2xl mx-auto bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-700 p-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-black text-white">Perfil</h1>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-xl border border-slate-600 transition-colors">
              Editar Perfil
            </button>
          )}
        </div>
        <p className="text-sm text-slate-400">Actualiza tus datos de cuenta y foto de perfil.</p>

        {!isEditing ? (
          <div className="mt-8 space-y-6">
            <div className="flex items-center space-x-6">
              <img src={sessionUser?.profileImageUrl || `https://ui-avatars.com/api/?name=${sessionUser?.fullName || 'User'}&background=random`} alt="Perfil" className="w-32 h-32 rounded-[1.5rem] object-cover border-2 border-slate-600 shadow-xl" />
              <div>
                <h2 className="text-2xl font-bold text-white">{form.fullName}</h2>
                <p className="text-slate-400">@{form.username}</p>
                <p className="text-sm text-slate-500 mt-1">DPI: {form.dpi}</p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-4 animate-fade-in-up" onSubmit={onSubmit}>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Nombre Completo</label>
              <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Nombre completo" className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Nombre de Usuario</label>
              <input name="username" value={form.username} onChange={onChange} placeholder="Nombre de usuario" className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">DPI</label>
              <input name="dpi" value={form.dpi} onChange={onChange} placeholder="DPI" className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Contraseña (Obligatorio para guardar)</label>
              <input name="password" value={form.password} onChange={onChange} placeholder="Contraseña para confirmar cambios" type="password" className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Foto de Perfil</label>
              <input type="file" accept="image/*" onChange={onImageSelect} className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-slate-400 px-4 py-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20 transition-all" />
            </div>

            {imageDataUrl ? (
              <div className="pt-2">
                <img src={imageDataUrl} alt="preview" className="w-32 h-32 rounded-[1.5rem] object-cover border-2 border-slate-600 shadow-xl" />
              </div>
            ) : null}

            <div className="pt-4 flex gap-4">
              <button disabled={isLoading} className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white px-8 py-3.5 font-bold shadow-lg shadow-red-500/30 disabled:opacity-50 transition-all">
                {isLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none rounded-xl bg-slate-700 hover:bg-slate-600 text-white px-8 py-3.5 font-bold shadow-lg border border-slate-600 transition-all">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {message ? <p className="mt-4 text-sm text-emerald-400 bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-3 animate-fade-in">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-400 bg-red-900/30 border border-red-500/30 rounded-xl p-3 animate-fade-in">{error}</p> : null}
      </section>
    </main>
  );
}
