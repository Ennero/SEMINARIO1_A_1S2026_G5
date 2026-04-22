# Manual de Usuario - Semi-Social

## Credenciales de prueba

Estas credenciales son para pruebas locales del proyecto.

### Usuario de aplicacion (login)

- Correo: `test@example.com`
- Contrasena: `Prueba123!`

Fuente: `bruno/environments.local.json`.

### Usuario de aplicacion alterno (ejemplo generado)

- Correo: `test_1776704310@example.com`
- Contrasena: `Prueba123!`

Fuente: `register.json` y `login.json`.

### Credenciales de base de datos local (Docker)

- Host: `localhost`
- Puerto: `5432`
- Base de datos: `semisocial_db`
- Usuario: `semisocial_user`
- Contrasena: `semisocial_password`

Fuente: valores por defecto en `docker-compose.yml`.

## Como probar rapido

1. Levanta los servicios con Docker Compose desde la raiz del proyecto.
2. Abre la aplicacion en `http://localhost:3000`.
3. Inicia sesion con el usuario de aplicacion indicado arriba.
4. Si prefieres probar API, usa la carpeta `bruno/` con el environment `local`.

## Nota importante

- Estas credenciales son solo para entorno local de desarrollo/pruebas.
- No reutilizar estas credenciales en despliegues reales.
