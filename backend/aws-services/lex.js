const { LexRuntimeV2Client, RecognizeTextCommand } = require('@aws-sdk/client-lex-runtime-v2');

const lexClient = new LexRuntimeV2Client({
  region: process.env.AWS_REGION,
});

async function sendLexMessage({ userId, message }) {
  if (!process.env.LEX_BOT_ID || !process.env.LEX_BOT_ALIAS_ID) {
    throw new Error('LEX_BOT_ID and LEX_BOT_ALIAS_ID must be configured');
  }

  const command = new RecognizeTextCommand({
    botId: process.env.LEX_BOT_ID,
    botAliasId: process.env.LEX_BOT_ALIAS_ID,
    localeId: process.env.LEX_LOCALE_ID || 'es_419',
    sessionId: `semi-social-${userId || 'guest'}`,    text: message,
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
