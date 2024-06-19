
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

ALTER SCHEMA "public" OWNER TO "postgres";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgtap" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "plpgsql_check" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."app_permission" AS ENUM (
    'dictionaries',
    'notes',
    'projects',
    'verses.set',
    'moderator.set',
    'user_projects',
    'project_source',
    'coordinator.set',
    'languages',
    'user_languages',
    'translator.set'
);

ALTER TYPE "public"."app_permission" OWNER TO "postgres";

CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'coordinator',
    'moderator',
    'translator'
);

ALTER TYPE "public"."app_role" OWNER TO "postgres";

CREATE TYPE "public"."book_code" AS ENUM (
    'gen',
    'exo',
    'lev',
    'num',
    'deu',
    'jos',
    'jdg',
    'rut',
    '1sa',
    '2sa',
    '1ki',
    '2ki',
    '1ch',
    '2ch',
    'ezr',
    'neh',
    'est',
    'job',
    'psa',
    'pro',
    'ecc',
    'sng',
    'isa',
    'jer',
    'lam',
    'ezk',
    'dan',
    'hos',
    'jol',
    'amo',
    'oba',
    'jon',
    'mic',
    'nam',
    'hab',
    'zep',
    'hag',
    'zec',
    'mal',
    'mat',
    'mrk',
    'luk',
    'jhn',
    'act',
    'rom',
    '1co',
    '2co',
    'gal',
    'eph',
    'php',
    'col',
    '1th',
    '2th',
    '1ti',
    '2ti',
    'tit',
    'phm',
    'heb',
    'jas',
    '1pe',
    '2pe',
    '1jn',
    '2jn',
    '3jn',
    'jud',
    'rev',
    'obs'
);

ALTER TYPE "public"."book_code" OWNER TO "postgres";

CREATE TYPE "public"."project_role" AS ENUM (
    'coordinator',
    'moderator',
    'translator'
);

ALTER TYPE "public"."project_role" OWNER TO "postgres";

CREATE TYPE "public"."project_type" AS ENUM (
    'obs',
    'bible'
);

