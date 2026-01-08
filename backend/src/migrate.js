const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const DB_FILE = process.env.DATABASE_FILE || path.join(__dirname, '..', 'data', 'dev.sqlite3');
const migrationsPath = path.join(__dirname, 'migrations', 'init.sql');
const migrations = fs.readFileSync(migrationsPath, 'utf8');

fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Failed to open DB', err);
    process.exit(1);
  }
});

db.exec(migrations, (err) => {
  if (err) {
    console.error('Migration failed', err);
    process.exit(1);
  } else {
    console.log('Migration applied successfully.');
    // seed an admin user
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const seedEmail = 'admin@jhs.local';
    const seedPass = 'AdminPass123';
    bcrypt.hash(seedPass, saltRounds).then(hash => {
      db.run(
        `INSERT OR IGNORE INTO users (email, password_hash, full_name, role, active) VALUES (?, ?, ?, ?, ?)`,
        [seedEmail, hash, 'Admin User', 'admin', 1],
        function (err) {
          if (err) console.error('Seed admin failed', err);
          else console.log('Seed admin inserted or already exists');
          db.close();
        }
      );
    }).catch(err => {
      console.error('Hash failed', err);
      db.close();
    });
  }
});