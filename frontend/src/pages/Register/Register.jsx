import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WebcamCapture from '../../components/WebcamCapture/WebcamCapture';
import { confirmUser, registerUser } from '../../services/authService';

function stripDataUrlPrefix(imageDataUrl) {
  return imageDataUrl.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, '');
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    dpi: '',
    password: '',
    confirmPassword: '',
  });
  const [imageMode, setImageMode] = useState('upload');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canRegister = useMemo(() => {
    return (
      form.fullName &&
      form.email &&
      form.dpi &&
      form.password &&
      form.confirmPassword &&
      imageDataUrl
    );
  }, [form, imageDataUrl]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Debes seleccionar un archivo de imagen.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result || ''));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const submitRegister = async (event) => {
    event.preventDefault();
    if (!canRegister) return;

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        ...form,
        imageBase64: stripDataUrlPrefix(imageDataUrl),
        contentType: 'image/jpeg',
        fileName: `${form.username || form.email}-profile.jpg`,
      };

      const result = await registerUser(payload);
      setPendingEmail(form.email);
      setMessage(result.message || 'Registro enviado. Revisa tu correo para confirmar.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const submitConfirmation = async (event) => {
    event.preventDefault();
    if (!pendingEmail || !confirmationCode) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await confirmUser({
        email: pendingEmail,
        confirmationCode,
      });

      setMessage(result.message || 'Cuenta confirmada exitosamente.');
      navigate('/login');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-cafeto-light via-white to-orange-100 py-12 px-4">
      <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        <article className="bg-white/90 border border-white shadow-xl rounded-2xl p-6 md:p-8">
          <h1 className="text-3xl font-black text-cafeto-dark">Registro</h1>
          <p className="text-sm text-slate-600 mt-2">
            Completa los datos obligatorios y agrega foto de perfil (webcam o archivo).
          </p>

          <form className="mt-6 space-y-3" onSubmit={submitRegister}>
            <input name="fullName" placeholder="Nombre completo" className="w-full rounded-lg border px-3 py-2" value={form.fullName} onChange={onChange} />
            <input name="username" placeholder="Nombre de usuario (opcional)" className="w-full rounded-lg border px-3 py-2" value={form.username} onChange={onChange} />
            <input name="email" type="email" placeholder="Correo electronico" className="w-full rounded-lg border px-3 py-2" value={form.email} onChange={onChange} />
            <input name="dpi" placeholder="DPI (13 digitos)" className="w-full rounded-lg border px-3 py-2" value={form.dpi} onChange={onChange} />
            <input name="password" type="password" placeholder="Contrasena" className="w-full rounded-lg border px-3 py-2" value={form.password} onChange={onChange} />
            <input name="confirmPassword" type="password" placeholder="Repetir contrasena" className="w-full rounded-lg border px-3 py-2" value={form.confirmPassword} onChange={onChange} />

            <div className="rounded-lg bg-slate-100 p-2 flex gap-2 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`flex-1 rounded-md py-2 ${imageMode === 'upload' ? 'bg-cafeto-dark text-white' : 'bg-white'}`}
              >
                Subir imagen
              </button>
              <button
                type="button"
                onClick={() => setImageMode('webcam')}
                className={`flex-1 rounded-md py-2 ${imageMode === 'webcam' ? 'bg-cafeto-dark text-white' : 'bg-white'}`}
              >
                Usar webcam
              </button>
            </div>

            {imageMode === 'upload' ? (
              <input type="file" accept="image/*" onChange={onFileSelect} className="w-full rounded-lg border px-3 py-2 bg-white" />
            ) : (
              <WebcamCapture onCapture={setImageDataUrl} disabled={isLoading} />
            )}

            {imageDataUrl ? (
              <img src={imageDataUrl} alt="Preview" className="rounded-lg border w-40 h-40 object-cover" />
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

            <button
              type="submit"
              disabled={!canRegister || isLoading}
              className="w-full rounded-lg bg-cafeto-red text-white py-2 font-bold disabled:opacity-50"
            >
              {isLoading ? 'Enviando...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-sm mt-4 text-slate-600">
            Ya tienes cuenta? <Link className="font-semibold text-cafeto-red" to="/login">Inicia sesion</Link>
          </p>
        </article>

        <article className="bg-white/90 border border-white shadow-xl rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-black text-cafeto-dark">Confirmar cuenta</h2>
          <p className="text-sm text-slate-600 mt-2">
            Ingresa el codigo enviado a tu correo para habilitar el login.
          </p>

          <form className="mt-6 space-y-3" onSubmit={submitConfirmation}>
            <input
              value={pendingEmail}
              onChange={(e) => setPendingEmail(e.target.value)}
              type="email"
              placeholder="Correo registrado"
              className="w-full rounded-lg border px-3 py-2"
            />
            <input
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              placeholder="Codigo de confirmacion"
              className="w-full rounded-lg border px-3 py-2"
            />

            <button
              type="submit"
              disabled={!pendingEmail || !confirmationCode || isLoading}
              className="w-full rounded-lg bg-cafeto-dark text-white py-2 font-bold disabled:opacity-50"
            >
              Confirmar cuenta
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}
