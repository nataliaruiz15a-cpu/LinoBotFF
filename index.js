const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.get('/', (req, res) => res.send('Modo seguro activo'));
app.listen(process.env.PORT || 3000, () => console.log('✅ Servidor web encendido.'));

console.log('⚡ Iniciando Bot (Sin candado ciego)...');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage', 
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
            // 🔥 LE QUITAMOS EL "--single-process" QUE LO ESTABA CONGELANDO 🔥
        ]
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('📱 ¡POR FIN! ESCANEA EL QR RÁPIDO:');
});

client.on('ready', () => {
    console.log('🎉 ¡VICTORIA TOTAL! SESIÓN GUARDADA CON ÉXITO.');
    console.log('👉 Ahora sí, ya podemos regresarle su menú gigante.');
});

client.initialize().catch(err => console.log('❌ Error:', err));