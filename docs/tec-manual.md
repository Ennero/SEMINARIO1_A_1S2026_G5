# Manual Técnico — Semi-Social

## 1. Integrantes
- 202302220 - Enner Esai Mendizabal Castro
- 202200129 - Luis Pablo Manuel Garcia Lopez
- 202000886 - Jose Ricardo Menocal Kong
- 202006633 - Katherin Alejandra Galvez Chiroy
- 202300601 - Diego Alessandro Constanza Padilla
- 202300636 - Jose Emilio Morales Castillo

---

## 2. Resumen Arquitectónico

La solución sigue una arquitectura **SPA + API REST + Servicios AWS**:

| Capa | Tecnología | Descripción |
|---|---|---|
| Frontend | React (Vite) + TailwindCSS | SPA en `frontend/` |
| Backend | Node.js + Express | API REST en `backend/` |
| Base de datos | PostgreSQL 15 | Docker local / RDS en producción |
| Almacenamiento | Amazon S3 | Imágenes de perfil y posts |
| Autenticación | Amazon Cognito | Registro, confirmación por email y login |
| Reconocimiento | Amazon Rekognition | Login facial y etiquetado de imágenes |
| Traducción | Amazon Translate | Traduce descripciones y comentarios independientemente |
| Chatbot | Amazon Lex v2 | Bot informativo universitario |
| Chat en tiempo real | Socket.io | Mensajes + presencia online en tiempo real |

---

## 3. Estructura Principal de Código

```
/
├── frontend/
│   ├── index.html             # Entry point HTML (favicon SS, lang=es)
│   ├── public/
│   │   └── favicon.svg        # Favicon SS con gradiente rojo-naranja
│   └── src/
│       ├── pages/
│       │   ├── Feed/          # Feed de publicaciones (solo amigos)
│       │   ├── Friends/       # Gestión de amigos + búsqueda en tiempo real
│       │   ├── Chats/         # Chat en tiempo real con presencia online
│       │   ├── Profile/       # Edición de perfil con validación de contraseña
│       │   ├── Login/         # Login por credenciales y facial
│       │   └── Register/      # Registro + confirmación Cognito
│       └── services/
│           ├── api.js          # Axios base
│           ├── postsService.js # CRUD de posts + translate
│           ├── usersService.js # Usuarios, amigos, solicitudes (soporte q=)
│           └── chatService.js  # Salas de chat y mensajes
├── backend/
│   ├── index.js               # Arranque Express + Socket.io + presencia online
│   ├── aws-services/          # Clientes AWS SDK v3 modulares
│   ├── controllers/
│   │   ├── authController.js  # Registro, login, Cognito confirm, Rekognition, Lex
│   │   ├── postsController.js # CRUD posts + etiquetas Rekognition + translate
│   │   ├── usersController.js # Usuarios (solo confirmados), amigos, búsqueda
│   │   └── chatController.js  # Rooms, mensajes, presencia
│   ├── routes/                # Definición REST
│   └── database/
│       └── schema.sql         # DDL (incluye cognito_confirmed BOOLEAN)
└── docs/
    ├── user-manual.md
    └── tec-manual.md
```

---

## 4. Variables de Entorno

Archivo único `.env` en la raíz del repositorio.

| Variable | Descripción |
|---|---|
| `DB_HOST` | Host de PostgreSQL (`db` en Docker, `localhost` en host) |
| `DB_PORT` | Puerto PostgreSQL (default: 5432) |
| `DB_USER` | Usuario de BD |
| `DB_PASSWORD` | Contraseña de BD |
| `DB_NAME` | Nombre de la BD |
| `AWS_REGION` | Región AWS (ej: `us-east-1`) |
| `AWS_ACCESS_KEY_ID` | Clave de acceso AWS |
| `AWS_SECRET_ACCESS_KEY` | Clave secreta AWS |
| `COGNITO_USER_POOL_ID` | Pool ID de Cognito |
| `COGNITO_CLIENT_ID` | Client ID de Cognito |
| `COGNITO_CLIENT_SECRET` | Client Secret (si aplica) |
| `S3_BUCKET_IMAGES` | Nombre del bucket S3 para imágenes |
| `LEX_BOT_ID` | ID del bot Lex v2 |
| `LEX_BOT_ALIAS_ID` | Alias del bot Lex |
| `LEX_LOCALE_ID` | Locale del bot (ej: `es_419`) |
| `CLIENT_URL` | URL del frontend (CORS origin) |
| `FACIAL_MATCH_THRESHOLD` | Umbral de similitud facial (default: 90) |

