# Manual de Usuario - Semi-Social

Bienvenido a la red social universitaria **Semi-Social**, un espacio interactivo, escalable y con funciones impulsadas por Inteligencia Artificial de AWS. En este manual, te mostraremos paso a paso cómo utilizar las funcionalidades de la plataforma.

---

## 1. Registro de Nueva Cuenta

Para poder interactuar con la plataforma, primero debes crear una cuenta.

### Pasos:
1. Accede a la página principal de la plataforma.
2. Selecciona la opción **Registrarse**.
3. Rellena el formulario con tus datos:
   - Nombre completo
   - Correo electrónico
   - DPI (Documento Personal de Identidad)
   - Contraseña segura
4. Tómate una foto o sube una imagen para tu foto de perfil. **Esta foto será utilizada para tu inicio de sesión facial.**
5. Una vez enviados los datos, revisa tu correo electrónico para verificar el código enviado por la plataforma.

![[Inserta aquí la captura de pantalla: Formulario de Registro]]()

---

## 2. Iniciar Sesión

Puedes acceder a tu cuenta utilizando tus credenciales clásicas o, de manera rápida, utilizando el inicio de sesión facial.

### Iniciar sesión con Credenciales:
1. Dirígete a la pestaña de **Login**.
2. Ingresa tu correo electrónico y tu contraseña.
3. Haz clic en el botón de **Iniciar Sesión**.

### Iniciar sesión con Reconocimiento Facial (Face Login):
1. Selecciona la opción **Login Facial** en la pantalla de inicio.
2. Permite el acceso a tu cámara web.
3. Tómate una foto. El sistema usará Amazon Rekognition para comparar tu rostro con tu foto de perfil. ¡Si coinciden, entrarás inmediatamente!

![[Inserta aquí la captura de pantalla: Inicio de sesión normal / facial]]()

---

## 3. Navegando por el Feed Principal (Publicaciones)

El **Feed** es el corazón de Semi-Social. Aquí podrás interactuar con tus amigos y compartir momentos.

### Crear una publicación
1. En la parte superior del Feed, encontrarás un panel para crear publicaciones.
2. Escribe una descripción (opcional).
3. Selecciona la imagen que deseas publicar (obligatorio).
4. Haz clic en **Publicar**.

![[Inserta aquí la captura de pantalla: Crear una nueva publicación en el Feed]]()

### Interacción (Filtros y Comentarios)
- **Filtros Inteligentes:** Al lado derecho del Feed, verás un listado de etiquetas (ej: "Persona", "Perro", "Edificio"). Estas etiquetas son detectadas automáticamente por la IA al subir fotos. Puedes dar clic sobre ellas para filtrar y ver únicamente las publicaciones que contengan esa categoría.
- **Comentar:** Abajo de cada publicación, puedes escribir y enviar comentarios a las fotos de tus amigos.

![[Inserta aquí la captura de pantalla: Feed de publicaciones con filtros laterales aplicados]]()

---

## 4. Traducción de Contenidos

¿Un amigo escribió un comentario o una descripción en otro idioma?

1. En cada publicación o comentario, encontrarás un botón de **Traducir**.
2. Al presionarlo, la plataforma utilizará Amazon Translate para convertir ese texto al español o viceversa.

![[Inserta aquí la captura de pantalla: Uso del botón traducir en un post o comentario]]()

---

## 5. Gestión de Amigos

Para ver publicaciones y enviar mensajes a otros usuarios, primero debes ser su amigo.

1. Dirígete a la pestaña **Amigos** en la barra de navegación superior.
2. En la sección **Sugerencias / Buscar**, podrás ver la lista de todos los usuarios registrados.
3. Envía una solicitud de amistad.
4. En el panel de **Solicitudes Entrantes**, puedes Aceptar o Rechazar invitaciones de otras personas.

![[Inserta aquí la captura de pantalla: Panel de solicitudes de amistad]]()

---

## 6. Chat en Tiempo Real

Puedes comunicarte instantáneamente con cualquiera de tus amigos utilizando la funcionalidad de Chat.

1. Navega a la pestaña de **Chats**.
2. A la izquierda, verás tu lista de amigos.
3. Selecciona a un amigo para abrir la sala de conversación.
4. Puedes enviar mensajes que llegarán instantáneamente gracias a la tecnología de WebSockets, sin necesidad de recargar la página.

![[Inserta aquí la captura de pantalla: Conversación activa en la pantalla de Chats]]()

---

## 7. Chatbot Informativo (Amazon Lex)

Si tienes dudas acerca de la Facultad de Ingeniería o sobre cómo usar la red social, puedes consultarlo con nuestro bot inteligente.

1. En la esquina inferior derecha de la pantalla (o desde el Feed), encontrarás un ícono flotante de Chatbot.
2. Al abrirlo, podrás enviarle mensajes y el Bot te responderá dinámicamente con información útil y horarios frecuentes.

![[Inserta aquí la captura de pantalla: Interacción con el Chatbot de Amazon Lex]]()

---

## 8. Editar tu Perfil

Para actualizar tus datos personales:

1. Ve a la sección **Mi Perfil**.
2. Aquí podrás cambiar tu foto de perfil, tu nombre completo o DPI.
3. Para confirmar cualquier cambio, el sistema te pedirá ingresar tu contraseña por motivos de seguridad.

![[Inserta aquí la captura de pantalla: Pantalla de Edición de Perfil]]()

---

## Soporte Técnico
Si necesitas credenciales de prueba o presentar un problema, contacta a los administradores del sistema. (Recuerda que para entornos locales existen credenciales por defecto ubicadas en la sección de desarrollador en `bruno/environments.local.json`).
