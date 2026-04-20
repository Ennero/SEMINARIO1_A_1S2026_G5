# Manual Tecnico - Semi-Social

## 1. Integrantes
- 202302220 - Enner Esai Mendizabal Castro
- 202200129 - Luis Pablo Manuel Garcia Lopez
- 202000886 - Jose Ricardo Menocal Kong
- 202006633 - Katherin Alejandra Galvez Chiroy
- 202300601 - Diego Alessandro Constanza Padilla
- 202300636 - Jose Emilio Morales Castillo

## 2. Resumen Arquitectonico
La solucion sigue una arquitectura SPA + API REST + servicios AWS:

- Frontend React (Vite) en `frontend/`.
- Backend Node.js + Express en `backend/`.
- Persistencia PostgreSQL (dev: Docker, prod: RDS).
- Imagenes en S3.
- Autenticacion y confirmacion por correo con Cognito.
- Login facial y etiquetas de imagen con Rekognition.
- Traduccion con Amazon Translate.
- Chatbot con Amazon Lex Runtime V2.
- Socket.io para eventos de chat en tiempo real y API REST para persistencia.

## 3. Estructura principal de codigo
- `backend/index.js`: arranque API, CORS, sockets y validacion de variables.
- `backend/config/env.js`: validacion de variables obligatorias.
- `backend/config/db.js`: pool compartido de PostgreSQL.
- `backend/aws-services/`: clientes AWS SDK v3 modulares.
- `backend/controllers/`: logica de negocio por modulo (`auth`, `posts`, `users`, `chat`).
- `backend/routes/`: definicion REST.
- `frontend/src/pages/`: vistas principales (`Login`, `Register`, `Feed`, `Profile`, `Friends`, `Chats`).
- `frontend/src/services/`: clientes API centralizados.
- `bruno/`: requests listos para probar endpoints.

## 4. Variables de Entorno
Se usa un unico archivo `.env` en la raiz del repo.

Variables criticas:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `COGNITO_CLIENT_SECRET` (si aplica)
- `S3_BUCKET_IMAGES` o `S3_BUCKET_NAME`
- `LEX_BOT_ID`, `LEX_BOT_ALIAS_ID`, `LEX_LOCALE_ID`
- `IMAGE_UPLOAD_API_URL` (opcional, recomendado para flujo estricto API Gateway + Lambda)

Nota local:
- Para ejecutar backend en host con DB en contenedor, usar `DB_HOST=localhost`.
- En Docker Compose, backend usa `DB_HOST=db` automaticamente dentro de su servicio.

## 5. Endpoints Implementados

### 5.1 Auth / IA (`/api/auth`)
- `POST /register`
  - Registro en Cognito + insercion local en `users` con `password_md5`.
  - Carga foto de perfil a S3 (API Gateway si esta configurado, fallback a S3 directo).
- `POST /confirm`
  - Confirmacion de usuario Cognito por codigo.
- `POST /login`
  - Login por credenciales con Cognito.
- `POST /login-facial`
  - Login facial comparando imagen capturada contra foto de perfil en S3.
- `POST /labels`
  - Deteccion de etiquetas (URL o base64).
- `POST /translate`
  - Traduccion de texto (`es`, `en`, `it`, `pt`).
- `POST /chatbot`
  - Mensaje a bot Lex.
- `POST /logout`
  - Logout funcional a nivel frontend (limpieza de sesion local).

### 5.2 Publicaciones (`/api/posts`)
- `GET /`
  - Lista publicaciones ordenadas por fecha, con tags y comentarios.
  - Soporta query params: `tag`, `q`, `limit`.
- `GET /:id`
  - Obtiene detalle de publicacion.
- `POST /`
  - Crea publicacion (imagen obligatoria + descripcion opcional).
  - Detecta etiquetas con Rekognition y persiste en `tags` + `post_tags`.
- `PUT /:id`
  - Actualiza descripcion de publicacion (requiere `userId`).
- `DELETE /:id`
  - Elimina publicacion propia (requiere `userId`).
- `POST /:id/comments`
  - Agrega comentario.
