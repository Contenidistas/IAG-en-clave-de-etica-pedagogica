ALTER TABLE events ADD COLUMN country_code TEXT;
ALTER TABLE feedback ADD COLUMN country_code TEXT;

UPDATE events
SET country_code = CASE country
  WHEN 'Uruguay' THEN 'uy'
  WHEN 'República Dominicana' THEN 'do'
  WHEN 'Colombia' THEN 'co'
  WHEN 'Argentina' THEN 'ar'
  WHEN 'Bolivia' THEN 'bo'
  WHEN 'Brasil' THEN 'br'
  WHEN 'Chile' THEN 'cl'
  WHEN 'Costa Rica' THEN 'cr'
  WHEN 'Cuba' THEN 'cu'
  WHEN 'Ecuador' THEN 'ec'
  WHEN 'El Salvador' THEN 'sv'
  WHEN 'Guatemala' THEN 'gt'
  WHEN 'Honduras' THEN 'hn'
  WHEN 'México' THEN 'mx'
  WHEN 'Nicaragua' THEN 'ni'
  WHEN 'Panamá' THEN 'pa'
  WHEN 'Paraguay' THEN 'py'
  WHEN 'Perú' THEN 'pe'
  WHEN 'Puerto Rico' THEN 'pr'
  WHEN 'Venezuela' THEN 've'
  WHEN 'Canadá' THEN 'ca'
  WHEN 'España' THEN 'es'
  WHEN 'Estados Unidos' THEN 'us'
  WHEN 'Portugal' THEN 'pt'
  ELSE CASE WHEN country IS NOT NULL AND country != '' THEN 'other' ELSE NULL END
END
WHERE country_code IS NULL OR country_code = '';

UPDATE feedback
SET country_code = CASE country
  WHEN 'Uruguay' THEN 'uy'
  WHEN 'República Dominicana' THEN 'do'
  WHEN 'Colombia' THEN 'co'
  WHEN 'Argentina' THEN 'ar'
  WHEN 'Bolivia' THEN 'bo'
  WHEN 'Brasil' THEN 'br'
  WHEN 'Chile' THEN 'cl'
  WHEN 'Costa Rica' THEN 'cr'
  WHEN 'Cuba' THEN 'cu'
  WHEN 'Ecuador' THEN 'ec'
  WHEN 'El Salvador' THEN 'sv'
  WHEN 'Guatemala' THEN 'gt'
  WHEN 'Honduras' THEN 'hn'
  WHEN 'México' THEN 'mx'
  WHEN 'Nicaragua' THEN 'ni'
  WHEN 'Panamá' THEN 'pa'
  WHEN 'Paraguay' THEN 'py'
  WHEN 'Perú' THEN 'pe'
  WHEN 'Puerto Rico' THEN 'pr'
  WHEN 'Venezuela' THEN 've'
  WHEN 'Canadá' THEN 'ca'
  WHEN 'España' THEN 'es'
  WHEN 'Estados Unidos' THEN 'us'
  WHEN 'Portugal' THEN 'pt'
  ELSE CASE WHEN country IS NOT NULL AND country != '' THEN 'other' ELSE NULL END
END
WHERE country_code IS NULL OR country_code = '';

CREATE INDEX IF NOT EXISTS idx_events_country_type ON events(country_code, event_type);
CREATE INDEX IF NOT EXISTS idx_feedback_country ON feedback(country_code);
