const fs = require('fs');
const fse = require('fs-extra');
const qrcode = require('qrcode-terminal');
const readline = require('readline');
const { Client, LocalAuth } = require('whatsapp-web.js');
const linkExtractor = require('./utils/linkExtractor');
const mensagens = require('./messages');

const gruposVisitadosPath = './grupos_visitados.txt';
const gruposAutorizadosPath = './grupos_autorizados.txt';
const gruposMensagemPath = './grupos_mensagens.txt';
const logEntradaPath = './logs/entrada.log';
const logErroPath = './logs/erros.log';

const ESCUTAR_TODOS = process.env.ESCUTAR_TODOS === '1';
const DELAY_ENTRADA = parseInt(process.env.DELAY_ENTRADA_MS) || 10000;
const ESPERA_CARREGAR_CHAT_MS = parseInt(process.env.ESPERA_CARREGAR_CHAT_MS) || 3000;
const TECLA_TODOS = (process.env.TECLA_TODOS || 'M').toLowerCase();
const TECLA_NOVOS = (process.env.TECLA_NOVOS || 'N').toLowerCase();

let historicoEntrada = [];

function logConsole(mensagem) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${mensagem}`);
}

function salvarGrupoVisitado(id, nome) {
  fs.appendFileSync(gruposVisitadosPath, `${id} - ${nome}\n`);
}

function salvarGrupoComMensagem(id) {
  fs.appendFileSync(gruposMensagemPath, `${id}\n`);
}

function grupoJaRecebeuMensagem(id) {
  if (!fs.existsSync(gruposMensagemPath)) return false;
  return fs.readFileSync(gruposMensagemPath, 'utf8').includes(id);
}

function salvarLogEntrada(texto) {
  fs.appendFileSync(logEntradaPath, `${new Date().toISOString()} - ${texto}\n`);
}

function salvarLogErro(texto) {
  fs.appendFileSync(logErroPath, `${new Date().toISOString()} - ${texto}\n`);
}

function grupoJaVisitado(id) {
  if (!fs.existsSync(gruposVisitadosPath)) return false;
  return fs.readFileSync(gruposVisitadosPath, 'utf8').includes(id);
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function iniciarBot() {
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    logConsole(`${process.env.BOT_NOME} está online!`);

    console.log('\n🧩 Atalhos disponíveis:');
    console.log(`▶️ Pressione "${TECLA_TODOS.toUpperCase()}" para enviar mensagem a todos os grupos`);
    console.log(`▶️ Pressione "${TECLA_NOVOS.toUpperCase()}" para enviar mensagem apenas a grupos que ainda não receberam\n`);
  });

  client.on('message', async msg => {
    
    try {
        const chat = await msg.getChat();
        logConsole(`📩 Mensagem recebida: ${msg.body}`); // <-- aqui

        const links = linkExtractor(msg.body);
        logConsole(`🔍 Links detectados: ${JSON.stringify(links)}`); // <-- aqui

        if (!links.length) {
        logConsole(`❌ Nenhum link de grupo detectado.`);
        return;
        }


      for (const link of links) {
        const groupCode = link.split('/').pop();

        if (grupoJaVisitado(groupCode)) {
          logConsole(`🔁 Grupo já visitado: ${groupCode}`);
          continue;
        }

        logConsole(`➡️ Tentando entrar no grupo com link: ${link}`);

        let chatInvite = null;
        try {
          chatInvite = await client.acceptInvite(groupCode);
        } catch (e) {
          logConsole(`❌ WhatsApp rejeitou o convite (${groupCode}): ${e.message}`);
          salvarLogErro(`Erro ao aceitar convite: ${e.message}`);
          await esperar(DELAY_ENTRADA);
          continue;
        }

        let joinedChat = null;
        for (let tentativa = 1; tentativa <= 5; tentativa++) {
          await esperar(ESPERA_CARREGAR_CHAT_MS);
          const allChats = await client.getChats();
          joinedChat = allChats.find(c => c.isGroup && c.inviteCode === groupCode);
          if (joinedChat) break;
        }

        if (!joinedChat) {
          logConsole(`⚠️ Entrou no grupo (${groupCode}), mas não conseguiu localizar o chat.`);
          salvarGrupoVisitado(groupCode, "Aguardando sincronia");
          salvarLogEntrada(`${groupCode} - Aguardando sincronia`);
          await esperar(DELAY_ENTRADA);
          continue;
        }

        const newGroupName = joinedChat.name || 'Sem nome';
        const newGroupId = joinedChat.id ? joinedChat.id._serialized : null;

        salvarGrupoVisitado(groupCode, newGroupName);
        salvarLogEntrada(`${groupCode} - ${newGroupName}`);
        logConsole(`✅ Entrou no grupo: ${newGroupName} (${newGroupId})`);

        historicoEntrada.push({ id: newGroupId, timestamp: Date.now() });

        await esperar(DELAY_ENTRADA);
      }
    } catch (err) {
      salvarLogErro(`Erro geral: ${err.message}`);
    }
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("line", async (input) => {
    const tecla = input.trim().toLowerCase();

    if (tecla === TECLA_TODOS) {
      logConsole(`📦 Enviando mensagens para TODOS os grupos...`);
      const allChats = await client.getChats();
      for (const chat of allChats) {
        if (chat.isGroup) {
          await chat.sendMessage(mensagens.sortear());
          salvarGrupoComMensagem(chat.id._serialized);
          logConsole(`📨 [${tecla.toUpperCase()}] Mensagem enviada para: ${chat.name}`);
          await esperar(1000);
        }
      }
    }

    if (tecla === TECLA_NOVOS) {
      logConsole(`📦 Enviando mensagens apenas para grupos que ainda não receberam...`);
      const allChats = await client.getChats();
      for (const chat of allChats) {
        if (chat.isGroup && !grupoJaRecebeuMensagem(chat.id._serialized)) {
          await chat.sendMessage(mensagens.sortear());
          salvarGrupoComMensagem(chat.id._serialized);
          logConsole(`📨 [${tecla.toUpperCase()}] Mensagem enviada para: ${chat.name}`);
          await esperar(1000);
        }
      }
    }
  });

  client.initialize();
}

module.exports = { iniciarBot };
