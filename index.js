const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const qrImage = require('qr-image'); // Usaremos esto para verlo en la web

const app = express();
let lastQr = "";

// Esto permitirá ver el QR entrando al link de tu bot
app.get('/', (req, res) => {
    if (lastQr) {
        const code = qrImage.image(lastQr, { type: 'png' });
        res.type('png');
        code.pipe(res);
    } else {
        res.send('Lino Bot está cargando... Si el QR no sale en la terminal, actualiza esta página en 1 minuto.');
    }
});

app.listen(process.env.PORT || 3000);

console.log('🚀 Iniciando Lino Bot con visualización web...');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    },
    webVersionCache: { type: 'none' } 
});

client.on('qr', (qr) => {
    lastQr = qr; // Guardamos el código para la web
    console.log('✅ QR GENERADO (Mira el link de la web si no aparece aquí):');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('✅ Lino Bot conectado con éxito!');
    lastQr = ""; // Limpiamos el QR
});

client.on('message', async msg => {
    if (msg.body === '.menu') msg.reply('🔥 Lino Bot Activo 🔥');
});

client.initialize();