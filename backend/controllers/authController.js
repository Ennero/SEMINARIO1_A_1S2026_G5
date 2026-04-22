const crypto = require('crypto');
const pool = require('../config/db');

const {
  signUpUser,
  confirmUserSignUp,
  loginWithPassword,
} = require('../aws-services/cognito');
const { uploadProfileImage } = require('../aws-services/imageUpload');
const {
  compareFaceWithProfileImage,
  detectLabelsFromImageUrl,
  detectLabelsFromImageBase64,
} = require('../aws-services/rekognition');
const { translateText } = require('../aws-services/translate');
const { sendLexMessage } = require('../aws-services/lex');

const DPI_PATTERN = /^\d{13}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_TRANSLATE_LANGUAGES = new Set(['es', 'en', 'it', 'pt']);

function hashPasswordMd5(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

function cleanUser(user) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    dpi: user.dpi,
    profileImageUrl: user.profile_image_url,
    cognitoSub: user.cognito_sub,
    createdAt: user.created_at,
  };
}

function normalizeImagePayload(imageInput) {
  if (typeof imageInput !== 'string') {
    return null;
  }

  return imageInput.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, '');
}

function extractAwsError(error) {
  const code = error.name || 'UnknownError';
  const msg = error.message || '';

  if (code === 'UsernameExistsException') {
    return { status: 409, message: 'El correo electrónico ya está registrado.' };
  }

  if (code === 'NotAuthorizedException') {
    return { status: 401, message: 'Credenciales inválidas.' };
  }

  if (code === 'UserNotFoundException') {
    return { status: 404, message: 'Usuario no encontrado en el sistema.' };
  }

  if (code === 'CodeMismatchException') {
    return { status: 400, message: 'El código de confirmación es inválido o incorrecto.' };
  }

  if (code === 'ExpiredCodeException') {
    return { status: 400, message: 'El código de confirmación ha expirado. Solicita otro.' };
  }
  
  if (code === 'InvalidPasswordException') {
    return { status: 400, message: 'La contraseña no cumple con los requisitos mínimos (8 caracteres, mayúscula, número, carácter especial).' };
  }

  if (code === 'InvalidParameterException' && msg.includes('attributes')) {
    return { status: 400, message: 'Faltan atributos requeridos por el sistema (como nombre, foto o apellido).' };
  }

  return { status: 500, message: `Error inesperado: ${msg}` };
}

async function registerUser(req, res) {
  try {
    const {
      fullName,
      email,
      username,
      dpi,
      password,
      confirmPassword,
      imageBase64,
      fileName,
      contentType,
    } = req.body;

    if (!fullName || !email || !dpi || !password || !confirmPassword || !imageBase64) {
      return res.status(400).json({
        error: 'fullName, email, dpi, password, confirmPassword, and imageBase64 are required.',
      });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (!DPI_PATTERN.test(dpi)) {
      return res.status(400).json({ error: 'DPI must contain exactly 13 digits.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must have at least 8 characters.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and confirmPassword do not match.' });
    }

    const normalizedUsername = username || email.split('@')[0];

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2 OR dpi = $3 LIMIT 1',
      [email, normalizedUsername, dpi]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({
        error: 'User with the same email, username, or DPI already exists in the database.',
      });
    }

    const imageUrl = await uploadProfileImage({
      imageBase64: normalizeImagePayload(imageBase64),
      fileName: fileName || `${normalizedUsername}-profile.jpg`,
      contentType: contentType || 'image/jpeg',
      email,
    });

    const nameParts = fullName.split(' ');
    const givenName = nameParts[0];
    const familyName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Usuario';

    const signUpResponse = await signUpUser({
      email,
      password,
      fullName,
      username: normalizedUsername,
      given_name: givenName,
      family_name: familyName,
      picture: imageUrl,
    });

    const passwordMd5 = hashPasswordMd5(password);
    const insertQuery = `
      INSERT INTO users (username, full_name, email, cognito_sub, dpi, password_md5, profile_image_url, face_image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, full_name, email, dpi, profile_image_url, cognito_sub, created_at
    `;

    const insertValues = [
      normalizedUsername,
      fullName,
      email,
      signUpResponse.UserSub || null,
      dpi,
      passwordMd5,
      imageUrl,
      imageUrl,
    ];

    const inserted = await pool.query(insertQuery, insertValues);

    return res.status(201).json({
      message: 'User registered. Check your email for the Cognito confirmation code.',
      user: cleanUser(inserted.rows[0]),
      requiresConfirmation: true,
    });
  } catch (error) {
    console.error('registerUser error:', error);
    const awsError = extractAwsError(error);
    return res.status(awsError.status).json({ error: awsError.message });
  }
}