---

## 5. Endpoints Implementados

### 5.1 Auth / IA (`/api/auth`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/register` | Registro Cognito + inserción local + upload foto S3 |
| POST | `/confirm` | Confirma usuario Cognito por código. **Actualiza `cognito_confirmed = TRUE` en DB** |
| POST | `/login` | Login por credenciales via Cognito |
| POST | `/login-facial` | Login facial comparando contre S3 via Rekognition |
| POST | `/labels` | Detección de etiquetas (URL o base64) |
| POST | `/translate` | Traducción de texto genérica |
| POST | `/chatbot` | Mensaje a Amazon Lex v2 |
| POST | `/logout` | Logout frontend (limpia localStorage) |

### 5.2 Publicaciones (`/api/posts`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista posts — **filtra por `userId` para mostrar solo amigos + propios** — soporta `tag`, `q`, `limit` |
| GET | `/:id` | Detalle de publicación |
| POST | `/` | Crea post con imagen (S3 + Rekognition automático) |
| PUT | `/:id` | Actualiza descripción |
| DELETE | `/:id` | Elimina post propio |
| POST | `/:id/comments` | Agrega comentario |
| POST | `/:id/translate` | Traduce descripción **o** un comentario específico (`commentId` en body) |

### 5.3 Usuarios / Amigos (`/api/users`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista usuarios **confirmados** (`cognito_confirmed = TRUE`). Soporta `q` para búsqueda |
| GET | `/:id` | Perfil de usuario |
| PUT | `/:id` | Actualiza perfil — **requiere contraseña actual para validar** |
| DELETE | `/:id` | Elimina usuario |
| GET | `/:id/friends` | Amigos aceptados |
| GET | `/:id/friend-requests` | Solicitudes pendientes entrantes |
| POST | `/:id/friend-requests` | Enviar solicitud (`senderId` → `receiverId`) |
| PATCH | `/friend-requests/:requestId` | Responde solicitud (`accept`/`reject`) |

### 5.4 Chat (`/api/chat`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/rooms?userId=` | Salas del usuario |
| POST | `/direct-room` | Obtiene o crea sala directa entre dos usuarios |
| GET | `/messages/:room?userId=` | Mensajes de una sala |
| POST | `/messages` | Persiste mensaje |

---

## 6. Flujo Funcional Detallado

### Registro y Confirmación
1. Usuario envía datos + foto → backend sube imagen a S3, crea usuario en Cognito, inserta en `users` con `cognito_confirmed = FALSE`.
2. Cognito envía código al correo del usuario.
3. Usuario ingresa el código en `/confirm` → backend confirma en Cognito y **actualiza `cognito_confirmed = TRUE` en PostgreSQL**.
4. A partir de ese momento el usuario aparece en "Nuevos Usuarios" para otros.

### Filtrado del Feed por Amigos
- `GET /api/posts?userId=X` ejecuta un subquery sobre `friendships` para incluir solo posts del usuario `X` y sus amigos con `status = 'accepted'`.

### Traducción Independiente (descripción vs comentario)
- `POST /api/posts/:id/translate` con solo `{ targetLanguageCode }` traduce la **descripción**.
- `POST /api/posts/:id/translate` con `{ targetLanguageCode, commentId }` traduce ese **comentario específico**.
- El frontend monta un componente `DescriptionTranslate` y un `CommentTranslate` por separado, cada uno con su propio estado `[activeLang, translated, loading]`.

### Presencia Online (Socket.io)
- Al cargar `Chats.jsx`, el frontend emite `user_online(userId)`.
- El backend registra el `userId` en un `Set` en memoria y emite `online_users([...ids])` a todos los clientes.
- Al desconectarse el socket, el backend elimina el usuario del Set y notifica a todos.
- Los indicadores de "En línea" / "Desconectado" se actualizan en tiempo real.

### Búsqueda de Amigos
- El componente `Friends.jsx` usa un debounce de 350ms para llamar a `GET /api/users?currentUserId=X&q=texto`.
- El backend busca `LOWER(username) LIKE %q%` OR `LOWER(full_name) LIKE %q%`.

