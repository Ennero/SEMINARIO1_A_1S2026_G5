import { useEffect, useMemo, useState } from 'react';
import { getSessionUser } from '../../services/session';
import { addPostComment, createPost, fetchPosts, translatePostText } from '../../services/postsService';

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

export default function Feed() {
  const sessionUser = useMemo(() => getSessionUser(), []);
  const [posts, setPosts] = useState([]);
  const [selectedTag, setSelectedTag] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [description, setDescription] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshPosts = async (opts = {}) => {
    try {
      setError('');
      const { posts: loadedPosts } = await fetchPosts(opts);
      setPosts(loadedPosts || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  const tags = useMemo(() => {
    const all = new Set();
    posts.forEach((post) => {
      (post.tags || []).forEach((tag) => all.add(tag.name));
    });
    return Array.from(all).sort();
  }, [posts]);

  const onImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Selecciona una imagen valida.');
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setImageDataUrl(dataUrl);
  };

  const onCreatePost = async (event) => {
    event.preventDefault();
    if (!sessionUser?.id || !imageDataUrl) {
      setError('Debes iniciar sesion y seleccionar imagen.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await createPost({
        userId: sessionUser.id,
        description,
        imageBase64: stripPrefix(imageDataUrl),
        contentType: 'image/jpeg',
        fileName: `post-${sessionUser.id}-${Date.now()}.jpg`,
      });

      setDescription('');
      setImageDataUrl('');
      await refreshPosts();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onAddComment = async (postId, content) => {
    if (!content || !sessionUser?.id) return;

    try {
      await addPostComment(postId, {
        userId: sessionUser.id,
        content,
      });
      await refreshPosts({ tag: selectedTag === 'all' ? undefined : selectedTag, q: searchText || undefined });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const applyFilters = async () => {
    await refreshPosts({
      tag: selectedTag === 'all' ? undefined : selectedTag,
      q: searchText || undefined,
    });
  };

  return (
    <main className="min-h-screen pt-24 pb-10 px-4 bg-slate-900 relative font-sans">
      {/* Fondo animado decorativo */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-red-600/20 blur-[120px] rounded-full top-[-10%] left-[-10%] animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] bg-sky-500/20 blur-[120px] rounded-full bottom-[-10%] right-[-10%] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <section className="relative z-10 max-w-4xl mx-auto flex flex-col gap-6">
        <div className="space-y-6">
          <article className="bg-slate-800/80 backdrop-blur-xl rounded-[2rem] border border-slate-700 shadow-2xl p-6">
            <h1 className="text-2xl font-black text-white">Publicaciones</h1>
            <p className="text-sm text-slate-400 mt-1">Crea publicaciones, comenta y filtra por etiquetas detectadas.</p>

            <form className="mt-4 space-y-3" onSubmit={onCreatePost}>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descripción opcional"
                className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all min-h-24 text-sm"
              />
              <input type="file" accept="image/*" onChange={onImageSelect} className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-slate-400 px-4 py-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20" />
              {imageDataUrl ? <img src={imageDataUrl} alt="preview" className="w-40 h-40 rounded-xl object-cover border border-slate-600 shadow-lg" /> : null}
              <button type="submit" className="rounded-xl px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white font-bold disabled:opacity-50 shadow-lg shadow-red-500/30 transition-all" disabled={!imageDataUrl || isLoading}>
                {isLoading ? 'Publicando...' : 'Crear publicación'}
              </button>
            </form>
          </article>

          <article className="bg-slate-800/80 backdrop-blur-xl rounded-[2rem] border border-slate-700 shadow-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Buscar por descripción</label>
                <input value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm placeholder-slate-500" placeholder="Buscar..." />
              </div>
              <div className="md:w-52">
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Etiqueta</label>
                <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm">
                  <option value="all">Todos</option>
                  {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              </div>
              <button onClick={applyFilters} className="rounded-xl bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 font-bold transition-colors text-sm border border-slate-600">Filtrar</button>
            </div>
          </article>

          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onComment={onAddComment} />
            ))}
          </div>

          {error ? <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-xl text-sm text-red-400 animate-fade-in">{error}</div> : null}
        </div>
      </section>
    </main>
  );
}

function PostCard({ post, onComment }) {
  const [comment, setComment] = useState('');
  const [translatedText, setTranslatedText] = useState(null);
  const [translatedComments, setTranslatedComments] = useState({});
  const [activeLang, setActiveLang] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const onTranslate = async (langCode) => {
    // Toggle off
    if (activeLang === langCode) {
      setActiveLang(null);
      setTranslatedText(null);
      setTranslatedComments({});
      return;
    }

    setIsTranslating(true);
    setActiveLang(langCode);

    try {
      const promises = [];
      
      // Translate Post Description
      if (post.description) {
        promises.push(
          translatePostText(post.id, { targetLanguageCode: langCode })
            .then(res => ({ type: 'post', text: res.translated?.translatedText }))
        );
      }

      // Translate all comments
      if (post.comments && post.comments.length > 0) {
        post.comments.forEach(c => {
          promises.push(
            translatePostText(post.id, { targetLanguageCode: langCode, commentId: c.id })
              .then(res => ({ type: 'comment', id: c.id, text: res.translated?.translatedText }))
          );
        });
      }

      const results = await Promise.all(promises);
      const newTranslatedComments = {};
      
      results.forEach(res => {
        if (res.type === 'post') setTranslatedText(res.text);
        if (res.type === 'comment') newTranslatedComments[res.id] = res.text;
      });

      setTranslatedComments(newTranslatedComments);
    } catch (err) {
      console.error(err);
      setTranslatedText('Error al traducir.');
    } finally {
      setIsTranslating(false);
    }
  };

  const LangButton = ({ code, label, flag }) => {
    const isActive = activeLang === code;
    return (
      <button 
        onClick={() => onTranslate(code)}
        disabled={isTranslating && !isActive}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all disabled:opacity-50
          ${isActive 
            ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
            : 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'}`}
      >
        <span>{flag}</span>
        <span>{label}</span>
      </button>
    );
  };

  return (
    <article className="bg-slate-800/80 backdrop-blur-xl rounded-[2rem] border border-slate-700 shadow-xl overflow-hidden hover:border-slate-600 transition-colors">
      <img src={post.imageUrl} alt="post" className="w-full max-h-[500px] object-cover border-b border-slate-700/50" />
      <div className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white text-lg">{post.username || 'Usuario'}</p>
            <p className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1 uppercase tracking-wider">Traducir:</span>
            <LangButton code="en" label="EN" flag="🇺🇸" />
            <LangButton code="it" label="IT" flag="🇮🇹" />
            <LangButton code="pt" label="PT" flag="🇧🇷" />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-slate-300 text-sm leading-relaxed">
            {post.description || <span className="italic text-slate-500">Sin descripción</span>}
          </p>
          {translatedText && (
            <p className="text-orange-300 text-sm leading-relaxed font-medium bg-orange-950/20 border-l-2 border-orange-500/50 pl-3 py-1 rounded-r-lg animate-fade-in">
              {translatedText}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {(post.tags || []).map((tag) => (
            <span key={`${post.id}-${tag.name}`} className="text-xs bg-slate-900/60 border border-slate-600 px-3 py-1 rounded-full text-slate-300 font-medium">#{tag.name}</span>
          ))}
        </div>

        {post.comments?.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-slate-700/50">
            {(post.comments || []).map((entry) => (
              <div key={entry.id} className="text-sm bg-slate-900/40 rounded-xl px-4 py-2.5 border border-slate-700/50">
                <span className="font-bold text-slate-200">{entry.username}: </span>
                <span className="text-slate-300">{entry.content}</span>
                {translatedComments[entry.id] && (
                  <p className="text-orange-300 text-xs font-medium mt-1.5 bg-orange-950/20 border-l-2 border-orange-500/50 pl-2 py-1 rounded-r-lg animate-fade-in">
                    {translatedComments[entry.id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <form
          className="flex gap-3 pt-2"
          onSubmit={(event) => {
            event.preventDefault();
            onComment(post.id, comment);
            setComment('');
          }}
        >
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1 rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-sm placeholder-slate-500 transition-all"
          />
          <button className="rounded-xl bg-slate-700 hover:bg-slate-600 text-white px-5 font-bold text-sm border border-slate-600 transition-colors">Enviar</button>
        </form>
      </div>
    </article>
  );
}
