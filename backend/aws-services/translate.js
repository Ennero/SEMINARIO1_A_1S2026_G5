const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');

const translateClient = new TranslateClient({
  region: process.env.AWS_REGION,
});

async function translateText({ text, targetLanguageCode, sourceLanguageCode = 'auto' }) {
  const command = new TranslateTextCommand({
    Text: text,
    SourceLanguageCode: sourceLanguageCode,
    TargetLanguageCode: targetLanguageCode,
  });

  const response = await translateClient.send(command);
  return {
    translatedText: response.TranslatedText,
    sourceLanguageCode: response.SourceLanguageCode,
    targetLanguageCode,
  };
}

module.exports = {
  translateText,
};
