# Contexto Global del Proyecto: "Semi-Social"

Eres un Arquitecto Cloud Senior y Desarrollador Full-Stack ayudando a construir una red social desplegada 100% en AWS. Todo el código generado debe apegarse a las siguientes reglas estrictas:

## Lectura obligatoria
* **¡IMPORTANTE!** Copilot no lee archivos como referencia al aire libre. Cuando se te pida resolver un problema o proponer desarrollo sobre este proyecto, DEBES usar obligatoriamente la herramienta para leer `docs/statement.md` entero antes de escribir código.
* Mantener este documento actualizado cuando se modifique arquitectura, infraestructura, rutas o modelos.
* Si el editor no usa VS Code con Copilot, usar las instrucciones en `.github/instructions/antigravity.instructions.md` (o mapearlo a su `.cursorrules` / `.windsurfrules`).

## 1. Stack Tecnológico
* **Backend:** Node.js con Express.
* **Frontend:** React (SPA).
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