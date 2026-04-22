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
        <h1 className="text-3xl font-black text-white">Perfil</h1>
        <p className="text-sm text-slate-400 mt-2">Actualiza tus datos de cuenta y foto de perfil.</p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Nombre completo" className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-sm" />
          <input name="username" value={form.username} onChange={onChange} placeholder="Nombre de usuario" className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-sm" />
          <input name="dpi" value={form.dpi} onChange={onChange} placeholder="DPI" className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-sm" />
          <input name="password" value={form.password} onChange={onChange} placeholder="Contraseña para confirmar cambios" type="password" className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-sm" />
          <input type="file" accept="image/*" onChange={onImageSelect} className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-slate-400 px-4 py-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20 transition-all" />

          {imageDataUrl ? (
            <div className="pt-2">
              <img src={imageDataUrl} alt="preview" className="w-32 h-32 rounded-[1.5rem] object-cover border-2 border-slate-600 shadow-xl" />
            </div>
          ) : null}

          <div className="pt-4">
            <button disabled={isLoading} className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white px-8 py-3.5 font-bold shadow-lg shadow-red-500/30 disabled:opacity-50 transition-all">
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>

          {message ? <p className="text-sm text-emerald-400 bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-3">{message}</p> : null}
          {error ? <p className="text-sm text-red-400 bg-red-900/30 border border-red-500/30 rounded-xl p-3">{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
