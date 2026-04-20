import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WebcamCapture from '../../components/WebcamCapture/WebcamCapture';
import { loginFacial, loginUser } from '../../services/authService';
import { saveSession } from '../../services/session';

function stripDataUrlPrefix(imageDataUrl) {
  return imageDataUrl.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, '');
}

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('credentials');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submitCredentials = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await loginUser({ identifier, password });
      saveSession({ user: response.user, tokens: response.tokens });
      setMessage(response.message || 'Login correcto.');
      navigate('/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFacial = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await loginFacial({
        email,
        imageBase64: stripDataUrlPrefix(imageDataUrl),
      });

      saveSession({ user: response.user, tokens: null });
      setMessage(`Login facial correcto (similitud: ${Number(response.similarity).toFixed(2)}%)`);
      navigate('/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-orange-50 to-cafeto-light py-12 px-4">
      <section className="max-w-xl mx-auto bg-white/90 border border-white shadow-xl rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl font-black text-cafeto-dark">Iniciar sesion</h1>
        <p className="text-sm text-slate-600 mt-2">Usa credenciales o reconocimiento facial.</p>

        <div className="mt-6 rounded-lg bg-slate-100 p-2 flex gap-2 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 rounded-md py-2 ${activeTab === 'credentials' ? 'bg-cafeto-dark text-white' : 'bg-white'}`}
          >
            Credenciales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('facial')}
            className={`flex-1 rounded-md py-2 ${activeTab === 'facial' ? 'bg-cafeto-dark text-white' : 'bg-white'}`}
          >
            Facial
          </button>
        </div>

        {activeTab === 'credentials' ? (
          <form className="mt-6 space-y-3" onSubmit={submitCredentials}>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Correo o usuario"
              className="w-full rounded-lg border px-3 py-2"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Contrasena"
              className="w-full rounded-lg border px-3 py-2"
            />
            <button
              type="submit"
              disabled={!identifier || !password || isLoading}
              className="w-full rounded-lg bg-cafeto-red text-white py-2 font-bold disabled:opacity-50"
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-3" onSubmit={submitFacial}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Correo registrado"
              className="w-full rounded-lg border px-3 py-2"
            />
            <WebcamCapture onCapture={setImageDataUrl} disabled={isLoading} />
            {imageDataUrl ? (
              <img src={imageDataUrl} alt="Captura" className="rounded-lg border w-40 h-40 object-cover" />
            ) : null}

            <button
              type="submit"
              disabled={!email || !imageDataUrl || isLoading}
              className="w-full rounded-lg bg-cafeto-red text-white py-2 font-bold disabled:opacity-50"
            >
              Validar rostro
            </button>
          </form>
        )}

        {error ? <p className="text-sm text-red-600 mt-4">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700 mt-4">{message}</p> : null}

        <p className="text-sm mt-6 text-slate-600">
          No tienes cuenta? <Link className="font-semibold text-cafeto-red" to="/register">Registrate</Link>
        </p>
      </section>
    </main>
  );
}
