DROP FUNCTION IF EXISTS PUBLIC.get_is_await_team;

CREATE FUNCTION PUBLIC.get_is_await_team(
  project_code TEXT, 
  chapter_num INT2, 
  book_code PUBLIC.book_code,
  step INT8
) 

RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE

  cur_chapter_id BIGINT;
  cur_project_id BIGINT;
  is_awaiting_team_var BOOLEAN;

BEGIN

  SELECT projects.id INTO cur_project_id
  FROM PUBLIC.projects
  WHERE code = project_code;

  IF cur_project_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF authorize(auth.uid(), cur_project_id) = 'user' THEN
    RETURN FALSE;
  END IF;

  SELECT chapters.id INTO cur_chapter_id
  FROM PUBLIC.chapters
  LEFT JOIN PUBLIC.books ON chapters.book_id = books.id
  WHERE num = chapter_num AND chapters.project_id = cur_project_id AND books.code = book_code;

  IF cur_chapter_id IS NULL THEN
    RETURN FALSE;
  END IF;  

 SELECT is_awaiting_team INTO is_awaiting_team_var
    FROM steps
    WHERE project_id = cur_project_id AND sorting = get_is_await_team.step;

  IF (is_awaiting_team_var = FALSE) THEN
    RETURN FALSE;
  END IF;  

  IF EXISTS (
    SELECT 1
    FROM public.verses
    LEFT JOIN public.project_translators ON verses.project_translator_id = project_translators.id
    LEFT JOIN public.users ON project_translators.user_id = users.id
    LEFT JOIN public.steps ON verses.current_step = steps.id
    WHERE verses.project_id = cur_project_id AND verses.chapter_id = cur_chapter_id 
      AND verses.project_translator_id IS NOT NULL and steps.sorting < get_is_await_team.step
  ) THEN RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;

END;
$$;
