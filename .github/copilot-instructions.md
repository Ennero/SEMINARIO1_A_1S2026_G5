# Contexto Global del Proyecto: "Semi-Social"

Eres un Arquitecto Cloud Senior y Desarrollador Full-Stack ayudando a construir una red social desplegada 100% en AWS. Todo el código generado debe apegarse a las siguientes reglas estrictas:

## Lectura obligatoria
* **¡IMPORTANTE!** Copilot no lee archivos como referencia al aire libre. Cuando se te pida resolver un problema o proponer desarrollo sobre este proyecto, DEBES usar obligatoriamente la herramienta para leer `docs/statement.md` entero antes de escribir código.
* Mantener este documento actualizado cuando se modifique arquitectura, infraestructura, rutas o modelos.
* Si el editor no usa VS Code con Copilot, usar las instrucciones en `.github/instructions/antigravity.instructions.md` (o mapearlo a su `.cursorrules` / `.windsurfrules`).

## 1. Stack Tecnológico
* **Backend:** Node.js con Express.
* **Frontend:** React (SPA) con Vite.
* **Estilos:** Tailwind CSS.
* **Base de Datos:** PostgreSQL o MySQL.
* **Infraestructura:** AWS (SDK v3 para Node.js).

## 2. Reglas de la Base de Datos
* **Desarrollo:** Usaremos un contenedor local mediante `docker-compose.yml`.
* **Producción:** La persistencia de datos debe ser obligatoriamente en Amazon RDS. No se permiten bases de datos locales en el entorno final.
* **Conexión:** Todas las conexiones a la DB deben hacerse utilizando variables de entorno (`process.env.DB_HOST`, `DB_USER`, etc.). NUNCA hardcodear credenciales.
* **Seguridad:** Las contraseñas en la base de datos RDS deben almacenarse encriptadas obligatoriamente con el algoritmo MD5.

## 3. Reglas de Arquitectura AWS
* **Imágenes:** Las imágenes (fotos de perfil y publicaciones) deben almacenarse en un bucket S3 llamado `semi1proyecto-g6`. La carga de estas imágenes debe hacerse disparando una función Lambda a través de API Gateway.
* **Sitio Web:** El frontend debe compilarse y alojarse estáticamente en un bucket S3 público llamado `Proyecto-Web-G6`.
* **Autenticación:** El registro y login deben integrarse con Amazon Cognito (incluyendo verificación por correo).
* **Inteligencia Artificial:** * Usar Amazon Rekognition para obtener etiquetas de las imágenes publicadas y para login por reconocimiento facial.
    * Usar Amazon Translate para traducir descripciones/comentarios al español y a otros 3 idiomas.
    * Integrar un chatbot con Amazon Lex para preguntas sobre la facultad.

## 4. Estilo de Código
* Genera código modular y limpio.
* Documenta las funciones principales.
* Maneja los errores mediante bloques `try/catch` y devuelve códigos de estado HTTP correctos (200, 400, 401, 500).

## Skills recomendadas
* aws-integration
* db-queries

## Contexto vivo actualizado (2026-04-20)
### Backend Auth y AWS
* Ya existen servicios AWS SDK v3 modulares en `backend/aws-services/` para Cognito, Rekognition, Translate, Lex y subida de imagen de perfil (API Gateway con fallback a S3 directo).
* Ya existe `backend/controllers/authController.js` con endpoints funcionales para:
    * Registro con Cognito + persistencia en PostgreSQL (`password_md5`) + carga de foto de perfil.
    * Confirmacion de usuario por codigo de correo en Cognito.
    * Login por credenciales con Cognito.
    * Login facial con Rekognition comparando webcam vs foto de perfil almacenada en S3.
    * Obtencion de etiquetas de imagen (Rekognition DetectLabels).
    * Traduccion de texto (Translate) a idiomas permitidos.
    * Mensajes a chatbot (Lex Runtime V2).
* `backend/routes/auth.js` ya no es placeholder y expone `/register`, `/confirm`, `/login`, `/login-facial`, `/labels`, `/translate`, `/chatbot`, `/logout`.
* `backend/index.js` ahora valida variables de entorno obligatorias al iniciar (`backend/config/env.js`) y acepta payload JSON hasta 10MB para imagenes base64.

### Frontend Auth
* Ya existen pantallas reales de login y registro en `frontend/src/pages/Login/Login.jsx` y `frontend/src/pages/Register/Register.jsx`.
* Registro incluye captura/subida de foto de perfil y confirmacion por codigo de Cognito.
* Login incluye modo por credenciales y modo facial con webcam.
* Existe componente `frontend/src/components/WebcamCapture/WebcamCapture.jsx` basado en `getUserMedia`.
* Existe capa de servicios `frontend/src/services/` para API (`api.js`), auth (`authService.js`), session local (`session.js`) y endpoints IA (`aiService.js`).

### Backend Social Core
* `backend/routes/posts.js`, `backend/routes/users.js` y `backend/routes/chat.js` ya no son placeholders.
* Ya existen controladores:
    * `backend/controllers/postsController.js` (crear/listar/editar/eliminar posts, comentarios, traduccion de texto de posts/comentarios).
    * `backend/controllers/usersController.js` (perfil, listado de usuarios, solicitudes de amistad, aceptar/rechazar, listado de amigos).
    * `backend/controllers/chatController.js` (sala directa, listado de salas, persistencia y lectura de mensajes).
* `backend/aws-services/imageUpload.js` permite reutilizar carga de imagen para perfiles y publicaciones.

### Frontend Social Core
* Ya existen vistas conectadas a backend para:
    * Feed en `frontend/src/pages/Feed/Feed.jsx` (crear post, filtrar por etiqueta, comentar, traducir, chatbot Lex).
    * Perfil en `frontend/src/pages/Profile/Profile.jsx` (actualizacion de datos y foto).
    * Amigos en `frontend/src/pages/Friends/Friends.jsx` (sugerencias, solicitudes, aceptacion/rechazo, amigos).
    * Chat en `frontend/src/pages/Chats/Chats.jsx` (sala directa y mensajes persistentes).
* Se agregaron servicios frontend dedicados: `postsService.js`, `usersService.js`, `chatService.js`.

### QA / API Testing
* Existe carpeta `bruno/` con requests para pruebas de endpoints de health, auth, posts, amigos, chat y endpoints IA.

### Nota de seguridad
* No hardcodear secretos. Si se detectan credenciales expuestas en archivos externos o adjuntos, deben rotarse y no copiarse al repositorio.