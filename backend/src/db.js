const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const DB_FILE = process.env.DATABASE_FILE || path.join(__dirname, '..', 'data', 'dev.sqlite3');

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Could not open DB', err);
  } else {
    console.log('Connected to SQLite DB:', DB_FILE);
  }
});

module.exports = db;