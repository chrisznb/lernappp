-- =====================================================
-- KOPIERE DIESES SCRIPT UND FÜHRE ES IM SUPABASE SQL EDITOR AUS
-- Dashboard: https://supabase.com/dashboard -> SQL Editor
-- =====================================================

-- Schritt 1: Karten von Entwicklungspsychologie auf die 5 Submodule verteilen
DO $$
DECLARE
  target_user_id UUID;
  dev_psych_id UUID;
  stadien_id UUID;
  bindung_id UUID;
  kognitiv_id UUID;
  emotional_id UUID;
  sozial_id UUID;
  total_cards INT;
  cards_per_module INT;
BEGIN
  -- User finden
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'mirelacostea0022@gmail.com';

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User mirelacostea0022@gmail.com nicht gefunden!';
  END IF;

  RAISE NOTICE 'User gefunden: %', target_user_id;

  -- Entwicklungspsychologie (Parent) finden
  SELECT id INTO dev_psych_id FROM subjects
  WHERE name = 'Entwicklungspsychologie'
  AND user_id = target_user_id
  AND parent_subject_id IS NULL;

  IF dev_psych_id IS NULL THEN
    RAISE EXCEPTION 'Entwicklungspsychologie nicht gefunden!';
  END IF;

  RAISE NOTICE 'Entwicklungspsychologie: %', dev_psych_id;

  -- Submodule finden
  SELECT id INTO stadien_id FROM subjects
  WHERE name = 'Klassische Stadienmodelle' AND parent_subject_id = dev_psych_id;

  SELECT id INTO bindung_id FROM subjects
  WHERE name = 'Bindung & Attachment' AND parent_subject_id = dev_psych_id;

  SELECT id INTO kognitiv_id FROM subjects
  WHERE name = 'Kognitive Entwicklung' AND parent_subject_id = dev_psych_id;

  SELECT id INTO emotional_id FROM subjects
  WHERE name = 'Emotionale Entwicklung' AND parent_subject_id = dev_psych_id;

  SELECT id INTO sozial_id FROM subjects
  WHERE name = 'Soziale Entwicklung' AND parent_subject_id = dev_psych_id;

  RAISE NOTICE 'Submodule: Stadien=%, Bindung=%, Kognitiv=%, Emotional=%, Sozial=%',
    stadien_id, bindung_id, kognitiv_id, emotional_id, sozial_id;

  -- Karten zählen
  SELECT COUNT(*) INTO total_cards FROM cards
  WHERE subject_id = dev_psych_id AND user_id = target_user_id;

  RAISE NOTICE 'Karten zu verteilen: %', total_cards;

  IF total_cards = 0 THEN
    RAISE NOTICE 'Keine Karten zum Verteilen!';
    RETURN;
  END IF;

  cards_per_module := CEIL(total_cards::FLOAT / 5);
  RAISE NOTICE 'Karten pro Modul: ~%', cards_per_module;

  -- Modul 1: Klassische Stadienmodelle
  IF stadien_id IS NOT NULL THEN
    UPDATE cards SET subject_id = stadien_id
    WHERE id IN (
      SELECT id FROM cards
      WHERE subject_id = dev_psych_id AND user_id = target_user_id
      ORDER BY created_at LIMIT cards_per_module
    );
    RAISE NOTICE 'Karten zu Klassische Stadienmodelle verschoben';
  END IF;

  -- Modul 2: Bindung & Attachment
  IF bindung_id IS NOT NULL THEN
    UPDATE cards SET subject_id = bindung_id
    WHERE id IN (
      SELECT id FROM cards
      WHERE subject_id = dev_psych_id AND user_id = target_user_id
      ORDER BY created_at LIMIT cards_per_module
    );
    RAISE NOTICE 'Karten zu Bindung & Attachment verschoben';
  END IF;

  -- Modul 3: Kognitive Entwicklung
  IF kognitiv_id IS NOT NULL THEN
    UPDATE cards SET subject_id = kognitiv_id
    WHERE id IN (
      SELECT id FROM cards
      WHERE subject_id = dev_psych_id AND user_id = target_user_id
      ORDER BY created_at LIMIT cards_per_module
    );
    RAISE NOTICE 'Karten zu Kognitive Entwicklung verschoben';
  END IF;

  -- Modul 4: Emotionale Entwicklung
  IF emotional_id IS NOT NULL THEN
    UPDATE cards SET subject_id = emotional_id
    WHERE id IN (
      SELECT id FROM cards
      WHERE subject_id = dev_psych_id AND user_id = target_user_id
      ORDER BY created_at LIMIT cards_per_module
    );
    RAISE NOTICE 'Karten zu Emotionale Entwicklung verschoben';
  END IF;

  -- Modul 5: Soziale Entwicklung (alle restlichen)
  IF sozial_id IS NOT NULL THEN
    UPDATE cards SET subject_id = sozial_id
    WHERE subject_id = dev_psych_id AND user_id = target_user_id;
    RAISE NOTICE 'Restliche Karten zu Soziale Entwicklung verschoben';
  END IF;

  RAISE NOTICE '✓ Fertig! Alle Karten wurden verteilt.';
END $$;

-- Ergebnis prüfen
SELECT s.name, COUNT(c.id) as anzahl_karten
FROM subjects s
LEFT JOIN cards c ON s.id = c.subject_id
WHERE s.user_id = (SELECT id FROM auth.users WHERE email = 'mirelacostea0022@gmail.com')
AND (s.name = 'Entwicklungspsychologie'
     OR s.parent_subject_id = (
       SELECT id FROM subjects
       WHERE name = 'Entwicklungspsychologie'
       AND user_id = (SELECT id FROM auth.users WHERE email = 'mirelacostea0022@gmail.com')
       AND parent_subject_id IS NULL
     ))
GROUP BY s.name
ORDER BY s.name;
