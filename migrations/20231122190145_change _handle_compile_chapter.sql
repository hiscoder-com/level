  DROP TRIGGER IF EXISTS on_public_chapters_update ON PUBLIC.chapters;
  DROP FUNCTION IF EXISTS PUBLIC.handle_compile_chapter;  
  
  CREATE FUNCTION PUBLIC.handle_compile_chapter() RETURNS TRIGGER
    LANGUAGE plpgsql SECURITY DEFINER AS $$
    DECLARE
      chapter JSONB;
    BEGIN
      IF (NEW.finished_at IS NOT NULL) THEN
        SELECT jsonb_object_agg(num, "text" ORDER BY num ASC) FROM PUBLIC.verses WHERE project_id = OLD.project_id AND chapter_id = OLD.id AND num < 201 INTO chapter;
        NEW.text=chapter;
      END IF;
      RETURN NEW;
    END;
  $$;

  CREATE TRIGGER on_public_chapters_update BEFORE
    UPDATE
      ON PUBLIC.chapters FOR each ROW EXECUTE FUNCTION PUBLIC.handle_compile_chapter();
