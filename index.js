const express = require('express');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs'); 

const app = express();
app.get('/', (req, res) => res.send('☁️ Lino bot está vivo en la nube'));
app.listen(process.env.PORT || 3000, () => console.log('✅ Servidor web encendido.'));

const configPath = './config.json';
let config = { 
    bienvenida: "¡Bienvenido al grupo de insanos! 👊 Presentate con nombre y foto.", 
    despedida: "Se fue al lobby... 👋" 
};
if (fs.existsSync(configPath)) { config = JSON.parse(fs.readFileSync(configPath)); }
const guardarConfig = () => fs.writeFileSync(configPath, JSON.stringify(config));

console.log('⏳ Abriendo el navegador invisible...');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--js-flags="--max-old-space-size=512"' // 🔥 OBLIGAMOS A NO USAR TANTA RAM 🔥
        ] 
    },
    webVersionCache: { type: 'none' } 
});

const BOT_NAME = '🤖 *Lino bot*';

// 📡 EL RADAR: ESTO NOS DIRÁ SI SE ESTÁ MOVIENDO O SE TRABÓ
client.on('loading_screen', (percent, message) => {
    console.log(`📡 RADAR: Cargando WhatsApp Web... ${percent}% | ${message}`);
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('📱 ¡POR FIN! ESCANEA ESTE QR RÁPIDO:');
});

client.on('ready', () => {
    console.log('✅ Lino bot está 100% activo.');
});

client.on('group_join', async (notification) => {
    const chat = await notification.getChat();
    for (let user of notification.recipientIds) {
        chat.sendMessage(`${BOT_NAME}\n\n${config.bienvenida}\n@${user.split('@')[0]}`, { mentions: [user] });
    }
});

client.on('group_leave', async (notification) => {
    const chat = await notification.getChat();
    for (let user of notification.recipientIds) {
        chat.sendMessage(`${BOT_NAME}\n\n@${user.split('@')[0]} ${config.despedida}`, { mentions: [user] });
    }
});

client.on('group_admin_changed', async (notification) => {
    if (notification.action === 'promote') {
        const chat = await notification.getChat();
        const promoterId = notification.author; 
        
        for (let adminId of notification.recipientIds) {
            const mensaje = `┌─『 👑 NUEVO ADMIN 』─┐\n│ 👤 Usuario:\n│ @${adminId.split('@')[0]}\n│ ✅ Ascendido por:\n│ @${promoterId.split('@')[0]}\n└──────────────┘`;
            chat.sendMessage(mensaje, { mentions: [adminId, promoterId] });
        }
    }
});

