import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs, { readdirSync } from 'fs';
import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = pino({ level: 'silent' });
const app = express();
app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));

const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const sessions = new Map();
const logs = new Map();
const stats = new Map();
let botCounter = 0;

function addLog(username, msg) {
  if (!logs.has(username)) logs.set(username, []);
  const logArr = logs.get(username);
  logArr.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
  if (logArr.length > 100) logArr.shift();
  console.log(`[${username}] ${msg}`);
}

function getSystemStats() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const cpuUsage = os.loadavg()[0];
  return {
    ram: {
      total: (totalMem / 1024 / 1024).toFixed(0),
      used: (usedMem / 1024 / 1024).toFixed(0),
      percent: ((usedMem / totalMem) * 100).toFixed(1)
    },
    cpu: {
      cores: os.cpus().length,
      load: cpuUsage.toFixed(2),
      percent: ((cpuUsage / os.cpus().length) * 100).toFixed(1)
    },
    uptime: Math.floor(os.uptime() / 60)
  };
}

function getProcessStats() {
  const mem = process.memoryUsage();
  return {
    heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2),
    rss: (mem.rss / 1024 / 1024).toFixed(2)
  };
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'teddy-xmd' });
    addLog('SYSTEM', '✅ MongoDB Connected');
  } catch (e) {
    addLog('SYSTEM', `❌ MongoDB Error: ${e.message}`);
  }
}

async function createBotInstance(username, sessionB64) {
  const sessionPath = `./sessions/${username}`;
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

  try {
    const cleanSession = sessionB64.replace('TEDDY-XMD~', '').trim();
    const sessionData = Buffer.from(cleanSession, 'base64').toString();
    JSON.parse(sessionData);
    fs.writeFileSync(`${sessionPath}/creds.json`, sessionData);
    addLog(username, '📥 Session imported');
  } catch (e) {
    addLog(username, `❌ Invalid session: ${e.message}`);
    return null;
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: state,
    browser: Browsers.macOS(`TEDDY-XMD-${username}`)
  });

  sessions.set(username, {
    sock,
    status: 'connecting',
    number: null,
    startTime: Date.now(),
    msgCount: 0,
    sessionB64
  });

  stats.set(username, { cpu: 0, lastCpu: process.cpuUsage() });

  // Load plugins
  const commands = new Map();
  const pluginPath = path.join(__dirname, 'plugins');
  if (fs.existsSync(pluginPath)) {
    const pluginFiles = readdirSync(pluginPath).filter(f => f.endsWith('.js'));
    for (const file of pluginFiles) {
      try {
        const plugin = await import(`./plugins/${file}?update=${Date.now()}`);
        if (plugin.command && plugin.handler) {
          commands.set(plugin.command, plugin.handler);
        }
      } catch (e) {
        addLog(username, `❌ Plugin ${file}: ${e.message}`);
      }
    }
    addLog(username, `✅ Loaded ${commands.size} plugins`);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    const session = sessions.get(username);
    if (!session) return;

    if (connection === 'close') {
      const code = lastDisconnect?.error instanceof Boom? lastDisconnect.error.output.statusCode : 0;
      addLog(username, `❌ Disconnected: ${DisconnectReason[code] || code}`);
      const shouldReconnect = code!== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        addLog(username, '🔄 Reconnecting in 3s...');
        setTimeout(() => createBotInstance(username, sessionB64), 3000);
      } else {
        session.status = 'logged_out';
        addLog(username, '🚪 Logged out');
      }
    } else if (connection === 'open') {
      session.status = 'connected';
      session.number = sock.user?.id?.split(':')[0];
      addLog(username, `✅ Connected as ${session.number}`);
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const session = sessions.get(username);
    if (session) session.msgCount++;

    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    if (!text.startsWith('.')) return;

    const cmd = text.slice(1).split(' ')[0].toLowerCase();
    const args = text.slice(1).split(' ').slice(1);

    if (commands.has(cmd)) {
      try {
        addLog(username, `⚡ Command:.${cmd}`);
        await commands.get(cmd)(sock, msg, args);
      } catch (e) {
        addLog(username, `❌ Cmd error.${cmd}: ${e.message}`);
      }
    }
  });

  return sock;
}

function checkAuth(req, res, next) {
  if (req.headers.password!== ADMIN_PASS) {
    return res.status(401).json({ error: 'Wrong password' });
  }
  next();
}

setInterval(() => {
  sessions.forEach((data, username) => {
    if (data.status === 'connected') {
      data.sock.sendPresenceUpdate('available').catch(() => {});
      const stat = stats.get(username);
      if (stat) {
        const current = process.cpuUsage(stat.lastCpu);
        stat.cpu = ((current.user + current.system) / 1000000).toFixed(2);
        stat.lastCpu = process.cpuUsage();
      }
    }
  });
  if (global.gc && Date.now() % (30 * 60 * 1000) < 5000) global.gc();
}, 5 * 60 * 1000);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/login', (req, res) => {
  if (req.body.password === ADMIN_PASS) res.json({ success: true });
  else res.status(401).json({ error: 'Wrong password' });
});

app.get('/api/stats', checkAuth, (req, res) => {
  const bots = Array.from(sessions.entries()).map(([username, data]) => ({
    username,
    status: data.status,
    number: data.number || 'connecting...',
    uptime: Math.floor((Date.now() - data.startTime) / 1000 / 60),
    msgCount: data.msgCount,
    cpu: stats.get(username)?.cpu || '0.00'
  }));

  res.json({
    system: getSystemStats(),
    process: getProcessStats(),
    bots,
    total: bots.length,
    active: bots.filter(b => b.status === 'connected').length
  });
});

app.post('/api/bulk-import', checkAuth, async (req, res) => {
  const { sessions: sessionsData } = req.body;
  const results = [];
  for (const item of sessionsData) {
    let username, session;
    if (item.includes(':TEDDY-XMD~')) {
      [username, session] = item.split(':TEDDY-XMD~');
      username = username.trim().replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
      session = 'TEDDY-XMD~' + session.trim();
    } else if (item.startsWith('TEDDY-XMD~')) {
      botCounter++;
      username = `bot${botCounter}`;
      session = item.trim();
    } else {
      results.push({ success: false, error: 'Invalid format' });
      continue;
    }

    if (sessions.has(username)) {
      results.push({ username, success: false, error: 'Name exists' });
      continue;
    }

    addLog(username, '⏳ Starting bot...');
    const sock = await createBotInstance(username, session);
    results.push({ username, success:!!sock });
    await new Promise(r => setTimeout(r, 2000));
  }
  res.json({ results });
});

app.get('/api/logs/:username', checkAuth, (req, res) => {
  res.json({ logs: logs.get(req.params.username) || [] });
});

app.delete('/api/stop/:username', checkAuth, (req, res) => {
  const { username } = req.params;
  if (sessions.has(username)) {
    sessions.get(username).sock.end();
    sessions.delete(username);
    stats.delete(username);
    addLog(username, '🛑 Stopped');
    res.json({ success: true });
  } else res.status(404).json({ error: 'Not found' });
});

app.listen(process.env.PORT || 3000, async () => {
  await connectDB();
  if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');
  if (!fs.existsSync('./plugins')) fs.mkdirSync('./plugins');
  addLog('SYSTEM', `🌐 Panel on port ${process.env.PORT || 3000}`);
});

process.on('uncaughtException', e => addLog('SYSTEM', `Crash: ${e.message}`));
