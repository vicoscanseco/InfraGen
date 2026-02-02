// Minimal deploy worker simulation
const fs = require('fs');
const path = require('path');

function processRequest(requestId) {
  const reqPath = path.join(__dirname, 'requests', `${requestId}.json`);
  if (!fs.existsSync(reqPath)) return;
  const data = JSON.parse(fs.readFileSync(reqPath, 'utf8'));
  data.status = 'processing';
  fs.writeFileSync(reqPath, JSON.stringify(data, null, 2));

  // Simulate doing work (in real case: bicep build + az deployment)
  setTimeout(() => {
    data.status = 'completed';
    data.completedAt = new Date().toISOString();
    fs.writeFileSync(reqPath, JSON.stringify(data, null, 2));
  }, 2000);
}

module.exports = { processRequest };