client.on('message', async msg => {
    const chat = await msg.getChat();
    if (!chat.isGroup) return;

    if (!msg.body.startsWith('!') && !msg.body.startsWith('.')) return;

    const authorId = msg.author || msg.from;
    const esAdmin = chat.participants.some(p => p.id._serialized === authorId && (p.isAdmin || p.isSuperAdmin));

    const texto = msg.body.toLowerCase();
    const comando = texto.split(' ')[0]; 
    const args = msg.body.split(' ').slice(1).join(' ');

    if (!esAdmin) return; 

    if (comando === '.menu' || comando === '!menu' || comando === '.help') {
        const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const fecha = new Date().toLocaleDateString('es-MX', opciones);
        const leerMas = String.fromCharCode(8206).repeat(4000);

        const menuTexto = `🫧゜・☆。。・゜゜🔥・。☆。・゜🫧
𝐇𝐎𝐋𝐀, 𝐒𝐎𝐘 𝐋𝐈𝐍𝐎 𝐁𝐎𝐓 🤖
╭┈────────────── 
│ •≡ 𝑴𝒆𝒏𝒖: Completo
│ •≡ 𝑼𝒔𝒖𝒂𝒓𝒊𝒐: @${authorId.split('@')[0]}
│ •≡ 𝑭𝒆𝒄𝒉𝒂: ${fecha}
│ •≡ 𝑴𝒐𝒅𝒐: Privado
│ •≡ 𝑪𝒓𝒆𝒂𝒅𝒐𝒓𝒂: wa.me/5218716926709
╰┈┈┈┈┈┈┈┈┈➤${leerMas}

𝐏𝐀𝐑𝐀 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐂𝐈Ó𝐍
╭─────❀
│🔥 .daradmins
│🔥 .audioon/off
│🔥 .welcomeaudio
│🔥 .byeaudio
│🔥 .welcomeaudioon/off
│🔥 .quitaradmins
│🔥 .kick
│🔥 .kickall
│🔥 .tag/n
│🔥 .tagall
│🔥 .todos
│🔥 .invocar
│🔥 .totalchat
│🔥 .restchat
│🔥 .fantasmas
│🔥 .fankick
│🔥 .delete
│🔥 .linkgrupo
│🔥 .mute
│🔥 .unmute
│🔥 .ban
│🔥 .unban
│🔥 .restpro
│🔥 .abrirgrupo
│🔥 .cerrargrupo
│🔥 .infogrupo
│🔥 .setinfo
│🔥 .setname
│🔥 .setwelcome
│🔥 .setdespedidas
│🔥 .settagemoji
│🔥 .setfoto
│🔥 .setreglas
│🔥 .reglas
│🔥 .welcome on/off
│🔥 .despedidas on/off
│🔥 .modoadmins on/off
│🔥 .antilink on/off
│🔥 .linkall on/off
│🔥 .antis on/off
│🔥 .antidelete on/off
│🔥 .antiarabe on/off
│🔥 .configrupo
│🔥 .addco 
│🔥 .delco 
╰─────❀

    ☁️*𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈𝐎𝐍☁️
╭─────❀
│🔥 .menugrupo
│🔥 .menuowner
│🔥 .menufree
│🔥 .menuventas
│🔥 .ping
│🔥 .creador
│🔥 .help
│🔥 .info
╰─────❀

     ☁️𝐌𝐈𝐍𝐈 𝐉𝐔𝐄𝐆𝐎𝐒☁️
╭─────❀
│🔥 .verdad / reto
│🔥 .personalidad
│🔥 .parejas / ship
│🔥 .kiss / topkiss
│🔥 .slap / topslap
│🔥 .top
│🔥 .topgay
│🔥 .ahorcado
│🔥 .doxeofull
│🔥 .doxeo
│🔥 .pajero
│🔥 .acertijo
│🔥 .consejo
│🔥 .piropo
│🔥 .pajeame
│🔥 .sorteo
│🔥 .sorteo2
│🔥 .horario
╰─────❀

     ☁️𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐒☁️
╭─────❀
│🔥 .play
│🔥 .play2
│🔥 .ytmp3
│🔥 .ytmp4
│🔥 .ytmp3doc
│🔥 .ytmp4doc
│🔥 .tiktok
│🔥 .fb
│🔥 .ig
│🔥 .spoti
│🔥 .mediafire
│🔥 .apk
│🔥 .pin
╰─────❀

    ☁️𝐁𝐔𝐒𝐂𝐀𝐃𝐎𝐑𝐄𝐒☁️
╭─────❀
│🔥 .pixai
│🔥 .tiktoksearch
│🔥 .yts
│🔥 .tiktokstalk
╰─────❀

    ☁️𝐇𝐄𝐑𝐑𝐀𝐌𝐈𝐄𝐍𝐓𝐀𝐒☁️
╭─────❀
│🔥 .s
│🔥 .brat
│🔥 .qc
│🔥 .qc2
│🔥 .texto
│🔥 .tomp3
│🔥 .toaudio
│🔥 .hd
│🔥 .tts
│🔥 .tovideo
│🔥 .toimg
│🔥 .gifvideo
│🔥 .ff / ff2
│🔥 .ver
│🔥 .perfil
│🔥 .get
│🔥 .tourl
│🔥 .whatmusic
╰─────❀`;

        chat.sendMessage(menuTexto, { mentions: [authorId] });
    }

    if (comando === '.n' || comando === '!n') {
        if(!args) return msg.reply('❌ Escribe el anuncio que quieres dar.');
        const opciones = { day: 'numeric', month: 'long' };
        const fecha = new Date().toLocaleDateString('es-MX', opciones);
        const mensaje = `${args}\n\n💘 © LINO BOT | ${fecha}`;
        chat.sendMessage(mensaje);
    }

    if (comando === '.todos' || comando === '!todos') {
        let menciones = [];
        let lista = `┌─『 📢 ${args || 'LLAMADO GENERAL'} 』─┐\n`;
        for (let participante of chat.participants) {
            let id = participante.id._serialized;
            menciones.push(id);
            lista += `│ 🔥 @${id.split('@')[0]}\n`;
        }
        lista += `└──────────────┘`;
        chat.sendMessage(lista, { mentions: menciones });
    }

    if (comando === '.setbienvenida' || comando === '!setbienvenida') {
        if(!args) return msg.reply('❌ Escribe el mensaje después del comando.');
        config.bienvenida = args; guardarConfig(); msg.reply('✅ Nueva bienvenida guardada.');
    }

    if (comando === '.setdespedida' || comando === '!setdespedida') {
        if(!args) return msg.reply('❌ Escribe el mensaje después del comando.');
        config.despedida = args; guardarConfig(); msg.reply('✅ Nueva despedida guardada.');
    }
});

client.initialize().catch(err => console.error('❌ ERROR FATAL:', err));