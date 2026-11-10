-- Backfill country and country_code on historical visit events from matching session events
UPDATE events
SET
  country = (
    SELECT e2.country
    FROM events e2
    WHERE e2.session_id = events.session_id
      AND e2.country IS NOT NULL
      AND e2.country != ''
    ORDER BY CASE WHEN e2.event_type = 'completion' THEN 0 ELSE 1 END, e2.id DESC
    LIMIT 1
  ),
  country_code = (
    SELECT e2.country_code
    FROM events e2
    WHERE e2.session_id = events.session_id
      AND e2.country_code IS NOT NULL
      AND e2.country_code != ''
    ORDER BY CASE WHEN e2.event_type = 'completion' THEN 0 ELSE 1 END, e2.id DESC
    LIMIT 1
  )
WHERE event_type = 'visit'
  AND session_id IS NOT NULL
  AND session_id != ''
  AND (country_code IS NULL OR country_code = '')
  AND EXISTS (
    SELECT 1
    FROM events e2
    WHERE e2.session_id = events.session_id
      AND e2.country_code IS NOT NULL
      AND e2.country_code != ''
  );

CREATE INDEX IF NOT EXISTS idx_events_session_type ON events(session_id, event_type);
