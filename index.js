const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// El servidor para que Render no se enoje
const app = express();
app.get('/', (req, res) => res.send('Modo seguro activo'));
app.listen(process.env.PORT || 3000, () => console.log('✅ Servidor web encendido.'));

console.log('⚡ Iniciando en MODO SEGURO (Bajo consumo de RAM)...');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage', 
            '--disable-gpu',
            '--single-process'
        ]
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('📱 ¡RÁPIDO! ESCANEA EL QR ANTES DE QUE SE CANCELE:');
});

client.on('ready', () => {
    console.log('🎉 ¡VICTORIA! SESIÓN GUARDADA CON ÉXITO.');
    console.log('👉 AHORA SÍ, YA PUEDES PONER EL CÓDIGO DEL MENÚ GIGANTE.');
});

client.initialize().catch(err => console.log('❌ Error:', err));
