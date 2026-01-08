PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'staff', -- 'staff' or 'admin'
  active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_external_id TEXT, -- id from source system
  case_id TEXT UNIQUE,   -- canonical case id we assign (uuid)
  contact_name TEXT,
  phone_number TEXT,
  pet_name TEXT,
  pet_species TEXT,
  pet_breed TEXT,
  initial_request TEXT,
  source_system TEXT,
  status TEXT,
  outcome TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted INTEGER NOT NULL DEFAULT 0 -- soft delete flag
);

CREATE INDEX IF NOT EXISTS idx_cases_phone ON cases(phone_number);
CREATE INDEX IF NOT EXISTS idx_cases_name ON cases(contact_name);