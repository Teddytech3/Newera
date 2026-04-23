import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import express from 'express';
import { config } from './config.js';
import { Config } from './database/models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = pino({ level: 'silent' });
const app = express();
app.use(express.static('public'));
app.use(express.json());

// Store all active bot instances
const sessions = new Map();

async function connectDB() {
  try {
    await mongoose.connect(config.MONGODB_URI, { dbName: 'teddy-xmd' });
    console.log('✅ MongoDB Connected');
  } catch (e) {
    console.error('❌ MongoDB Error:', e);
    process.exit(1);
  }
}

// Create new bot instance for user
async function createBotInstance(username) {
  const sessionPath = `./sessions/${username}`;
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
  
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
    status: 'disconnected', 
    pairingCode: null,
    createdAt: Date.now()
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    const session = sessions.get(username);
    
    if (connection === 'connecting') session.status = 'connecting';
    
    if (connection === 'close') {
      session.status = 'disconnected';
      session.pairingCode = null;
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)? 
        lastDisconnect.error.output.statusCode!== DisconnectReason.loggedOut : true;
      
      if (shouldReconnect && fs.existsSync(`${sessionPath}/creds.json`)) {
        console.log(`Reconnecting ${username}...`);
        setTimeout(() => createBotInstance(username), 3000);
      } else {
        sessions.delete(username);
      }
    } else if (connection === 'open') {
      session.status = 'connected';
      session.pairingCode = null;
      console.log(`✅ ${username} Connected`);
      
      // Auto Join + Follow from DB
      const autoJoin = await Config.findOne({ key: `AUTO_JOIN_GROUP_${username}` });
      if (autoJoin?.value?.enabled && autoJoin.value.link) {
        try {
          const inviteCode = autoJoin.value.link.split('/').pop();
          await sock.groupAcceptInvite(inviteCode);
          console.log(`✅ ${username} joined group`);
        } catch (e) {}
      }
      
      const autoFollow = await Config.findOne({ key: `AUTO_FOLLOW_CHANNEL_${username}` });
      if (autoFollow?.value?.enabled && autoFollow.value.link) {
        try {
          const channelJid = autoFollow.value.link.includes('@newsletter') 
            ? autoFollow.value.link 
            : autoFollow.value.link.split('/').pop() + '@newsletter';
          await sock.newsletterFollow(channelJid);
          console.log(`✅ ${username} followed channel`);
        } catch (e) {}
      }
    }
  });

  return sock;
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/users', (req, res) => {
  const users = Array.from(sessions.entries()).map(([username, data]) => ({
    username,
    status: data.status,
    pairingCode: data.pairingCode
  }));
  res.json(users);
});

app.post('/api/pair', async (req, res) => {
  const { username, number } = req.body;
  if (!username ||!number) return res.status(400).json({ error: 'Username and number required' });
  
  const cleanUser = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  if (sessions.has(cleanUser)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  try {
    const sock = await createBotInstance(cleanUser);
    const code = await sock.requestPairingCode(number.replace(/[^0-9]/g, ''));
    sessions.get(cleanUser).pairingCode = code;
    sessions.get(cleanUser).status = 'pairing';
    res.json({ code, success: true, username: cleanUser });
  } catch (e) {
    sessions.delete(cleanUser);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/session/:username', (req, res) => {
  try {
    const { username } = req.params;
    const credsPath = `./sessions/${username}/creds.json`;
    if (!fs.existsSync(credsPath)) {
      return res.status(404).json({ error: 'No session found' });
    }
    const creds = fs.readFileSync(credsPath);
    const b64 = Buffer.from(creds).toString('base64');
    const customSession = `TEDDY-XMD~${b64}`;
    res.json({ session: customSession });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/logout/:username', (req, res) => {
  const { username } = req.params;
  if (sessions.has(username)) {
    sessions.get(username).sock.end();
    sessions.delete(username);
    fs.rmSync(`./sessions/${username}`, { recursive: true, force: true });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.listen(config.PORT, async () => {
  await connectDB();
  if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');
  console.log(`🌐 Multi-User Panel: http://localhost:${config.PORT}`);
});