drop function if exists "public"."update_project_basic"(project_code text, title text, orig_title text, code text, language_id bigint);

set check_function_bodies = off;

create or replace view "public"."methods_view" as  SELECT methods.title,
    methods.steps,
    methods.offline_steps
   FROM methods;


CREATE OR REPLACE FUNCTION public.save_token(token text, project_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
      chap RECORD;
    BEGIN
      IF authorize(auth.uid(), save_token.project_id) NOT IN ('admin', 'coordinator')THEN RETURN FALSE;
      END IF;  

      UPDATE PUBLIC.users SET comcheck_token = token WHERE id = auth.uid();
      RETURN true;
    END;$function$
;

create or replace view "public"."translator_projects" as  SELECT pt.user_id,
    p.id AS project_id,
    p.title,
    p.code,
    p.base_manifest,
    p.resources,
    p.method,
    json_agg(json_build_object('book_id', b.id, 'book_code', b.code, 'book_properties', b.properties)) AS books
   FROM ((project_translators pt
     JOIN projects p ON ((pt.project_id = p.id)))
     LEFT JOIN books b ON ((b.project_id = p.id)))
  GROUP BY pt.user_id, p.id, p.title, p.code;


create or replace view "public"."translator_projects_books" as  SELECT pt.user_id,
    p.id AS project_id,
    p.title AS project_title,
    p.code AS project_code,
    p.base_manifest,
    p.resources,
    p.method,
    json_agg(json_build_object('book_id', b.id, 'book_code', b.code, 'book_properties', b.properties)) AS books
   FROM (((project_translators pt
     JOIN projects p ON ((pt.project_id = p.id)))
     LEFT JOIN books b ON ((b.project_id = p.id)))
     JOIN methods m ON ((p.method = m.title)))
  WHERE ((m.offline_steps IS NOT NULL) AND (jsonb_array_length(m.offline_steps) > 0) AND (EXISTS ( SELECT 1
           FROM (verses v
             LEFT JOIN chapters c ON ((v.chapter_id = c.id)))
          WHERE ((v.project_id = p.id) AND (c.started_at IS NOT NULL) AND (c.finished_at IS NULL) AND (v.project_translator_id = pt.id)))))
  GROUP BY pt.user_id, p.id, p.title, p.code, m.offline_steps;


create or replace view "public"."users_view" as  SELECT users.id,
    users.login,
    users.email
   FROM users;


CREATE OR REPLACE FUNCTION public.admin_only()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      access INT;

    BEGIN
      SELECT
        COUNT(*) INTO access
      FROM
        PUBLIC.users
      WHERE
        users.id = auth.uid() AND users.is_admin;

      RETURN access > 0;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.alphabet_change_handler()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  DECLARE
    old_letter_exists BOOLEAN;
    new_letter_exists BOOLEAN;
    letter_count INT;
  BEGIN
    -- If the record was undeleted, check if the letter exists in the alphabet
    IF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      SELECT EXISTS(
        SELECT 1 FROM PUBLIC.projects
        WHERE jsonb_exists(dictionaries_alphabet, upper(NEW.title::VARCHAR(1)))
        AND projects.id = NEW.project_id
      ) INTO new_letter_exists;

      -- If the letter does not exist, add it to the project alphabet
      IF NOT new_letter_exists THEN
        UPDATE PUBLIC.projects
        SET dictionaries_alphabet = dictionaries_alphabet || jsonb_build_array(upper(NEW.title::VARCHAR(1)))
        WHERE projects.id = NEW.project_id;
      END IF;
      RETURN NEW;
    END IF;

    -- If the word was updated or soft deleted
    IF OLD.title <> NEW.title OR (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL) THEN
      -- Check if there are other words starting with the same letter as the old word
      SELECT EXISTS(
        SELECT 1 FROM PUBLIC.dictionaries
        WHERE upper(title::VARCHAR(1)) = upper(OLD.title::VARCHAR(1))
        AND project_id = OLD.project_id AND deleted_at IS NULL
      ) INTO old_letter_exists;

      -- If not, remove the letter from the project alphabet
      IF NOT old_letter_exists THEN
        UPDATE PUBLIC.projects
        SET dictionaries_alphabet = dictionaries_alphabet - upper(OLD.title::VARCHAR(1))
        WHERE projects.id = OLD.project_id;
      END IF;

      -- If the word was updated (not soft deleted), check if there are other words starting with the same letter as the new word
      IF NEW.deleted_at IS NULL AND OLD.title <> NEW.title THEN
        SELECT COUNT(id) > 1 FROM PUBLIC.dictionaries
          WHERE upper(title::VARCHAR(1)) = upper(NEW.title::VARCHAR(1))
          AND project_id = NEW.project_id AND deleted_at IS NULL
        INTO new_letter_exists;

        -- If not, add the letter to the project alphabet
        IF NOT new_letter_exists THEN
          UPDATE PUBLIC.projects
          SET dictionaries_alphabet = dictionaries_alphabet || jsonb_build_array(upper(NEW.title::VARCHAR(1)))
          WHERE projects.id = NEW.project_id;
        END IF;
      END IF;
    END IF;

    RETURN NEW;
  END;
$function$
;

CREATE OR REPLACE FUNCTION public.alphabet_insert_handler()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  DECLARE
    new_letter_exists BOOLEAN;
  BEGIN
    -- Check if the letter exists in the alphabet
    SELECT EXISTS(
      SELECT 1 FROM PUBLIC.projects
      WHERE jsonb_exists(dictionaries_alphabet, upper(NEW.title::VARCHAR(1)))
      AND projects.id = NEW.project_id
    ) INTO new_letter_exists;

    -- If the letter does not exist, add it to the project alphabet
    IF NOT new_letter_exists THEN
      UPDATE PUBLIC.projects
      SET dictionaries_alphabet = dictionaries_alphabet || jsonb_build_array(upper(NEW.title::VARCHAR(1)))
      WHERE projects.id = NEW.project_id;
    END IF;

    RETURN NEW;
  END;
$function$
;

CREATE OR REPLACE FUNCTION public.assign_moderator(user_id uuid, project_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      usr RECORD;
    BEGIN
      IF authorize(auth.uid(), assign_moderator.project_id) NOT IN ('admin', 'coordinator') THEN
        RETURN FALSE;
      END IF;
      SELECT id, is_moderator INTO usr FROM PUBLIC.project_translators WHERE project_translators.project_id = assign_moderator.project_id AND project_translators.user_id = assign_moderator.user_id;
      IF usr.id IS NULL THEN
        RETURN FALSE;
      END IF;
      UPDATE PUBLIC.project_translators SET is_moderator = TRUE WHERE project_translators.id = usr.id;

      RETURN TRUE;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.authorize(user_id uuid, project_id bigint)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      bind_permissions INT;
      priv RECORD;
    BEGIN
      SELECT u.is_admin as is_admin,
        pc.project_id*1 IS NOT NULL as is_coordinator,
        pt.project_id*1 IS NOT NULL as is_translator,
        pt.is_moderator IS TRUE as is_moderator
      FROM public.users as u
        LEFT JOIN public.project_coordinators as pc
          ON (u.id = pc.user_id AND pc.project_id = authorize.project_id)
        LEFT JOIN public.project_translators as pt
          ON (u.id = pt.user_id AND pt.project_id = authorize.project_id)
      WHERE u.id = authorize.user_id AND u.blocked IS NULL INTO priv;

      IF priv.is_admin THEN
        return 'admin';
      END IF;

      IF priv.is_coordinator THEN
        return 'coordinator';
      END IF;

      IF priv.is_moderator THEN
        return 'moderator';
      END IF;

      IF priv.is_translator THEN
        return 'translator';
      END IF;

      return 'user';

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.block_user(user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      blocked_user RECORD;
    BEGIN
      IF NOT PUBLIC.admin_only() THEN
        RETURN FALSE;
      END IF;

      SELECT blocked, is_admin INTO blocked_user FROM PUBLIC.users WHERE id = block_user.user_id;
      IF blocked_user.is_admin = TRUE THEN
        RETURN FALSE;
      END IF;

      IF blocked_user.blocked IS NULL THEN
        UPDATE PUBLIC.users SET blocked = NOW() WHERE id = block_user.user_id;
      ELSE
        UPDATE PUBLIC.users SET blocked = NULL WHERE id = block_user.user_id;
      END IF;

      RETURN TRUE;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.can_translate(translator_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      access INT;

    BEGIN
      SELECT
        COUNT(*) INTO access
      FROM
        PUBLIC.project_translators
      WHERE
        user_id = auth.uid() AND id = can_translate.translator_id;

      RETURN access > 0;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.change_finish_chapter(chapter_id bigint, project_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      chap RECORD;
    BEGIN
      IF authorize(auth.uid(), change_finish_chapter.project_id) NOT IN ('admin', 'coordinator')THEN RETURN FALSE;
      END IF;  

      SELECT finished_at,started_at INTO chap FROM PUBLIC.chapters WHERE change_finish_chapter.chapter_id = chapters.id AND change_finish_chapter.project_id = chapters.project_id;

      IF chap.started_at IS NULL
      THEN RETURN FALSE;
      END IF;

      IF chap.finished_at  IS NULL THEN
        UPDATE PUBLIC.chapters SET finished_at = NOW() WHERE change_finish_chapter.chapter_id = chapters.id;
      ELSE 
        UPDATE PUBLIC.chapters SET finished_at = NULL WHERE change_finish_chapter.chapter_id = chapters.id;
      END IF;

      RETURN true;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.change_start_chapter(chapter_id bigint, project_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      chap RECORD;
    BEGIN
      IF authorize(auth.uid(), change_start_chapter.project_id) NOT IN ('admin', 'coordinator')THEN RETURN FALSE;
      END IF;  

      SELECT started_at,finished_at INTO chap FROM PUBLIC.chapters WHERE change_start_chapter.chapter_id = chapters.id AND change_start_chapter.project_id = chapters.project_id;

      IF chap.finished_at IS NOT NULL
      THEN RETURN FALSE;
      END IF;

      IF chap.started_at  IS NULL THEN
        UPDATE PUBLIC.chapters SET started_at = NOW() WHERE change_start_chapter.chapter_id = chapters.id;
      ELSE 
        UPDATE PUBLIC.chapters SET started_at = NULL WHERE change_start_chapter.chapter_id = chapters.id;
      END IF;

      RETURN true;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.change_time_step(project_code text, step_num smallint, time_count smallint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  project BIGINT;
BEGIN
    SELECT id FROM projects WHERE projects.code = change_time_step.project_code INTO project;
    -- must be on the project
    IF authorize(auth.uid(), project) NOT IN ( 'admin', 'coordinator', 'moderator') THEN
        RETURN FALSE;
    END IF;
UPDATE public.steps
SET time = change_time_step.time_count
WHERE steps.project_id  = project
AND steps.sorting = change_time_step.step_num; 
RETURN TRUE;    
END$function$
;

CREATE OR REPLACE FUNCTION public.chapter_assign(chapter integer, translators bigint[], project_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.check_agreement()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE

    BEGIN
      UPDATE PUBLIC.users SET agreement = TRUE WHERE users.id = auth.uid();

      RETURN TRUE;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.check_confession()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE

    BEGIN
      UPDATE PUBLIC.users SET confession = TRUE WHERE users.id = auth.uid();

      RETURN TRUE;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.compile_book(book_id bigint, project_id bigint)
 RETURNS TABLE(num smallint, text jsonb, id bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      chapter JSONB;
      chapter_row RECORD;
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator', 'moderator') Query THEN
        RETURN QUERY SELECT NULL::SMALLINT AS num, '{}'::JSONB AS "text", NULL::BIGINT AS id;
      END IF;

      FOR chapter_row IN SELECT c.id AS chapter_id, c.num as chapter_num FROM PUBLIC.chapters c JOIN PUBLIC.verses v ON c.id = v.chapter_id WHERE c.book_id = compile_book.book_id AND c.started_at IS NOT NULL GROUP BY c.id, c.num LOOP
        SELECT jsonb_object_agg(verses.num, verses."text" ORDER BY verses.num ASC) FROM PUBLIC.verses WHERE verses.project_id = compile_book.project_id AND verses.chapter_id = chapter_row.chapter_id AND verses.num < 201 INTO chapter;
        UPDATE PUBLIC.chapters
        SET "text"= chapter
        WHERE chapters.id = chapter_row.chapter_id AND chapters.started_at IS NOT NULL;
      END LOOP;
    
      
      RETURN QUERY SELECT chapters.num,chapters.text,chapters.id FROM chapters WHERE chapters.id = ANY(ARRAY(SELECT chapters.id FROM PUBLIC.chapters WHERE chapters.book_id = compile_book.book_id));
    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.correct_sorting_on_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  DECLARE
    parent_sorting INT;
    user_id UUID;
    project_id INT8;
  BEGIN
    IF TG_TABLE_NAME = 'personal_notes' THEN
      SELECT OLD.user_id INTO user_id;

      IF OLD.parent_id IS NULL THEN
        IF NEW.sorting IS NULL THEN
          EXECUTE format('
            UPDATE PUBLIC.%I
            SET sorting = sorting - 1
            WHERE user_id = $1 AND parent_id IS NULL AND sorting > $2',
            TG_TABLE_NAME)
          USING user_id, OLD.sorting;
        END IF;
        ELSE
          SELECT sorting INTO parent_sorting
          FROM PUBLIC.personal_notes
          WHERE id = OLD.parent_id;

          IF NEW.sorting IS NULL THEN
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting - 1
              WHERE user_id = $1 AND parent_id = $2 AND sorting > $3',
              TG_TABLE_NAME)
            USING user_id, OLD.parent_id, OLD.sorting - parent_sorting;
          END IF;
      END IF;
    ELSE -- TG_TABLE_NAME = 'team_notes'
      SELECT OLD.project_id INTO project_id;

      IF OLD.parent_id IS NULL THEN
        IF NEW.sorting IS NULL THEN
          EXECUTE format('
            UPDATE PUBLIC.%I
            SET sorting = sorting - 1
            WHERE project_id = $1 AND parent_id IS NULL AND sorting > $2',
            TG_TABLE_NAME)
          USING project_id, OLD.sorting;
        END IF;
      ELSE
        SELECT sorting INTO parent_sorting
        FROM PUBLIC.team_notes
        WHERE id = OLD.parent_id;

        IF NEW.sorting IS NULL THEN
          EXECUTE format('
            UPDATE PUBLIC.%I
            SET sorting = sorting - 1
            WHERE project_id = $1 AND parent_id = $2 AND sorting > $3',
            TG_TABLE_NAME)
          USING project_id, OLD.parent_id, OLD.sorting - parent_sorting;
        END IF;
      END IF;
    END IF;

    RETURN OLD;
  END;
  $function$
;

CREATE OR REPLACE FUNCTION public.create_brief(project_id bigint, is_enable boolean, data_collection json)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
      DECLARE
        brief_id BIGINT;
      BEGIN
        IF authorize(auth.uid(), create_brief.project_id) NOT IN ('admin', 'coordinator') THEN
          RETURN false;
        END IF;
        INSERT INTO PUBLIC.briefs (project_id, data_collection, is_enable) VALUES (project_id, data_collection, is_enable) RETURNING id INTO brief_id;
        RETURN brief_id;
      END;
  $function$
;

CREATE OR REPLACE FUNCTION public.create_chapters(book_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      book RECORD;
      chapter RECORD;
    BEGIN
      -- 1. Получаем список json глав и стихов для книги
      SELECT id, chapters, project_id FROM PUBLIC.books WHERE id = create_chapters.book_id into book;

      IF authorize(auth.uid(), book.project_id) NOT IN ('admin', 'coordinator') THEN
        RETURN FALSE;
      END IF;

      FOR chapter IN SELECT * FROM json_each_text(book.chapters)
      LOOP
        INSERT INTO
          PUBLIC.chapters (num, book_id, verses, project_id)
        VALUES
          (chapter.key::int2 , book.id, chapter.value::int4, book.project_id);
      END LOOP;
      -- 2. Наверное не вариант сразу создавать все стихи и все главы
      -- 3. Создадим все главы книги. И сделаем какую-нить функцию которая потом создаст все стихи

      RETURN true;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.create_verses(chapter_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
  $function$
;

CREATE OR REPLACE FUNCTION public.divide_verses(divider character varying, project_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
     verse_row record;
    BEGIN
      IF authorize(auth.uid(), divide_verses.project_id) NOT IN ('admin', 'coordinator') THEN
        RETURN FALSE;
      END IF;

      FOR verse_row IN SELECT * FROM jsonb_to_recordset(divider::jsonb) AS x(project_translator_id INT,id INT)
      LOOP
        UPDATE PUBLIC.verses SET project_translator_id = verse_row.project_translator_id WHERE verse_row.id = id;
      END LOOP;

      RETURN TRUE;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.find_books_with_chapters_and_verses(project_code text)
 RETURNS TABLE(book_code book_code, chapter_num smallint, verse_num smallint, verse_text text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  DECLARE
  project_id bigint;
  BEGIN
    SELECT id INTO project_id FROM public.projects WHERE code = project_code;

    IF project_id IS NULL THEN
      RETURN;
    END IF;

    IF authorize(auth.uid(), project_id) NOT IN ('user', 'admin', 'coordinator', 'moderator') THEN
      RETURN;
    END IF;

    RETURN QUERY
       SELECT
        b.code AS book_code,
        c.num AS chapter_num,
        v.num AS verse_num,
        v.text AS verse_text
        FROM
          public.books b
        INNER JOIN
          public.chapters c ON b.id = c.book_id
        INNER JOIN
          public.verses v ON c.id = v.chapter_id
        INNER JOIN
          public.projects p ON b.project_id = p.id
        WHERE
          c.started_at IS NOT NULL
          AND v.text IS NOT NULL
          AND p.code = project_code;
  END;
$function$
;

CREATE OR REPLACE FUNCTION public.fix_sorting(table_name text, column_name text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
  DECLARE
    sql text;
  BEGIN
    sql := format('
      WITH sorted_notes AS (
        SELECT id,
          row_number() OVER (PARTITION BY %I, parent_id ORDER BY sorting) - 1 AS new_sorting
        FROM %I
        WHERE sorting IS NOT NULL
      )
      UPDATE %I tn
      SET sorting = sn.new_sorting
      FROM sorted_notes sn
      WHERE tn.id = sn.id', column_name, table_name, table_name);

    EXECUTE sql;
  END;
  $function$
;

CREATE OR REPLACE FUNCTION public.get_active_translators(project_code text, book_code book_code, chapter_num smallint)
 RETURNS TABLE(translator_id bigint, login text, is_moderator boolean, user_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
    -- must be on the project
    IF authorize(auth.uid(), (SELECT id FROM projects WHERE code = get_active_translators.project_code)) NOT IN ('user', 'admin', 'coordinator', 'moderator', 'translator') THEN
        RETURN;
    END IF;

    RETURN query SELECT project_translator_id, users.login, project_translators.is_moderator, users.id
    FROM verses
    LEFT JOIN chapters ON (verses.chapter_id = chapters.id)
    LEFT JOIN books ON (chapters.book_id = books.id)
    LEFT JOIN steps ON (verses.current_step = steps.id)
    LEFT JOIN projects ON (projects.id = verses.project_id)
    LEFT JOIN project_translators ON (project_translators.id = verses.project_translator_id)
    LEFT JOIN users ON (users.id = project_translators.user_id)
    WHERE projects.code = get_active_translators.project_code
    AND books.code = get_active_translators.book_code
    AND chapters.num = get_active_translators.chapter_num
    AND chapters.started_at IS NOT NULL
    AND chapters.finished_at IS NULL
    AND verses.project_translator_id IS NOT NULL
    GROUP BY project_translator_id, users.login, project_translators.is_moderator, users.id
    ORDER BY users.login;
END$function$
;

CREATE OR REPLACE FUNCTION public.get_books_not_null_level_checks(project_code text)
 RETURNS TABLE(book_code book_code, level_checks json)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  DECLARE
  project_id bigint;
  BEGIN
    SELECT id INTO project_id FROM public.projects WHERE code = project_code;

    IF project_id IS NULL THEN
      RETURN;
    END IF;

    IF authorize(auth.uid(), project_id) NOT IN ('user', 'admin', 'coordinator', 'moderator') THEN
     RETURN;
    END IF;

    RETURN QUERY
     SELECT
        b.code AS book_code,
        b.level_checks
      FROM
        public.books b
      INNER JOIN
        public.projects p ON b.project_id = p.id
      WHERE
        p.code = project_code
        AND b.level_checks IS NOT NULL;
  END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_steps(project_id bigint)
 RETURNS TABLE(title text, project text, book book_code, chapter smallint, step smallint, started_at timestamp without time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$

    BEGIN
      -- должен быть на проекте
      IF authorize(auth.uid(), get_current_steps.project_id) IN ('user') THEN
        RETURN;
      END IF;

      --
      RETURN query SELECT steps.title, projects.code as project, books.code as book, chapters.num as chapter, steps.sorting as step, chapters.started_at
      FROM verses
        LEFT JOIN chapters ON (verses.chapter_id = chapters.id)
        LEFT JOIN books ON (chapters.book_id = books.id)
        LEFT JOIN steps ON (verses.current_step = steps.id)
        LEFT JOIN projects ON (projects.id = verses.project_id)
      WHERE verses.project_id = get_current_steps.project_id
        AND chapters.started_at IS NOT NULL
        AND chapters.finished_at IS NULL
        AND project_translator_id = (SELECT id FROM project_translators WHERE project_translators.project_id = get_current_steps.project_id AND user_id = auth.uid())
      GROUP BY books.id, chapters.id, verses.current_step, steps.id, projects.id;

    END;
  $function$
;

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

CREATE OR REPLACE FUNCTION public.get_max_sorting(table_name text, user_id uuid DEFAULT NULL::uuid, project_id bigint DEFAULT NULL::bigint)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
      DECLARE
        max_sorting_value integer;
      BEGIN
        IF table_name = 'personal_notes' THEN
          EXECUTE format('
            SELECT COALESCE(MAX(sorting), -1)
            FROM %I
            WHERE parent_id IS NULL AND user_id = $1', table_name)
          INTO max_sorting_value
          USING user_id;
        ELSIF table_name = 'team_notes' THEN
          EXECUTE format('
            SELECT COALESCE(MAX(sorting), -1)
            FROM %I
            WHERE parent_id IS NULL AND project_id = $1', table_name)
          INTO max_sorting_value
          USING project_id;
        END IF;

        RETURN max_sorting_value + 1;
      END;
    $function$
;

CREATE OR REPLACE FUNCTION public.get_verses(project_id bigint, chapter smallint, book book_code)
 RETURNS TABLE(verse_id bigint, num smallint, verse text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      verses_list RECORD;
      cur_chapter_id BIGINT;
    BEGIN
      -- должен быть на проекте
      IF authorize(auth.uid(), get_verses.project_id) IN ('user') THEN
        RETURN;
      END IF;

      SELECT chapters.id into cur_chapter_id
      FROM PUBLIC.chapters
      WHERE chapters.num = get_verses.chapter AND chapters.project_id = get_verses.project_id AND chapters.book_id = (SELECT id FROM PUBLIC.books WHERE books.code = get_verses.book AND books.project_id = get_verses.project_id);

      -- узнать id главы
      IF cur_chapter_id IS NULL THEN
        RETURN;
      END IF;

      -- вернуть айди стиха, номер и текст для определенного переводчика и из определенной главы
      return query SELECT verses.id as verse_id, verses.num, verses.text as verse
      FROM public.verses
      WHERE verses.project_translator_id = (SELECT id
      FROM PUBLIC.project_translators
      WHERE project_translators.user_id = auth.uid()
        AND project_translators.project_id = get_verses.project_id)
        AND verses.project_id = get_verses.project_id
        AND verses.chapter_id = cur_chapter_id
      ORDER BY verses.num;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.get_whole_chapter(project_code text, chapter_num smallint, book_code book_code)
 RETURNS TABLE(verse_id bigint, num smallint, verse text, translator text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      verses_list RECORD;
      cur_chapter_id BIGINT;
      cur_project_id BIGINT;
    BEGIN

      SELECT projects.id INTO cur_project_id
      FROM PUBLIC.projects
      WHERE projects.code = get_whole_chapter.project_code;

      -- find out the project_id
      IF cur_project_id IS NULL THEN
        RETURN;
      END IF;

      -- user must be assigned to this project
      IF authorize(auth.uid(), cur_project_id) IN ('user') THEN
        RETURN;
      END IF;

      SELECT chapters.id INTO cur_chapter_id
      FROM PUBLIC.chapters
      JOIN PUBLIC.books ON chapters.book_id = books.id
      WHERE chapters.num = get_whole_chapter.chapter_num
        AND chapters.project_id = cur_project_id
        AND books.code = get_whole_chapter.book_code
        AND books.project_id = cur_project_id;

      -- find out the chapter id
      IF cur_chapter_id IS NULL THEN
        RETURN;
      END IF;

      -- return the verse id, number, and text from a specific chapter
      RETURN query SELECT verses.id AS verse_id, verses.num, verses.text AS verse, users.login AS translator
      FROM public.verses LEFT OUTER JOIN public.project_translators ON (verses.project_translator_id = project_translators.id) LEFT OUTER JOIN public.users ON (project_translators.user_id = users.id)
      WHERE verses.project_id = cur_project_id
        AND verses.chapter_id = cur_chapter_id
        AND verses.num < 201
      ORDER BY verses.num;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.get_words_page(search_query text, words_per_page integer, page_number integer, project_id_param bigint)
 RETURNS TABLE(dict_id text, dict_project_id bigint, dict_title text, dict_data json, dict_created_at timestamp without time zone, dict_changed_at timestamp without time zone, dict_deleted_at timestamp without time zone, total_records bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  DECLARE
  from_offset INT;
  to_offset INT;
  BEGIN
    IF page_number = -1 THEN
      RETURN QUERY
       SELECT
        id AS dict_id,
        project_id AS dict_project_id,
        title AS dict_title,
        data AS dict_data,
        created_at AS dict_created_at,
        changed_at AS dict_changed_at,
        deleted_at AS dict_deleted_at,
        COUNT(*) OVER() AS total_records
      FROM dictionaries
      WHERE project_id = project_id_param
        AND deleted_at IS NULL
        AND title ILIKE (search_query || '%')
      ORDER BY title ASC;
    ELSE
      from_offset := page_number * words_per_page;
      to_offset := (page_number + 1) * words_per_page;

      RETURN QUERY
        SELECT
          id AS dict_id,
          project_id AS dict_project_id,
          title AS dict_title,
          data AS dict_data,
          created_at AS dict_created_at,
          changed_at AS dict_changed_at,
          deleted_at AS dict_deleted_at,
          COUNT(*) OVER() AS total_records
        FROM dictionaries
        WHERE project_id = project_id_param
        AND deleted_at IS NULL
        AND title ILIKE (search_query || '%')
        ORDER BY title ASC
        LIMIT words_per_page
        OFFSET from_offset;
    END IF;
  END 
$function$
;

CREATE OR REPLACE FUNCTION public.go_to_next_step(project text, chapter smallint, book book_code)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      proj_trans RECORD;
      cur_step int2;
      cur_chapter_id bigint;
      next_step RECORD;
    BEGIN

      SELECT
        project_translators.id, projects.id as project_id INTO proj_trans
      FROM
        PUBLIC.project_translators LEFT JOIN PUBLIC.projects ON (projects.id = project_translators.project_id)
      WHERE
        project_translators.user_id = auth.uid() AND projects.code = go_to_next_step.project;

      -- Есть ли такой переводчик на проекте
      IF proj_trans.id IS NULL THEN
        RETURN 0;
      END IF;

      -- получаем айди главы
      SELECT chapters.id into cur_chapter_id
      FROM PUBLIC.chapters
      WHERE chapters.num = go_to_next_step.chapter AND chapters.project_id = proj_trans.project_id AND chapters.book_id = (SELECT id FROM PUBLIC.books WHERE books.code = go_to_next_step.book AND books.project_id = proj_trans.project_id);

      -- валидация главы
      IF cur_chapter_id IS NULL THEN
        RETURN 0;
      END IF;

      SELECT
        sorting INTO cur_step
      FROM
        PUBLIC.verses LEFT JOIN PUBLIC.steps ON (steps.id = verses.current_step)
      WHERE verses.chapter_id = cur_chapter_id
        AND project_translator_id = proj_trans.id
      LIMIT 1;

      -- Есть ли закрепленные за ним стихи, и узнать на каком сейчас шаге
      IF cur_step IS NULL THEN
        RETURN 0;
      END IF;

      SELECT id, sorting into next_step
      FROM PUBLIC.steps
      WHERE steps.project_id = proj_trans.project_id
        AND steps.sorting > cur_step
      ORDER BY steps.sorting
      LIMIT 1;

      -- получить с базы, какой следующий шаг, если его нет то ничего не делать
      IF next_step.id IS NULL THEN
        RETURN cur_step;
      END IF;

      -- Если есть, то обновить в базе
      UPDATE PUBLIC.verses SET current_step = next_step.id WHERE verses.chapter_id = cur_chapter_id
        AND verses.project_translator_id = proj_trans.id;

      RETURN next_step.sorting;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.go_to_step(project text, chapter smallint, book book_code, current_step smallint)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      proj_trans RECORD;
      cur_step int2;
      cur_chapter_id bigint;
      next_step RECORD;
    BEGIN

      SELECT
        project_translators.id, projects.id as project_id INTO proj_trans
      FROM
        PUBLIC.project_translators LEFT JOIN PUBLIC.projects ON (projects.id = project_translators.project_id)
      WHERE
        project_translators.user_id = auth.uid() AND projects.code = go_to_step.project;

      -- Есть ли такой переводчик на проекте
      IF proj_trans.id IS NULL THEN
        RETURN 0;
      END IF;

      -- получаем айди главы
      SELECT chapters.id into cur_chapter_id
      FROM PUBLIC.chapters
      WHERE chapters.num = go_to_step.chapter AND chapters.project_id = proj_trans.project_id AND chapters.book_id = (SELECT id FROM PUBLIC.books WHERE books.code = go_to_step.book AND books.project_id = proj_trans.project_id);

      -- валидация главы
      IF cur_chapter_id IS NULL THEN
        RETURN 0;
      END IF;

      SELECT
        sorting INTO cur_step
      FROM
        PUBLIC.verses LEFT JOIN PUBLIC.steps ON (steps.id = verses.current_step)
      WHERE verses.chapter_id = cur_chapter_id
        AND project_translator_id = proj_trans.id
      LIMIT 1;

      -- Есть ли закрепленные за ним стихи, и узнать на каком сейчас шаге
      IF cur_step IS NULL THEN
        RETURN 0;
      END IF;

      IF cur_step != go_to_step.current_step THEN
        RETURN cur_step;
      END IF;

      SELECT id, sorting into next_step
      FROM PUBLIC.steps
      WHERE steps.project_id = proj_trans.project_id
        AND steps.sorting > cur_step
      ORDER BY steps.sorting
      LIMIT 1;

      -- получить с базы, какой следующий шаг, если его нет то ничего не делать
      IF next_step.id IS NULL THEN
        RETURN cur_step;
      END IF;

      -- Если есть, то обновить в базе
      UPDATE PUBLIC.verses SET current_step = next_step.id WHERE verses.chapter_id = cur_chapter_id
        AND verses.project_translator_id = proj_trans.id;

      RETURN next_step.sorting;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.handle_compile_chapter()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      chapter JSONB;
    BEGIN
      IF (NEW.finished_at IS NOT NULL) THEN
        SELECT jsonb_object_agg(num, "text" ORDER BY num ASC) FROM PUBLIC.verses WHERE project_id = OLD.project_id AND chapter_id = OLD.id AND num < 201 INTO chapter;
        NEW.text=chapter;
      END IF;
      RETURN NEW;
    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.handle_new_book()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ BEGIN
      IF (PUBLIC.create_chapters(NEW.id)) THEN
        RETURN NEW;
      ELSE
        RETURN NULL;
      END IF;
    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ BEGIN
      INSERT INTO
        PUBLIC.users (id, email, login)
      VALUES
        (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'login');

      RETURN NEW;

    END;

  $function$
;

CREATE OR REPLACE FUNCTION public.handle_next_step()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ BEGIN
      IF NEW.current_step = OLD.current_step THEN
        RETURN NEW;
      END IF;
      INSERT INTO
        PUBLIC.progress (verse_id, "text", step_id)
      VALUES
        (NEW.id, NEW.text, OLD.current_step);

      RETURN NEW;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.handle_update_personal_notes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ BEGIN
      NEW.changed_at:=NOW();

      RETURN NEW;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.handle_update_team_notes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ BEGIN
      NEW.changed_at:=NOW();

      RETURN NEW;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.has_access()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      access INT;

    BEGIN
      SELECT
        COUNT(*) INTO access
      FROM
        PUBLIC.users
      WHERE
        users.id = auth.uid() AND users.agreement
        AND users.confession AND users.blocked IS NULL;

      RETURN access > 0;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.has_assigned_verses(project_translator_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM verses 
    WHERE verses.project_translator_id = has_assigned_verses.project_translator_id
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_additional_chapter(book_id bigint, verses integer, project_id bigint, num smallint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$         
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
      END IF;      
      INSERT INTO PUBLIC.logs (log) VALUES (json_build_object('function', 'insert_additional_chapter', 'book_id', book_id, 'verses', verses, 'project_id', project_id, 'num',  num));  
      INSERT INTO PUBLIC.chapters (num, verses, book_id, project_id) VALUES (num, verses, book_id, project_id)
      ON CONFLICT ON CONSTRAINT chapters_book_id_num_key
          DO NOTHING;
      RETURN TRUE;
    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.insert_additional_verses(start_verse smallint, finish_verse smallint, chapter_id bigint, project_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ 
    DECLARE step_id BIGINT;    
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
      END IF;      
      IF finish_verse < start_verse THEN
        RETURN false;
      END IF;    
      SELECT id FROM steps WHERE steps.project_id = insert_additional_verses.project_id AND sorting = 1 INTO step_id;
      INSERT INTO PUBLIC.logs (log) VALUES ( json_build_object('function', 'insert_additional_verses', 'start_verse', start_verse, 'step_id', id, 'finish_verse', finish_verse, 'chapter_id', chapter_id, 'project_id', project_id)); 
      
      FOR i IN start_verse..finish_verse LOOP
        INSERT INTO
          PUBLIC.verses (num, chapter_id, current_step, project_id)
        VALUES
          (i, chapter_id, step_id, project_id)
          ON CONFLICT ON CONSTRAINT verses_chapter_id_num_key
          DO NOTHING;
      END LOOP;      
      RETURN TRUE;
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.move_node(new_sorting_value integer, dragged_node_id character varying, new_parent_id character varying, table_name text, project_id bigint DEFAULT NULL::bigint, user_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      old_sorting INT;
      old_parent_id VARCHAR;
      note_user_id UUID;
      note_project_id INT8;
    BEGIN
      IF table_name = 'personal_notes' THEN
        EXECUTE format('
          SELECT sorting, parent_id, user_id
          FROM PUBLIC.%I
          WHERE id = $1', table_name)
        INTO old_sorting, old_parent_id, note_user_id
        USING dragged_node_id;

        IF note_user_id != user_id THEN
          RAISE EXCEPTION 'You are not allowed to move this note';
        END IF;
      ELSIF table_name = 'team_notes' THEN
        EXECUTE format('
          SELECT sorting, parent_id, project_id
          FROM PUBLIC.%I
          WHERE id = $1', table_name)
        INTO old_sorting, old_parent_id, note_project_id
        USING dragged_node_id;

        IF note_project_id != project_id THEN
          RAISE EXCEPTION 'You are not allowed to move this note';
        END IF;
      END IF;

      IF old_sorting IS NOT NULL THEN
        -- if the new sorting is equal to the old one, or greater than the old one by one and the action is in the common parent, then we do nothing
        IF (new_sorting_value = old_sorting OR new_sorting_value = old_sorting + 1) AND (old_parent_id = new_parent_id OR (old_parent_id IS NULL AND new_parent_id IS NULL)) THEN
          RETURN;

        -- if the new sorting is greater than the old sorting and the action is in a common parent
        ELSIF new_sorting_value > old_sorting AND (new_parent_id = old_parent_id OR (old_parent_id IS NULL AND new_parent_id IS NULL)) THEN
          new_sorting_value := new_sorting_value - 1;
          IF table_name = 'personal_notes' THEN
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting - 1
              WHERE user_id = $1 AND sorting > $2 AND sorting <= $3 AND (parent_id = $4 OR (parent_id IS NULL AND $5 IS NULL))', table_name)
            USING note_user_id, old_sorting, new_sorting_value, new_parent_id, new_parent_id;
          ELSIF table_name = 'team_notes' THEN
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting - 1
              WHERE project_id = $1 AND sorting > $2 AND sorting <= $3 AND (parent_id = $4 OR (parent_id IS NULL AND $5 IS NULL))', table_name)
            USING note_project_id, old_sorting, new_sorting_value, new_parent_id, new_parent_id;
          END IF;

        -- if the new sorting is smaller than the old sorting and the action is in the common parent
        ELSIF new_sorting_value < old_sorting AND (new_parent_id = old_parent_id OR (old_parent_id IS NULL AND new_parent_id IS NULL)) THEN
          IF table_name = 'personal_notes' THEN
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting + 1
              WHERE user_id = $1 AND sorting < $2 AND sorting >= $3 AND (parent_id = $4 OR (parent_id IS NULL AND $5 IS NULL))', table_name)
            USING note_user_id, old_sorting, new_sorting_value, new_parent_id, new_parent_id;
          ELSIF table_name = 'team_notes' THEN
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting + 1
              WHERE project_id = $1 AND sorting < $2 AND sorting >= $3 AND (parent_id = $4 OR (parent_id IS NULL AND $5 IS NULL))', table_name)
            USING note_project_id, old_sorting, new_sorting_value, new_parent_id, new_parent_id;
          END IF;

        -- if we move to a new folder, then in the old folder we reduce the sorting of all elements that are larger than the old sorting
        ELSIF new_parent_id IS DISTINCT FROM old_parent_id THEN
          IF table_name = 'personal_notes' THEN
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting - 1
              WHERE user_id = $1 AND sorting > $2 AND (parent_id = $3 OR (parent_id IS NULL AND $4 IS NULL))', table_name)
            USING note_user_id, old_sorting, old_parent_id, old_parent_id;

            -- in the new folder we increase the sorting of all elements whose sorting is equal to or greater than the new sorting
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting + 1
              WHERE user_id = $1 AND sorting >= $2 AND (parent_id = $3 OR (parent_id IS NULL AND $4 IS NULL))', table_name)
            USING note_user_id, new_sorting_value, new_parent_id, new_parent_id;
          ELSIF table_name = 'team_notes' THEN
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting - 1
              WHERE project_id = $1 AND sorting > $2 AND (parent_id = $3 OR (parent_id IS NULL AND $4 IS NULL))', table_name)
            USING note_project_id, old_sorting, old_parent_id, old_parent_id;

            -- in the new folder we increase the sorting of all elements whose sorting is equal to or greater than the new sorting
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting + 1
              WHERE project_id = $1 AND sorting >= $2 AND (parent_id = $3 OR (parent_id IS NULL AND $4 IS NULL))', table_name)
            USING note_project_id, new_sorting_value, new_parent_id, new_parent_id;
          END IF;
        END IF;
      END IF;

      -- update the moved node
      EXECUTE format('
        UPDATE PUBLIC.%I
        SET sorting = $1, parent_id = $2
        WHERE id = $3', table_name)
      USING new_sorting_value, new_parent_id, dragged_node_id;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.remove_moderator(user_id uuid, project_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      usr RECORD;
    BEGIN
      IF authorize(auth.uid(), remove_moderator.project_id) NOT IN ('admin', 'coordinator') THEN
        RETURN FALSE;
      END IF;
      SELECT id, is_moderator INTO usr FROM PUBLIC.project_translators WHERE project_translators.project_id = remove_moderator.project_id AND project_translators.user_id = remove_moderator.user_id;
      IF usr.id IS NULL THEN
        RETURN FALSE;
      END IF;
      UPDATE PUBLIC.project_translators SET is_moderator = FALSE WHERE project_translators.id = usr.id;

      RETURN TRUE;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.save_verse(verse_id bigint, new_verse text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
     current_verse record;
     current_chapter record;
     cur_user record;
    BEGIN
      SELECT * FROM public.verses where verses.id = verse_id INTO current_verse;
      -- стих должен существовать и должен быть назначен переводчику
      IF current_verse.project_translator_id IS NULL THEN
        RETURN FALSE;
      END IF;

      -- юзер должен быть на этом проекте
      IF authorize(auth.uid(), current_verse.project_id) IN ('user') THEN RETURN FALSE;
      END IF;

      SELECT chapters.id FROM public.chapters where chapters.id = current_verse.chapter_id AND chapters.started_at IS NOT NULL AND chapters.finished_at IS NULL INTO current_chapter;
      -- глава должна быть в процессе перевода
      IF current_chapter.id IS NULL THEN
        RETURN FALSE;
      END IF;

      SELECT project_translators.user_id as id FROM public.project_translators where project_translators.id = current_verse.project_translator_id AND project_translators.project_id = current_verse.project_id AND project_translators.user_id = auth.uid() into cur_user;
      -- текущий юзер должен быть переводчиком на проекте, и должен быть назначен на этот стих
      IF cur_user.id IS NULL THEN
        RETURN FALSE;
      END IF;

      UPDATE PUBLIC.verses SET "text" = save_verse.new_verse WHERE verses.id = save_verse.verse_id;

      RETURN true;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.save_verses(verses json)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
    new_verses RECORD;
    BEGIN
      -- узнать айди переводчика на проекте
      -- узнать айди главы, которую переводим, убедиться что перевод еще в процессе
      -- в цикле обновить текст стихов, с учетом айди переводчика и главы

      FOR new_verses IN SELECT * FROM json_each_text(save_verses.verses)
      LOOP
        UPDATE
          PUBLIC.verses
        SET "text" = new_verses.value::text
        WHERE
          verses.id = new_verses.key::bigint;
      END LOOP;

      RETURN true;

    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.save_verses_if_null(verses json, project_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
  $function$
;

CREATE OR REPLACE FUNCTION public.set_sorting_before_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
      DECLARE
        user_id UUID;
        project_id INT8;
      BEGIN
        IF TG_TABLE_NAME = 'personal_notes' THEN
          SELECT NEW.user_id INTO user_id;
          NEW.sorting := get_max_sorting('personal_notes', user_id, NULL);
        ELSIF TG_TABLE_NAME = 'team_notes' THEN
          SELECT NEW.project_id INTO project_id;
          NEW.sorting := get_max_sorting('team_notes', NULL, project_id);
        END IF;
        RETURN NEW;
      END;
    $function$
;

CREATE OR REPLACE FUNCTION public.update_chapters_in_books(book_id bigint, chapters_new json, project_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$  
    DECLARE chapters_old JSON;        
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
      END IF;
      SELECT json_build_object('chapters',chapters) FROM PUBLIC.books WHERE books.id = book_id AND books.project_id = update_chapters_in_books.project_id INTO chapters_old;
      INSERT INTO PUBLIC.logs (log) VALUES (json_build_object('function','update_chapters_in_books', 'book_id', book_id, 'chapters', update_chapters_in_books.chapters_new, 'project_id', project_id, 'old values', chapters_old));   
      UPDATE PUBLIC.books SET chapters = update_chapters_in_books.chapters_new WHERE books.id = book_id AND books.project_id = update_chapters_in_books.project_id;
      RETURN TRUE;
    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.update_multiple_steps(steps jsonb[], project_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  step jsonb;
BEGIN
  IF authorize(auth.uid(), update_multiple_steps.project_id) NOT IN ('admin') THEN
    RETURN FALSE;
  END IF;
  FOREACH step IN ARRAY steps
  LOOP
    UPDATE public.steps
    SET
      title = (step->>'title')::TEXT,
      description = (step->>'description')::TEXT,
      intro = (step->>'intro')::TEXT
     WHERE id = (step->>'id')::BIGINT AND update_multiple_steps.project_id = public.steps.project_id;
  END LOOP;
  RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_project_basic(project_code text, title text, orig_title text, code text, language_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ DECLARE
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
      
    SELECT id FROM public.projects WHERE projects.code = update_project_basic.project_code INTO project_id;
  END IF;

  UPDATE PUBLIC.projects SET code = update_project_basic.code, title=update_project_basic.title, orig_title = update_project_basic.orig_title, language_id = update_project_basic.language_id WHERE projects.id = project_id;
  RETURN TRUE;
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

CREATE OR REPLACE FUNCTION public.update_resources_in_projects(resources_new json, base_manifest_new json, project_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ 
    DECLARE old_values JSON;
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
      END IF;
      SELECT json_build_object('resources', resources, 'base_manifest', base_manifest) FROM PUBLIC.projects WHERE id = update_resources_in_projects.project_id INTO old_values;
      INSERT INTO PUBLIC.logs (log) VALUES (json_build_object('function', 'update_resources_in_projects','resources', update_resources_in_projects.resources_new, 'base_manifest', update_resources_in_projects.base_manifest_new, 'project_id', project_id, 'old values', old_values));  
      UPDATE PUBLIC.projects SET resources = update_resources_in_projects.resources_new, base_manifest = update_resources_in_projects.base_manifest_new WHERE id = project_id;
      RETURN TRUE;
    END;
  $function$
;

CREATE OR REPLACE FUNCTION public.update_verses_in_chapters(book_id bigint, verses_new integer, num smallint, project_id bigint)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ 
    DECLARE chapter JSON;
            verses_old JSON;        
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
      END IF;
      SELECT json_build_object('verses', verses) FROM PUBLIC.chapters WHERE chapters.book_id = update_verses_in_chapters.book_id AND chapters.project_id = update_verses_in_chapters.project_id INTO verses_old;
      INSERT INTO PUBLIC.logs (log) VALUES (json_build_object('function', 'update_verses_in_chapters', 'book_id', book_id, 'verses', update_verses_in_chapters.verses_new, 'project_id', project_id, 'old values', verses_old));
      UPDATE PUBLIC.chapters SET verses = update_verses_in_chapters.verses_new WHERE chapters.book_id = update_verses_in_chapters.book_id AND chapters.num = update_verses_in_chapters.num AND chapters.project_id = update_verses_in_chapters.project_id;
      SELECT json_build_object('id', id, 'started_at', started_at) FROM PUBLIC.chapters WHERE chapters.book_id = update_verses_in_chapters.book_id AND chapters.num = update_verses_in_chapters.num INTO chapter;
      RETURN chapter;
    END;
  $function$
;


