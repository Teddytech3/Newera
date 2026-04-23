import express from 'express';
import fs from 'fs';
import path from 'path';
import { Config } from '../database/models.js';

const router = express.Router();

// Get all active users
router.get('/users', (req, res) => {
  const sessions = req.app.get('sessions');
  const users = Array.from(sessions.entries()).map(([username, data]) => ({
    username,
    status: data.status,
    pairingCode: data.pairingCode,
    createdAt: data.createdAt
  }));
  res.json(users);
});

// Pair new user
router.post('/pair', async (req, res) => {
  const { username, number } = req.body;
  const sessions = req.app.get('sessions');
  const createBotInstance = req.app.get('createBotInstance');
  
  if (!username ||!number) return res.status(400).json({ error: 'Username and number required' });
  
  const cleanUser = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanNumber = number.replace(/[^0-9]/g, '');
  
  if (cleanNumber.length < 10) {
    return res.status(400).json({ error: 'Invalid number. Use format: 254712345678' });
  }
  
  if (sessions.has(cleanUser)) {
    return res.status(400).json({ error: 'Username already exists or connecting' });
  }
  
  try {
    console.log(`Pairing ${cleanUser} with ${cleanNumber}`);
    const sock = await createBotInstance(cleanUser);
    
    await new Promise(r => setTimeout(r, 2000));
    
    if (!sock.authState.creds.registered) {
      const code = await sock.requestPairingCode(cleanNumber);
      sessions.get(cleanUser).pairingCode = code;
      sessions.get(cleanUser).status = 'pairing';
      console.log(`Code for ${cleanUser}: ${code}`);
      res.json({ code, success: true, username: cleanUser });
    } else {
      res.status(400).json({ error: 'Already registered' });
    }
    
  } catch (e) {
    console.error(`Pair error for ${cleanUser}:`, e.message);
    sessions.delete(cleanUser);
    fs.rmSync(`./sessions/${cleanUser}`, { recursive: true, force: true });
    
    if (e.message.includes('Connection Closed')) {
      res.status(500).json({ error: 'Connection closed. Check: 1) Number format 2) Logout other devices 3) Try again' });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
});

// Export session
router.get('/session/:username', (req, res) => {
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

// Import session
router.post('/session/import', async (req, res) => {
  try {
    const { username, session } = req.body;
    if (!username ||!session) return res.status(400).json({ error: 'Username and session required' });

    const cleanUser = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    let cleanSession = session.trim();
    
    if (cleanSession.startsWith('TEDDY-XMD~')) {
      cleanSession = cleanSession.replace('TEDDY-XMD~', '');
    }
    
    const sessionData = Buffer.from(cleanSession, 'base64').toString();
    const sessionObj = JSON.parse(sessionData);
    
    if (!sessionObj.noiseKey) {
      return res.status(400).json({ error: 'Invalid session format' });
    }
    
    const sessionPath = `./sessions/${cleanUser}`;
    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
    fs.writeFileSync(`${sessionPath}/creds.json`, JSON.stringify(sessionObj, null, 2));
    
    const createBotInstance = req.app.get('createBotInstance');
    await createBotInstance(cleanUser);
    
    res.json({ success: true, message: `Bot for ${cleanUser} started` });
    
  } catch (e) {
    res.status(500).json({ error: 'Invalid session: ' + e.message });
  }
});

// Logout user
router.delete('/logout/:username', (req, res) => {
  const { username } = req.params;
  const sessions = req.app.get('sessions');
  
  if (sessions.has(username)) {
    sessions.get(username).sock.end();
    sessions.delete(username);
    fs.rmSync(`./sessions/${username}`, { recursive: true, force: true });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Get/Set user config
router.get('/config/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const configs = await Config.find({ key: new RegExp(`_${username}$`) });
    const configObj = {};
    configs.forEach(c => {
      const key = c.key.replace(`_${username}`, '');
      configObj[key] = c.value;
    });
    res.json(configObj);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/config/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { key, value } = req.body;
    await Config.updateOne(
      { key: `${key}_${username}` }, 
      { $set: { value } }, 
      { upsert: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
