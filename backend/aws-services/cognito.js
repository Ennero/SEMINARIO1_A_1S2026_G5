const crypto = require('crypto');
const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION || process.env.AWS_REGION,
});

function buildSecretHash(username) {
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;

  if (!clientSecret) {
    return undefined;
  }

  return crypto
    .createHmac('sha256', clientSecret)
    .update(`${username}${process.env.COGNITO_CLIENT_ID}`)
    .digest('base64');
}

async function signUpUser({ email, password, fullName, username, given_name, family_name, picture }) {
  const attributes = [
    { Name: 'email', Value: email },
    { Name: 'name', Value: fullName },
    { Name: 'given_name', Value: given_name || fullName.split(' ')[0] },
    { Name: 'family_name', Value: family_name || fullName.split(' ').slice(1).join(' ') || 'N/A' },
  ];

  if (picture) {
    attributes.push({ Name: 'picture', Value: picture });
  }

  if (username) {
    attributes.push({ Name: 'preferred_username', Value: username });
  }

  const commandInput = {
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: attributes,
  };

  const secretHash = buildSecretHash(email);
  if (secretHash) {
    commandInput.SecretHash = secretHash;
  }

  const command = new SignUpCommand(commandInput);
  return cognitoClient.send(command);
}

async function confirmUserSignUp({ email, confirmationCode }) {
  const commandInput = {
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    ConfirmationCode: confirmationCode,
  };

  const secretHash = buildSecretHash(email);
  if (secretHash) {
    commandInput.SecretHash = secretHash;
  }

  const command = new ConfirmSignUpCommand(commandInput);
  return cognitoClient.send(command);
}

async function loginWithPassword({ usernameOrEmail, password }) {
  const authParameters = {
    USERNAME: usernameOrEmail,
    PASSWORD: password,
  };

  const secretHash = buildSecretHash(usernameOrEmail);
  if (secretHash) {
    authParameters.SECRET_HASH = secretHash;
  }

  const command = new InitiateAuthCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthFlow: 'USER_PASSWORD_AUTH',
    AuthParameters: authParameters,
  });

  return cognitoClient.send(command);
}

module.exports = {
  signUpUser,
  confirmUserSignUp,
  loginWithPassword,
};
