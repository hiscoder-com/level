--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1
-- Dumped by pg_dump version 15.1 (Debian 15.1-1.pgdg110+1)

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

--
-- Name: pgsodium; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA "public" OWNER TO "postgres";

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


--
-- Name: app_permission; Type: TYPE; Schema: public; Owner: postgres
--

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

--
-- Name: app_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'coordinator',
    'moderator',
    'translator'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";

--
-- Name: book_code; Type: TYPE; Schema: public; Owner: postgres
--

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

--
-- Name: project_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE "public"."project_role" AS ENUM (
    'coordinator',
    'moderator',
    'translator'
);


ALTER TYPE "public"."project_role" OWNER TO "postgres";

--
-- Name: project_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE "public"."project_type" AS ENUM (
    'obs',
    'bible'
);


ALTER TYPE "public"."project_type" OWNER TO "postgres";

--
-- Name: admin_only(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."admin_only"() RETURNS boolean
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

--
-- Name: assign_moderator("uuid", bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."assign_moderator"("user_id" "uuid", "project_id" bigint) RETURNS boolean
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

--
-- Name: authorize("uuid", bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."authorize"("user_id" "uuid", "project_id" bigint) RETURNS "text"
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

--
-- Name: block_user("uuid"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."block_user"("user_id" "uuid") RETURNS "text"
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

--
-- Name: can_translate(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."can_translate"("translator_id" bigint) RETURNS boolean
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

--
-- Name: change_finish_chapter(bigint, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."change_finish_chapter"("chapter_id" bigint, "project_id" bigint) RETURNS boolean
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

--
-- Name: change_start_chapter(bigint, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."change_start_chapter"("chapter_id" bigint, "project_id" bigint) RETURNS boolean
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

--
-- Name: check_agreement(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."check_agreement"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    DECLARE

    BEGIN
      UPDATE PUBLIC.users SET agreement = TRUE WHERE users.id = auth.uid();

      RETURN TRUE;

    END;
  $$;


ALTER FUNCTION "public"."check_agreement"() OWNER TO "postgres";

--
-- Name: check_confession(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."check_confession"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    DECLARE

    BEGIN
      UPDATE PUBLIC.users SET confession = TRUE WHERE users.id = auth.uid();

      RETURN TRUE;

    END;
  $$;


ALTER FUNCTION "public"."check_confession"() OWNER TO "postgres";

--
-- Name: create_brief(bigint, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."create_brief"("project_id" bigint, "is_enable" boolean) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
      DECLARE 
        brief_JSON json;
      BEGIN
        IF authorize(auth.uid(), create_brief.project_id) NOT IN ('admin', 'coordinator') THEN
          RETURN false;
        END IF;
        SELECT brief FROM PUBLIC.methods 
          JOIN PUBLIC.projects ON (projects.method = methods.title) 
          WHERE projects.id = project_id into brief_JSON;
          INSERT INTO PUBLIC.briefs (project_id, data_collection, is_enable) VALUES (project_id, brief_JSON, is_enable);
        RETURN true;
      END;
  $$;


ALTER FUNCTION "public"."create_brief"("project_id" bigint, "is_enable" boolean) OWNER TO "postgres";

--
-- Name: create_chapters(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."create_chapters"("book_id" bigint) RETURNS boolean
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

--
-- Name: create_verses(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."create_verses"("chapter_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    DECLARE
      chapter RECORD;
      start_verse int;
      method_type text;
    BEGIN
      -- 1. Получаем количество стихов
      SELECT  chapters.id as id,
              chapters.verses as verses,
              chapters.project_id as project_id,
              steps.id as step_id
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

--
-- Name: divide_verses(character varying, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."divide_verses"("divider" character varying, "project_id" bigint) RETURNS boolean
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

--
-- Name: get_current_steps(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_current_steps"("project_id" bigint) RETURNS TABLE("title" "text", "project" "text", "book" "public"."book_code", "chapter" smallint, "step" smallint, "started_at" timestamp without time zone)
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

--
-- Name: get_project_book_chapter_verses("text", "public"."book_code", integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_project_book_chapter_verses"("project_code" "text", "book_c" "public"."book_code", "chapter_num" integer) RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    DECLARE
      book record;
      chapter record;
      project record;
      allverses json;
      allJson json;
    BEGIN
      -- 1. Получаем список json глав и стихов для книги
      SELECT id FROM PUBLIC.projects where code=project_code into project;
      SELECT id,code FROM PUBLIC.books where project_id = project.id and code = book_c into book ;
      SELECT id,num,started_at,finished_at FROM PUBLIC.chapters where project_id=project.id and book_id = book.id and num = chapter_num  into chapter;
      SELECT  Json_agg(json_build_object('id',verses.id,'num',verses.num,'text',text,'current_step',current_step,'project_translator_id',project_translator_id)) FROM PUBLIC.verses where project_id = project.id and chapter_id = chapter.id into allverses;
      allJson = json_build_object('book', book, 'chapter', chapter, 'verses', allverses, 'project', project);    
      RETURN allJson;

    END;
  $$;


ALTER FUNCTION "public"."get_project_book_chapter_verses"("project_code" "text", "book_c" "public"."book_code", "chapter_num" integer) OWNER TO "postgres";

--
-- Name: get_verses(bigint, smallint, "public"."book_code"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_verses"("project_id" bigint, "chapter" smallint, "book" "public"."book_code") RETURNS TABLE("verse_id" bigint, "num" smallint, "verse" "text")
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

--
-- Name: get_whole_chapter("text", smallint, "public"."book_code"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_whole_chapter"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code") RETURNS TABLE("verse_id" bigint, "num" smallint, "verse" "text", "translator" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    DECLARE
      verses_list RECORD;
      cur_chapter_id BIGINT;
      cur_project_id BIGINT;
    BEGIN

      SELECT projects.id into cur_project_id
      FROM PUBLIC.projects
      WHERE projects.code = get_whole_chapter.project_code;

      -- узнать id проекта
      IF cur_project_id IS NULL THEN
        RETURN;
      END IF;

      -- должен быть на проекте
      IF authorize(auth.uid(), cur_project_id) IN ('user') THEN
        RETURN;
      END IF;

      SELECT chapters.id into cur_chapter_id
      FROM PUBLIC.chapters
      WHERE chapters.num = get_whole_chapter.chapter_num AND chapters.project_id = cur_project_id AND chapters.book_id = (SELECT id FROM PUBLIC.books WHERE books.code = get_whole_chapter.book_code AND books.project_id = cur_project_id);

      -- узнать id главы
      IF cur_chapter_id IS NULL THEN
        RETURN;
      END IF;

      -- вернуть айди стиха, номер и текст из определенной главы
      return query SELECT verses.id as verse_id, verses.num, verses.text as verse, users.login as translator
      FROM public.verses LEFT OUTER JOIN public.project_translators ON (verses.project_translator_id = project_translators.id) LEFT OUTER JOIN public.users ON (project_translators.user_id = users.id)
      WHERE verses.project_id = cur_project_id
        AND verses.chapter_id = cur_chapter_id
      ORDER BY verses.num;

    END;
  $$;


ALTER FUNCTION "public"."get_whole_chapter"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code") OWNER TO "postgres";

--
-- Name: go_to_next_step("text", smallint, "public"."book_code"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."go_to_next_step"("project" "text", "chapter" smallint, "book" "public"."book_code") RETURNS integer
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

--
-- Name: go_to_step("text", smallint, "public"."book_code", smallint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."go_to_step"("project" "text", "chapter" smallint, "book" "public"."book_code", "current_step" smallint) RETURNS integer
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

--
-- Name: handle_compile_chapter(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."handle_compile_chapter"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    DECLARE      
      chapter JSONB;
    BEGIN
      IF (NEW.finished_at IS NOT NULL ) THEN
        SELECT  jsonb_object_agg(num, text ORDER BY num ASC) FROM PUBLIC.verses WHERE project_id = OLD.project_id AND chapter_id = OLD.id INTO chapter;
        New.text=chapter; 
      END IF;        
      RETURN NEW;
    END;
  $$;


ALTER FUNCTION "public"."handle_compile_chapter"() OWNER TO "postgres";

--
-- Name: handle_new_book(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."handle_new_book"() RETURNS "trigger"
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

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
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

--
-- Name: handle_next_step(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."handle_next_step"() RETURNS "trigger"
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

--
-- Name: handle_update_dictionaries(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."handle_update_dictionaries"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    DECLARE
      alphabet JSONB;
    BEGIN
      IF upper(OLD.title::varchar(1)) = upper(NEW.title::varchar(1)) THEN
        RETURN NEW;
      END IF;
      SELECT dictionaries_alphabet INTO alphabet FROM PUBLIC.projects WHERE NEW.project_id = projects.id;
        IF (SELECT alphabet ? upper(NEW.title::varchar(1))) THEN
          RETURN NEW;
        ELSE  
          UPDATE PUBLIC.projects SET dictionaries_alphabet = alphabet || to_jsonb( upper(NEW.title::varchar(1))) WHERE projects.id = NEW.project_id;
        END IF;      
      RETURN NEW;
    END;
  $$;


ALTER FUNCTION "public"."handle_update_dictionaries"() OWNER TO "postgres";

--
-- Name: handle_update_personal_notes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."handle_update_personal_notes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ BEGIN
      NEW.changed_at:=NOW();

      RETURN NEW;

    END;
  $$;


ALTER FUNCTION "public"."handle_update_personal_notes"() OWNER TO "postgres";

--
-- Name: handle_update_team_notes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."handle_update_team_notes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ BEGIN
      NEW.changed_at:=NOW();

      RETURN NEW;

    END;
  $$;


ALTER FUNCTION "public"."handle_update_team_notes"() OWNER TO "postgres";

--
-- Name: has_access(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."has_access"() RETURNS boolean
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

--
-- Name: insert_additional_chapter(bigint, integer, bigint, smallint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."insert_additional_chapter"("book_id" bigint, "verses" integer, "project_id" bigint, "num" smallint) RETURNS boolean
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

--
-- Name: insert_additional_verses(smallint, smallint, bigint, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."insert_additional_verses"("start_verse" smallint, "finish_verse" smallint, "chapter_id" bigint, "project_id" integer) RETURNS boolean
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

--
-- Name: remove_moderator("uuid", bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."remove_moderator"("user_id" "uuid", "project_id" bigint) RETURNS boolean
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

--
-- Name: save_verse(bigint, "text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."save_verse"("verse_id" bigint, "new_verse" "text") RETURNS boolean
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

--
-- Name: save_verses("json"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."save_verses"("verses" "json") RETURNS boolean
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

--
-- Name: update_chapters_in_books(bigint, "json", bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."update_chapters_in_books"("book_id" bigint, "chapters_new" "json", "project_id" bigint) RETURNS boolean
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

--
-- Name: update_resources_in_projects("json", "json", bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."update_resources_in_projects"("resources_new" "json", "base_manifest_new" "json", "project_id" bigint) RETURNS boolean
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

--
-- Name: update_verses_in_chapters(bigint, integer, smallint, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."update_verses_in_chapters"("book_id" bigint, "verses_new" integer, "num" smallint, "project_id" bigint) RETURNS "json"
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

--
-- Name: books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."books" (
    "id" bigint NOT NULL,
    "code" "public"."book_code" NOT NULL,
    "project_id" bigint NOT NULL,
    "text" "text",
    "chapters" "json",
    "properties" "json"
);


ALTER TABLE "public"."books" OWNER TO "postgres";

--
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."books" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."books_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: briefs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."briefs" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "data_collection" "json",
    "is_enable" boolean DEFAULT true
);


ALTER TABLE "public"."briefs" OWNER TO "postgres";

--
-- Name: briefs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."briefs" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."briefs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: chapters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."chapters" (
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

--
-- Name: chapters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."chapters" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."chapters_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: dictionaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."dictionaries" (
    "id" "text" NOT NULL,
    "project_id" bigint NOT NULL,
    "title" "text",
    "data" "json",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "changed_at" timestamp without time zone DEFAULT "now"(),
    "deleted_at" timestamp without time zone
);


ALTER TABLE "public"."dictionaries" OWNER TO "postgres";

--
-- Name: languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."languages" (
    "id" bigint NOT NULL,
    "eng" "text" NOT NULL,
    "code" "text" NOT NULL,
    "orig_name" "text" NOT NULL,
    "is_gl" boolean DEFAULT false NOT NULL
);

ALTER TABLE ONLY "public"."languages" REPLICA IDENTITY FULL;


ALTER TABLE "public"."languages" OWNER TO "postgres";

--
-- Name: languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."languages" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."languages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."logs" (
    "id" bigint NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "log" "jsonb"
);


ALTER TABLE "public"."logs" OWNER TO "postgres";

--
-- Name: logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."logs" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."methods" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "steps" "json",
    "resources" "json",
    "type" "public"."project_type" DEFAULT 'bible'::"public"."project_type" NOT NULL,
    "brief" "json" DEFAULT '[]'::"json"
);


ALTER TABLE "public"."methods" OWNER TO "postgres";

--
-- Name: methods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."methods" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."methods_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: personal_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."personal_notes" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text",
    "data" "json",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "changed_at" timestamp without time zone DEFAULT "now"(),
    "is_folder" boolean DEFAULT false,
    "parent_id" "text",
    "deleted_at" timestamp without time zone
);


ALTER TABLE "public"."personal_notes" OWNER TO "postgres";

--
-- Name: progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."progress" (
    "id" bigint NOT NULL,
    "verse_id" bigint NOT NULL,
    "step_id" bigint NOT NULL,
    "text" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."progress" OWNER TO "postgres";

--
-- Name: progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."progress" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."progress_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: project_coordinators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."project_coordinators" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."project_coordinators" OWNER TO "postgres";

--
-- Name: project_coordinators_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."project_coordinators" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."project_coordinators_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: project_translators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."project_translators" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "is_moderator" boolean DEFAULT false,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."project_translators" OWNER TO "postgres";

--
-- Name: project_translators_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."project_translators" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."project_translators_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."projects" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "code" "text" NOT NULL,
    "language_id" bigint NOT NULL,
    "type" "public"."project_type" NOT NULL,
    "resources" "json",
    "method" "text" NOT NULL,
    "base_manifest" "json",
    "dictionaries_alphabet" "jsonb" DEFAULT '[]'::"jsonb",
    "orig_title" "text"
);


ALTER TABLE "public"."projects" OWNER TO "postgres";

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."projects" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."projects_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."role_permissions" (
    "id" bigint NOT NULL,
    "role" "public"."project_role" NOT NULL,
    "permission" "public"."app_permission" NOT NULL
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."role_permissions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."role_permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: steps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."steps" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "intro" "text",
    "count_of_users" smallint NOT NULL,
    "whole_chapter" boolean DEFAULT true,
    "time" smallint NOT NULL,
    "project_id" bigint NOT NULL,
    "config" "json" NOT NULL,
    "sorting" smallint NOT NULL
);


ALTER TABLE "public"."steps" OWNER TO "postgres";

--
-- Name: steps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."steps" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."steps_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: team_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."team_notes" (
    "id" "text" NOT NULL,
    "project_id" bigint NOT NULL,
    "title" "text",
    "data" "json",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "changed_at" timestamp without time zone DEFAULT "now"(),
    "is_folder" boolean DEFAULT false,
    "parent_id" "text",
    "deleted_at" timestamp without time zone
);


ALTER TABLE "public"."team_notes" OWNER TO "postgres";

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "login" "text" NOT NULL,
    "agreement" boolean DEFAULT false NOT NULL,
    "confession" boolean DEFAULT false NOT NULL,
    "is_admin" boolean DEFAULT false NOT NULL,
    "blocked" timestamp without time zone
);

ALTER TABLE ONLY "public"."users" REPLICA IDENTITY FULL;


ALTER TABLE "public"."users" OWNER TO "postgres";

--
-- Name: verses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."verses" (
    "id" bigint NOT NULL,
    "num" smallint NOT NULL,
    "text" "text",
    "current_step" bigint NOT NULL,
    "chapter_id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "project_translator_id" bigint
);


ALTER TABLE "public"."verses" OWNER TO "postgres";

--
-- Name: verses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."verses" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."verses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pkey" PRIMARY KEY ("id");


--
-- Name: books books_project_id_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_project_id_code_key" UNIQUE ("project_id", "code");


--
-- Name: briefs briefs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."briefs"
    ADD CONSTRAINT "briefs_pkey" PRIMARY KEY ("id");


--
-- Name: briefs briefs_project_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."briefs"
    ADD CONSTRAINT "briefs_project_id_key" UNIQUE ("project_id");


--
-- Name: chapters chapters_book_id_num_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."chapters"
    ADD CONSTRAINT "chapters_book_id_num_key" UNIQUE ("book_id", "num");


--
-- Name: chapters chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."chapters"
    ADD CONSTRAINT "chapters_pkey" PRIMARY KEY ("id");


--
-- Name: dictionaries dictionaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."dictionaries"
    ADD CONSTRAINT "dictionaries_pkey" PRIMARY KEY ("id");


--
-- Name: languages languages_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."languages"
    ADD CONSTRAINT "languages_code_key" UNIQUE ("code");


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."languages"
    ADD CONSTRAINT "languages_pkey" PRIMARY KEY ("id");


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."logs"
    ADD CONSTRAINT "logs_pkey" PRIMARY KEY ("id");


--
-- Name: methods methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."methods"
    ADD CONSTRAINT "methods_pkey" PRIMARY KEY ("id");


--
-- Name: personal_notes personal_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."personal_notes"
    ADD CONSTRAINT "personal_notes_pkey" PRIMARY KEY ("id");


--
-- Name: progress progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."progress"
    ADD CONSTRAINT "progress_pkey" PRIMARY KEY ("id");


--
-- Name: project_coordinators project_coordinators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."project_coordinators"
    ADD CONSTRAINT "project_coordinators_pkey" PRIMARY KEY ("id");


--
-- Name: project_coordinators project_coordinators_project_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."project_coordinators"
    ADD CONSTRAINT "project_coordinators_project_id_user_id_key" UNIQUE ("project_id", "user_id");


--
-- Name: project_translators project_translators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."project_translators"
    ADD CONSTRAINT "project_translators_pkey" PRIMARY KEY ("id");


--
-- Name: project_translators project_translators_project_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."project_translators"
    ADD CONSTRAINT "project_translators_project_id_user_id_key" UNIQUE ("project_id", "user_id");


--
-- Name: projects projects_code_language_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_code_language_id_key" UNIQUE ("code", "language_id");


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");


--
-- Name: role_permissions role_permissions_role_permission_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_permission_key" UNIQUE ("role", "permission");


--
-- Name: steps steps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."steps"
    ADD CONSTRAINT "steps_pkey" PRIMARY KEY ("id");


--
-- Name: steps steps_project_id_sorting_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."steps"
    ADD CONSTRAINT "steps_project_id_sorting_key" UNIQUE ("project_id", "sorting");


--
-- Name: team_notes team_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_notes"
    ADD CONSTRAINT "team_notes_pkey" PRIMARY KEY ("id");


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");


--
-- Name: users users_login_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_login_key" UNIQUE ("login");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");


--
-- Name: verses verses_chapter_id_num_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."verses"
    ADD CONSTRAINT "verses_chapter_id_num_key" UNIQUE ("chapter_id", "num");


--
-- Name: verses verses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."verses"
    ADD CONSTRAINT "verses_pkey" PRIMARY KEY ("id");


--
-- Name: dictionaries_project_id_title_indx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "dictionaries_project_id_title_indx" ON "public"."dictionaries" USING "btree" ("project_id", "title") WHERE ("deleted_at" IS NULL);


--
-- Name: dictionaries on_dictionaries_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_dictionaries_update" BEFORE UPDATE ON "public"."dictionaries" FOR EACH ROW EXECUTE FUNCTION "public"."handle_update_dictionaries"();


--
-- Name: books on_public_book_created; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_public_book_created" AFTER INSERT ON "public"."books" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_book"();


--
-- Name: chapters on_public_chapters_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_public_chapters_update" BEFORE UPDATE ON "public"."chapters" FOR EACH ROW EXECUTE FUNCTION "public"."handle_compile_chapter"();


--
-- Name: personal_notes on_public_personal_notes_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_public_personal_notes_update" BEFORE UPDATE ON "public"."personal_notes" FOR EACH ROW EXECUTE FUNCTION "public"."handle_update_personal_notes"();


--
-- Name: team_notes on_public_team_notes_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_public_team_notes_update" BEFORE UPDATE ON "public"."team_notes" FOR EACH ROW EXECUTE FUNCTION "public"."handle_update_team_notes"();


--
-- Name: verses on_public_verses_next_step; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_public_verses_next_step" AFTER UPDATE ON "public"."verses" FOR EACH ROW EXECUTE FUNCTION "public"."handle_next_step"();


--
-- Name: books books_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


--
-- Name: briefs briefs_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."briefs"
    ADD CONSTRAINT "briefs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


--
-- Name: chapters chapters_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."chapters"
    ADD CONSTRAINT "chapters_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;


--
-- Name: chapters chapters_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."chapters"
    ADD CONSTRAINT "chapters_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


--
-- Name: dictionaries dictionaries_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."dictionaries"
    ADD CONSTRAINT "dictionaries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


--
-- Name: personal_notes personal_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."personal_notes"
    ADD CONSTRAINT "personal_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: progress progress_step_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."progress"
    ADD CONSTRAINT "progress_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "public"."steps"("id") ON DELETE CASCADE;


--
-- Name: progress progress_verse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."progress"
    ADD CONSTRAINT "progress_verse_id_fkey" FOREIGN KEY ("verse_id") REFERENCES "public"."verses"("id") ON DELETE CASCADE;


--
-- Name: project_coordinators project_coordinators_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."project_coordinators"
    ADD CONSTRAINT "project_coordinators_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


--
-- Name: project_coordinators project_coordinators_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."project_coordinators"
    ADD CONSTRAINT "project_coordinators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: project_translators project_translators_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."project_translators"
    ADD CONSTRAINT "project_translators_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


--
-- Name: project_translators project_translators_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."project_translators"
    ADD CONSTRAINT "project_translators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: projects projects_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE;


--
-- Name: steps steps_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."steps"
    ADD CONSTRAINT "steps_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


--
-- Name: team_notes team_notes_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_notes"
    ADD CONSTRAINT "team_notes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


--
-- Name: verses verses_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."verses"
    ADD CONSTRAINT "verses_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE CASCADE;


--
-- Name: verses verses_current_step_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."verses"
    ADD CONSTRAINT "verses_current_step_fkey" FOREIGN KEY ("current_step") REFERENCES "public"."steps"("id") ON DELETE CASCADE;


--
-- Name: verses verses_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."verses"
    ADD CONSTRAINT "verses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


--
-- Name: verses verses_project_translator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."verses"
    ADD CONSTRAINT "verses_project_translator_id_fkey" FOREIGN KEY ("project_translator_id") REFERENCES "public"."project_translators"("id") ON DELETE CASCADE;


--
-- Name: books; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."books" ENABLE ROW LEVEL SECURITY;

--
-- Name: briefs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."briefs" ENABLE ROW LEVEL SECURITY;

--
-- Name: chapters; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."chapters" ENABLE ROW LEVEL SECURITY;

--
-- Name: dictionaries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."dictionaries" ENABLE ROW LEVEL SECURITY;

--
-- Name: languages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."languages" ENABLE ROW LEVEL SECURITY;

--
-- Name: logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."logs" ENABLE ROW LEVEL SECURITY;

--
-- Name: methods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."methods" ENABLE ROW LEVEL SECURITY;

--
-- Name: personal_notes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."personal_notes" ENABLE ROW LEVEL SECURITY;

--
-- Name: progress; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."progress" ENABLE ROW LEVEL SECURITY;

--
-- Name: project_coordinators; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."project_coordinators" ENABLE ROW LEVEL SECURITY;

--
-- Name: project_translators; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."project_translators" ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;

--
-- Name: role_permissions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;

--
-- Name: steps; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."steps" ENABLE ROW LEVEL SECURITY;

--
-- Name: team_notes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."team_notes" ENABLE ROW LEVEL SECURITY;

--
-- Name: team_notes team_notes delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "team_notes delete" ON "public"."team_notes" FOR DELETE USING (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text", 'moderator'::"text"])));


--
-- Name: team_notes team_notes insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "team_notes insert" ON "public"."team_notes" FOR INSERT WITH CHECK (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text", 'moderator'::"text"])));


--
-- Name: team_notes team_notes select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "team_notes select" ON "public"."team_notes" FOR SELECT USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));


--
-- Name: team_notes team_notes update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "team_notes update" ON "public"."team_notes" FOR UPDATE USING (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text", 'moderator'::"text"])));


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

--
-- Name: verses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."verses" ENABLE ROW LEVEL SECURITY;

--
-- Name: dictionaries word delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "word delete" ON "public"."dictionaries" FOR DELETE USING (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text", 'moderator'::"text"])));


--
-- Name: dictionaries word insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "word insert" ON "public"."dictionaries" FOR INSERT WITH CHECK (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text", 'moderator'::"text"])));


--
-- Name: dictionaries word update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "word update" ON "public"."dictionaries" FOR UPDATE USING (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text", 'moderator'::"text"])));


--
-- Name: dictionaries words select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "words select" ON "public"."dictionaries" FOR SELECT USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));


--
-- Name: projects Админ видит все проекты, остальные; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Админ видит все проекты, остальные" ON "public"."projects" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "id") <> 'user'::"text"));


--
-- Name: project_coordinators Админ видит всех, остальные только; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Админ видит всех, остальные только" ON "public"."project_coordinators" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));


--
-- Name: project_translators Админ видит всех, остальные только; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Админ видит всех, остальные только" ON "public"."project_translators" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));


--
-- Name: methods Админ может получить список всех м; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Админ может получить список всех м" ON "public"."methods" FOR SELECT TO "authenticated" USING ("public"."admin_only"());


--
-- Name: briefs Видят все кто на проекте и админ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Видят все кто на проекте и админ" ON "public"."briefs" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));


--
-- Name: books Добавлять можно только админу; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Добавлять можно только админу" ON "public"."books" FOR INSERT WITH CHECK ("public"."admin_only"());


--
-- Name: steps Добавлять можно только админу; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Добавлять можно только админу" ON "public"."steps" FOR INSERT WITH CHECK ("public"."admin_only"());


--
-- Name: project_translators Добавлять на проект может админ ил; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Добавлять на проект может админ ил" ON "public"."project_translators" FOR INSERT WITH CHECK (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text"])));


--
-- Name: project_coordinators Добавлять на проект может только а; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Добавлять на проект может только а" ON "public"."project_coordinators" FOR INSERT WITH CHECK ("public"."admin_only"());


--
-- Name: personal_notes Залогиненый юзер может добавить л; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Залогиненый юзер может добавить л" ON "public"."personal_notes" FOR INSERT TO "authenticated" WITH CHECK (true);


--
-- Name: personal_notes Залогиненый юзер может изменить л; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Залогиненый юзер может изменить л" ON "public"."personal_notes" FOR UPDATE USING (("auth"."uid"() = "user_id"));


--
-- Name: languages Залогиненый юзер может получить с; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Залогиненый юзер может получить с" ON "public"."languages" FOR SELECT TO "authenticated" USING (true);


--
-- Name: users Залогиненый юзер может получить с; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Залогиненый юзер может получить с" ON "public"."users" FOR SELECT TO "authenticated" USING (true);


--
-- Name: personal_notes Залогиненый юзер может удалить ли; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Залогиненый юзер может удалить ли" ON "public"."personal_notes" FOR DELETE USING (("auth"."uid"() = "user_id"));


--
-- Name: briefs Изменять может админ, кординатор и; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Изменять может админ, кординатор и" ON "public"."briefs" FOR UPDATE USING (("public"."authorize"("auth"."uid"(), "project_id") <> ALL (ARRAY['user'::"text", 'translator'::"text"])));


--
-- Name: languages Обновлять может только админ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Обновлять может только админ" ON "public"."languages" FOR UPDATE USING ("public"."admin_only"());


--
-- Name: projects Обновлять может только админ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Обновлять может только админ" ON "public"."projects" FOR UPDATE USING ("public"."admin_only"());


--
-- Name: personal_notes Показывать личные заметки данного; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Показывать личные заметки данного" ON "public"."personal_notes" FOR SELECT USING (("auth"."uid"() = "user_id"));


--
-- Name: steps Получают данные по шагам все кто н; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Получают данные по шагам все кто н" ON "public"."steps" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));


--
-- Name: books Получают книги все кто на проекте; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Получают книги все кто на проекте" ON "public"."books" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));


--
-- Name: chapters Получают книги все кто на проекте; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Получают книги все кто на проекте" ON "public"."chapters" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));


--
-- Name: languages Создавать может только админ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Создавать может только админ" ON "public"."languages" FOR INSERT WITH CHECK ("public"."admin_only"());


--
-- Name: projects Создавать может только админ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Создавать может только админ" ON "public"."projects" FOR INSERT WITH CHECK ("public"."admin_only"());


--
-- Name: verses Стих получить может переводчик, ко; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Стих получить может переводчик, ко" ON "public"."verses" FOR SELECT TO "authenticated" USING (("public"."authorize"("auth"."uid"(), "project_id") <> 'user'::"text"));


--
-- Name: languages Удалять может только админ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Удалять может только админ" ON "public"."languages" FOR DELETE USING ("public"."admin_only"());


--
-- Name: project_translators Удалять с проекта может админ или ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Удалять с проекта может админ или " ON "public"."project_translators" FOR DELETE USING (("public"."authorize"("auth"."uid"(), "project_id") = ANY (ARRAY['admin'::"text", 'coordinator'::"text"])));


--
-- Name: project_coordinators Удалять только админ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Удалять только админ" ON "public"."project_coordinators" FOR DELETE USING ("public"."admin_only"());


--
-- Name: SCHEMA "pgsodium_masks"; Type: ACL; Schema: -; Owner: postgres
--

-- REVOKE ALL ON SCHEMA "pgsodium_masks" FROM "supabase_admin";
-- REVOKE USAGE ON SCHEMA "pgsodium_masks" FROM "pgsodium_keyiduser";
-- GRANT ALL ON SCHEMA "pgsodium_masks" TO "postgres";
-- GRANT USAGE ON SCHEMA "pgsodium_masks" TO "pgsodium_keyiduser";


--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: FUNCTION "comment_directive"("comment_" "text"); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "service_role";


--
-- Name: FUNCTION "exception"("message" "text"); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "service_role";


--
-- Name: FUNCTION "get_schema_version"(); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "service_role";


--
-- Name: FUNCTION "increment_schema_version"(); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "service_role";


--
-- Name: FUNCTION "graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb"); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "anon";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "service_role";


--
-- Name: TABLE "key"; Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON TABLE "pgsodium"."key" FROM "supabase_admin";
-- REVOKE ALL ON TABLE "pgsodium"."key" FROM "pgsodium_keymaker";
-- GRANT ALL ON TABLE "pgsodium"."key" TO "postgres";
-- GRANT ALL ON TABLE "pgsodium"."key" TO "pgsodium_keymaker";


--
-- Name: TABLE "valid_key"; Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON TABLE "pgsodium"."valid_key" FROM "supabase_admin";
-- REVOKE ALL ON TABLE "pgsodium"."valid_key" FROM "pgsodium_keyholder";
-- REVOKE SELECT ON TABLE "pgsodium"."valid_key" FROM "pgsodium_keyiduser";
-- GRANT ALL ON TABLE "pgsodium"."valid_key" TO "postgres";
-- GRANT ALL ON TABLE "pgsodium"."valid_key" TO "pgsodium_keyholder";
-- GRANT SELECT ON TABLE "pgsodium"."valid_key" TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_aead_det_decrypt"("ciphertext" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("ciphertext" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("ciphertext" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("ciphertext" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("ciphertext" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: pgsodium_keymaker
--

-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea") TO "service_role";


--
-- Name: FUNCTION "crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: pgsodium_keymaker
--

-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea") TO "service_role";


--
-- Name: FUNCTION "crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_aead_det_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_keygen"() TO "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_keygen"() TO "service_role";


--
-- Name: FUNCTION "crypto_aead_det_noncegen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_noncegen"() FROM PUBLIC;
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_noncegen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_noncegen"() FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_noncegen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_noncegen"() TO PUBLIC;
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_noncegen"() TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_aead_ietf_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_keygen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_aead_ietf_noncegen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_noncegen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_noncegen"() FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_noncegen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_noncegen"() TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_auth"("message" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_auth"("message" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_auth_hmacsha256"("message" "bytea", "secret" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "secret" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "secret" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "secret" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "secret" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_auth_hmacsha256"("message" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_auth_hmacsha256_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_keygen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "secret" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_auth_hmacsha512"("message" "bytea", "secret" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "secret" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "secret" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "secret" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "secret" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_auth_hmacsha512"("message" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "secret" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_auth_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_keygen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_auth_verify"("mac" "bytea", "message" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_auth_verify"("mac" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_box"("message" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box"("message" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box"("message" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box"("message" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box"("message" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_box_new_keypair"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_new_keypair"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_new_keypair"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_new_keypair"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_new_keypair"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_box_noncegen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_noncegen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_noncegen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_noncegen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_noncegen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_box_open"("ciphertext" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_open"("ciphertext" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_open"("ciphertext" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_open"("ciphertext" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_open"("ciphertext" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_box_seed_new_keypair"("seed" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_seed_new_keypair"("seed" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_seed_new_keypair"("seed" "bytea") FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_seed_new_keypair"("seed" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_seed_new_keypair"("seed" "bytea") TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_generichash"("message" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_generichash"("message" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_generichash"("message" "bytea", "key" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_generichash"("message" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_generichash"("message" "bytea", "key" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_generichash_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_generichash_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_generichash_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_generichash_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_generichash_keygen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_kdf_derive_from_key"("subkey_size" bigint, "subkey_id" bigint, "context" "bytea", "primary_key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kdf_derive_from_key"("subkey_size" bigint, "subkey_id" bigint, "context" "bytea", "primary_key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kdf_derive_from_key"("subkey_size" bigint, "subkey_id" bigint, "context" "bytea", "primary_key" "bytea") FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kdf_derive_from_key"("subkey_size" bigint, "subkey_id" bigint, "context" "bytea", "primary_key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kdf_derive_from_key"("subkey_size" bigint, "subkey_id" bigint, "context" "bytea", "primary_key" "bytea") TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_kdf_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kdf_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kdf_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kdf_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kdf_keygen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_kx_new_keypair"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kx_new_keypair"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kx_new_keypair"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kx_new_keypair"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kx_new_keypair"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_kx_new_seed"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kx_new_seed"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kx_new_seed"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kx_new_seed"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kx_new_seed"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_kx_seed_new_keypair"("seed" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kx_seed_new_keypair"("seed" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kx_seed_new_keypair"("seed" "bytea") FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kx_seed_new_keypair"("seed" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kx_seed_new_keypair"("seed" "bytea") TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_secretbox"("message" "bytea", "nonce" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_secretbox"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_secretbox_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_keygen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_secretbox_noncegen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_noncegen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_noncegen"() FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_noncegen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_noncegen"() TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_secretbox_open"("ciphertext" "bytea", "nonce" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("ciphertext" "bytea", "nonce" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("ciphertext" "bytea", "nonce" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("ciphertext" "bytea", "nonce" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("ciphertext" "bytea", "nonce" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_secretbox_open"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_shorthash"("message" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_shorthash"("message" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_shorthash"("message" "bytea", "key" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_shorthash"("message" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_shorthash"("message" "bytea", "key" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_shorthash_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_shorthash_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_shorthash_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_shorthash_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_shorthash_keygen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_sign_final_create"("state" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_final_create"("state" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_final_create"("state" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_final_create"("state" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_final_create"("state" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_sign_final_verify"("state" "bytea", "signature" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_final_verify"("state" "bytea", "signature" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_final_verify"("state" "bytea", "signature" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_final_verify"("state" "bytea", "signature" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_final_verify"("state" "bytea", "signature" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_sign_init"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_init"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_init"() FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_init"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_init"() TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_sign_new_keypair"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_new_keypair"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_new_keypair"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_new_keypair"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_new_keypair"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_sign_update"("state" "bytea", "message" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_update"("state" "bytea", "message" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_update"("state" "bytea", "message" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_update"("state" "bytea", "message" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_update"("state" "bytea", "message" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_sign_update_agg1"("state" "bytea", "message" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg1"("state" "bytea", "message" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg1"("state" "bytea", "message" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg1"("state" "bytea", "message" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg1"("state" "bytea", "message" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_sign_update_agg2"("cur_state" "bytea", "initial_state" "bytea", "message" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg2"("cur_state" "bytea", "initial_state" "bytea", "message" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg2"("cur_state" "bytea", "initial_state" "bytea", "message" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg2"("cur_state" "bytea", "initial_state" "bytea", "message" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg2"("cur_state" "bytea", "initial_state" "bytea", "message" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_signcrypt_new_keypair"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_new_keypair"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_new_keypair"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_new_keypair"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_new_keypair"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_signcrypt_sign_after"("state" "bytea", "sender_sk" "bytea", "ciphertext" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_after"("state" "bytea", "sender_sk" "bytea", "ciphertext" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_after"("state" "bytea", "sender_sk" "bytea", "ciphertext" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_after"("state" "bytea", "sender_sk" "bytea", "ciphertext" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_after"("state" "bytea", "sender_sk" "bytea", "ciphertext" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_signcrypt_sign_before"("sender" "bytea", "recipient" "bytea", "sender_sk" "bytea", "recipient_pk" "bytea", "additional" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_before"("sender" "bytea", "recipient" "bytea", "sender_sk" "bytea", "recipient_pk" "bytea", "additional" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_before"("sender" "bytea", "recipient" "bytea", "sender_sk" "bytea", "recipient_pk" "bytea", "additional" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_before"("sender" "bytea", "recipient" "bytea", "sender_sk" "bytea", "recipient_pk" "bytea", "additional" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_before"("sender" "bytea", "recipient" "bytea", "sender_sk" "bytea", "recipient_pk" "bytea", "additional" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_signcrypt_verify_after"("state" "bytea", "signature" "bytea", "sender_pk" "bytea", "ciphertext" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_after"("state" "bytea", "signature" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_after"("state" "bytea", "signature" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_after"("state" "bytea", "signature" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_after"("state" "bytea", "signature" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_signcrypt_verify_before"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "recipient_sk" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_before"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "recipient_sk" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_before"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "recipient_sk" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_before"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "recipient_sk" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_before"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "recipient_sk" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_signcrypt_verify_public"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "ciphertext" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_public"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_public"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_public"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_public"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "derive_key"("key_id" bigint, "key_len" integer, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."derive_key"("key_id" bigint, "key_len" integer, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."derive_key"("key_id" bigint, "key_len" integer, "context" "bytea") FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."derive_key"("key_id" bigint, "key_len" integer, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."derive_key"("key_id" bigint, "key_len" integer, "context" "bytea") TO "pgsodium_keymaker";


--
-- Name: FUNCTION "pgsodium_derive"("key_id" bigint, "key_len" integer, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."pgsodium_derive"("key_id" bigint, "key_len" integer, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."pgsodium_derive"("key_id" bigint, "key_len" integer, "context" "bytea") FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."pgsodium_derive"("key_id" bigint, "key_len" integer, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."pgsodium_derive"("key_id" bigint, "key_len" integer, "context" "bytea") TO "pgsodium_keymaker";


--
-- Name: FUNCTION "randombytes_buf"("size" integer); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_buf"("size" integer) FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_buf"("size" integer) FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_buf"("size" integer) TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_buf"("size" integer) TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "randombytes_buf_deterministic"("size" integer, "seed" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_buf_deterministic"("size" integer, "seed" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_buf_deterministic"("size" integer, "seed" "bytea") FROM "pgsodium_keymaker";
-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_buf_deterministic"("size" integer, "seed" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_buf_deterministic"("size" integer, "seed" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_buf_deterministic"("size" integer, "seed" "bytea") TO "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_buf_deterministic"("size" integer, "seed" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "randombytes_new_seed"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_new_seed"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_new_seed"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_new_seed"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_new_seed"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "randombytes_random"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_random"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_random"() FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_random"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_random"() TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "randombytes_uniform"("upper_bound" integer); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_uniform"("upper_bound" integer) FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_uniform"("upper_bound" integer) FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_uniform"("upper_bound" integer) TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_uniform"("upper_bound" integer) TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "admin_only"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."admin_only"() TO "anon";
GRANT ALL ON FUNCTION "public"."admin_only"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_only"() TO "service_role";


--
-- Name: FUNCTION "assign_moderator"("user_id" "uuid", "project_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."assign_moderator"("user_id" "uuid", "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."assign_moderator"("user_id" "uuid", "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_moderator"("user_id" "uuid", "project_id" bigint) TO "service_role";


--
-- Name: FUNCTION "authorize"("user_id" "uuid", "project_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."authorize"("user_id" "uuid", "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."authorize"("user_id" "uuid", "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."authorize"("user_id" "uuid", "project_id" bigint) TO "service_role";


--
-- Name: FUNCTION "block_user"("user_id" "uuid"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."block_user"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."block_user"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."block_user"("user_id" "uuid") TO "service_role";


--
-- Name: FUNCTION "can_translate"("translator_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."can_translate"("translator_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."can_translate"("translator_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_translate"("translator_id" bigint) TO "service_role";


--
-- Name: FUNCTION "change_finish_chapter"("chapter_id" bigint, "project_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."change_finish_chapter"("chapter_id" bigint, "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."change_finish_chapter"("chapter_id" bigint, "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."change_finish_chapter"("chapter_id" bigint, "project_id" bigint) TO "service_role";


--
-- Name: FUNCTION "change_start_chapter"("chapter_id" bigint, "project_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."change_start_chapter"("chapter_id" bigint, "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."change_start_chapter"("chapter_id" bigint, "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."change_start_chapter"("chapter_id" bigint, "project_id" bigint) TO "service_role";


--
-- Name: FUNCTION "check_agreement"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."check_agreement"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_agreement"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_agreement"() TO "service_role";


--
-- Name: FUNCTION "check_confession"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."check_confession"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_confession"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_confession"() TO "service_role";


--
-- Name: FUNCTION "create_brief"("project_id" bigint, "is_enable" boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."create_brief"("project_id" bigint, "is_enable" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."create_brief"("project_id" bigint, "is_enable" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_brief"("project_id" bigint, "is_enable" boolean) TO "service_role";


--
-- Name: FUNCTION "create_chapters"("book_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."create_chapters"("book_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."create_chapters"("book_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_chapters"("book_id" bigint) TO "service_role";


--
-- Name: FUNCTION "create_verses"("chapter_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."create_verses"("chapter_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."create_verses"("chapter_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_verses"("chapter_id" bigint) TO "service_role";


--
-- Name: FUNCTION "divide_verses"("divider" character varying, "project_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."divide_verses"("divider" character varying, "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."divide_verses"("divider" character varying, "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."divide_verses"("divider" character varying, "project_id" bigint) TO "service_role";


--
-- Name: FUNCTION "get_current_steps"("project_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_current_steps"("project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_steps"("project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_steps"("project_id" bigint) TO "service_role";


--
-- Name: FUNCTION "get_project_book_chapter_verses"("project_code" "text", "book_c" "public"."book_code", "chapter_num" integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_project_book_chapter_verses"("project_code" "text", "book_c" "public"."book_code", "chapter_num" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_project_book_chapter_verses"("project_code" "text", "book_c" "public"."book_code", "chapter_num" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_project_book_chapter_verses"("project_code" "text", "book_c" "public"."book_code", "chapter_num" integer) TO "service_role";


--
-- Name: FUNCTION "get_verses"("project_id" bigint, "chapter" smallint, "book" "public"."book_code"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_verses"("project_id" bigint, "chapter" smallint, "book" "public"."book_code") TO "anon";
GRANT ALL ON FUNCTION "public"."get_verses"("project_id" bigint, "chapter" smallint, "book" "public"."book_code") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_verses"("project_id" bigint, "chapter" smallint, "book" "public"."book_code") TO "service_role";


--
-- Name: FUNCTION "get_whole_chapter"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_whole_chapter"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code") TO "anon";
GRANT ALL ON FUNCTION "public"."get_whole_chapter"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_whole_chapter"("project_code" "text", "chapter_num" smallint, "book_code" "public"."book_code") TO "service_role";


--
-- Name: FUNCTION "go_to_next_step"("project" "text", "chapter" smallint, "book" "public"."book_code"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."go_to_next_step"("project" "text", "chapter" smallint, "book" "public"."book_code") TO "anon";
GRANT ALL ON FUNCTION "public"."go_to_next_step"("project" "text", "chapter" smallint, "book" "public"."book_code") TO "authenticated";
GRANT ALL ON FUNCTION "public"."go_to_next_step"("project" "text", "chapter" smallint, "book" "public"."book_code") TO "service_role";


--
-- Name: FUNCTION "go_to_step"("project" "text", "chapter" smallint, "book" "public"."book_code", "current_step" smallint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."go_to_step"("project" "text", "chapter" smallint, "book" "public"."book_code", "current_step" smallint) TO "anon";
GRANT ALL ON FUNCTION "public"."go_to_step"("project" "text", "chapter" smallint, "book" "public"."book_code", "current_step" smallint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."go_to_step"("project" "text", "chapter" smallint, "book" "public"."book_code", "current_step" smallint) TO "service_role";


--
-- Name: FUNCTION "handle_compile_chapter"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."handle_compile_chapter"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_compile_chapter"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_compile_chapter"() TO "service_role";


--
-- Name: FUNCTION "handle_new_book"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."handle_new_book"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_book"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_book"() TO "service_role";


--
-- Name: FUNCTION "handle_new_user"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


--
-- Name: FUNCTION "handle_next_step"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."handle_next_step"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_next_step"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_next_step"() TO "service_role";


--
-- Name: FUNCTION "handle_update_dictionaries"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."handle_update_dictionaries"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_update_dictionaries"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_update_dictionaries"() TO "service_role";


--
-- Name: FUNCTION "handle_update_personal_notes"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."handle_update_personal_notes"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_update_personal_notes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_update_personal_notes"() TO "service_role";


--
-- Name: FUNCTION "handle_update_team_notes"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."handle_update_team_notes"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_update_team_notes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_update_team_notes"() TO "service_role";


--
-- Name: FUNCTION "has_access"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."has_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."has_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_access"() TO "service_role";


--
-- Name: FUNCTION "insert_additional_chapter"("book_id" bigint, "verses" integer, "project_id" bigint, "num" smallint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."insert_additional_chapter"("book_id" bigint, "verses" integer, "project_id" bigint, "num" smallint) TO "anon";
GRANT ALL ON FUNCTION "public"."insert_additional_chapter"("book_id" bigint, "verses" integer, "project_id" bigint, "num" smallint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_additional_chapter"("book_id" bigint, "verses" integer, "project_id" bigint, "num" smallint) TO "service_role";


--
-- Name: FUNCTION "insert_additional_verses"("start_verse" smallint, "finish_verse" smallint, "chapter_id" bigint, "project_id" integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."insert_additional_verses"("start_verse" smallint, "finish_verse" smallint, "chapter_id" bigint, "project_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."insert_additional_verses"("start_verse" smallint, "finish_verse" smallint, "chapter_id" bigint, "project_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_additional_verses"("start_verse" smallint, "finish_verse" smallint, "chapter_id" bigint, "project_id" integer) TO "service_role";


--
-- Name: FUNCTION "remove_moderator"("user_id" "uuid", "project_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."remove_moderator"("user_id" "uuid", "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."remove_moderator"("user_id" "uuid", "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_moderator"("user_id" "uuid", "project_id" bigint) TO "service_role";


--
-- Name: FUNCTION "save_verse"("verse_id" bigint, "new_verse" "text"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."save_verse"("verse_id" bigint, "new_verse" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."save_verse"("verse_id" bigint, "new_verse" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_verse"("verse_id" bigint, "new_verse" "text") TO "service_role";


--
-- Name: FUNCTION "save_verses"("verses" "json"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."save_verses"("verses" "json") TO "anon";
GRANT ALL ON FUNCTION "public"."save_verses"("verses" "json") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_verses"("verses" "json") TO "service_role";


--
-- Name: FUNCTION "update_chapters_in_books"("book_id" bigint, "chapters_new" "json", "project_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."update_chapters_in_books"("book_id" bigint, "chapters_new" "json", "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_chapters_in_books"("book_id" bigint, "chapters_new" "json", "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_chapters_in_books"("book_id" bigint, "chapters_new" "json", "project_id" bigint) TO "service_role";


--
-- Name: FUNCTION "update_resources_in_projects"("resources_new" "json", "base_manifest_new" "json", "project_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."update_resources_in_projects"("resources_new" "json", "base_manifest_new" "json", "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_resources_in_projects"("resources_new" "json", "base_manifest_new" "json", "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_resources_in_projects"("resources_new" "json", "base_manifest_new" "json", "project_id" bigint) TO "service_role";


--
-- Name: FUNCTION "update_verses_in_chapters"("book_id" bigint, "verses_new" integer, "num" smallint, "project_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."update_verses_in_chapters"("book_id" bigint, "verses_new" integer, "num" smallint, "project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_verses_in_chapters"("book_id" bigint, "verses_new" integer, "num" smallint, "project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_verses_in_chapters"("book_id" bigint, "verses_new" integer, "num" smallint, "project_id" bigint) TO "service_role";


--
-- Name: SEQUENCE "seq_schema_version"; Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "postgres";
-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "anon";
-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "authenticated";
-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "service_role";


--
-- Name: TABLE "decrypted_key"; Type: ACL; Schema: pgsodium; Owner: postgres
--

-- GRANT ALL ON TABLE "pgsodium"."decrypted_key" TO "pgsodium_keyholder";


--
-- Name: SEQUENCE "key_key_id_seq"; Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON SEQUENCE "pgsodium"."key_key_id_seq" FROM "supabase_admin";
-- REVOKE ALL ON SEQUENCE "pgsodium"."key_key_id_seq" FROM "pgsodium_keymaker";
-- GRANT ALL ON SEQUENCE "pgsodium"."key_key_id_seq" TO "postgres";
-- GRANT ALL ON SEQUENCE "pgsodium"."key_key_id_seq" TO "pgsodium_keymaker";


--
-- Name: TABLE "masking_rule"; Type: ACL; Schema: pgsodium; Owner: postgres
--

-- GRANT ALL ON TABLE "pgsodium"."masking_rule" TO "pgsodium_keyholder";


--
-- Name: TABLE "mask_columns"; Type: ACL; Schema: pgsodium; Owner: postgres
--

-- GRANT ALL ON TABLE "pgsodium"."mask_columns" TO "pgsodium_keyholder";


--
-- Name: TABLE "books"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."books" TO "anon";
GRANT ALL ON TABLE "public"."books" TO "authenticated";
GRANT ALL ON TABLE "public"."books" TO "service_role";


--
-- Name: SEQUENCE "books_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."books_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."books_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."books_id_seq" TO "service_role";


--
-- Name: TABLE "briefs"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."briefs" TO "anon";
GRANT ALL ON TABLE "public"."briefs" TO "authenticated";
GRANT ALL ON TABLE "public"."briefs" TO "service_role";


--
-- Name: SEQUENCE "briefs_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."briefs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."briefs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."briefs_id_seq" TO "service_role";


--
-- Name: TABLE "chapters"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."chapters" TO "anon";
GRANT ALL ON TABLE "public"."chapters" TO "authenticated";
GRANT ALL ON TABLE "public"."chapters" TO "service_role";


--
-- Name: SEQUENCE "chapters_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."chapters_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."chapters_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."chapters_id_seq" TO "service_role";


--
-- Name: TABLE "dictionaries"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."dictionaries" TO "anon";
GRANT ALL ON TABLE "public"."dictionaries" TO "authenticated";
GRANT ALL ON TABLE "public"."dictionaries" TO "service_role";


--
-- Name: TABLE "languages"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."languages" TO "anon";
GRANT ALL ON TABLE "public"."languages" TO "authenticated";
GRANT ALL ON TABLE "public"."languages" TO "service_role";


--
-- Name: SEQUENCE "languages_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."languages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."languages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."languages_id_seq" TO "service_role";


--
-- Name: TABLE "logs"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."logs" TO "anon";
GRANT ALL ON TABLE "public"."logs" TO "authenticated";
GRANT ALL ON TABLE "public"."logs" TO "service_role";


--
-- Name: SEQUENCE "logs_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."logs_id_seq" TO "service_role";


--
-- Name: TABLE "methods"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."methods" TO "anon";
GRANT ALL ON TABLE "public"."methods" TO "authenticated";
GRANT ALL ON TABLE "public"."methods" TO "service_role";


--
-- Name: SEQUENCE "methods_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."methods_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."methods_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."methods_id_seq" TO "service_role";


--
-- Name: TABLE "personal_notes"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."personal_notes" TO "anon";
GRANT ALL ON TABLE "public"."personal_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."personal_notes" TO "service_role";


--
-- Name: TABLE "progress"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."progress" TO "anon";
GRANT ALL ON TABLE "public"."progress" TO "authenticated";
GRANT ALL ON TABLE "public"."progress" TO "service_role";


--
-- Name: SEQUENCE "progress_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."progress_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."progress_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."progress_id_seq" TO "service_role";


--
-- Name: TABLE "project_coordinators"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."project_coordinators" TO "anon";
GRANT ALL ON TABLE "public"."project_coordinators" TO "authenticated";
GRANT ALL ON TABLE "public"."project_coordinators" TO "service_role";


--
-- Name: SEQUENCE "project_coordinators_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."project_coordinators_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."project_coordinators_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."project_coordinators_id_seq" TO "service_role";


--
-- Name: TABLE "project_translators"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."project_translators" TO "anon";
GRANT ALL ON TABLE "public"."project_translators" TO "authenticated";
GRANT ALL ON TABLE "public"."project_translators" TO "service_role";


--
-- Name: SEQUENCE "project_translators_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."project_translators_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."project_translators_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."project_translators_id_seq" TO "service_role";


--
-- Name: TABLE "projects"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";


--
-- Name: SEQUENCE "projects_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "service_role";


--
-- Name: TABLE "role_permissions"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";


--
-- Name: SEQUENCE "role_permissions_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "service_role";


--
-- Name: TABLE "steps"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."steps" TO "anon";
GRANT ALL ON TABLE "public"."steps" TO "authenticated";
GRANT ALL ON TABLE "public"."steps" TO "service_role";


--
-- Name: SEQUENCE "steps_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."steps_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."steps_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."steps_id_seq" TO "service_role";


--
-- Name: TABLE "team_notes"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."team_notes" TO "anon";
GRANT ALL ON TABLE "public"."team_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."team_notes" TO "service_role";


--
-- Name: TABLE "users"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";


--
-- Name: TABLE "verses"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."verses" TO "anon";
GRANT ALL ON TABLE "public"."verses" TO "authenticated";
GRANT ALL ON TABLE "public"."verses" TO "service_role";


--
-- Name: SEQUENCE "verses_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."verses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."verses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."verses_id_seq" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- PostgreSQL database dump complete
--

RESET ALL;
