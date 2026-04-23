router.post('/pair', async (req, res) => {
  const { username, number } = req.body;
  const sessions = req.app.get('sessions');
  const createBotInstance = req.app.get('createBotInstance');
  
  if (!username ||!number) return res.status(400).json({ error: 'Username and number required' });
  
  const cleanUser = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanNumber = number.replace(/[^0-9]/g, '');
  
  console.log(`[PAIR] Attempt: ${cleanUser} -> ${cleanNumber}`);
  
  if (cleanNumber.length < 10 || cleanNumber.length > 15) {
    return res.status(400).json({ error: 'Invalid number. Use: 254712345678' });
  }
  
  if (sessions.has(cleanUser)) {
    return res.status(400).json({ error: 'Username exists. Delete it first.' });
  }
  
  try {
    const sock = await createBotInstance(cleanUser);
    
    // Log all connection updates
    sock.ev.on('connection.update', (update) => {
      console.log(`[PAIR] ${cleanUser} update:`, update);
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    if (!sock.authState.creds.registered) {
      console.log(`[PAIR] Requesting code for ${cleanNumber}`);
      const code = await sock.requestPairingCode(cleanNumber);
      sessions.get(cleanUser).pairingCode = code;
      sessions.get(cleanUser).status = 'pairing';
      console.log(`[PAIR] SUCCESS ${cleanUser}: ${code}`);
      res.json({ code, success: true, username: cleanUser });
    } else {
      res.status(400).json({ error: 'Number already registered on WhatsApp Web' });
    }
    
  } catch (e) {
    console.error(`[PAIR] FAILED ${cleanUser}:`, e);
    console.error(`[PAIR] Stack:`, e.stack);
    sessions.delete(cleanUser);
    fs.rmSync(`./sessions/${cleanUser}`, { recursive: true, force: true });
    
    let errorMsg = e.message;
    if (e.message.includes('Connection Closed')) {
      errorMsg = 'WhatsApp closed connection. Causes: 1) Wrong number 2) Number banned 3) Already logged in elsewhere 4) Network issue';
    } else if (e.message.includes('405')) {
      errorMsg = 'WhatsApp rejected request. Number might be banned or invalid.';
    }
    
    res.status(500).json({ error: errorMsg, details: e.toString() });
  }
});
