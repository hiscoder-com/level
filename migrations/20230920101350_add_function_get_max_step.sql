DROP FUNCTION IF EXISTS PUBLIC.get_max_step;
CREATE OR REPLACE FUNCTION PUBLIC.get_max_step(
  project_code TEXT, 
  translator_id BIGINT, 
  chapter_id BIGINT
) RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$   
DECLARE
  current_project_id BIGINT;
  max_step INT2;
  count_steps INT2;      
BEGIN
  SELECT id INTO current_project_id FROM projects WHERE code = project_code;

  IF NOT authorize(auth.uid(), current_project_id) IN ('admin', 'supporter') THEN
    RETURN json_build_object('count_steps', 0, 'max_step', 0);
  END IF;

  SELECT MAX(steps.sorting) INTO count_steps
  FROM PUBLIC.steps 
  WHERE steps.project_id = current_project_id;

  SELECT MAX(steps.sorting) INTO max_step
  FROM Public.progress 
  LEFT JOIN PUBLIC.steps ON (steps.id = progress.step_id) 
  WHERE progress.verse_id = (
    SELECT verses.id 
    FROM PUBLIC.verses 
    WHERE verses.chapter_id = get_max_step.chapter_id 
      AND project_translator_id = translator_id 
    LIMIT 1
  );

  RETURN CASE
    WHEN max_step IS NULL THEN
      json_build_object('count_steps', count_steps, 'max_step', 1)
    WHEN max_step = count_steps THEN
      json_build_object('count_steps', count_steps, 'max_step', count_steps)
    ELSE
      json_build_object('count_steps', count_steps, 'max_step', max_step + 1)
  END;
END;  
$$
