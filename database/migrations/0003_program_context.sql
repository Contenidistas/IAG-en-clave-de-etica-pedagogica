ALTER TABLE events ADD COLUMN program_code TEXT;
ALTER TABLE events ADD COLUMN cohort_code TEXT;
ALTER TABLE events ADD COLUMN measurement_phase TEXT;
ALTER TABLE events ADD COLUMN participant_id TEXT;

ALTER TABLE feedback ADD COLUMN program_code TEXT;
ALTER TABLE feedback ADD COLUMN cohort_code TEXT;
ALTER TABLE feedback ADD COLUMN measurement_phase TEXT;
ALTER TABLE feedback ADD COLUMN participant_id TEXT;

CREATE INDEX IF NOT EXISTS idx_events_program_cohort_phase
  ON events(program_code, cohort_code, measurement_phase, event_type);
CREATE INDEX IF NOT EXISTS idx_events_program_participant
  ON events(program_code, participant_id, event_type);
CREATE INDEX IF NOT EXISTS idx_feedback_program_cohort_phase
  ON feedback(program_code, cohort_code, measurement_phase);
