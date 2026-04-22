import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WebcamCapture from '../../components/WebcamCapture/WebcamCapture';
import { confirmUser, registerUser } from '../../services/authService';

function stripDataUrlPrefix(imageDataUrl) {
  return imageDataUrl.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, '');
}

function translateError(errorMsg) {
  if (!errorMsg) return '';
  const msg = errorMsg.toLowerCase();
  // Cognito errors
  if (msg.includes('password did not conform with policy')) return 'La contraseña no cumple con los requisitos (min 8 caracteres, mayúscula, número, símbolo).';
  if (msg.includes('user already exists')) return 'Ya existe una cuenta registrada con ese correo.';
  if (msg.includes('invalid email address')) return 'El formato del correo no es válido.';
  if (msg.includes('invalid verification code')) return 'El código de confirmación es inválido o ha expirado.';
  if (msg.includes('limit exceeded')) return 'Límite de intentos excedido. Intenta de nuevo más tarde.';
  if (msg.includes('validation')) return 'Error de validación en los datos.';
  return errorMsg; 
}

export default function Register() {
  const navigate = useNavigate();
  // Form states
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    dpi: '',
    password: '',
    confirmPassword: '',
  });
  const [imageMode, setImageMode] = useState('upload');
  const [imageDataUrl, setImageDataUrl] = useState('');
  
  // UI states
  const [step, setStep] = useState('register'); // 'register' | 'confirm'
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

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        ...form,
        imageBase64: stripDataUrlPrefix(imageDataUrl),
        contentType: 'image/jpeg',
        fileName: `${form.email.replace(/[@.]/g, '_')}-profile.jpg`,
      };

      await registerUser(payload);
      setPendingEmail(form.email);
      setMessage('Cuenta creada con éxito. Hemos enviado un código a tu correo.');
      setStep('confirm');
    } catch (requestError) {
      setError(translateError(requestError.message));
    } finally {
      setIsLoading(false);
    }
  };

  const submitConfirmation = async (event) => {
    event.preventDefault();
    if (!pendingEmail || !confirmationCode) return;

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await confirmUser({
        email: pendingEmail,
        confirmationCode,
      });

      setMessage('Cuenta verificada exitosamente. Redirigiendo a Login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (requestError) {
      setError(translateError(requestError.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 overflow-x-hidden font-sans relative flex flex-col items-center justify-center p-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-orange-600/20 blur-[120px] rounded-full top-[-10%] right-[-10%] animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] bg-red-600/20 blur-[130px] rounded-full bottom-[-10%] left-[-10%] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Link to="/" className="absolute top-8 left-8 text-slate-400 hover:text-white z-20 flex items-center gap-2 transition-colors">
        <span className="text-xl">←</span> Volver al inicio
      </Link>

      <section className="relative z-10 w-full max-w-xl mx-auto">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-[2rem] p-8 overflow-hidden transform transition-all duration-700">
          
          {step === 'register' ? (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white">Crear cuenta</h1>
                <p className="text-sm text-slate-400 mt-2">Únete a la comunidad de la Facultad</p>
              </div>

              <form className="space-y-4" onSubmit={submitRegister}>
                <div className="space-y-4">
                  <div>
                    <input name="fullName" placeholder="Nombre completo *" required className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-slate-500 text-sm" value={form.fullName} onChange={onChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input name="email" type="email" placeholder="Correo *" required className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-slate-500 text-sm" value={form.email} onChange={onChange} />
                  </div>
                  <div>
                    <input name="dpi" placeholder="DPI *" required className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-slate-500 text-sm" value={form.dpi} onChange={onChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input name="password" type="password" placeholder="Contraseña *" required className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-slate-500 text-sm" value={form.password} onChange={onChange} />
                  </div>
                  <div>
                    <input name="confirmPassword" type="password" placeholder="Repetir *" required className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-slate-500 text-sm" value={form.confirmPassword} onChange={onChange} />
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1 bg-slate-900/30 p-3 rounded-xl border border-slate-700/50 text-xs text-slate-400">
                  <p className="font-semibold text-slate-300 mb-1">Tu contraseña debe contener al menos:</p>
                  <p className="flex items-center gap-2"><span className={form.password.length >= 8 ? "text-emerald-400" : ""}>✓</span> 8 caracteres</p>
                  <p className="flex items-center gap-2"><span className={/[A-Z]/.test(form.password) ? "text-emerald-400" : ""}>✓</span> 1 letra mayúscula</p>
                  <p className="flex items-center gap-2"><span className={/[a-z]/.test(form.password) ? "text-emerald-400" : ""}>✓</span> 1 letra minúscula</p>
                  <p className="flex items-center gap-2"><span className={/[0-9]/.test(form.password) ? "text-emerald-400" : ""}>✓</span> 1 número</p>
                  <p className="flex items-center gap-2"><span className={/[^A-Za-z0-9]/.test(form.password) ? "text-emerald-400" : ""}>✓</span> 1 carácter especial (por ejemplo: ! @ # $)</p>
                </div>

                <div className="mt-6 mb-2">
                  <label className="block text-xs font-medium text-slate-400 mb-2">Foto de perfil (Requerida *)</label>
                  <div className="rounded-xl bg-slate-900/50 border border-slate-700 p-1 flex gap-1 mb-4 text-xs font-semibold">
                    <button type="button" onClick={() => setImageMode('upload')} className={`flex-1 rounded-lg py-2 transition-colors ${imageMode === 'upload' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                      Subir archivo
                    </button>
                    <button type="button" onClick={() => setImageMode('webcam')} className={`flex-1 rounded-lg py-2 transition-colors ${imageMode === 'webcam' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                      Usar webcam
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900/50 p-4 flex flex-col items-center">
                    {imageMode === 'upload' ? (
                      <input type="file" accept="image/*" onChange={onFileSelect} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
                    ) : (
                      <WebcamCapture onCapture={setImageDataUrl} disabled={isLoading} />
                    )}

                    {imageDataUrl && (
                      <div className="mt-4 pt-4 border-t border-slate-700 w-full flex flex-col items-center">
                        <p className="text-xs text-emerald-400 font-semibold mb-2">Imagen seleccionada:</p>
                        <img src={imageDataUrl} alt="Preview" className="rounded-full shadow-lg border-2 border-slate-600 w-24 h-24 object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-h-[20px]">
                  {error && <p className="text-xs text-red-500 text-center animate-fade-in">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={!canRegister || isLoading}
                  className="w-full mt-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white py-3.5 font-bold shadow-lg shadow-red-500/25 disabled:opacity-50 hover:-translate-y-[1px] transition-all"
                >
                  {isLoading ? 'Procesando...' : 'Crear cuenta'}
                </button>
              </form>

              <p className="text-sm mt-6 text-center text-slate-400 border-t border-slate-700/50 pt-6">
                ¿Ya tienes una cuenta? <Link className="font-semibold text-red-400 hover:text-red-300 transition-colors" to="/login">Inicia sesión</Link>
              </p>
            </div>
          ) : (
            <div className="animate-fade-in py-6">
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-3xl mb-4 border border-red-500/30">
                  ✉️
                </div>
                <h2 className="text-2xl font-black text-white">Verifica tu correo</h2>
                <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                  Ingresa el código temporal que hemos enviado a <br/>
                  <strong className="text-white">{pendingEmail}</strong>
                </p>
              </div>

              <form className="space-y-5" onSubmit={submitConfirmation}>
                <div>
                  <input
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    placeholder="Código de seguridad"
                    className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-4 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                  />
                </div>

                {error && <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-xl text-sm text-red-400 text-center animate-fade-in">{error}</div>}
                {message && <div className="p-3 bg-emerald-900/30 border border-emerald-500/30 rounded-xl text-sm text-emerald-400 text-center animate-fade-in">{message}</div>}

                <button
                  type="submit"
                  disabled={!confirmationCode || isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white py-3.5 font-bold shadow-lg shadow-red-500/25 disabled:opacity-50 hover:-translate-y-[1px] transition-all"
                >
                  {isLoading ? 'Verificando...' : 'Confirmar cuenta'}
                </button>
              </form>
              
              <button onClick={() => setStep('register')} className="mt-8 text-xs w-full text-center text-slate-500 hover:text-slate-300">
                ← Volver al registro
              </button>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
