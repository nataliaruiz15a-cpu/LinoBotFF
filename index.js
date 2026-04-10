const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const fs = require('fs');

const app = express();

let qrImage = "";

app.get('/', (req, res) => {
    res.send('☁️ Lino bot está vivo en la nube');
});

app.get('/qr', (req, res) => {
    if (!qrImage) return res.send("⚠️ QR aún no generado. Reinicia el bot.");
    res.send(`<h2>Escanea el QR</h2><img src="${qrImage}" width="300">`);
});

app.listen(process.env.PORT || 3000, () => {
    console.log('✅ Servidor activo.');
});

const configPath = './config.json';

let config = { 
    bienvenida: "¡Bienvenido al grupo de insanos! 👊 Presentate con nombre y foto.", 
    despedida: "Se fue al lobby... 👋" 
};

if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath));
}

const guardarConfig = () => {
    fs.writeFileSync(configPath, JSON.stringify(config));
};

console.log('⏳ Iniciando Lino bot...');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    },
    webVersionCache: { type: 'none' }
});

const BOT_NAME = '🤖 *Lino bot*';

client.on('qr', async (qr) => {

    console.log('📱 Escanea el QR desde /qr');

    qrcode.generate(qr, { small: true });

    qrImage = await QRCode.toDataURL(qr);
});

client.on('ready', () => {
    console.log('✅ Lino bot está 100% activo.');
});

client.on('authenticated', () => {
    console.log('🔐 Sesión iniciada correctamente.');
});

client.on('auth_failure', msg => {
    console.error('❌ Error de autenticación', msg);
});

client.on('disconnected', reason => {
    console.log('⚠️ Bot desconectado:', reason);
    client.initialize();
});

client.on('group_join', async (notification) => {

    const chat = await notification.getChat();

    for (let user of notification.recipientIds) {

        chat.sendMessage(
            `${BOT_NAME}\n\n${config.bienvenida}\n@${user.split('@')[0]}`,
            { mentions: [user] }
        );

    }
});

client.on('group_leave', async (notification) => {

    const chat = await notification.getChat();

    for (let user of notification.recipientIds) {

        chat.sendMessage(
            `${BOT_NAME}\n\n@${user.split('@')[0]} ${config.despedida}`,
            { mentions: [user] }
        );

    }
});

client.on('message', async msg => {

    const chat = await msg.getChat();

    if (!chat.isGroup) return;

    if (!msg.body.startsWith('!') && !msg.body.startsWith('.')) return;

    const authorId = msg.author || msg.from;

    const esAdmin = chat.participants.some(
        p => p.id._serialized === authorId && (p.isAdmin || p.isSuperAdmin)
    );

    if (!esAdmin) return;

    const texto = msg.body.toLowerCase();

    const comando = texto.split(' ')[0];

    const args = msg.body.split(' ').slice(1).join(' ');

    if (comando === '.menu' || comando === '!menu') {

        const fecha = new Date().toLocaleDateString('es-MX');

        const menu = `
🤖 *LINO BOT*

👤 Usuario: @${authorId.split('@')[0]}
📅 Fecha: ${fecha}

COMANDOS

🔥 .menu
🔥 .todos
🔥 .n
🔥 .setbienvenida
🔥 .setdespedida
        `;

        chat.sendMessage(menu, { mentions: [authorId] });

    }

    if (comando === '.n') {

        if (!args) return msg.reply('❌ Escribe el anuncio.');

        const fecha = new Date().toLocaleDateString('es-MX');

        const mensaje = `${args}

💘 © LINO BOT | ${fecha}`;

        chat.sendMessage(mensaje);

    }

    if (comando === '.todos') {

        let menciones = [];

        let lista = `📢 LLAMADO GENERAL\n\n`;

        for (let participante of chat.participants) {

            let id = participante.id._serialized;

            menciones.push(id);

            lista += `🔥 @${id.split('@')[0]}\n`;

        }

        chat.sendMessage(lista, { mentions: menciones });

    }

    if (comando === '.setbienvenida') {

        if (!args) return msg.reply('❌ Escribe el mensaje.');

        config.bienvenida = args;

        guardarConfig();

        msg.reply('✅ Bienvenida guardada.');

    }

    if (comando === '.setdespedida') {

        if (!args) return msg.reply('❌ Escribe el mensaje.');

        config.despedida = args;

        guardarConfig();

        msg.reply('✅ Despedida guardada.');

    }

});

setInterval(() => {
    console.log("🟢 Bot activo...");
}, 300000);

client.initialize().catch(err => console.error('❌ ERROR FATAL:', err));