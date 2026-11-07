import express from 'express';

const app = express();
app.use(express.json());

const TARGET_WORKER_URL = 'https://vec-zalo-worker.veccentral.workers.dev/zalo/webhook';

// Tiếp nhận webhook từ Zalo và chuyển tiếp vào Cloudflare Worker với User-Agent chuẩn
app.post('/zalo/webhook', async (req, res) => {
  const secret = req.headers['x-bot-api-secret-token'] || '';
  try {
    const upstream = await fetch(TARGET_WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bot-Api-Secret-Token': secret,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VEC-Relay/1.0',
      },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.text();
    res.status(upstream.status).send(data);
  } catch (err) {
    console.error('Relay error:', err);
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

app.get('/', (req, res) => {
  res.send('VEC Central Work Zalo Relay is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Relay listening on port ${PORT}`));
