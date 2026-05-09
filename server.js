const express = require('express');
const { AccessToken } = require('livekit-server-sdk');

const app = express();
app.use(express.json());

// Environment variables (Railway'de ayarlayacağız)
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
  console.error("Missing required environment variables!");
  process.exit(1);
}

app.post('/get-token', async (req, res) => {
  try {
    const { kanalId } = req.body;
    
    if (!kanalId) {
      return res.status(400).json({ error: "kanalId required" });
    }

    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: `user-${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      ttl: 6 * 60 * 60, // 6 saat
    });

    token.addGrant({
      roomJoin: true,
      room: `kanal-${kanalId}`,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();
    res.json({ token: jwt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Token generation failed" });
  }
});

// Sağlık kontrolü için basit bir endpoint
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Token server running on port ${port}`);
});