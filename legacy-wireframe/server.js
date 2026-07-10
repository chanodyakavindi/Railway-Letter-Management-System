const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve index.html for SPA behavior
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Railway Letter System Wireframe running at http://localhost:${PORT}`);
});
