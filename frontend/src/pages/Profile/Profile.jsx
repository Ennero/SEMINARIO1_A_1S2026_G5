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
    <main className="min-h-screen pt-24 pb-12 px-4 bg-[linear-gradient(135deg,#f6efe7,#fff,#f8f1eb)]">
      <section className="max-w-2xl mx-auto bg-white rounded-2xl shadow border border-slate-200 p-6">
        <h1 className="text-2xl font-extrabold text-cafeto-dark">Perfil</h1>
        <p className="text-sm text-slate-600 mt-1">Actualiza tus datos de cuenta y foto de perfil.</p>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Nombre completo" className="w-full rounded-lg border px-3 py-2" />
          <input name="username" value={form.username} onChange={onChange} placeholder="Nombre de usuario" className="w-full rounded-lg border px-3 py-2" />
          <input name="dpi" value={form.dpi} onChange={onChange} placeholder="DPI" className="w-full rounded-lg border px-3 py-2" />
          <input name="password" value={form.password} onChange={onChange} placeholder="Contrasena para confirmar cambios" type="password" className="w-full rounded-lg border px-3 py-2" />
          <input type="file" accept="image/*" onChange={onImageSelect} className="w-full rounded-lg border px-3 py-2 bg-white" />

          {imageDataUrl ? <img src={imageDataUrl} alt="preview" className="w-32 h-32 rounded-xl object-cover border" /> : null}

          <button disabled={isLoading} className="rounded-lg bg-cafeto-red text-white px-4 py-2 font-bold disabled:opacity-50">
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </button>

          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
