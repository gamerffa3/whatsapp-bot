const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session'
    })
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('📱 Scan this QR code with WhatsApp:');
});

client.on('ready', () => {
    console.log('✅ Bot is ready!');
});

client.on('message', async (message) => {
    if (message.body.toLowerCase() === '!ping') {
        await message.reply('🏓 Pong!');
    }
});

client.initialize();
