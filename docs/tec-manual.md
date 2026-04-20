# Manual Tecnico - Semi-Social

## Alcance de esta iteracion
Se implemento la primera unificacion funcional del modulo de autenticacion tomando como base este repositorio principal y adaptando el trabajo separado de login/registro.

Incluye:
- Registro con Cognito + persistencia en PostgreSQL.
- Confirmacion por correo en Cognito.
- Login por credenciales con Cognito.
- Login facial con Rekognition contra foto de perfil en S3.
- Endpoint de etiquetas de imagen con Rekognition.
- Endpoint de traduccion con Amazon Translate.
- Endpoint de chatbot con Amazon Lex.

## Arquitectura aplicada
- Backend: Express en `backend/`.
- Frontend: React + Vite en `frontend/`.
- DB: PostgreSQL por `pg` pool compartido (`backend/config/db.js`).
- AWS SDK v3: servicios en `backend/aws-services/`.

## Endpoints implementados
Base URL backend: `/api/auth`

- `POST /register`
  - Crea usuario en Cognito.
  - Sube foto de perfil a S3 (via API Gateway si `IMAGE_UPLOAD_API_URL` existe; fallback a S3 directo).
  - Inserta usuario en BD con `password_md5`.

- `POST /confirm`
  - Confirma usuario en Cognito con codigo de correo.

- `POST /login`
  - Login por credenciales usando Cognito (`USER_PASSWORD_AUTH`).

- `POST /login-facial`
  - Compara rostro capturado vs foto perfil almacenada con Rekognition.

- `POST /labels`
  - Obtiene etiquetas de una imagen por URL o base64.

- `POST /translate`
  - Traduce texto con Translate (idiomas permitidos: `es`, `en`, `it`, `pt`).

- `POST /chatbot`
  - Envia mensajes a Lex Runtime V2.

- `POST /logout`
  - Respuesta funcional para limpiar sesion desde frontend.

## Variables de entorno clave
Revisar `.env.example`.

Obligatorias para arranque backend:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `AWS_REGION`
- `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`
- `S3_BUCKET_IMAGES` o `S3_BUCKET_NAME`

Opcionales segun configuracion:
- `COGNITO_CLIENT_SECRET`
- `IMAGE_UPLOAD_API_URL`
- `FACIAL_MATCH_THRESHOLD`
- `LEX_BOT_ID`, `LEX_BOT_ALIAS_ID`, `LEX_LOCALE_ID`

## Frontend integrado
- Login: `frontend/src/pages/Login/Login.jsx`
- Register: `frontend/src/pages/Register/Register.jsx`
- Webcam: `frontend/src/components/WebcamCapture/WebcamCapture.jsx`
- Capa API: `frontend/src/services/`

## Validaciones realizadas
- Build frontend exitoso con `npm run build`.
- Carga del controlador backend exitosa con `node -e "require('./controllers/authController')"`.

## Pendientes de hardening
- Rotar credenciales comprometidas detectadas en material externo.
- Agregar middleware de token para proteger endpoints no publicos.
- Migrar carga de imagen 100% por API Gateway/Lambda en todos los casos de uso sin fallback directo a S3 cuando se despliegue final.
