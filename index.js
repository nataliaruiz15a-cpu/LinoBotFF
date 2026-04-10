const express = require('express');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs'); 

// --- SERVIDOR FANTASMA PARA LA NUBE ---
const app = express();
app.get('/', (req, res) => res.send('☁️ Lino bot está vivo en la nube'));
app.listen(process.env.PORT || 3000, () => console.log('Servidor web activo.'));

// --- MEMORIA ---
const configPath = './config.json';
let config = { 
    bienvenida: "¡Bienvenido al grupo de insanos! 👊", 
    despedida: "Se fue al lobby... 👋" 
};
if (fs.existsSync(configPath)) { config = JSON.parse(fs.readFileSync(configPath)); }
const guardarConfig = () => fs.writeFileSync(configPath, JSON.stringify(config));

// --- CONFIGURACIÓN PARA LINUX (NUBE) ---
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }
});

const BOT_NAME = '🤖 *Lino bot*';

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('📱 ESCANEA ESTE QR RÁPIDO CON EL CELULAR DEL BOT');
});

client.on('ready', () => {
    console.log('✅ Lino bot está 100% activo.');
});

// --- ENTRADAS Y SALIDAS ---
client.on('group_join', async (notification) => {
    const chat = await notification.getChat();
    for (let user of notification.recipientIds) {
        chat.sendMessage(`${BOT_NAME}\n\n${config.bienvenida}\n@${user.split('@')[0]}`, { mentions: [user] });
        if(fs.existsSync('./audios/bienvenido.mp3')){
            chat.sendMessage(MessageMedia.fromFilePath('./audios/bienvenido.mp3'), { sendAudioAsVoice: true });
        }
    }
});

client.on('group_leave', async (notification) => {
    const chat = await notification.getChat();
    for (let user of notification.recipientIds) {
        chat.sendMessage(`${BOT_NAME}\n\n@${user.split('@')[0]} ${config.despedida}`, { mentions: [user] });
    }
});

// --- MENSAJES Y COMANDOS ---
client.on('message', async msg => {
    const chat = await msg.getChat();
    if (!chat.isGroup) return;

    const texto = msg.body.toLowerCase();

    // 🎵 AUDIOS
    if (texto.includes('feliz jueves') && fs.existsSync('./audios/jueves.mp3')) {
        msg.reply(MessageMedia.fromFilePath('./audios/jueves.mp3'), null, { sendAudioAsVoice: true });
    }
    if (texto === 'hola' && fs.existsSync('./audios/hola.mp3')) {
        msg.reply(MessageMedia.fromFilePath('./audios/hola.mp3'), null, { sendAudioAsVoice: true });
    }

    if (!msg.body.startsWith('!')) return;

    // VALIDACIÓN DE ADMIN
    const contact = await msg.getContact();
    const authorId = msg.author || msg.from;
    const esAdmin = chat.participants.some(p => 
        (p.id._serialized === authorId || p.id._serialized === contact.id._serialized) && (p.isAdmin || p.isSuperAdmin)
    );

    if (!esAdmin) return;

    const comando = msg.body.toLowerCase().split(' ')[0];
    const args = msg.body.split(' ').slice(1).join(' ');
    const part = chat.participants;

    if (comando === '!menu' || comando === '!ayuda') {
        msg.reply(`${BOT_NAME} - PANEL\n\n🎮 *Juegos*\n!pvp\n!ruleta\n!pareja\n!infiel\n!sorteo\n!porcentaje [algo]\n\n⚙️ *Control*\n!setbienvenida [texto]\n!setdespedida [texto]\n!silenciar\n!abrir\n!nombre [nuevo]\n!sacar (respondiendo a alguien)`);
    }

    if (comando === '!setbienvenida') {
        if(!args) return; config.bienvenida = args; guardarConfig(); msg.reply('✅ Bienvenida guardada.');
    }
    if (comando === '!setdespedida') {
        if(!args) return; config.despedida = args; guardarConfig(); msg.reply('✅ Despedida guardada.');
    }

    if (comando === '!pvp') {
        const p1 = part[Math.floor(Math.random() * part.length)].id._serialized;
        const p2 = part[Math.floor(Math.random() * part.length)].id._serialized;
        chat.sendMessage(`⚔️ *PVP INSANO* ⚔️\n\n@${p1.split('@')[0]} VS @${p2.split('@')[0]}\n\n¿Quién ganará? 🩸`, { mentions: [p1, p2] });
    }
    if (comando === '!ruleta') {
        msg.reply(Math.random() < 0.2 ? '💥 *PUM!* Te moriste.' : '💨 *Click...* Te salvaste.');
    }
    if (comando === '!pareja') {
        const p1 = part[Math.floor(Math.random() * part.length)].id._serialized;
        const p2 = part[Math.floor(Math.random() * part.length)].id._serialized;
        chat.sendMessage(`❤️ Pareja ideal:\n@${p1.split('@')[0]} y @${p2.split('@')[0]}`, { mentions: [p1, p2] });
    }
    if (comando === '!infiel') {
        const infiel = part[Math.floor(Math.random() * part.length)].id._serialized;
        chat.sendMessage(`🚨 @${infiel.split('@')[0]} es 99% infiel 👀`, { mentions: [infiel] });
    }
    if (comando === '!sorteo') {
        const ganador = part[Math.floor(Math.random() * part.length)].id._serialized;
        chat.sendMessage(`🎉 Ganador del sorteo: @${ganador.split('@')[0]} 💎`, { mentions: [ganador] });
    }
    if (comando === '!porcentaje') {
        msg.reply(`📊 El porcentaje de ${args || 'insano'} es: *${Math.floor(Math.random() * 101)}%*`);
    }
    
    if (comando === '!silenciar') { await chat.setMessagesAdminsOnly(true); msg.reply('🤫 Grupo silenciado.'); }
    if (comando === '!abrir') { await chat.setMessagesAdminsOnly(false); msg.reply('🔊 Grupo abierto.'); }
    if (comando === '!nombre' && args) { await chat.setSubject(args); msg.reply('✅ Nombre cambiado.'); }
    if (comando === '!sacar' && msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();
        await chat.removeParticipants([quotedMsg.author || quotedMsg.from]);
        msg.reply('✅ Jugador expulsado.');
    }
});

client.initialize();