const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// API Routes
app.use('/api', routes);

module.exports = app;
