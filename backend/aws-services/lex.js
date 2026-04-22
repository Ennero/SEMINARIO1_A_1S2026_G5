const { LexRuntimeV2Client, RecognizeTextCommand } = require('@aws-sdk/client-lex-runtime-v2');

const lexClient = new LexRuntimeV2Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

async function sendLexMessage({ userId, message }) {
  const botId = process.env.LEX_BOT_ID || 'DWUDBVG2LS';
  const botAliasId = process.env.LEX_BOT_ALIAS_ID || 'TSTALIASID';

  const command = new RecognizeTextCommand({
    botId: botId,
    botAliasId: botAliasId,
    localeId: 'es_419',
    sessionId: `semi-social-${userId || 'guest'}`,
    text: message,
  });

  const response = await lexClient.send(command);
  const firstMessage = (response.messages || [])[0];

  return {
    messages: response.messages || [],
    firstMessage: firstMessage ? firstMessage.content : '',
    sessionId: response.sessionId,
  };
}

module.exports = {
  sendLexMessage,
};
