const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// In-memory store for demo purposes
const requests = new Map();

app.post('/deploy/request', (req, res) => {
  const id = `${Date.now()}`;
  const payload = req.body || {};
  requests.set(id, { id, status: 'queued', payload, createdAt: new Date().toISOString() });

  // In a real implementation we'd enqueue for worker processing
  // For now, write a simple file and return requestId
  const outDir = path.join(__dirname, 'requests');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${id}.json`), JSON.stringify(requests.get(id), null, 2));

  res.json({ requestId: id, status: 'queued' });
});

app.post('/bicep/validate', (req, res) => {
  const { bicep } = req.body || {};
  if (!bicep || typeof bicep !== 'string') return res.status(400).json({ error: 'missing bicep string' });
  // Lightweight validation: ensure contains 'param'
  const ok = bicep.includes('param');
  res.json({ valid: ok, warnings: ok ? [] : ['No params found in bicep'] });
});

app.get('/deploy/status/:id', (req, res) => {
  const id = req.params.id;
  const r = requests.get(id);
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json({ id, status: r.status });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
