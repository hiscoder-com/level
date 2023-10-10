DROP FUNCTION IF EXISTS PUBLIC.save_verses_if_null;

CREATE FUNCTION PUBLIC.save_verses_if_null(verses JSON) RETURNS BOOLEAN
    LANGUAGE plpgsql SECURITY DEFINER AS $$
    DECLARE
    new_verses RECORD;
    current_verse RECORD;
    BEGIN 
      SELECT * FROM public.verses WHERE verses.id = verse_id INTO current_verse;
      IF current_verse.project_translator_id IS NULL THEN
        RETURN FALSE;
      END IF;

      IF authorize(auth.uid(), current_verse.project_id) IN ('user') THEN RETURN FALSE;
      END IF;
          
      FOR new_verses IN SELECT * FROM json_each_text(save_verses_if_null.verses)
      LOOP
        UPDATE
          PUBLIC.verses
        SET "text" = new_verses.value::TEXT
        WHERE
          verses.id = new_verses.key::BIGINT AND "text" IS NULL;
      END LOOP;
      RETURN true;
    END;
  $$;
