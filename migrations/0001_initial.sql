PRAGMA foreign_keys = ON;

CREATE TABLE groups (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_iterations INTEGER NOT NULL CHECK (password_iterations > 0),
  timezone TEXT NOT NULL
);

CREATE TABLE households (
  id INTEGER PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  UNIQUE (group_id, name)
);

CREATE TABLE meetings (
  id INTEGER PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  meeting_date TEXT NOT NULL CHECK (
    length(meeting_date) = 10
    AND meeting_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  host_household_id INTEGER REFERENCES households(id) ON DELETE SET NULL,
  address TEXT NOT NULL DEFAULT '',
  main_dish TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE responses (
  meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('yes', 'no', 'maybe')),
  contribution TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (meeting_id, household_id)
);

CREATE INDEX idx_households_group_id ON households(group_id);
CREATE INDEX idx_meetings_group_date ON meetings(group_id, meeting_date);
CREATE INDEX idx_meetings_host_household_id ON meetings(host_household_id);
CREATE INDEX idx_responses_household_id ON responses(household_id);
