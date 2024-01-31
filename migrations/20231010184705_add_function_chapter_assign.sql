DROP FUNCTION IF EXISTS PUBLIC.chapter_assign;
CREATE FUNCTION PUBLIC.chapter_assign(chapter INT, translators BIGINT[], project_id BIGINT) RETURNS BOOLEAN
  LANGUAGE plpgsql SECURITY DEFINER AS $$
  DECLARE
    verse_row RECORD;
    num_verse INT;
    x INT;
    
  BEGIN
    IF authorize(auth.uid(), chapter_assign.project_id) NOT IN ('admin', 'coordinator') THEN
      RETURN FALSE;
    END IF; 
      UPDATE PUBLIC.verses 
      SET project_translator_id = NULL WHERE verses.chapter_id = chapter AND verses.num >200;

    num_verse = 201;
    FOREACH x IN ARRAY translators LOOP
      UPDATE PUBLIC.verses 
      SET project_translator_id = x WHERE chapter_id = chapter AND num = num_verse;
      num_verse = num_verse + 1;
    END LOOP;
    RETURN TRUE;
  END;
$$;
