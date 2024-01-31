DROP FUNCTION IF EXISTS PUBLIC.save_verses_if_null;

CREATE FUNCTION PUBLIC.save_verses_if_null(verses JSON, project_id BIGINT) RETURNS BOOLEAN
    LANGUAGE plpgsql SECURITY DEFINER AS $$
    DECLARE
    new_verses RECORD;
    BEGIN 

      IF authorize(auth.uid(), save_verses_if_null.project_id) IN ('user') THEN RETURN FALSE;
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
