import { useEffect, useMemo, useState } from 'react';
import { getSessionUser } from '../../services/session';
import { addPostComment, createPost, fetchPosts, translatePostText } from '../../services/postsService';
import { sendChatbotMessage } from '../../services/aiService';

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
  const [chatInput, setChatInput] = useState('');
  const [chatReply, setChatReply] = useState('');

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

  const onTranslatePost = async (postId) => {
    try {
      const { translated } = await translatePostText(postId, { targetLanguageCode: 'en' });
      alert(`Translated: ${translated?.translatedText || 'No text'}`);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const onAskChatbot = async (event) => {
    event.preventDefault();
    if (!chatInput) return;

    try {
      const response = await sendChatbotMessage({
        message: chatInput,
        userId: sessionUser?.id,
      });
      setChatReply(response.firstMessage || 'Sin respuesta del bot.');
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
    <main className="min-h-screen pt-24 pb-10 px-4 bg-[radial-gradient(circle_at_top_left,#f8f1eb,#fff7f0,#f5eee4)]">
      <section className="max-w-6xl mx-auto grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="space-y-6">
          <article className="bg-white/90 rounded-2xl border border-slate-200 shadow p-5">
            <h1 className="text-2xl font-extrabold text-cafeto-dark">Publicaciones</h1>
            <p className="text-sm text-slate-600 mt-1">Crea publicaciones, comenta y filtra por etiquetas detectadas.</p>

            <form className="mt-4 space-y-3" onSubmit={onCreatePost}>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descripcion opcional"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 min-h-24"
              />
              <input type="file" accept="image/*" onChange={onImageSelect} className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white" />
              {imageDataUrl ? <img src={imageDataUrl} alt="preview" className="w-40 h-40 rounded-xl object-cover border" /> : null}
              <button type="submit" className="rounded-xl px-4 py-2 bg-cafeto-red text-white font-bold disabled:opacity-50" disabled={!imageDataUrl || isLoading}>
                {isLoading ? 'Publicando...' : 'Crear publicacion'}
              </button>
            </form>
          </article>

          <article className="bg-white/90 rounded-2xl border border-slate-200 shadow p-5">
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-600">Buscar por descripcion</label>
                <input value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full mt-1 rounded-lg border px-3 py-2" />
              </div>
              <div className="md:w-52">
                <label className="text-sm font-semibold text-slate-600">Etiqueta</label>
                <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="w-full mt-1 rounded-lg border px-3 py-2 bg-white">
                  <option value="all">Todos</option>
                  {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              </div>
              <button onClick={applyFilters} className="rounded-lg bg-cafeto-dark text-white px-4 py-2 font-semibold">Filtrar</button>
            </div>
          </article>

          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onComment={onAddComment} onTranslate={onTranslatePost} />
            ))}
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <aside className="bg-white/90 rounded-2xl border border-slate-200 shadow p-5 h-fit sticky top-24">
          <h2 className="text-xl font-extrabold text-cafeto-dark">Chatbot Lex</h2>
          <p className="text-sm text-slate-600 mt-1">Consulta temas de la facultad desde aqui.</p>

          <form className="mt-4 space-y-3" onSubmit={onAskChatbot}>
            <textarea
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Pregunta al bot"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 min-h-24"
            />
            <button className="rounded-xl px-4 py-2 bg-cafeto-dark text-white font-bold">Preguntar</button>
          </form>

          {chatReply ? <p className="mt-4 text-sm text-slate-700 bg-slate-100 rounded-lg p-3">{chatReply}</p> : null}
        </aside>
      </section>
    </main>
  );
}

function PostCard({ post, onComment, onTranslate }) {
  const [comment, setComment] = useState('');

  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow overflow-hidden">
      <img src={post.imageUrl} alt="post" className="w-full max-h-96 object-cover" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-cafeto-dark">{post.username || 'Usuario'}</p>
            <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={() => onTranslate(post.id)} className="text-sm font-semibold text-cafeto-red">Traducir</button>
        </div>

        <p className="text-slate-700">{post.description || 'Sin descripcion'}</p>

        <div className="flex flex-wrap gap-2">
          {(post.tags || []).map((tag) => (
            <span key={`${post.id}-${tag.name}`} className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">#{tag.name}</span>
          ))}
        </div>

        <div className="space-y-2">
          {(post.comments || []).map((entry) => (
            <div key={entry.id} className="text-sm bg-slate-50 rounded-lg px-3 py-2">
              <span className="font-semibold">{entry.username}: </span>
              <span>{entry.content}</span>
            </div>
          ))}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            onComment(post.id, comment);
            setComment('');
          }}
        >
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Comentar"
            className="flex-1 rounded-lg border px-3 py-2"
          />
          <button className="rounded-lg bg-cafeto-dark text-white px-3 font-semibold">Enviar</button>
        </form>
      </div>
    </article>
  );
}
