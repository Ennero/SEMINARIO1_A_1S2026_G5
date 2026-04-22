import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WebcamCapture from '../../components/WebcamCapture/WebcamCapture';
import { loginFacial, loginUser } from '../../services/authService';
import { saveSession } from '../../services/session';

function stripDataUrlPrefix(imageDataUrl) {
  return imageDataUrl.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, '');
}

// Function to translate common Cognito/Backend connection errors
function translateError(errorMsg) {
  if (!errorMsg) return '';
  const msg = errorMsg.toLowerCase();
  if (msg.includes('incorrect username or password')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('user does not exist')) return 'El usuario no existe.';
  if (msg.includes('not authorized')) return 'No estás autorizado para realizar esta acción.';
  if (msg.includes('user is disabled')) return 'El usuario está deshabilitado.';
  if (msg.includes('validation')) return 'Error de validación de datos.';
  if (msg.includes('similarity')) return 'El rostro no coincide con el perfil registrado.';
  if (msg.includes('timeout')) return 'Tiempo de espera agotado. Verifica tu conexión.';
  return errorMsg; 
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

  const resetForm = () => {
    setError('');
    setMessage('');
    setImageDataUrl('');
  };

  const submitCredentials = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    resetForm();

    try {
      const response = await loginUser({ identifier, password });
      saveSession({ user: response.user, tokens: response.tokens });
      setMessage(response.message || 'Login exitoso.');
      setTimeout(() => navigate('/feed'), 800);
    } catch (requestError) {
      setError(translateError(requestError.message));
    } finally {
      setIsLoading(false);
    }
  };

  const submitFacial = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    resetForm();

    try {
      const response = await loginFacial({
        email,
        imageBase64: stripDataUrlPrefix(imageDataUrl),
      });

      saveSession({ user: response.user, tokens: null });
      setMessage(`Login facial exitoso (similitud: ${Number(response.similarity).toFixed(2)}%)`);
      setTimeout(() => navigate('/feed'), 1000);
    } catch (requestError) {
      setError(translateError(requestError.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 overflow-hidden font-sans relative flex flex-col items-center justify-center p-4">
      {/* Elementos flotantes decorativos */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-[400px] h-[400px] bg-red-600/30 blur-[120px] rounded-full top-[-10%] right-[-10%] animate-pulse"></div>
        <div className="absolute w-[400px] h-[400px] bg-sky-500/20 blur-[120px] rounded-full bottom-[-10%] left-[-10%] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Flecha p/ volver */}
      <Link to="/" className="absolute top-8 left-8 text-slate-400 hover:text-white z-20 flex items-center gap-2 transition-colors">
        <span className="text-xl">←</span> Volver al inicio
      </Link>

      <section className="relative z-10 w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-3xl p-8 transform transition-all duration-500 animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">Iniciar sesión</h1>
          <p className="text-sm text-slate-400 mt-2">Aprovecha el poder de la nube</p>
        </div>

        {/* Pestanas */}
        <div className="mb-6 rounded-xl bg-slate-900/50 p-1.5 flex text-sm font-semibold border border-slate-700/50 shadow-inner">
          <button
            type="button"
            onClick={() => { setActiveTab('credentials'); resetForm(); }}
            className={`flex-1 rounded-lg py-2.5 transition-all duration-300 ${activeTab === 'credentials' ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Credenciales
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('facial'); resetForm(); }}
            className={`flex-1 rounded-lg py-2.5 transition-all duration-300 ${activeTab === 'facial' ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Facial
          </button>
        </div>

        {activeTab === 'credentials' ? (
          <form className="space-y-5 animate-fade-in" onSubmit={submitCredentials}>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Correo electrónico</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Contraseña</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-slate-600"
              />
            </div>
            <button
              type="submit"
              disabled={!identifier || !password || isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white py-3.5 font-bold shadow-lg shadow-red-500/25 disabled:opacity-50 hover:-translate-y-[1px] transition-all"
            >
              {isLoading ? 'Conectando...' : 'Ingresar'}
            </button>
          </form>
        ) : (
          <form className="space-y-5 animate-fade-in" onSubmit={submitFacial}>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Correo electrónico registrado</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="ejemplo@correo.com"
                className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-slate-600"
              />
            </div>
            
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900/50 p-2">
               {/* Fix UI styling internal frame from the webcam capture internally vs here */}
              <WebcamCapture onCapture={setImageDataUrl} disabled={isLoading} />
              {imageDataUrl && (
                <div className="mt-3 flex flex-col items-center">
                  <p className="text-xs text-emerald-400 font-semibold mb-2">¡Rostro capturado exitosamente!</p>
                  <img src={imageDataUrl} alt="Captura" className="rounded-lg border border-slate-600 w-24 h-24 object-cover shadow-md" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!email || !imageDataUrl || isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-sky-500 hover:to-blue-400 text-white py-3.5 font-bold shadow-lg shadow-blue-500/25 disabled:opacity-50 hover:-translate-y-[1px] transition-all"
            >
              {isLoading ? 'Analizando rostro...' : 'Validar mediante IA'}
            </button>
          </form>
        )}

        {/* Mensajes de Alerta */}
        <div className="min-h-[40px] mt-4">
          {error && <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-xl text-sm text-red-400 animate-fade-in">{error}</div>}
          {message && <div className="p-3 bg-emerald-900/30 border border-emerald-500/30 rounded-xl text-sm text-emerald-400 flex items-center justify-center animate-fade-in">✅ {message}</div>}
        </div>

        <p className="text-sm mt-6 text-center text-slate-400 border-t border-slate-700/50 pt-6">
          ¿No tienes una cuenta aún?{' '}
          <Link className="font-semibold text-red-400 hover:text-red-300 transition-colors" to="/register">Regístrate ahora</Link>
        </p>
      </section>
    </main>
  );
}
