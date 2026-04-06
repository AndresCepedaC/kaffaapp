const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

// Initialize the WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, { small: true });
    console.log('📌 Escanea este código QR con la app de WhatsApp para vincular el bot.');
});

// Log when bot is ready
client.on('ready', () => {
    console.log('✅ WhatsApp Bot conectado y listo!');
});

// Minimal logger for incoming messages (optional, can be completely removed if strict silence is needed)
client.on('message', async msg => {
    if (msg.from === 'status@broadcast') return;
});

client.initialize();

// Setup Express Server to receive API calls from Java Spring Boot
const app = express();
app.use(express.json());

app.post('/send-message', async (req, res) => {
    const { chatId, message } = req.body;
    if (!chatId || !message) {
        return res.status(400).json({ error: 'chatId y message son requeridos.' });
    }

    try {
        await client.sendMessage(chatId, message);
        console.log(`📤 Mensaje enviado a ${chatId}`);
        res.status(200).json({ success: true, message: 'Mensaje enviado' });
    } catch (error) {
        console.error('❌ Error enviando mensaje por WhatsApp:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 API del Bot escuchando en http://localhost:${PORT}`);
});
