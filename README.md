# Manual Técnico

## Datos de los estudiantes

| Nombre | Carné |
|--------|-------|
| 202302220 | Enner Esai Mendizabal Castro |
| 202200129 | Luis Pablo Manuel Garcia Lopez |
| 202000886 | Jose Ricardo Menocal Kong |
| 202006633 | Katherin Alejandra Galvez Chiroy |
| 202300601 | Diego Alessandro Constanza Padilla |
| 202300636 | Jose Emilio Morales Castillo |

## Descripción de la arquitectura

Semi-Social es una red social basada en la nube de AWS con una arquitectura de tres capas:

- **Frontend**: Aplicación React alojada y servida a través de un balanceador de carga (Load Balancer).
- **Backend**: API REST construida con Node.js y Express, desplegada en instancias EC2 detrás de un Load Balancer. Utiliza Socket.io para funcionalidades de chat en tiempo real.
- **Base de Datos**: PostgreSQL gestionado a través de Amazon RDS.
- **Almacenamiento**: Amazon S3 para almacenar imágenes y archivos multimedia subidos por los usuarios.
- **Autenticación**: Amazon Cognito para la gestión de usuarios, grupos y flujos de autenticación (registro, inicio de sesión, recuperación de contraseña).
- **Funciones Serverless**: AWS Lambda para procesamiento de imágenes (carga a S3) y otras tareas asíncronas.
- **IA y Machine Learning**:
  - Amazon Rekognition para análisis y moderación de imágenes.
  - Amazon Translate para traducción de publicaciones entre idiomas.
  - Amazon Lex para el chatbot integrado en la plataforma.

```
Usuario
  │
  ▼
Load Balancer (ALB)
  ├──▶ Frontend (React / EC2)
  └──▶ Backend API (Node.js / EC2)
          ├──▶ Amazon RDS (PostgreSQL)
          ├──▶ Amazon S3
          ├──▶ Amazon Cognito
          ├──▶ Amazon Rekognition
          ├──▶ Amazon Translate
          ├──▶ Amazon Lex
          └──▶ AWS Lambda
```

## Usuarios IAM, permisos y roles

Se deben crear los siguientes usuarios y roles IAM para el correcto funcionamiento de la aplicación:

| Usuario / Rol IAM | Permisos asignados | Descripción |
|-------------------|--------------------|-------------|
| `semi-social-backend` | S3FullAccess, RekognitionFullAccess, TranslateFullAccess, LexFullAccess | Usuario para el servidor backend en EC2 |
| `semi-social-lambda-role` | AmazonS3FullAccess, CloudWatchLogsFullAccess | Rol de ejecución para las funciones Lambda |
| `semi-social-cognito-role` | AmazonCognitoPowerUser | Rol para administrar el User Pool de Cognito |

> **Nota**: Se recomienda seguir el principio de mínimo privilegio y ajustar los permisos según las necesidades reales del proyecto.

## Capturas de Pantalla

### Buckets de S3

_Insertar captura de pantalla de los buckets S3 creados para el proyecto._

### EC2

_Insertar captura de pantalla de las instancias EC2 utilizadas para el backend y frontend._

### Base de Datos RDS

_Insertar captura de pantalla de la instancia de base de datos RDS con PostgreSQL._

### Aplicación Web

_Insertar captura de pantalla de la aplicación web en funcionamiento._

### Funciones Lambda

_Insertar captura de pantalla de las funciones Lambda desplegadas (e.g., `imageUploader`)._

### Pool Cognito

_Insertar captura de pantalla del User Pool de Amazon Cognito configurado para Semi-Social._

### Configuración Amazon Lex

_Insertar captura de pantalla del bot de Amazon Lex configurado para el asistente virtual._

### Check LoadBalancer

_Insertar captura de pantalla del Application Load Balancer (ALB) y su estado de salud._

## Ejecucion local con Docker

Desde la raiz del proyecto se puede levantar frontend y backend al mismo tiempo:

```bash
docker compose up --build
```

Servicios disponibles:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

Comandos utiles:

```bash
# Levantar en segundo plano
docker compose up -d --build

# Ver logs
docker compose logs -f

# Detener y eliminar contenedores
docker compose down
```

Variables opcionales de puertos:

- `FRONTEND_PORT` (por defecto `3000`)
- `BACKEND_PORT` (por defecto `5000`)