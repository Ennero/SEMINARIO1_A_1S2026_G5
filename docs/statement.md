# Seminario de Sistemas 1: Proyecto - Semi-Social

**Universidad de San Carlos de Guatemala**  
**Facultad de Ingeniería**  
**Ingeniería en Ciencias y Sistemas (ECYS)**  
**Ponderación:** 30 pts | **Tiempo estimado:** 30 hr

---

## Índice

1. [Marco Formativo](#1-marco-formativo)
   - 1.1 Valor
   - 1.2 Competencia(s)
   - 1.3 Objetivo SMART
2. [Enunciado de la Práctica](#2-enunciado-de-la-práctica)
   - 2.1 Servicios a utilizar
   - 2.2 Requerimientos técnicos
   - 2.3 Consideraciones
3. [Valores](#3-valores)
4. [Entregables](#4-entregables)
5. [Material de apoyo](#5-material-de-apoyo)
6. [Recursos y herramientas a utilizar](#6-recursos-y-herramientas-a-utilizar)
7. [Cronograma](#7-cronograma)
8. [Rúbrica de Calificación](#8-rúbrica-de-calificación)

---

## 1. Marco Formativo

### 1.1. Valor

| Nombre del valor | ¿Cómo se aplica en tu laboratorio? |
|---|---|
| Perseverancia | El estudiante fortalecerá este valor al trabajar en ejercicios desafiantes, fomentando múltiples intentos y analizando errores sin desmotivarse. |

### 1.2. Competencia(s)

| Tipo de Competencia | Descripción |
|---|---|
| Competencia General | Aplica principios básicos de ingeniería, ciencias de computación y sistemas de información y comunicación, en la formulación y resolución adecuada de problemas complejos. |
| Competencia Específica | *(No especificado en el documento original)* |

### 1.3. Objetivo SMART

| SMART | Definición | Objetivo Redactado |
|---|---|---|
| **Específico** (¿Qué?) | El objetivo es concreto y tangible. | Desarrollar una aplicación web tipo red social desplegada completamente en la nube utilizando Amazon Web Services (AWS), que permita a los usuarios registrarse, iniciar sesión, publicar imágenes, comentar, comunicarse mediante chat y traducir contenido, integrando servicios como Cognito, Rekognition, S3, Lambda, API Gateway, RDS, EC2, ELB, Lex y Translate. |
| **Medible** (¿Cuánto?) | El objetivo tiene una medida objetiva de éxito. | Implementar correctamente al menos 10 servicios de AWS requeridos en la práctica y demostrar su funcionamiento mediante evidencias en el repositorio (capturas, endpoints funcionales, arquitectura desplegada y aplicación operativa accesible públicamente). |
| **Alcanzable** (¿Cómo?) | El objetivo debe ser posible con los recursos disponibles. | Construir la solución mediante el uso de herramientas accesibles para los estudiantes como AWS Free Tier, Node.js o Python, GitHub y frameworks web, aplicando la documentación oficial de AWS y los materiales proporcionados en el curso. |
| **Realista** (¿Para qué?) | El objetivo contribuye a metas más amplias. | Aplicar conceptos de arquitectura cloud, microservicios, balanceo de carga, almacenamiento distribuido, autenticación gestionada y servicios de inteligencia artificial, permitiendo al estudiante comprender cómo se diseñan y despliegan aplicaciones modernas escalables en la nube. |
| **A Tiempo** (¿Cuándo?) | El objetivo tiene fecha límite o mejor aún un cronograma de hitos de progreso. | Diseñar, implementar y desplegar la aplicación en AWS dentro del periodo comprendido entre el 24 de marzo de 2026 y el 23 de abril de 2026, entregando el repositorio documentado y el sistema funcional para su evaluación el 25 de abril de 2026. |

---

## 2. Enunciado de la Práctica

Amazon Web Services (AWS) es una plataforma de servicios de nube que ofrece potencia de cómputo, almacenamiento y funcionalidad para ayudar a las empresas a escalar. Se desarrollará una aplicación web inspirada en redes sociales que permitirá compartir publicaciones a los usuarios registrados. Tendrá las funcionalidades de login, registro, visualización de publicaciones, comentarios, chat en tiempo real y traducción de contenido.

### 2.1 Servicios a utilizar

Los servicios de AWS a utilizar son:

- IAM
- EC2
- S3
- Cognito
- Translate
- Rekognition
- Lambda
- API Gateway
- RDS (Relational Database Service)
- ELB (Elastic Load Balancing)
- Lex
- Sitio web

A continuación, se detallarán las diferentes secciones o funcionalidades de la aplicación web:

#### 1. Módulo de Registro

Para registrar un nuevo usuario obligatoriamente se pedirán los datos:

- Nombre completo
- Correo electrónico
- DPI
- Contraseña
- Repetir contraseña

La foto del usuario será obligatoria; esta se realizará eligiendo una imagen de la computadora o tomando una foto con la webcam, ya que esta servirá para el inicio de sesión haciendo uso de Rekognition. Esta sección deberá ser implementada haciendo uso de **Cognito**.

#### 2. Módulo de Login

Para la autenticación se realizará por medio de las credenciales:

- Nombre de usuario
- Contraseña

O por medio de **reconocimiento facial** haciendo uso de Rekognition y la foto de perfil del usuario. Esta sección deberá ser implementada haciendo uso de **Cognito**.

#### 3. Página principal

- **Ver publicaciones:** Se muestran todas las publicaciones que otros usuarios (solo amigos) han realizado, también se muestran las del propio usuario. Todas se muestran ordenadas por fecha de publicación de forma descendente (del más reciente al más antiguo).
- **Comentarios:** Cada publicación puede recibir comentarios de amigos.
- **Filtrar publicaciones:** Se tendrá una lista de filtros basadas en las etiquetas de las imágenes de las publicaciones obtenidas por la API de Amazon Rekognition. El filtro "Todos" siempre aparecerá; los demás dependerán de las imágenes. Al seleccionar una de estas, solo se mostrarán las publicaciones que tienen esa etiqueta. Además, se debe contar con un buscador de etiquetas donde se puede ingresar el nombre que se desea buscar.
- **Crear publicaciones:** Se tendrá una sección donde se creará una nueva publicación. La publicación tendrá:
  - Imagen *(obligatorio)*
  - Descripción *(opcional)*
- **Traducir publicaciones:** La descripción y los comentarios de las publicaciones tendrán la opción de "traducir"; al realizar esta acción deberá de tener 3 idiomas disponibles además del español, utilizando la API de Amazon Translate.

#### 4. Edición de Perfil

En esta sección, el usuario puede ver y modificar sus datos, tales como:

- Nombre completo
- DPI
- Foto de perfil

Se debe ingresar la contraseña correcta para que se guarden los datos modificados.

#### 5. Usuarios y amigos

Para visualizar a los otros usuarios registrados, se debe de mostrar un apartado donde se lista a los usuarios que no son amigos. Los usuarios que son amigos solo se mostrarán en el Chat. La forma para agregar amigos será de la manera que funciona Facebook, por lo que se deberán manejar solicitudes de amistad con la posibilidad de aceptar o rechazar.

#### 6. Chat

En esta sección, el usuario puede comunicarse con sus amigos.

- Ambos usuarios amigos pueden enviar y recibir mensajes.
- Se recomienda utilizar **WebSockets** para la comunicación en tiempo real.

---

### 2.2 Requerimientos técnicos

#### Infraestructura EC2 y Balanceador

- Se deben configurar **2 instancias EC2** conectadas a un Application Load Balancer (ELB).
- Ambas instancias deben ser clones (misma configuración y endpoints).
- El servidor puede desarrollarse en **Node.js** o **Python**, a elección del estudiante.
- El balanceador distribuirá el tráfico de forma equitativa entre ambas instancias.

> **NOTA:** Tomar en cuenta la seguridad de las instancias EC2.

#### Amazon RDS

- No se permite el uso de bases de datos locales o en contenedores.
- Se debe utilizar **Amazon RDS** (MySQL o PostgreSQL) para la persistencia de datos de la aplicación.

#### Imágenes en S3

Se debe configurar un bucket de S3 con el nombre `semi1proyecto-g#` para el almacenamiento de imágenes, tales como las de las publicaciones y las fotos de perfil de los usuarios.

#### API Gateway y Función Lambda (Carga de Imágenes)

La carga de imágenes (tanto para fotos de perfil como para publicaciones) debe realizarse **obligatoriamente** a través de un endpoint en API Gateway que dispare una Función Lambda. Esta función se encargará de procesar el archivo y almacenarlo en el bucket de S3.

#### Amazon Lex (Bot)

- El chatbot debe brindar información sobre la Facultad de Ingeniería (horarios, preguntas frecuentes, etc.).
- Se valorará la integración de funciones Lambda para respuestas dinámicas.
- Deberá incluirse un botón de acceso al Bot (Amazon Lex) para consultas sobre la facultad.

#### Cognito

- Se debe configurar un pool de usuarios de tal forma que cada usuario registrado y que actualice sus datos en la aplicación también se almacene en este pool.
- La relación entre el pool de usuarios y los datos a guardar en la BD queda a criterio de los estudiantes.
- Se debe tener como mínimo los siguientes datos: **Nombre Completo, Correo electrónico, DPI, Contraseña encriptada**.
- Estos datos también deben actualizarse cuando el usuario modifique sus datos desde la aplicación.
- Es necesario implementar la **verificación por correo electrónico** utilizando Cognito.

#### Rekognition

Se utilizará para:
- Obtener una lista de etiquetas de las imágenes que se publican, que se utilizarán para realizar los filtros de publicaciones.
- Login de la aplicación por medio de **reconocimiento facial**.

#### Translate

Se utilizará para traducir el texto de las publicaciones en cualquier idioma al español o viceversa.

#### Seguridad

Deben configurarse correctamente los security groups y los permisos que se le asignen a los usuarios IAM.

---

### Página Web

Puede ser realizada con cualquier librería, lenguaje o framework de programación al criterio del estudiante. Esta estará alojada en un Bucket de S3 público para que se pueda acceder en cualquier momento y conectarse al balanceador de carga. El Bucket debe llevar el nombre `Proyecto-Web-G#` (donde `#` es el número de grupo).

---

### Manual Técnico

Se necesita un manual de configuración redactado en Markdown dentro del repositorio, que contenga:

- Datos de los estudiantes.
- Descripción de la arquitectura utilizada.
- Describir los usuarios IAM, permisos y roles utilizados para la elaboración del proyecto.
- **Capturas de Pantalla:**
  - Buckets de S3
  - EC2
  - Base de Datos RDS
  - Aplicación Web
  - Funciones Lambda
  - Pool Cognito
  - Configuración Amazon Lex
  - Check LoadBalancer

Puede realizarse en el `README.md` del repositorio.

---

### 2.3 Consideraciones

- La Página Web debe estar cargada como web estática en S3.
- Repositorio en GitHub en modo **privado** y documentado con el formato Markdown.
- Agregar como colaborador en el repositorio a los auxiliares de curso: `elder1095`, `CarlosJezeh777`.
- La práctica debe ser en **grupos**.
- Usar los respectivos usuarios de IAM con sus respectivas políticas de acuerdo con el servicio que se está utilizando.
  - Ejemplo: Si se está utilizando S3, crear un usuario con las políticas respectivas. Si se está utilizando EC2, crear el usuario con las políticas para ese servicio.
- Se **prohíbe** modificar código o configuraciones dentro de la calificación.
- Toda la práctica debe ser desplegada en la nube con los servicios de AWS; no se aceptará nada local.

---

## 3. Valores

En el desarrollo de la práctica, se espera que cada estudiante demuestre honestidad académica y profesionalismo. Por lo tanto, se establecen los siguientes principios:

- **Originalidad del Trabajo:** Cada estudiante o equipo debe desarrollar su propio código y/o documentación, aplicando los conocimientos adquiridos en el curso.
- **Prohibición de Copias y Plagio:** Si se detecta la copia total o parcial del código, documentación o cualquier otro entregable, la calificación será de **0 puntos**. Esto incluye la reproducción de código entre compañeros, la reutilización de proyectos de semestres anteriores o el uso de código externo sin la debida referencia.
- **Uso Responsable de Recursos Externos:** El uso de bibliotecas, frameworks y ejemplos de código externos está permitido, siempre y cuando se referencien correctamente y se comprendan plenamente. *(Consultar con el catedrático su política)*.

---

## 4. Entregables

| Tipo | Descripción |
|---|---|
| Repositorio en GitHub | Repositorio con el nombre `SEMINARIO1_A_1S2026_G#` que contenga la carpeta `"Proyecto"` y dentro de la misma el código fuente del proyecto y un archivo `README.md` con la descripción y capturas de las configuraciones de los servicios. |
| Código Fuente | Código de los servidores backend (Python o Javascript) y frontend. |

---

## 5. Material de apoyo

- [Subir backend NodeJS a AWS - EC2 (Oberg Agustin)](https://dev.to/agustinoberg/subir-backend-nodejs-a-aws-ec2-4nd5)
- [Creación de un balanceador de carga (AWS)](https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/elb-getting-started.html)
- [Configuración de un sitio web en S3 (AWS)](https://docs.aws.amazon.com/es_es/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html)
- [Amazon RDS](https://docs.aws.amazon.com/rds/)
- [Amazon RDS User Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/)
- [AWS IAM](https://docs.aws.amazon.com/iam/)
- [AWS IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide)

---

## 6. Recursos y herramientas a utilizar

- **Software:** Python y/o Javascript.
- **Plataformas:** GitHub (para repositorio), UEDI (para entrega), AWS (para despliegue cloud).
- **Lecturas recomendadas:** manuales de AWS, artículos sobre despliegues cloud en su concepto general o artículos sobre el uso de EC2, Load Balancer y S3.

---

## 7. Cronograma

| Tarea | Fecha |
|---|---|
| Asignación del proyecto / Entrega del enunciado | Marzo 24 de 2026 |
| Fecha de entrega | Abril 23 de 2026 |
| Fecha de calificación | Abril 25 de 2026 |

---

## 8. Rúbrica de Calificación

### 7.1 Requisitos para optar a la calificación

| Tema | Descripción | Cumple (Si/No) |
|---|---|---|
| Cumplimiento de la tecnología establecida | El desarrollo debe haberse realizado en Python y Javascript, además del uso de frameworks como React o Angular. | |
| Uso de herramientas requeridas | La aplicación debe ejecutarse completamente en la nube de AWS, no hay nada local. | |
| Gestión y entregas de prácticas | El repositorio en GitHub debe contener el código fuente y el README indicado. | |

---

### 7.2 Resumen de Puntuaciones

| Área | Puntos Totales | Puntos Obtenidos |
|---|---|---|
| **1. Infraestructura AWS** | | |
| Configuración de IAM (usuarios, roles y políticas) | 5 | |
| Bucket S3 para almacenamiento de imágenes | 5 | |
| Configuración de la instancia EC2 No. 1 | 5 | |
| Configuración de la instancia EC2 No. 2 | 5 | |
| Configuración de Amazon RDS | 5 | |
| Configuración de grupos de seguridad | 5 | |
| Configuración correcta del balanceador | 5 | |
| Hosting del sitio web | 5 | |
| **Sub-Total Infraestructura** | **40** | |
| **2. Integración de Servicios AWS Avanzados** | | |
| Cognito para registro y login | 7 | |
| Rekognition para etiquetas y login facial | 7 | |
| Lambda para procesamiento de imágenes | 5 | |
| API Gateway para carga de imágenes | 5 | |
| Translate para traducción de publicaciones | 5 | |
| Lex chatbot integrado | 6 | |
| **Sub-Total servicios avanzados** | **35** | |
| **3. Funcionalidad de la Aplicación** | | |
| Registro y autenticación de usuarios | 3 | |
| Publicación de imágenes | 3 | |
| Sistema de comentarios | 3 | |
| Filtro de publicaciones por etiquetas | 3 | |
| Chat entre usuarios | 3 | |
| **Sub-Total aplicación** | **15** | |
| **4. Documentación y Conocimiento** | | |
| Documentación | 5 | |
| Preguntas | 5 | |
| **Sub-Total documentación** | **10** | |
| **TOTAL** | **100** | |

---

### 7.3 Comentarios Generales

Toda la aplicación debe estar desplegada en la nube. Todos los integrantes deben participar y en caso de sospecha de copia, el estudiante deberá demostrar su autoría en el trabajo. Cualquier copia total o parcial será reportada a la escuela de sistemas.

---

### 7.4 Detalle de la Calificación

#### 1. INFRAESTRUCTURA AWS (40 pts)

| No. | Criterio de evaluación | Punteo máx. | Satisfactorio (100%–61%) | Necesita mejorar (60%–0%) | Rango Satisfactorio | Rango Necesita mejorar |
|---|---|---|---|---|---|---|
| 1.1 | Gestión de Identidad (IAM) | 5 | Se implementan usuarios y roles IAM específicos por servicio con políticas que garantizan la separación de responsabilidades. | No se utilizan usuarios IAM o las políticas aplicadas no son adecuadas para la restricción de accesos. | 5–3 | 2–0 |
| 1.2 | Configuración de S3 | 5 | El sitio web se despliega en S3. El bucket de imágenes contiene las carpetas `Fotos_Perfil` y `Fotos_Publicadas` con acceso público funcional. | El acceso al sitio es deficiente o las carpetas de imágenes no cumplen con la estructura o permisos solicitados. | 5–3 | 2–0 |
| 1.3 | Instancia EC2 No. 1 (Node.js) | 5 | La primera instancia cuenta con las configuraciones adecuadas para el despliegue funcional del backend en Node.js. | No se desplegó la instancia o el servidor no se encuentra alojado correctamente en la máquina virtual. | 5–3 | 2–0 |
| 1.4 | Instancia EC2 No. 2 (Python) | 5 | La segunda instancia cuenta con las configuraciones adecuadas para el despliegue funcional del backend en Python. | No se desplegó la instancia o el servidor no responde a las peticiones del balanceador. | 5–3 | 2–0 |
| 1.5 | Amazon RDS y Lógica | 5 | Base de datos RDS activa con esquema relacional funcional. Las contraseñas se almacenan encriptadas con el algoritmo MD5. | No se utiliza RDS o las contraseñas están en texto plano. La lógica de tablas no soporta las funciones de la app. | 5–3 | 2–0 |
| 1.6 | Grupos de Seguridad | 5 | Los grupos de seguridad están configurados para restringir el acceso a los puertos necesarios únicamente desde los endpoints autorizados. | Las instancias de EC2 o RDS cuentan con configuraciones abiertas que comprometen el consumo de los servicios. | 5–3 | 2–0 |
| 1.7 | Balanceador de Carga | 5 | El ALB distribuye tráfico a ambas EC2. Al detener una instancia, la aplicación sigue funcionando sin interrupción mediante el DNS del LB. | El balanceador no cuenta con ambas instancias o el tráfico entre redes no funciona adecuadamente ante fallos. | 5–3 | 2–0 |
| 1.8 | Hosting del sitio web | 5 | La página web está desplegada correctamente como sitio estático en S3 o en un servicio para frontend y se conecta al backend mediante el balanceador. | El sitio web no se encuentra desplegado correctamente o no puede comunicarse con los servicios backend. | 5–3 | 2–0 |

#### 2. INTEGRACIÓN DE SERVICIOS AVANZADOS (35 pts)

| No. | Criterio de evaluación | Punteo máx. | Satisfactorio (100%–61%) | Necesita mejorar (60%–0%) | Rango Satisfactorio | Rango Necesita mejorar |
|---|---|---|---|---|---|---|
| 2.1 | Cognito para registro y login | 7 | Se implementa Amazon Cognito para el registro, autenticación y verificación de usuarios mediante correo electrónico. | No se utiliza Cognito o el registro/login no funciona correctamente. | 7–4 | 3–0 |
| 2.2 | Rekognition para etiquetas y login facial | 7 | Se utiliza Rekognition para obtener etiquetas de imágenes y/o realizar autenticación mediante reconocimiento facial. | No se implementa Rekognition o las etiquetas de imágenes no se generan correctamente. | 7–4 | 3–0 |
| 2.3 | Lambda para procesamiento de imágenes | 5 | Las funciones Lambda procesan correctamente las imágenes cargadas y permiten su almacenamiento en S3. | No se utiliza Lambda o las funciones no procesan correctamente los archivos. | 5–3 | 2–0 |
| 2.4 | API Gateway para carga de imágenes | 5 | Se utiliza API Gateway para exponer endpoints que permitan la carga de imágenes mediante funciones. | No se implementa API Gateway o los endpoints no funcionan correctamente. | 5–3 | 2–0 |
| 2.5 | Translate para traducción de publicaciones | 5 | Amazon Translate para traducir publicaciones o comentarios a diferentes idiomas. | No se utiliza Translate o la funcionalidad de traducción no funciona correctamente. | 5–3 | 2–0 |
| 2.6 | Lex chatbot integrado | 6 | Se integra un chatbot funcional utilizando Amazon Lex que permite responder preguntas relacionadas con la facultad. | El chatbot no se encuentra integrado o no responde correctamente. | 6–4 | 3–0 |

#### 3. FUNCIONALIDAD Y SOFTWARE (15 pts)

| No. | Criterio de evaluación | Punteo máx. | Satisfactorio (100%–61%) | Necesita mejorar (60%–0%) | Rango Satisfactorio | Rango Necesita mejorar |
|---|---|---|---|---|---|---|
| 3.1 | Autenticación (Registro/Login) | 3 | El registro y login funcionan correctamente utilizando autenticación segura y almacenamiento de datos del usuario. | Existen errores en el registro o autenticación de usuarios. | 3–2 | 1–0 |
| 3.2 | Publicación de imágenes | 3 | Los usuarios pueden crear publicaciones con imágenes que se almacenan correctamente en S3. | Las publicaciones no se guardan o las imágenes no se almacenan correctamente. | 3–2 | 1–0 |
| 3.3 | Sistema de comentarios | 3 | Las publicaciones permiten recibir comentarios de otros usuarios. | No se pueden agregar comentarios o no se almacenan correctamente. | 3–2 | 1–0 |
| 3.4 | Filtro de publicaciones por etiquetas | 3 | Las publicaciones pueden filtrarse mediante etiquetas generadas por Rekognition. | No es posible gestionar los filtros o los enlaces multimedia no funcionan. | 3–2 | 1–0 |
| 3.5 | Chat entre usuarios | 3 | Los usuarios pueden comunicarse mediante un chat funcional en tiempo real. | El chat no funciona correctamente o no permite enviar y recibir mensajes. | 3–2 | 1–0 |

#### 4. DOCUMENTACIÓN Y CONOCIMIENTO (10 pts)

| No. | Criterio de evaluación | Punteo máx. | Satisfactorio (100%–61%) | Necesita mejorar (60%–0%) | Rango Satisfactorio | Rango Necesita mejorar |
|---|---|---|---|---|---|---|
| 4.1 | Documentación | 5 | El repositorio cuenta con el manual técnico detallado, incluyendo diagrama de arquitectura, políticas IAM y capturas de los servicios. | El manual no se encuentra en el repositorio o carece de las evidencias de configuración y diagramas solicitados. | 5–3 | 2–0 |
| 4.2 | Preguntas de Conocimiento | 5 | Todos los integrantes demuestran dominio técnico y participación al responder preguntas sobre la infraestructura y el flujo de la práctica. | Ninguno de los estudiantes, o solo una parte del grupo, responde adecuadamente a las preguntas técnicas sobre el proyecto. | 5–3 | 2–0 |