---

## 7. Schema de Base de Datos (principales tablas)

```sql
-- Usuarios (solo cognito_confirmed = TRUE son visibles en "Nuevos Usuarios")
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  cognito_sub VARCHAR(255) UNIQUE,
  cognito_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  dpi VARCHAR(20) UNIQUE NOT NULL,
  password_md5 CHAR(32) NOT NULL,
  profile_image_url TEXT NOT NULL,
  face_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Amistades
CREATE TABLE friendships (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id),
  receiver_id INT REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending | accepted | rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP
);

-- Posts, Tags, Post_Tags, Comments (omitidos por brevedad — ver schema.sql completo)
```

---

## 8. Decisiones Arquitectónicas

1. **Controladores por dominio** — `auth`, `posts`, `users`, `chat` — para aislar lógica de rutas.
2. **Clientes AWS v3 modulares** — cada servicio AWS en su propio archivo en `aws-services/`.
3. **Queries parametrizadas** con `pg` para prevenir SQL injection.
4. **`cognito_confirmed`** — columna booleana en `users`, actualizada al confirmar el código. Evita depender de Cognito en cada petición de listado.
5. **Presencia en memoria** — `Set` en `index.js` para usuarios online. Simple y sin latencia extra de BD. Al reiniciar el servidor el Set se vacía; los clientes reenvían `user_online` al reconectar el socket.
6. **Traducción granular** — componentes React independientes por descripción y por comentario para evitar rerender global y permitir estados de carga/activo individuales.
7. **Búsqueda con debounce** — 350ms de espera antes de disparar la petición al backend para evitar carga innecesaria.
8. **CORS con PATCH** — `methods: ['GET','POST','PUT','PATCH','DELETE']` — necesario para el endpoint `PATCH /friend-requests/:id`.

---

## 9. Colección Bruno

La carpeta `bruno/` incluye requests para probar:
- Health
- Register / Confirm / Login / Login Facial
- Create/List posts (con `userId` para filtrar amigos)
- Translate post / Translate comment
- Friend request (send / answer)
- Direct room + send message
- Chatbot

Entorno recomendado: `bruno/environments.local.json`.

---

## 10. Lista de Pendientes Cloud para Entrega Final

- [ ] Despliegue frontend en bucket S3 `Proyecto-Web-G5` (static website hosting).
- [ ] Backend en 2 instancias EC2 detrás de ALB.
- [ ] Base de datos migrada a RDS (actualizar `DB_HOST`, `DB_USER`, `DB_PASSWORD`).
- [ ] Endpoint de subida de imagen via API Gateway + Lambda.
- [ ] Capturas de evidencia: S3, EC2, RDS, Lambda, Cognito, Lex, Rekognition, ALB.
- [ ] Backend en Python (FastAPI/Flask) replicando endpoints de Node.js.

---

## 11. Comandos de Ejecución

### Stack Docker completo (recomendado)
```bash
docker compose down -v          # Detiene y elimina volúmenes (DB limpia)
docker compose up -d --build    # Construye y levanta todos los contenedores
```

### Local (desarrollo)
```bash
# Levantar solo la BD en Docker
docker compose up -d db

# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

> El frontend queda disponible en `http://localhost:3000` y el backend en `http://localhost:5000`.

---

## 12. Estado Actual del Proyecto

| Módulo | Estado |
|---|---|
| Auth (registro / login / facial) | ✅ Implementado |
| Confirmación Cognito + marcado en DB | ✅ Implementado |
| Publicaciones / comentarios / tags Rekognition | ✅ Implementado |
| Filtro feed solo amigos | ✅ Implementado |
| Traducción descripción (independiente) | ✅ Implementado |
| Traducción comentarios (independiente por comentario) | ✅ Implementado |
| Gestión amigos + búsqueda en tiempo real | ✅ Implementado |
| Solicitudes aceptar/rechazar (CORS PATCH fix) | ✅ Implementado |
| Chat en tiempo real (Socket.io) | ✅ Implementado |
| Presencia online real (En línea / Desconectado) | ✅ Implementado |
| Favicon SS personalizado | ✅ Implementado |
| Despliegue cloud final | ⏳ Pendiente |
