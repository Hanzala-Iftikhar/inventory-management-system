const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const brandRoutes = require('./routes/brandRoutes');
const modelRoutes = require('./routes/modelRoutes');
const itemRoutes  = require('./routes/itemRoutes');

// Routes without /api prefix
app.use('/brands', brandRoutes);
app.use('/models', modelRoutes);
app.use('/items',  itemRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

module.exports = app;