const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'WebWaka OS Platform Admin', milestone: 0 });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`WebWaka OS Platform Admin running on http://0.0.0.0:${PORT}`);
});
