CREATE OR REPLACE FUNCTION public.get_is_await_team(project_code text, chapter_num smallint, book_code book_code, step bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_project_basic(project_code text, title text, orig_title text, code text, language_id bigint, is_rtl boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      project_id BIGINT;
    BEGIN
      SELECT id FROM public.projects WHERE projects.code = project_code INTO project_id;
      IF authorize(auth.uid(), project_id) NOT IN ('admin') THEN
        RAISE EXCEPTION SQLSTATE '42000' USING MESSAGE = 'No access rights to this function';
      END IF;
      
      IF update_project_basic.project_code != update_project_basic.code THEN
        SELECT id FROM public.projects WHERE projects.code = update_project_basic.code INTO project_id;
        IF project_id IS NOT NULL THEN
          RAISE EXCEPTION SQLSTATE '23505' USING MESSAGE = 'This project code is already in use';
        END IF;
      END IF;     

      UPDATE PUBLIC.projects SET code = update_project_basic.code, title=update_project_basic.title, orig_title = update_project_basic.orig_title, language_id = update_project_basic.language_id,is_rtl = update_project_basic.is_rtl  WHERE projects.id = project_id;

      RETURN TRUE;

    END;
    $function$
;

