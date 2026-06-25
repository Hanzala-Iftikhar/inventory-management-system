const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Import all route files
const brandRoutes = require('./routes/brandRoutes');
const modelRoutes = require('./routes/modelRoutes');
const itemRoutes  = require('./routes/itemRoutes');

// Register routes
app.use('/brands', brandRoutes);
app.use('/models', modelRoutes);
app.use('/items',  itemRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});