- `POST /:id/translate`
  - Traduce descripcion o comentario asociado al post.

### 5.3 Usuarios / Amigos (`/api/users`)
- `GET /`
  - Lista usuarios (opcional `currentUserId` para excluirse).
- `GET /:id`
  - Perfil de usuario.
- `PUT /:id`
  - Actualiza perfil (nombre, dpi, username, password md5, foto).
- `DELETE /:id`
  - Elimina usuario.
- `GET /:id/friends`
  - Lista de amigos aceptados.
- `GET /:id/friend-requests`
  - Solicitudes pendientes recibidas.
- `POST /:id/friend-requests`
  - Enviar solicitud de amistad (`senderId` -> `receiverId`).
- `PATCH /friend-requests/:requestId`
  - Responder solicitud (`accept` o `reject`).

### 5.4 Chat (`/api/chat`)
- `GET /rooms?userId=...`
  - Lista salas donde participa el usuario.
- `POST /direct-room`
  - Obtiene o crea sala directa entre dos usuarios.
- `GET /messages/:room?userId=...`
  - Lista mensajes de sala.
- `POST /messages`
  - Persiste mensaje de chat.

## 6. Flujo Funcional

### Registro
1. Usuario ingresa datos + foto (archivo o webcam).
2. Backend sube imagen a S3.
3. Backend crea usuario en Cognito.
4. Backend guarda usuario en PostgreSQL con `password_md5`.
5. Usuario confirma por codigo en correo.

### Login Credenciales
1. Frontend envia `identifier + password`.
2. Backend autentica en Cognito.
3. Backend devuelve usuario local + tokens Cognito.

### Login Facial
1. Frontend captura foto webcam.
2. Backend compara rostro con imagen de perfil en S3 via Rekognition.
3. Si similitud supera umbral (`FACIAL_MATCH_THRESHOLD`), permite login.

### Publicaciones
1. Usuario crea post con imagen.
2. Imagen se almacena en S3.
3. Rekognition detecta etiquetas.
4. Post, etiquetas y comentarios se exponen al feed.

## 7. Coleccion Bruno
La carpeta `bruno/` incluye requests para probar:
- Health
- Register / Login
- Create/List posts
- Friend request
- Direct room + send message
- Translate + Chatbot

Archivo de entorno recomendado: `bruno/environments.local.json`.

## 8. Decisiones Arquitectonicas
1. Uso de controladores por dominio para aislar logica de rutas.
2. Uso de clientes AWS v3 modulares y reutilizables.
3. Queries parametrizadas con `pg` para evitar SQL injection.
4. Persistencia de chat en PostgreSQL y uso de Socket.io para eventos realtime.
5. Unificacion de configuracion en un solo `.env` raiz.
6. Fallback de subida S3 directa solo para continuidad local; en despliegue final se recomienda forzar API Gateway + Lambda.

## 9. Relacion con YAML de API Gateway
En este repo no se versionaron YAML de API Gateway aun. Si se agregan, sirven para:
- Definir infraestructura de endpoints cloud como codigo (IaC).
- Reproducir despliegues entre cuentas/entornos.
- Auditar cambios de rutas y autorizacion en API Gateway.

## 10. Lista de Pendientes Cloud para entrega final
- Despliegue frontend en bucket web publico `Proyecto-Web-G#`.
- Backend desplegado en 2 EC2 detras de ALB.
- Base de datos migrada a RDS.
- Endpoint de subida de imagen obligatorio por API Gateway + Lambda, sin fallback local.
- Evidencias en capturas: S3, EC2, RDS, Lambda, Cognito, Lex, ALB.

## 11. Comandos de Ejecucion
### Local (host)
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`
- DB: `docker compose up -d db`

### Stack Docker completo
- `docker compose up -d --build`

## 12. Estado actual del proyecto
- Auth/registro/login/login facial: implementado.
- Publicaciones/comentarios/tags/traduccion: implementado.
- Usuarios/amigos/solicitudes: implementado.
- Chat con persistencia: implementado.
- Frontend conectado a APIs principales: implementado.
- Pendiente de cierre de entrega: despliegue cloud final y evidencias del enunciado.
