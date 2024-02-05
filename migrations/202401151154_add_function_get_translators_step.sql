DROP FUNCTION IF EXISTS PUBLIC.get_translators_step;
CREATE FUNCTION PUBLIC.get_translators_step(project_code TEXT, chapter_num INT2, book_code PUBLIC.book_code) 
RETURNS TABLE(verse_id BIGINT, current_step INT2, translator TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  cur_chapter_id BIGINT;
  cur_project_id BIGINT;
BEGIN
  SELECT projects.id INTO cur_project_id
  FROM PUBLIC.projects
  WHERE projects.code = get_translators_step.project_code;

  IF cur_project_id IS NULL THEN
    RETURN;
  END IF;

  IF authorize(auth.uid(), cur_project_id) IN ('user') THEN
    RETURN;
  END IF;

  SELECT chapters.id INTO cur_chapter_id
  FROM PUBLIC.chapters
  LEFT JOIN PUBLIC.books ON (chapters.book_id = books.id)
  WHERE chapters.num = get_translators_step.chapter_num AND chapters.project_id = cur_project_id AND books.code = get_translators_step.book_code;

  IF cur_chapter_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY 
  SELECT DISTINCT ON (users.login) verses.id AS verse_id, steps.sorting as current_step,  users.login AS translator
  FROM public.verses 
  LEFT JOIN public.project_translators ON verses.project_translator_id = project_translators.id
  LEFT JOIN public.users ON project_translators.user_id = users.id
  LEFT JOIN public.steps ON verses.current_step = steps.id
  WHERE verses.project_id = cur_project_id AND verses.chapter_id = cur_chapter_id
  ORDER BY users.login, verses.num ASC;

END;

$$;
