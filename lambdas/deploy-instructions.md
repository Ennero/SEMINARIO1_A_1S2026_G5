# Despliegue de Lambda a AWS con SAM

Para poder desplegar la función `imageUploader.js` junto a su API Gateway hacia AWS, debes contar con el **AWS CLI** y **AWS SAM CLI** instalados y configurados en tu máquina.

## Pasos

1. **Abre una terminal** y navega hasta la carpeta `lambdas/`.

2. **Instala las dependencias** (necesario para el paquete final, aunque Node.js 18 en AWS ya incluye la v3 del SDK por defecto, siempre es buena práctica empaquetarlo):
   ```bash
   npm install
   ```

3. **Construye el empaquetado de SAM:**
   ```bash
   sam build
   ```

4. **Despliega en la nube:**
   ```bash
   sam deploy --guided
   ```
   *Durante el proceso guiado, SAM te pedirá:*
   - **Stack Name:** Ingresa un nombre, ejemplo: `semi-social-image-uploader`
   - **AWS Region:** Selecciona tu región, ejemplo: `us-east-1`
   - **S3BucketName:** Ingresa el nombre de tu bucket de imágenes (por defecto `semi1proyecto-g6`)
   - Confirmaciones de seguridad (acepta que puede crear roles IAM e infraestructura API sin autenticación para pruebas rápidas).

5. **Obtén tu Endpoint:**
   Al finalizar el despliegue exitoso, la consola imprimirá un campo llamado `UploadApiEndpoint`. Copia ese link e inyéctalo en las variables de entorno de tu backend como la variable que apunte a la subida de imágenes (por ejemplo: `IMAGE_UPLOAD_API_URL`).
