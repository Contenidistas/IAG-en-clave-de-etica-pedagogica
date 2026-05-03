-- IAG en clave de etica pedagogica
-- Cloudflare D1 schema

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('visit', 'completion', 'feedback')),
  session_id TEXT,
  page TEXT,
  anonymous INTEGER DEFAULT 1,
  profile TEXT,
  profile_key TEXT,
  user_name TEXT,
  country TEXT,
  nivel_educativo TEXT,
  familiaridad_inicial TEXT,
  recursos_similares TEXT,
  consent_tracking INTEGER DEFAULT 0,
  evidence INTEGER,
  likert_level TEXT,
  raw_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  question_id TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  session_id TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  suggestion TEXT,
  profile TEXT,
  profile_key TEXT,
  country TEXT,
  nivel_educativo TEXT,
  evidence INTEGER,
  likert_level TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_answers_event ON answers(event_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON feedback(timestamp);
