const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const authRoutes = require('./routes/auth');
const ingestRoutes = require('./routes/ingest');
const caseRoutes = require('./routes/cases');
const adminRoutes = require('./routes/admin');
const reportsRoutes = require('./routes/reports');   // <-- add this line

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportsRoutes);             // <-- add this line

// simple health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});