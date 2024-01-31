DROP FUNCTION IF EXISTS PUBLIC.create_verses;
CREATE FUNCTION PUBLIC.create_verses(chapter_id BIGINT) RETURNS BOOLEAN
  LANGUAGE plpgsql SECURITY DEFINER AS $$
  DECLARE
    chapter RECORD;
    start_verse int;
    method_type text;
  BEGIN
    -- 1. Get the number of verses
    SELECT  chapters.id AS id,
            chapters.verses AS verses,
            chapters.project_id AS project_id,
            steps.id AS step_id
    FROM PUBLIC.chapters
    JOIN PUBLIC.steps ON (steps.project_id = chapters.project_id)
    WHERE chapters.id = create_verses.chapter_id
    ORDER BY steps.sorting ASC
    LIMIT 1
    INTO chapter;

    IF authorize(auth.uid(), chapter.project_id) NOT IN ('admin', 'coordinator')
    THEN
      RETURN FALSE;
    END IF;
    method_type = (SELECT type FROM projects WHERE id = chapter.project_id);
    IF method_type = 'obs'
    THEN
      start_verse = 0;
    ELSE
      start_verse = 1;
    END IF;
    FOR i IN start_verse..chapter.verses LOOP
      INSERT INTO
        PUBLIC.verses (num, chapter_id, current_step, project_id)
      VALUES
        (i , chapter.id, chapter.step_id, chapter.project_id);
    END LOOP;
    FOR i IN 201..220 LOOP
      INSERT INTO
        PUBLIC.verses (num, chapter_id, current_step, project_id)
      VALUES
        (i , chapter.id, chapter.step_id, chapter.project_id);
    END LOOP;
    IF method_type = 'obs'
    THEN
      INSERT INTO
        PUBLIC.verses (num, chapter_id, current_step, project_id)
      VALUES
        (200 , chapter.id, chapter.step_id, chapter.project_id);
    ELSE
      RETURN true;
    END IF;
    RETURN true;      
  END;
  $$;