async function confirmRegistration(req, res) {
  try {
    const { email, confirmationCode } = req.body;

    if (!email || !confirmationCode) {
      return res.status(400).json({
        error: 'email and confirmationCode are required.',
      });
    }

    await confirmUserSignUp({ email, confirmationCode });

    return res.status(200).json({
      message: 'User confirmed successfully. You can login now.',
    });
  } catch (error) {
    console.error('confirmRegistration error:', error);
    const awsError = extractAwsError(error);
    return res.status(awsError.status).json({ error: awsError.message });
  }
}

async function loginUser(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'identifier and password are required.' });
    }

    const authResult = await loginWithPassword({
      usernameOrEmail: identifier,
      password,
    });

    const localUser = await pool.query(
      'SELECT id, username, full_name, email, dpi, profile_image_url, face_image_url, cognito_sub, created_at FROM users WHERE email = $1 OR username = $1 LIMIT 1',
      [identifier]
    );

    if (localUser.rowCount === 0) {
      return res.status(404).json({
        error: 'User authenticated in Cognito but not found in local database.',
      });
    }

    return res.status(200).json({
      message: 'Login successful.',
      user: cleanUser(localUser.rows[0]),
      tokens: authResult.AuthenticationResult || null,
      challengeName: authResult.ChallengeName || null,
    });
  } catch (error) {
    console.error('loginUser error:', error);
    const awsError = extractAwsError(error);
    return res.status(awsError.status).json({ error: awsError.message });
  }
}

async function loginFacial(req, res) {
  try {
    const { email, imageBase64 } = req.body;

    if (!email || !imageBase64) {
      return res.status(400).json({ error: 'email and imageBase64 are required.' });
    }

    const userResult = await pool.query(
      'SELECT id, username, full_name, email, dpi, profile_image_url, face_image_url, cognito_sub, created_at FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userResult.rows[0];
    const faceImageUrl = user.face_image_url || user.profile_image_url;

    if (!faceImageUrl) {
      return res.status(400).json({
        error: 'This user does not have a facial image configured for login.',
      });
    }

    const threshold = Number(process.env.FACIAL_MATCH_THRESHOLD || 90);

    const compareResult = await compareFaceWithProfileImage({
      imageBase64,
      profileImageUrl: faceImageUrl,
      threshold,
    });

    if (compareResult.maxSimilarity < threshold) {
      return res.status(401).json({
        error: 'Face does not match the profile image.',
        similarity: compareResult.maxSimilarity,
      });
    }

    return res.status(200).json({
      message: 'Facial login validated successfully.',
      user: cleanUser(user),
      similarity: compareResult.maxSimilarity,
      threshold,
      faceVerified: true,
    });
  } catch (error) {
    console.error('loginFacial error:', error);
    const awsError = extractAwsError(error);
    return res.status(awsError.status).json({ error: awsError.message });
  }
}

async function getImageLabels(req, res) {
  try {
    const { imageUrl, imageBase64, maxLabels, minConfidence } = req.body;

    if (!imageUrl && !imageBase64) {
      return res.status(400).json({ error: 'imageUrl or imageBase64 is required.' });
    }

    const options = {
      maxLabels: Number(maxLabels || 15),
      minConfidence: Number(minConfidence || 70),
    };

    const labels = imageUrl
      ? await detectLabelsFromImageUrl({ imageUrl, ...options })
      : await detectLabelsFromImageBase64({ imageBase64, ...options });

    return res.status(200).json({ labels });
  } catch (error) {
    console.error('getImageLabels error:', error);
    const awsError = extractAwsError(error);
    return res.status(awsError.status).json({ error: awsError.message });
  }
}

async function translateContent(req, res) {
  try {
    const { text, targetLanguageCode } = req.body;

    if (!text || !targetLanguageCode) {
      return res.status(400).json({
        error: 'text and targetLanguageCode are required.',
      });
    }

    if (!ALLOWED_TRANSLATE_LANGUAGES.has(targetLanguageCode)) {
      return res.status(400).json({
        error: 'targetLanguageCode must be one of: es, en, it, pt.',
      });
    }

    const result = await translateText({ text, targetLanguageCode });
    return res.status(200).json(result);
  } catch (error) {
    console.error('translateContent error:', error);
    const awsError = extractAwsError(error);
    return res.status(awsError.status).json({ error: awsError.message });
  }
}

async function chatbotMessage(req, res) {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required.' });
    }

    const result = await sendLexMessage({ message, userId });
    return res.status(200).json(result);
  } catch (error) {
    console.error('chatbotMessage error:', error);
    const awsError = extractAwsError(error);
    return res.status(awsError.status).json({ error: awsError.message });
  }
}

async function logoutUser(req, res) {
  return res.status(200).json({ message: 'Logout handled in frontend by clearing local session.' });
}

module.exports = {
  registerUser,
  confirmRegistration,
  loginUser,
  loginFacial,
  getImageLabels,
  translateContent,
  chatbotMessage,
  logoutUser,
};
