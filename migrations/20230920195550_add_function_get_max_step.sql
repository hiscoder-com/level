DROP FUNCTION IF EXISTS PUBLIC.get_max_step;
CREATE FUNCTION PUBLIC.get_max_step(project_code TEXT, translator_id BIGINT, chapter_id BIGINT) RETURNS JSON
    LANGUAGE plpgsql SECURITY DEFINER AS $$   
    DECLARE
      max_step INT2;
      count_steps INT2;      
    BEGIN
      -- must be on the project
      IF authorize(auth.uid(), (SELECT id FROM projects WHERE code = get_max_step.project_code)) NOT IN ('admin', 'supporter') THEN
        RETURN 0;
      END IF;      

      SELECT MAX(steps.sorting) INTO count_steps
      FROM PUBLIC.steps 
      WHERE steps.project_id=(SELECT id FROM projects WHERE code = get_max_step.project_code);

      SELECT MAX(steps.sorting) FROM Public.progress LEFT JOIN PUBLIC.steps ON (steps.id = progress.step_id) INTO max_step
      WHERE progress.verse_id = (SELECT verses.id FROM PUBLIC.verses WHERE verses.chapter_id = get_max_step.chapter_id AND project_translator_id = translator_id LIMIT 1);
      
      IF max_step IS NULL THEN
        RETURN json_build_object('count_steps',count_steps,'max_step','1');
      END IF;
      IF max_step = count_steps THEN
        RETURN json_build_object('count_steps',count_steps,'max_step',count_steps);
      END IF;
      IF max_step < count_steps THEN
        RETURN json_build_object('count_steps',count_steps,'max_step',max_step + 1);
      END IF;
    END;  
  $$