ALTER TYPE "public"."project_type" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."admin_only"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."admin_only"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."alphabet_change_handler"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."alphabet_change_handler"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."alphabet_insert_handler"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."alphabet_insert_handler"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."assign_moderator"("user_id" "uuid", "project_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."assign_moderator"("user_id" "uuid", "project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."authorize"("user_id" "uuid", "project_id" bigint) RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."authorize"("user_id" "uuid", "project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."block_user"("user_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."block_user"("user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."can_translate"("translator_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."can_translate"("translator_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."change_finish_chapter"("chapter_id" bigint, "project_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."change_finish_chapter"("chapter_id" bigint, "project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."change_start_chapter"("chapter_id" bigint, "project_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."change_start_chapter"("chapter_id" bigint, "project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."chapter_assign"("chapter" integer, "translators" bigint[], "project_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."chapter_assign"("chapter" integer, "translators" bigint[], "project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_agreement"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    DECLARE

    BEGIN
      UPDATE PUBLIC.users SET agreement = TRUE WHERE users.id = auth.uid();

      RETURN TRUE;

    END;
  $$;

ALTER FUNCTION "public"."check_agreement"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_confession"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    DECLARE

    BEGIN
      UPDATE PUBLIC.users SET confession = TRUE WHERE users.id = auth.uid();

      RETURN TRUE;

    END;
  $$;

ALTER FUNCTION "public"."check_confession"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."compile_book"("book_id" bigint, "project_id" bigint) RETURNS TABLE("num" smallint, "text" "jsonb", "id" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."compile_book"("book_id" bigint, "project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."correct_sorting_on_deletion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
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
  $_$;

ALTER FUNCTION "public"."correct_sorting_on_deletion"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_brief"("project_id" bigint, "is_enable" boolean, "data_collection" "json") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
      DECLARE
        brief_id BIGINT;
      BEGIN
        IF authorize(auth.uid(), create_brief.project_id) NOT IN ('admin', 'coordinator') THEN
          RETURN false;
        END IF;
        INSERT INTO PUBLIC.briefs (project_id, data_collection, is_enable) VALUES (project_id, data_collection, is_enable) RETURNING id INTO brief_id;
        RETURN brief_id;
      END;
  $$;

ALTER FUNCTION "public"."create_brief"("project_id" bigint, "is_enable" boolean, "data_collection" "json") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_chapters"("book_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."create_chapters"("book_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_verses"("chapter_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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

ALTER FUNCTION "public"."create_verses"("chapter_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."divide_verses"("divider" character varying, "project_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."divide_verses"("divider" character varying, "project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."find_books_with_chapters_and_verses"("project_code" "text") RETURNS TABLE("book_code" "public"."book_code", "chapter_num" smallint, "verse_num" smallint, "verse_text" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."find_books_with_chapters_and_verses"("project_code" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."fix_sorting"("table_name" "text", "column_name" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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
  $$;

ALTER FUNCTION "public"."fix_sorting"("table_name" "text", "column_name" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_books_not_null_level_checks"("project_code" "text") RETURNS TABLE("book_code" "public"."book_code", "level_checks" "json")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."get_books_not_null_level_checks"("project_code" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_current_steps"("project_id" bigint) RETURNS TABLE("title" "text", "project" "text", "book" "public"."book_code", "chapter" smallint, "step" smallint, "started_at" timestamp without time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$

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
  $$;

ALTER FUNCTION "public"."get_current_steps"("project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_is_await_team"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code", "step" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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

ALTER FUNCTION "public"."get_is_await_team"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code", "step" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_max_sorting"("table_name" "text", "user_id" "uuid" DEFAULT NULL::"uuid", "project_id" bigint DEFAULT NULL::bigint) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
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
    $_$;

ALTER FUNCTION "public"."get_max_sorting"("table_name" "text", "user_id" "uuid", "project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_verses"("project_id" bigint, "chapter" smallint, "book" "public"."book_code") RETURNS TABLE("verse_id" bigint, "num" smallint, "verse" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."get_verses"("project_id" bigint, "chapter" smallint, "book" "public"."book_code") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_whole_chapter"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code") RETURNS TABLE("verse_id" bigint, "num" smallint, "verse" "text", "translator" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."get_whole_chapter"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_words_page"("search_query" "text", "words_per_page" integer, "page_number" integer, "project_id_param" bigint) RETURNS TABLE("dict_id" "text", "dict_project_id" bigint, "dict_title" "text", "dict_data" "json", "dict_created_at" timestamp without time zone, "dict_changed_at" timestamp without time zone, "dict_deleted_at" timestamp without time zone, "total_records" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."get_words_page"("search_query" "text", "words_per_page" integer, "page_number" integer, "project_id_param" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."go_to_next_step"("project" "text", "chapter" smallint, "book" "public"."book_code") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."go_to_next_step"("project" "text", "chapter" smallint, "book" "public"."book_code") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."go_to_step"("project" "text", "chapter" smallint, "book" "public"."book_code", "current_step" smallint) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."go_to_step"("project" "text", "chapter" smallint, "book" "public"."book_code", "current_step" smallint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_compile_chapter"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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

ALTER FUNCTION "public"."handle_compile_chapter"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_book"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ BEGIN
      IF (PUBLIC.create_chapters(NEW.id)) THEN
        RETURN NEW;
      ELSE
        RETURN NULL;
      END IF;
    END;
  $$;

ALTER FUNCTION "public"."handle_new_book"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ BEGIN
      INSERT INTO
        PUBLIC.users (id, email, login)
      VALUES
        (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'login');

      RETURN NEW;

    END;

  $$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_next_step"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ BEGIN
      IF NEW.current_step = OLD.current_step THEN
        RETURN NEW;
      END IF;
      INSERT INTO
        PUBLIC.progress (verse_id, "text", step_id)
      VALUES
        (NEW.id, NEW.text, OLD.current_step);

      RETURN NEW;

    END;
  $$;

ALTER FUNCTION "public"."handle_next_step"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_update_personal_notes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ BEGIN
      NEW.changed_at:=NOW();

      RETURN NEW;

    END;
  $$;

ALTER FUNCTION "public"."handle_update_personal_notes"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_update_team_notes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ BEGIN
      NEW.changed_at:=NOW();

      RETURN NEW;

    END;
  $$;

ALTER FUNCTION "public"."handle_update_team_notes"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."has_access"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."has_access"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."insert_additional_chapter"("book_id" bigint, "verses" integer, "project_id" bigint, "num" smallint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$         
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
      END IF;      
      INSERT INTO PUBLIC.logs (log) VALUES (json_build_object('function', 'insert_additional_chapter', 'book_id', book_id, 'verses', verses, 'project_id', project_id, 'num',  num));  
      INSERT INTO PUBLIC.chapters (num, verses, book_id, project_id) VALUES (num, verses, book_id, project_id)
      ON CONFLICT ON CONSTRAINT chapters_book_id_num_key
          DO NOTHING;
      RETURN TRUE;
    END;
  $$;

ALTER FUNCTION "public"."insert_additional_chapter"("book_id" bigint, "verses" integer, "project_id" bigint, "num" smallint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."insert_additional_verses"("start_verse" smallint, "finish_verse" smallint, "chapter_id" bigint, "project_id" integer) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ 
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
$$;

ALTER FUNCTION "public"."insert_additional_verses"("start_verse" smallint, "finish_verse" smallint, "chapter_id" bigint, "project_id" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."move_node"("new_sorting_value" integer, "dragged_node_id" character varying, "new_parent_id" character varying, "table_name" "text", "project_id" bigint DEFAULT NULL::bigint, "user_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
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
    $_$;

ALTER FUNCTION "public"."move_node"("new_sorting_value" integer, "dragged_node_id" character varying, "new_parent_id" character varying, "table_name" "text", "project_id" bigint, "user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."remove_moderator"("user_id" "uuid", "project_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."remove_moderator"("user_id" "uuid", "project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."save_verse"("verse_id" bigint, "new_verse" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."save_verse"("verse_id" bigint, "new_verse" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."save_verses"("verses" "json") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

ALTER FUNCTION "public"."save_verses"("verses" "json") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."save_verses_if_null"("verses" "json", "project_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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

ALTER FUNCTION "public"."save_verses_if_null"("verses" "json", "project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_sorting_before_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
    $$;

ALTER FUNCTION "public"."set_sorting_before_insert"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_chapters_in_books"("book_id" bigint, "chapters_new" "json", "project_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$  
    DECLARE chapters_old JSON;        
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
      END IF;
      SELECT json_build_object('chapters',chapters) FROM PUBLIC.books WHERE books.id = book_id AND books.project_id = update_chapters_in_books.project_id INTO chapters_old;
      INSERT INTO PUBLIC.logs (log) VALUES (json_build_object('function','update_chapters_in_books', 'book_id', book_id, 'chapters', update_chapters_in_books.chapters_new, 'project_id', project_id, 'old values', chapters_old));   
      UPDATE PUBLIC.books SET chapters = update_chapters_in_books.chapters_new WHERE books.id = book_id AND books.project_id = update_chapters_in_books.project_id;
      RETURN TRUE;
    END;
  $$;

ALTER FUNCTION "public"."update_chapters_in_books"("book_id" bigint, "chapters_new" "json", "project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_multiple_steps"("steps" "jsonb"[], "project_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
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
$$;

ALTER FUNCTION "public"."update_multiple_steps"("steps" "jsonb"[], "project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_project_basic"("project_code" "text", "title" "text", "orig_title" "text", "code" "text", "language_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ DECLARE
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
$$;

ALTER FUNCTION "public"."update_project_basic"("project_code" "text", "title" "text", "orig_title" "text", "code" "text", "language_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_project_basic"("project_code" "text", "title" "text", "orig_title" "text", "code" "text", "language_id" bigint, "is_rtl" boolean) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
    $$;

ALTER FUNCTION "public"."update_project_basic"("project_code" "text", "title" "text", "orig_title" "text", "code" "text", "language_id" bigint, "is_rtl" boolean) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_resources_in_projects"("resources_new" "json", "base_manifest_new" "json", "project_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ 
    DECLARE old_values JSON;
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
      END IF;
      SELECT json_build_object('resources', resources, 'base_manifest', base_manifest) FROM PUBLIC.projects WHERE id = update_resources_in_projects.project_id INTO old_values;
      INSERT INTO PUBLIC.logs (log) VALUES (json_build_object('function', 'update_resources_in_projects','resources', update_resources_in_projects.resources_new, 'base_manifest', update_resources_in_projects.base_manifest_new, 'project_id', project_id, 'old values', old_values));  
      UPDATE PUBLIC.projects SET resources = update_resources_in_projects.resources_new, base_manifest = update_resources_in_projects.base_manifest_new WHERE id = project_id;
      RETURN TRUE;
    END;
  $$;

ALTER FUNCTION "public"."update_resources_in_projects"("resources_new" "json", "base_manifest_new" "json", "project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_verses_in_chapters"("book_id" bigint, "verses_new" integer, "num" smallint, "project_id" bigint) RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ 
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
  $$;

ALTER FUNCTION "public"."update_verses_in_chapters"("book_id" bigint, "verses_new" integer, "num" smallint, "project_id" bigint) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."books" (
    "id" bigint NOT NULL,
    "code" "public"."book_code" NOT NULL,
    "project_id" bigint NOT NULL,
    "text" "text",
    "chapters" "json",
    "properties" "json",
    "level_checks" "json"
);

ALTER TABLE "public"."books" OWNER TO "postgres";

COMMENT ON TABLE "public"."books" IS 'У каждой книги потом прописать ее вес. Рассчитать на основе англ или русских ресурсов (сколько там слов). Подумать о том, что будет если удалить проект. Так как в таблице книги мы хотим хранить текст. Отобразим 66 книг Библии или 1 ОБС. В будущем парсить манифест чтобы отображать книги которые уже готовы. Или в момент когда админ нажмет "Создать книгу" проверить есть ли они, если нет то выдать предупреждение. При создании проекта он указывает сразу метод. Придумать так чтобы нельзя было добавлять новые шаги после всего. Может сделать функцию, которая проверяет код книги, и добавляет. Тогда никто лишнего не отправит.';

COMMENT ON COLUMN "public"."books"."text" IS 'Здесь мы будем собирать книгу чтобы не делать много запросов. Возьмем все главы и объединим. Так же тут со временем пропишем вес книги на основе англ или русского ресурса. Делать это надо через функцию какую-то, чтобы она собрала сама книгу.';

ALTER TABLE "public"."books" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."books_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."briefs" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "data_collection" "json",
    "is_enable" boolean DEFAULT true,
    "name" "text" DEFAULT 'Brief'::"text",
    "is_rtl" boolean DEFAULT false
);

ALTER TABLE "public"."briefs" OWNER TO "postgres";

ALTER TABLE "public"."briefs" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."briefs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."chapters" (
    "id" bigint NOT NULL,
    "num" smallint NOT NULL,
    "book_id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "verses" integer,
    "started_at" timestamp without time zone,
    "finished_at" timestamp without time zone,
    "text" "jsonb"
);

ALTER TABLE "public"."chapters" OWNER TO "postgres";

ALTER TABLE "public"."chapters" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."chapters_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."dictionaries" (
    "id" "text" NOT NULL,
    "project_id" bigint NOT NULL,
    "title" "text",
    "data" "json",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "changed_at" timestamp without time zone DEFAULT "now"(),
    "deleted_at" timestamp without time zone
);

ALTER TABLE "public"."dictionaries" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."languages" (
    "id" bigint NOT NULL,
    "eng" "text" NOT NULL,
    "code" "text" NOT NULL,
    "orig_name" "text" NOT NULL,
    "is_gl" boolean DEFAULT false NOT NULL,
    "is_rtl" boolean DEFAULT false
);

ALTER TABLE ONLY "public"."languages" REPLICA IDENTITY FULL;

ALTER TABLE "public"."languages" OWNER TO "postgres";

ALTER TABLE "public"."languages" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."languages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."logs" (
    "id" bigint NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "log" "jsonb"
);

ALTER TABLE "public"."logs" OWNER TO "postgres";

ALTER TABLE "public"."logs" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."methods" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "steps" "jsonb",
    "resources" "jsonb",
    "type" "public"."project_type" DEFAULT 'bible'::"public"."project_type" NOT NULL,
    "brief" "json" DEFAULT '[]'::"json",
    "offline_steps" "jsonb"
);

ALTER TABLE "public"."methods" OWNER TO "postgres";

ALTER TABLE "public"."methods" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."methods_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."personal_notes" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text",
    "data" "json",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "changed_at" timestamp without time zone DEFAULT "now"(),
    "is_folder" boolean DEFAULT false,
    "parent_id" "text",
    "deleted_at" timestamp without time zone,
    "sorting" integer
);

ALTER TABLE "public"."personal_notes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."progress" (
    "id" bigint NOT NULL,
    "verse_id" bigint NOT NULL,
    "step_id" bigint NOT NULL,
    "text" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);

ALTER TABLE "public"."progress" OWNER TO "postgres";

ALTER TABLE "public"."progress" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."progress_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."project_coordinators" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL
);

ALTER TABLE "public"."project_coordinators" OWNER TO "postgres";

ALTER TABLE "public"."project_coordinators" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."project_coordinators_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."project_translators" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "is_moderator" boolean DEFAULT false,
    "user_id" "uuid" NOT NULL
);

ALTER TABLE "public"."project_translators" OWNER TO "postgres";

ALTER TABLE "public"."project_translators" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."project_translators_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "code" "text" NOT NULL,
    "language_id" bigint NOT NULL,
    "type" "public"."project_type" NOT NULL,
    "resources" "json",
    "method" "text" NOT NULL,
    "base_manifest" "json",
    "dictionaries_alphabet" "jsonb" DEFAULT '[]'::"jsonb",
    "orig_title" "text",
    "is_rtl" boolean DEFAULT false
);

ALTER TABLE "public"."projects" OWNER TO "postgres";

COMMENT ON COLUMN "public"."projects"."type" IS 'копируется с таблицы методов';

COMMENT ON COLUMN "public"."projects"."resources" IS 'копируем с таблицы методов, должны быть заполнены ссылки, указываем овнера, репо, коммит';

COMMENT ON COLUMN "public"."projects"."method" IS 'копируем без изменений название метода с таблицы шаблонов';

ALTER TABLE "public"."projects" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."projects_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" bigint NOT NULL,
    "role" "public"."project_role" NOT NULL,
    "permission" "public"."app_permission" NOT NULL
);

ALTER TABLE "public"."role_permissions" OWNER TO "postgres";

COMMENT ON TABLE "public"."role_permissions" IS 'Application permissions for each role.';

ALTER TABLE "public"."role_permissions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."role_permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."steps" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "intro" "text",
    "count_of_users" smallint NOT NULL,
    "whole_chapter" boolean DEFAULT true,
    "time" smallint NOT NULL,
    "project_id" bigint NOT NULL,
    "config" "jsonb" NOT NULL,
    "sorting" smallint NOT NULL,
    "is_awaiting_team" boolean DEFAULT false,
    "subtitle" "text"
);

ALTER TABLE "public"."steps" OWNER TO "postgres";

COMMENT ON COLUMN "public"."steps"."sorting" IS 'это поле юзер не редактирует. Мы его указываем сами. Пока что будем получать с клиента.';

ALTER TABLE "public"."steps" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."steps_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."team_notes" (
    "id" "text" NOT NULL,
    "project_id" bigint NOT NULL,
    "title" "text",
    "data" "json",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "changed_at" timestamp without time zone DEFAULT "now"(),
    "is_folder" boolean DEFAULT false,
    "parent_id" "text",
    "deleted_at" timestamp without time zone,
    "sorting" integer
);

ALTER TABLE "public"."team_notes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "login" "text" NOT NULL,
    "agreement" boolean DEFAULT false NOT NULL,
    "confession" boolean DEFAULT false NOT NULL,
    "is_admin" boolean DEFAULT false NOT NULL,
    "blocked" timestamp without time zone,
    "avatar_url" character varying(255) DEFAULT NULL::character varying
);

ALTER TABLE ONLY "public"."users" REPLICA IDENTITY FULL;

ALTER TABLE "public"."users" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."verses" (
    "id" bigint NOT NULL,
    "num" smallint NOT NULL,
    "text" "text",
    "current_step" bigint NOT NULL,
    "chapter_id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "project_translator_id" bigint
);

ALTER TABLE "public"."verses" OWNER TO "postgres";

COMMENT ON COLUMN "public"."verses"."text" IS 'тут будет храниться последний текст. Когда мы переходим на следующий шаг, мы копируем текст и номер предыдущего шага';

COMMENT ON COLUMN "public"."verses"."current_step" IS 'Скорее всего тут придется хранить айдишник шага. Так как несколько переводчиков то часть стихов может быть на одном а часть на другом шаге. Переводчик у нас на уровне проекта а не главы, чтобы можно было у переводчика хранить, на каком он шаге.';

ALTER TABLE "public"."verses" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."verses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_project_id_code_key" UNIQUE ("project_id", "code");

ALTER TABLE ONLY "public"."briefs"
    ADD CONSTRAINT "briefs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."briefs"
    ADD CONSTRAINT "briefs_project_id_key" UNIQUE ("project_id");

ALTER TABLE ONLY "public"."chapters"
    ADD CONSTRAINT "chapters_book_id_num_key" UNIQUE ("book_id", "num");

ALTER TABLE ONLY "public"."chapters"
    ADD CONSTRAINT "chapters_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."dictionaries"
    ADD CONSTRAINT "dictionaries_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."languages"
    ADD CONSTRAINT "languages_code_key" UNIQUE ("code");

ALTER TABLE ONLY "public"."languages"
    ADD CONSTRAINT "languages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."logs"
    ADD CONSTRAINT "logs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."methods"
    ADD CONSTRAINT "methods_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."personal_notes"
    ADD CONSTRAINT "personal_notes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."progress"
    ADD CONSTRAINT "progress_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."project_coordinators"
    ADD CONSTRAINT "project_coordinators_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."project_coordinators"
    ADD CONSTRAINT "project_coordinators_project_id_user_id_key" UNIQUE ("project_id", "user_id");

ALTER TABLE ONLY "public"."project_translators"
    ADD CONSTRAINT "project_translators_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."project_translators"
    ADD CONSTRAINT "project_translators_project_id_user_id_key" UNIQUE ("project_id", "user_id");

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_code_language_id_key" UNIQUE ("code", "language_id");

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_permission_key" UNIQUE ("role", "permission");

ALTER TABLE ONLY "public"."steps"
    ADD CONSTRAINT "steps_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."steps"
    ADD CONSTRAINT "steps_project_id_sorting_key" UNIQUE ("project_id", "sorting");

ALTER TABLE ONLY "public"."team_notes"
    ADD CONSTRAINT "team_notes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_login_key" UNIQUE ("login");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."verses"
    ADD CONSTRAINT "verses_chapter_id_num_key" UNIQUE ("chapter_id", "num");

ALTER TABLE ONLY "public"."verses"
    ADD CONSTRAINT "verses_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX "dictionaries_project_id_title_indx" ON "public"."dictionaries" USING "btree" ("project_id", "title") WHERE ("deleted_at" IS NULL);

CREATE OR REPLACE TRIGGER "alphabet_change_trigger" AFTER UPDATE ON "public"."dictionaries" FOR EACH ROW EXECUTE FUNCTION "public"."alphabet_change_handler"();

CREATE OR REPLACE TRIGGER "alphabet_insert_trigger" BEFORE INSERT ON "public"."dictionaries" FOR EACH ROW EXECUTE FUNCTION "public"."alphabet_insert_handler"();

CREATE OR REPLACE TRIGGER "before_insert_set_sorting_personal_notes" BEFORE INSERT ON "public"."personal_notes" FOR EACH ROW EXECUTE FUNCTION "public"."set_sorting_before_insert"();

CREATE OR REPLACE TRIGGER "before_insert_set_sorting_team_notes" BEFORE INSERT ON "public"."team_notes" FOR EACH ROW EXECUTE FUNCTION "public"."set_sorting_before_insert"();

CREATE OR REPLACE TRIGGER "on_public_book_created" AFTER INSERT ON "public"."books" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_book"();

CREATE OR REPLACE TRIGGER "on_public_chapters_update" BEFORE UPDATE ON "public"."chapters" FOR EACH ROW EXECUTE FUNCTION "public"."handle_compile_chapter"();

CREATE OR REPLACE TRIGGER "on_public_personal_notes_update" BEFORE UPDATE ON "public"."personal_notes" FOR EACH ROW EXECUTE FUNCTION "public"."handle_update_personal_notes"();

CREATE OR REPLACE TRIGGER "on_public_team_notes_update" BEFORE UPDATE ON "public"."team_notes" FOR EACH ROW EXECUTE FUNCTION "public"."handle_update_team_notes"();

CREATE OR REPLACE TRIGGER "on_public_verses_next_step" AFTER UPDATE ON "public"."verses" FOR EACH ROW EXECUTE FUNCTION "public"."handle_next_step"();

CREATE OR REPLACE TRIGGER "sorting_correction_on_deletion_personal_notes" AFTER UPDATE ON "public"."personal_notes" FOR EACH ROW EXECUTE FUNCTION "public"."correct_sorting_on_deletion"();

CREATE OR REPLACE TRIGGER "sorting_correction_on_deletion_team_notes" AFTER UPDATE ON "public"."team_notes" FOR EACH ROW EXECUTE FUNCTION "public"."correct_sorting_on_deletion"();

ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."briefs"
    ADD CONSTRAINT "briefs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."chapters"
    ADD CONSTRAINT "chapters_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."chapters"
    ADD CONSTRAINT "chapters_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."dictionaries"
    ADD CONSTRAINT "dictionaries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."personal_notes"
    ADD CONSTRAINT "personal_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."progress"
    ADD CONSTRAINT "progress_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "public"."steps"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."progress"
    ADD CONSTRAINT "progress_verse_id_fkey" FOREIGN KEY ("verse_id") REFERENCES "public"."verses"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."project_coordinators"
    ADD CONSTRAINT "project_coordinators_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."project_coordinators"
    ADD CONSTRAINT "project_coordinators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."project_translators"
    ADD CONSTRAINT "project_translators_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."project_translators"
    ADD CONSTRAINT "project_translators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."steps"
    ADD CONSTRAINT "steps_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."team_notes"
    ADD CONSTRAINT "team_notes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."verses"
    ADD CONSTRAINT "verses_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."verses"
    ADD CONSTRAINT "verses_current_step_fkey" FOREIGN KEY ("current_step") REFERENCES "public"."steps"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."verses"
    ADD CONSTRAINT "verses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."verses"
    ADD CONSTRAINT "verses_project_translator_id_fkey" FOREIGN KEY ("project_translator_id") REFERENCES "public"."project_translators"("id") ON DELETE CASCADE;

ALTER TABLE "public"."books" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."briefs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."chapters" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."dictionaries" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."languages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."logs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."methods" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."personal_notes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."progress" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."project_coordinators" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."project_translators" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."steps" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."team_notes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_notes delete" ON "public"."team_notes" FOR DELETE USING (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text", 'moderator'::"text"])));

CREATE POLICY "team_notes insert" ON "public"."team_notes" FOR INSERT WITH CHECK (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text", 'moderator'::"text"])));

CREATE POLICY "team_notes select" ON "public"."team_notes" FOR SELECT USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));

CREATE POLICY "team_notes update" ON "public"."team_notes" FOR UPDATE USING (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text", 'moderator'::"text"])));

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."verses" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "word delete" ON "public"."dictionaries" FOR DELETE USING (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text", 'moderator'::"text"])));

CREATE POLICY "word insert" ON "public"."dictionaries" FOR INSERT WITH CHECK (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text", 'moderator'::"text"])));

CREATE POLICY "word update" ON "public"."dictionaries" FOR UPDATE USING (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text", 'moderator'::"text"])));

CREATE POLICY "words select" ON "public"."dictionaries" FOR SELECT USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));

CREATE POLICY "Админ видит все проекты, остальные" ON "public"."projects" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "id") <> 'user'::"text"));

CREATE POLICY "Админ видит всех, остальные только" ON "public"."project_coordinators" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));

CREATE POLICY "Админ видит всех, остальные только" ON "public"."project_translators" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));

CREATE POLICY "Админ может получить список всех м" ON "public"."methods" FOR SELECT TO "authenticated" USING ("public"."admin_only"());

CREATE POLICY "Видят все кто на проекте и админ" ON "public"."briefs" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));

CREATE POLICY "Добавлять можно админу или коорди" ON "public"."books" FOR INSERT WITH CHECK (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text"])));

CREATE POLICY "Добавлять можно только админу" ON "public"."steps" FOR INSERT WITH CHECK ("public"."admin_only"());

CREATE POLICY "Добавлять на проект может админ ил" ON "public"."project_translators" FOR INSERT WITH CHECK (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text"])));

CREATE POLICY "Добавлять на проект может только а" ON "public"."project_coordinators" FOR INSERT WITH CHECK ("public"."admin_only"());

CREATE POLICY "Залогиненый юзер может добавить л" ON "public"."personal_notes" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Залогиненый юзер может изменить л" ON "public"."personal_notes" FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Залогиненый юзер может получить с" ON "public"."languages" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Залогиненый юзер может получить с" ON "public"."users" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Залогиненый юзер может удалить ли" ON "public"."personal_notes" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Изменять может админ, кординатор и" ON "public"."briefs" FOR UPDATE USING (("public"."authorize"("auth"."uid"(), "project_id") <> ALL (ARRAY['user'::"text", 'translator'::"text"])));

CREATE POLICY "Обновлять может только админ" ON "public"."languages" FOR UPDATE USING ("public"."admin_only"());

CREATE POLICY "Обновлять может только админ" ON "public"."projects" FOR UPDATE USING ("public"."admin_only"());

CREATE POLICY "Обновлять может только админ" ON "public"."steps" FOR UPDATE USING ("public"."admin_only"());

CREATE POLICY "Показывать личные заметки данного" ON "public"."personal_notes" FOR SELECT USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Получают данные по шагам все кто н" ON "public"."steps" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));

CREATE POLICY "Получают книги все кто на проекте" ON "public"."books" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));

CREATE POLICY "Получают книги все кто на проекте" ON "public"."chapters" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));

CREATE POLICY "Создавать может только админ" ON "public"."languages" FOR INSERT WITH CHECK ("public"."admin_only"());

CREATE POLICY "Создавать может только админ" ON "public"."projects" FOR INSERT WITH CHECK ("public"."admin_only"());

CREATE POLICY "Стих получить может переводчик, ко" ON "public"."verses" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));

CREATE POLICY "Удалять может только админ" ON "public"."languages" FOR DELETE USING ("public"."admin_only"());

CREATE POLICY "Удалять с проекта может админ или " ON "public"."project_translators" FOR DELETE USING (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text"])));

CREATE POLICY "Удалять только админ" ON "public"."project_coordinators" FOR DELETE USING ("public"."admin_only"());

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."admin_only"() TO "anon";
GRANT ALL ON FUNCTION "public"."admin_only"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_only"() TO "service_role";

GRANT ALL ON FUNCTION "public"."alphabet_change_handler"() TO "anon";
GRANT ALL ON FUNCTION "public"."alphabet_change_handler"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."alphabet_change_handler"() TO "service_role";

GRANT ALL ON FUNCTION "public"."alphabet_insert_handler"() TO "anon";
GRANT ALL ON FUNCTION "public"."alphabet_insert_handler"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."alphabet_insert_handler"() TO "service_role";

GRANT ALL ON FUNCTION "public"."assign_moderator"("user_id" "uuid", "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."assign_moderator"("user_id" "uuid", "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_moderator"("user_id" "uuid", "project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."authorize"("user_id" "uuid", "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."authorize"("user_id" "uuid", "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."authorize"("user_id" "uuid", "project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."block_user"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."block_user"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."block_user"("user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."can_translate"("translator_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."can_translate"("translator_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_translate"("translator_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."change_finish_chapter"("chapter_id" bigint, "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."change_finish_chapter"("chapter_id" bigint, "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."change_finish_chapter"("chapter_id" bigint, "project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."change_start_chapter"("chapter_id" bigint, "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."change_start_chapter"("chapter_id" bigint, "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."change_start_chapter"("chapter_id" bigint, "project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."chapter_assign"("chapter" integer, "translators" bigint[], "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."chapter_assign"("chapter" integer, "translators" bigint[], "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."chapter_assign"("chapter" integer, "translators" bigint[], "project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."check_agreement"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_agreement"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_agreement"() TO "service_role";

GRANT ALL ON FUNCTION "public"."check_confession"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_confession"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_confession"() TO "service_role";

GRANT ALL ON FUNCTION "public"."compile_book"("book_id" bigint, "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."compile_book"("book_id" bigint, "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."compile_book"("book_id" bigint, "project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."correct_sorting_on_deletion"() TO "anon";
GRANT ALL ON FUNCTION "public"."correct_sorting_on_deletion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."correct_sorting_on_deletion"() TO "service_role";

GRANT ALL ON FUNCTION "public"."create_brief"("project_id" bigint, "is_enable" boolean, "data_collection" "json") TO "anon";
GRANT ALL ON FUNCTION "public"."create_brief"("project_id" bigint, "is_enable" boolean, "data_collection" "json") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_brief"("project_id" bigint, "is_enable" boolean, "data_collection" "json") TO "service_role";

GRANT ALL ON FUNCTION "public"."create_chapters"("book_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."create_chapters"("book_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_chapters"("book_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."create_verses"("chapter_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."create_verses"("chapter_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_verses"("chapter_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."divide_verses"("divider" character varying, "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."divide_verses"("divider" character varying, "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."divide_verses"("divider" character varying, "project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."find_books_with_chapters_and_verses"("project_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."find_books_with_chapters_and_verses"("project_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_books_with_chapters_and_verses"("project_code" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."fix_sorting"("table_name" "text", "column_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fix_sorting"("table_name" "text", "column_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fix_sorting"("table_name" "text", "column_name" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_books_not_null_level_checks"("project_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_books_not_null_level_checks"("project_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_books_not_null_level_checks"("project_code" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_current_steps"("project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_steps"("project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_steps"("project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_is_await_team"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code", "step" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_is_await_team"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code", "step" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_is_await_team"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code", "step" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_max_sorting"("table_name" "text", "user_id" "uuid", "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_max_sorting"("table_name" "text", "user_id" "uuid", "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_max_sorting"("table_name" "text", "user_id" "uuid", "project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_verses"("project_id" bigint, "chapter" smallint, "book" "public"."book_code") TO "anon";
GRANT ALL ON FUNCTION "public"."get_verses"("project_id" bigint, "chapter" smallint, "book" "public"."book_code") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_verses"("project_id" bigint, "chapter" smallint, "book" "public"."book_code") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_whole_chapter"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code") TO "anon";
GRANT ALL ON FUNCTION "public"."get_whole_chapter"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_whole_chapter"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_words_page"("search_query" "text", "words_per_page" integer, "page_number" integer, "project_id_param" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_words_page"("search_query" "text", "words_per_page" integer, "page_number" integer, "project_id_param" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_words_page"("search_query" "text", "words_per_page" integer, "page_number" integer, "project_id_param" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."go_to_next_step"("project" "text", "chapter" smallint, "book" "public"."book_code") TO "anon";
GRANT ALL ON FUNCTION "public"."go_to_next_step"("project" "text", "chapter" smallint, "book" "public"."book_code") TO "authenticated";
GRANT ALL ON FUNCTION "public"."go_to_next_step"("project" "text", "chapter" smallint, "book" "public"."book_code") TO "service_role";

GRANT ALL ON FUNCTION "public"."go_to_step"("project" "text", "chapter" smallint, "book" "public"."book_code", "current_step" smallint) TO "anon";
GRANT ALL ON FUNCTION "public"."go_to_step"("project" "text", "chapter" smallint, "book" "public"."book_code", "current_step" smallint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."go_to_step"("project" "text", "chapter" smallint, "book" "public"."book_code", "current_step" smallint) TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_compile_chapter"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_compile_chapter"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_compile_chapter"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_book"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_book"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_book"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_next_step"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_next_step"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_next_step"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_update_personal_notes"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_update_personal_notes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_update_personal_notes"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_update_team_notes"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_update_team_notes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_update_team_notes"() TO "service_role";

GRANT ALL ON FUNCTION "public"."has_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."has_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_access"() TO "service_role";

GRANT ALL ON FUNCTION "public"."insert_additional_chapter"("book_id" bigint, "verses" integer, "project_id" bigint, "num" smallint) TO "anon";
GRANT ALL ON FUNCTION "public"."insert_additional_chapter"("book_id" bigint, "verses" integer, "project_id" bigint, "num" smallint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_additional_chapter"("book_id" bigint, "verses" integer, "project_id" bigint, "num" smallint) TO "service_role";

GRANT ALL ON FUNCTION "public"."insert_additional_verses"("start_verse" smallint, "finish_verse" smallint, "chapter_id" bigint, "project_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."insert_additional_verses"("start_verse" smallint, "finish_verse" smallint, "chapter_id" bigint, "project_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_additional_verses"("start_verse" smallint, "finish_verse" smallint, "chapter_id" bigint, "project_id" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."move_node"("new_sorting_value" integer, "dragged_node_id" character varying, "new_parent_id" character varying, "table_name" "text", "project_id" bigint, "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."move_node"("new_sorting_value" integer, "dragged_node_id" character varying, "new_parent_id" character varying, "table_name" "text", "project_id" bigint, "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."move_node"("new_sorting_value" integer, "dragged_node_id" character varying, "new_parent_id" character varying, "table_name" "text", "project_id" bigint, "user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."remove_moderator"("user_id" "uuid", "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."remove_moderator"("user_id" "uuid", "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_moderator"("user_id" "uuid", "project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."save_verse"("verse_id" bigint, "new_verse" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."save_verse"("verse_id" bigint, "new_verse" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_verse"("verse_id" bigint, "new_verse" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."save_verses"("verses" "json") TO "anon";
GRANT ALL ON FUNCTION "public"."save_verses"("verses" "json") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_verses"("verses" "json") TO "service_role";

GRANT ALL ON FUNCTION "public"."save_verses_if_null"("verses" "json", "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."save_verses_if_null"("verses" "json", "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_verses_if_null"("verses" "json", "project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."set_sorting_before_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_sorting_before_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_sorting_before_insert"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_chapters_in_books"("book_id" bigint, "chapters_new" "json", "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_chapters_in_books"("book_id" bigint, "chapters_new" "json", "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_chapters_in_books"("book_id" bigint, "chapters_new" "json", "project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."update_multiple_steps"("steps" "jsonb"[], "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_multiple_steps"("steps" "jsonb"[], "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_multiple_steps"("steps" "jsonb"[], "project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."update_project_basic"("project_code" "text", "title" "text", "orig_title" "text", "code" "text", "language_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_project_basic"("project_code" "text", "title" "text", "orig_title" "text", "code" "text", "language_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_project_basic"("project_code" "text", "title" "text", "orig_title" "text", "code" "text", "language_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."update_project_basic"("project_code" "text", "title" "text", "orig_title" "text", "code" "text", "language_id" bigint, "is_rtl" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."update_project_basic"("project_code" "text", "title" "text", "orig_title" "text", "code" "text", "language_id" bigint, "is_rtl" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_project_basic"("project_code" "text", "title" "text", "orig_title" "text", "code" "text", "language_id" bigint, "is_rtl" boolean) TO "service_role";

GRANT ALL ON FUNCTION "public"."update_resources_in_projects"("resources_new" "json", "base_manifest_new" "json", "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_resources_in_projects"("resources_new" "json", "base_manifest_new" "json", "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_resources_in_projects"("resources_new" "json", "base_manifest_new" "json", "project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."update_verses_in_chapters"("book_id" bigint, "verses_new" integer, "num" smallint, "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_verses_in_chapters"("book_id" bigint, "verses_new" integer, "num" smallint, "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_verses_in_chapters"("book_id" bigint, "verses_new" integer, "num" smallint, "project_id" bigint) TO "service_role";

GRANT ALL ON TABLE "public"."books" TO "anon";
GRANT ALL ON TABLE "public"."books" TO "authenticated";
GRANT ALL ON TABLE "public"."books" TO "service_role";

GRANT ALL ON SEQUENCE "public"."books_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."books_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."books_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."briefs" TO "anon";
GRANT ALL ON TABLE "public"."briefs" TO "authenticated";
GRANT ALL ON TABLE "public"."briefs" TO "service_role";

GRANT ALL ON SEQUENCE "public"."briefs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."briefs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."briefs_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."chapters" TO "anon";
GRANT ALL ON TABLE "public"."chapters" TO "authenticated";
GRANT ALL ON TABLE "public"."chapters" TO "service_role";

GRANT ALL ON SEQUENCE "public"."chapters_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."chapters_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."chapters_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."dictionaries" TO "anon";
GRANT ALL ON TABLE "public"."dictionaries" TO "authenticated";
GRANT ALL ON TABLE "public"."dictionaries" TO "service_role";

GRANT ALL ON TABLE "public"."languages" TO "anon";
GRANT ALL ON TABLE "public"."languages" TO "authenticated";
GRANT ALL ON TABLE "public"."languages" TO "service_role";

GRANT ALL ON SEQUENCE "public"."languages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."languages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."languages_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."logs" TO "anon";
GRANT ALL ON TABLE "public"."logs" TO "authenticated";
GRANT ALL ON TABLE "public"."logs" TO "service_role";

GRANT ALL ON SEQUENCE "public"."logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."logs_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."methods" TO "anon";
GRANT ALL ON TABLE "public"."methods" TO "authenticated";
GRANT ALL ON TABLE "public"."methods" TO "service_role";

GRANT ALL ON SEQUENCE "public"."methods_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."methods_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."methods_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."personal_notes" TO "anon";
GRANT ALL ON TABLE "public"."personal_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."personal_notes" TO "service_role";

GRANT ALL ON TABLE "public"."progress" TO "anon";
GRANT ALL ON TABLE "public"."progress" TO "authenticated";
GRANT ALL ON TABLE "public"."progress" TO "service_role";

GRANT ALL ON SEQUENCE "public"."progress_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."progress_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."progress_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."project_coordinators" TO "anon";
GRANT ALL ON TABLE "public"."project_coordinators" TO "authenticated";
GRANT ALL ON TABLE "public"."project_coordinators" TO "service_role";

GRANT ALL ON SEQUENCE "public"."project_coordinators_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."project_coordinators_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."project_coordinators_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."project_translators" TO "anon";
GRANT ALL ON TABLE "public"."project_translators" TO "authenticated";
GRANT ALL ON TABLE "public"."project_translators" TO "service_role";

GRANT ALL ON SEQUENCE "public"."project_translators_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."project_translators_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."project_translators_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";

GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";

GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."steps" TO "anon";
GRANT ALL ON TABLE "public"."steps" TO "authenticated";
GRANT ALL ON TABLE "public"."steps" TO "service_role";

GRANT ALL ON SEQUENCE "public"."steps_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."steps_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."steps_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."team_notes" TO "anon";
GRANT ALL ON TABLE "public"."team_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."team_notes" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

GRANT ALL ON TABLE "public"."verses" TO "anon";
GRANT ALL ON TABLE "public"."verses" TO "authenticated";
GRANT ALL ON TABLE "public"."verses" TO "service_role";

GRANT ALL ON SEQUENCE "public"."verses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."verses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."verses_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;

--
-- Dumped schema changes for auth and storage
--

CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();

