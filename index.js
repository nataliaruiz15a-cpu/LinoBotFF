const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.get('/', (req, res) => res.send('Lino Bot Online'));
app.listen(process.env.PORT || 3000);

console.log('🚀 Iniciando Lino Bot Optimizado...');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--single-process',
            '--disable-extensions'
        ]
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    }
});

client.on('qr', (qr) => {
    console.log('✅ QR GENERADO:');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('✅ Lino Bot conectado con éxito!');
});

client.on('message', async msg => {
    if (msg.body === '.menu') {
        msg.reply('🔥 *LINO BOT ACTIVO* 🔥\n\n¡Funcionando correctamente!');
    }
});

client.initialize();