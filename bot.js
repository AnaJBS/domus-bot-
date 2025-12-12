const venom = require('venom-bot');

// Número fixo que o bot vai responder (FORMATO DO WHATSAPP)
const NUMERO_CLIENTE = '5554984222800@c.us';

venom
  .create({
    session: 'teste-simples',
    multidevice: true,
    headless: false,
    useChrome: true,
    browserPathExecutable: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    disableSpins: true,
    logQR: true,
  })
  .then((client) => start(client))
  .catch((err) => console.error('Erro ao iniciar Venom:', err));

function start(client) {
  console.log('🤖 BOT INICIADO! Aguarde o Chrome abrir e envie mensagem do número autorizado.');

  // Apenas para acompanhar o estado da conexão
  client.onStateChange((state) => {
    console.log('🔄 Estado da sessão:', state);
  });

  // LISTENER PRINCIPAL
  client.onMessage(async (message) => {
    console.log('📩 Mensagem recebida:', {
      from: message.from,
      body: message.body,
      isGroup: message.isGroupMsg
    });

    // Ignorar grupos
    if (message.isGroupMsg) return;

    // Só responde se for o número autorizado
    if (message.from !== NUMERO_CLIENTE) {
      console.log('⚠️ Mensagem ignorada — não é o número autorizado.');
      return;
    }

    try {
      // Resposta simples (eco)
      await client.sendText(
        message.from,
        `Recebi tua mensagem: "${message.body}" 👌`
      );

      console.log('✅ Resposta enviada.');
    } catch (err) {
      console.error('❌ Erro ao responder:', err);
    }
  });
}
