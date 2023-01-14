--
-- PostgreSQL database dump
--

-- Dumped from database version 14.5 (Debian 14.5-2.pgdg110+2)
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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: app_permission; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.app_permission AS ENUM (
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


ALTER TYPE public.app_permission OWNER TO postgres;

--
-- Name: book_code; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.book_code AS ENUM (
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


ALTER TYPE public.book_code OWNER TO postgres;

--
-- Name: project_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.project_role AS ENUM (
    'coordinator',
    'moderator',
    'translator'
);


ALTER TYPE public.project_role OWNER TO postgres;

--
-- Name: project_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.project_type AS ENUM (
    'obs',
    'bible'
);


ALTER TYPE public.project_type OWNER TO postgres;

--
-- Name: admin_only(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.admin_only() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.admin_only() OWNER TO postgres;

--
-- Name: assign_moderator(uuid, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assign_moderator(user_id uuid, project_id bigint) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.assign_moderator(user_id uuid, project_id bigint) OWNER TO postgres;

--
-- Name: authorize(uuid, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.authorize(user_id uuid, project_id bigint) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.authorize(user_id uuid, project_id bigint) OWNER TO postgres;

--
-- Name: block_user(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.block_user(user_id uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.block_user(user_id uuid) OWNER TO postgres;

--
-- Name: can_translate(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.can_translate(translator_id bigint) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.can_translate(translator_id bigint) OWNER TO postgres;

--
-- Name: change_finish_chapter(bigint, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.change_finish_chapter(chapter_id bigint, project_id bigint) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.change_finish_chapter(chapter_id bigint, project_id bigint) OWNER TO postgres;

--
-- Name: change_start_chapter(bigint, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.change_start_chapter(chapter_id bigint, project_id bigint) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.change_start_chapter(chapter_id bigint, project_id bigint) OWNER TO postgres;

--
-- Name: check_agreement(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_agreement() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    DECLARE

    BEGIN
      UPDATE PUBLIC.users SET agreement = TRUE WHERE users.id = auth.uid();

      RETURN TRUE;

    END;
  $$;


ALTER FUNCTION public.check_agreement() OWNER TO postgres;

--
-- Name: check_confession(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_confession() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    DECLARE

    BEGIN
      UPDATE PUBLIC.users SET confession = TRUE WHERE users.id = auth.uid();

      RETURN TRUE;

    END;
  $$;


ALTER FUNCTION public.check_confession() OWNER TO postgres;

--
-- Name: create_chapters(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_chapters(book_id bigint) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.create_chapters(book_id bigint) OWNER TO postgres;

--
-- Name: create_verses(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_verses(chapter_id bigint) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    DECLARE
      chapter RECORD;
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

      FOR i IN 1..chapter.verses LOOP
        INSERT INTO
          PUBLIC.verses (num, chapter_id, current_step, project_id)
        VALUES
          (i , chapter.id, chapter.step_id, chapter.project_id);
      END LOOP;

      RETURN true;

    END;
  $$;


ALTER FUNCTION public.create_verses(chapter_id bigint) OWNER TO postgres;

--
-- Name: divide_verses(character varying, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.divide_verses(divider character varying, project_id bigint) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.divide_verses(divider character varying, project_id bigint) OWNER TO postgres;

--
-- Name: finished_chapter(bigint, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.finished_chapter(chapter_id bigint, project_id bigint) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

    BEGIN
      IF authorize(auth.uid(), finished_chapter.project_id) NOT IN ('admin', 'coordinator')THEN RETURN FALSE;
      END IF;

      UPDATE PUBLIC.chapters SET finished_at = NOW() WHERE finished_chapter.chapter_id = chapters.id AND finished_chapter.project_id = chapters.project_id AND started_at IS NOT NULL AND finished_at IS NULL;

      RETURN true;

    END;
  $$;


ALTER FUNCTION public.finished_chapter(chapter_id bigint, project_id bigint) OWNER TO postgres;

--
-- Name: get_current_steps(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_current_steps(project_id bigint) RETURNS TABLE(title text, project text, book public.book_code, chapter smallint, step smallint, started_at timestamp without time zone)
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.get_current_steps(project_id bigint) OWNER TO postgres;

--
-- Name: get_verses(bigint, smallint, public.book_code); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_verses(project_id bigint, chapter smallint, book public.book_code) RETURNS TABLE(verse_id bigint, num smallint, verse text)
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.get_verses(project_id bigint, chapter smallint, book public.book_code) OWNER TO postgres;

--
-- Name: get_whole_chapter(text, smallint, public.book_code); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_whole_chapter(project_code text, chapter_num smallint, book_code public.book_code) RETURNS TABLE(verse_id bigint, num smallint, verse text, translator text)
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.get_whole_chapter(project_code text, chapter_num smallint, book_code public.book_code) OWNER TO postgres;

--
-- Name: go_to_next_step(text, smallint, public.book_code); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.go_to_next_step(project text, chapter smallint, book public.book_code) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.go_to_next_step(project text, chapter smallint, book public.book_code) OWNER TO postgres;

--
-- Name: go_to_step(text, smallint, public.book_code, smallint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.go_to_step(project text, chapter smallint, book public.book_code, current_step smallint) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.go_to_step(project text, chapter smallint, book public.book_code, current_step smallint) OWNER TO postgres;

--
-- Name: handle_compile_book(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_compile_book(books_id bigint) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    DECLARE      
      book JSONB;
    BEGIN      
        SELECT  jsonb_object_agg(num, text) FROM PUBLIC.chapters WHERE book_id = handle_compile_book.books_id INTO book;
        return book;
      
    END;
  $$;


ALTER FUNCTION public.handle_compile_book(books_id bigint) OWNER TO postgres;

--
-- Name: handle_compile_chapter(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_compile_chapter() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    DECLARE      
      chapter JSONB;
    BEGIN

      IF (New.finished_at IS NOT NULL ) THEN
        SELECT  jsonb_object_agg(num, text) FROM PUBLIC.verses WHERE project_id = OLD.project_id AND chapter_id = OLD.id into chapter;
       New.text=chapter; 
      ELSE
        RETURN NEW;
      END IF;
        
      RETURN NEW;
    END;
  $$;


ALTER FUNCTION public.handle_compile_chapter() OWNER TO postgres;

--
-- Name: handle_new_book(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_book() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$ BEGIN
      IF (PUBLIC.create_chapters(NEW.id)) THEN
        RETURN NEW;
      ELSE
        RETURN NULL;
      END IF;
    END;
  $$;


ALTER FUNCTION public.handle_new_book() OWNER TO postgres;

--
-- Name: handle_new_project(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_project() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$ BEGIN
      INSERT INTO
        PUBLIC.briefs (project_id)
      VALUES
        (NEW.id);

      RETURN NEW;

    END;
  $$;


ALTER FUNCTION public.handle_new_project() OWNER TO postgres;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$ BEGIN
      INSERT INTO
        PUBLIC.users (id, email, login)
      VALUES
        (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'login');

      RETURN NEW;

    END;

  $$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: handle_next_step(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_next_step() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.handle_next_step() OWNER TO postgres;

--
-- Name: handle_update_dictionaries(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_update_dictionaries() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.handle_update_dictionaries() OWNER TO postgres;

--
-- Name: handle_update_personal_notes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_update_personal_notes() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$ BEGIN
      NEW.changed_at:=NOW();

      RETURN NEW;

    END;
  $$;


ALTER FUNCTION public.handle_update_personal_notes() OWNER TO postgres;

--
-- Name: handle_update_team_notes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_update_team_notes() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$ BEGIN
      NEW.changed_at:=NOW();

      RETURN NEW;

    END;
  $$;


ALTER FUNCTION public.handle_update_team_notes() OWNER TO postgres;

--
-- Name: has_access(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.has_access() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.has_access() OWNER TO postgres;

--
-- Name: remove_moderator(uuid, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.remove_moderator(user_id uuid, project_id bigint) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.remove_moderator(user_id uuid, project_id bigint) OWNER TO postgres;

--
-- Name: save_verse(bigint, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.save_verse(verse_id bigint, new_verse text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

    BEGIN
      -- TODO проверить что глава начата и не закончена, что стих назначен переводчику
      UPDATE PUBLIC.verses SET "text" = save_verse.new_verse WHERE verses.id = save_verse.verse_id;

      RETURN true;

    END;
  $$;


ALTER FUNCTION public.save_verse(verse_id bigint, new_verse text) OWNER TO postgres;

--
-- Name: save_verses(json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.save_verses(verses json) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.save_verses(verses json) OWNER TO postgres;

--
-- Name: start_chapter(bigint, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.start_chapter(chapter_id bigint, project_id bigint) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

    BEGIN
      IF authorize(auth.uid(), start_chapter.project_id) NOT IN ('admin', 'coordinator')THEN RETURN FALSE;
      END IF;

      UPDATE PUBLIC.chapters SET started_at = NOW() WHERE start_chapter.chapter_id = chapters.id AND start_chapter.project_id = chapters.project_id AND started_at IS NULL;

      RETURN true;

    END;
  $$;


ALTER FUNCTION public.start_chapter(chapter_id bigint, project_id bigint) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.books (
    id bigint NOT NULL,
    code public.book_code NOT NULL,
    project_id bigint NOT NULL,
    text text,
    chapters json
);


ALTER TABLE public.books OWNER TO postgres;

--
-- Name: TABLE books; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.books IS 'У каждой книги потом прописать ее вес. Рассчитать на основе англ или русских ресурсов (сколько там слов). Подумать о том, что будет если удалить проект. Так как в таблице книги мы хотим хранить текст. Отобразим 66 книг Библии или 1 ОБС. В будущем парсить манифест чтобы отображать книги которые уже готовы. Или в момент когда админ нажмет "Создать книгу" проверить есть ли они, если нет то выдать предупреждение. При создании проекта он указывает сразу метод. Придумать так чтобы нельзя было добавлять новые шаги после всего. Может сделать функцию, которая проверяет код книги, и добавляет. Тогда никто лишнего не отправит.';


--
-- Name: COLUMN books.text; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.books.text IS 'Здесь мы будем собирать книгу чтобы не делать много запросов. Возьмем все главы и объединим. Так же тут со временем пропишем вес книги на основе англ или русского ресурса. Делать это надо через функцию какую-то, чтобы она собрала сама книгу.';


--
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.books ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.books_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: briefs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.briefs (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    text text
);


ALTER TABLE public.briefs OWNER TO postgres;

--
-- Name: COLUMN briefs.text; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.briefs.text IS 'бриф пишем в формате маркдаун';


--
-- Name: briefs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.briefs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.briefs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: chapters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapters (
    id bigint NOT NULL,
    num smallint NOT NULL,
    book_id bigint NOT NULL,
    project_id bigint NOT NULL,
    text jsonb,
    verses integer,
    started_at timestamp without time zone,
    finished_at timestamp without time zone,
    tests text
);


ALTER TABLE public.chapters OWNER TO postgres;

--
-- Name: chapters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.chapters ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.chapters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: dictionaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dictionaries (
    id text NOT NULL,
    project_id bigint NOT NULL,
    title text,
    data json,
    created_at timestamp without time zone DEFAULT now(),
    changed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.dictionaries OWNER TO postgres;

--
-- Name: languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.languages (
    id bigint NOT NULL,
    eng text NOT NULL,
    code text NOT NULL,
    orig_name text NOT NULL,
    is_gl boolean DEFAULT false NOT NULL
);

ALTER TABLE ONLY public.languages REPLICA IDENTITY FULL;


ALTER TABLE public.languages OWNER TO postgres;

--
-- Name: languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.languages ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.languages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.methods (
    id bigint NOT NULL,
    title text NOT NULL,
    steps json,
    resources json,
    type public.project_type DEFAULT 'bible'::public.project_type NOT NULL
);


ALTER TABLE public.methods OWNER TO postgres;

--
-- Name: methods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.methods ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.methods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: personal_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_notes (
    id text NOT NULL,
    user_id uuid NOT NULL,
    title text,
    data json,
    created_at timestamp without time zone DEFAULT now(),
    changed_at timestamp without time zone DEFAULT now(),
    is_folder boolean DEFAULT false,
    parent_id text
);


ALTER TABLE public.personal_notes OWNER TO postgres;

--
-- Name: progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progress (
    id bigint NOT NULL,
    verse_id bigint NOT NULL,
    step_id bigint NOT NULL,
    text text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.progress OWNER TO postgres;

--
-- Name: progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.progress ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.progress_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: project_coordinators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_coordinators (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE public.project_coordinators OWNER TO postgres;

--
-- Name: project_coordinators_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.project_coordinators ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.project_coordinators_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: project_translators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_translators (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    is_moderator boolean DEFAULT false,
    user_id uuid NOT NULL
);


ALTER TABLE public.project_translators OWNER TO postgres;

--
-- Name: project_translators_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.project_translators ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.project_translators_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id bigint NOT NULL,
    title text NOT NULL,
    code text NOT NULL,
    language_id bigint NOT NULL,
    type public.project_type NOT NULL,
    resources json,
    method text NOT NULL,
    base_manifest json,
    dictionaries_alphabet jsonb
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: COLUMN projects.type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.projects.type IS 'копируется с таблицы методов';


--
-- Name: COLUMN projects.resources; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.projects.resources IS 'копируем с таблицы методов, должны быть заполнены ссылки, указываем овнера, репо, коммит';


--
-- Name: COLUMN projects.method; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.projects.method IS 'копируем без изменений название метода с таблицы шаблонов';


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.projects ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id bigint NOT NULL,
    role public.project_role NOT NULL,
    permission public.app_permission NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: TABLE role_permissions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.role_permissions IS 'Application permissions for each role.';


--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.role_permissions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.role_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: steps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.steps (
    id bigint NOT NULL,
    title text NOT NULL,
    description text,
    intro text,
    count_of_users smallint NOT NULL,
    whole_chapter boolean DEFAULT true,
    "time" smallint NOT NULL,
    project_id bigint NOT NULL,
    config json NOT NULL,
    sorting smallint NOT NULL
);


ALTER TABLE public.steps OWNER TO postgres;

--
-- Name: COLUMN steps.sorting; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.steps.sorting IS 'это поле юзер не редактирует. Мы его указываем сами. Пока что будем получать с клиента.';


--
-- Name: steps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.steps ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.steps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: team_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_notes (
    id text NOT NULL,
    project_id bigint NOT NULL,
    title text,
    data json,
    created_at timestamp without time zone DEFAULT now(),
    changed_at timestamp without time zone DEFAULT now(),
    is_folder boolean DEFAULT false,
    parent_id text
);


ALTER TABLE public.team_notes OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    login text NOT NULL,
    agreement boolean DEFAULT false NOT NULL,
    confession boolean DEFAULT false NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    blocked timestamp without time zone
);

ALTER TABLE ONLY public.users REPLICA IDENTITY FULL;


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: verses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verses (
    id bigint NOT NULL,
    num smallint NOT NULL,
    text text,
    current_step bigint NOT NULL,
    chapter_id bigint NOT NULL,
    project_id bigint NOT NULL,
    project_translator_id bigint
);


ALTER TABLE public.verses OWNER TO postgres;

--
-- Name: COLUMN verses.text; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.verses.text IS 'тут будет храниться последний текст. Когда мы переходим на следующий шаг, мы копируем текст и номер предыдущего шага';


--
-- Name: COLUMN verses.current_step; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.verses.current_step IS 'Скорее всего тут придется хранить айдишник шага. Так как несколько переводчиков то часть стихов может быть на одном а часть на другом шаге. Переводчик у нас на уровне проекта а не главы, чтобы можно было у переводчика хранить, на каком он шаге.';


--
-- Name: verses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.verses ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.verses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.books (id, code, project_id, text, chapters) OVERRIDING SYSTEM VALUE VALUES (1, 'ezr', 1, NULL, '{"1":11,"2":70,"3":13,"4":24,"5":17,"6":22,"7":28,"8":36,"9":15,"10":44}');
INSERT INTO public.books (id, code, project_id, text, chapters) OVERRIDING SYSTEM VALUE VALUES (2, '1jn', 1, NULL, '{"1":10,"2":29,"3":24,"4":21,"5":21}');


--
-- Data for Name: briefs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.briefs (id, project_id, text) OVERRIDING SYSTEM VALUE VALUES (1, 1, '');


--
-- Data for Name: chapters; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.chapters (id, num, book_id, project_id, text, verses, started_at, finished_at, tests) OVERRIDING SYSTEM VALUE VALUES (5, 5, 1, 1, NULL, 17, NULL, NULL, NULL);
INSERT INTO public.chapters (id, num, book_id, project_id, text, verses, started_at, finished_at, tests) OVERRIDING SYSTEM VALUE VALUES (6, 6, 1, 1, NULL, 22, NULL, NULL, NULL);
INSERT INTO public.chapters (id, num, book_id, project_id, text, verses, started_at, finished_at, tests) OVERRIDING SYSTEM VALUE VALUES (7, 7, 1, 1, NULL, 28, NULL, NULL, NULL);
INSERT INTO public.chapters (id, num, book_id, project_id, text, verses, started_at, finished_at, tests) OVERRIDING SYSTEM VALUE VALUES (8, 8, 1, 1, NULL, 36, NULL, NULL, NULL);
INSERT INTO public.chapters (id, num, book_id, project_id, text, verses, started_at, finished_at, tests) OVERRIDING SYSTEM VALUE VALUES (9, 9, 1, 1, NULL, 15, NULL, NULL, NULL);
INSERT INTO public.chapters (id, num, book_id, project_id, text, verses, started_at, finished_at, tests) OVERRIDING SYSTEM VALUE VALUES (10, 10, 1, 1, NULL, 44, NULL, NULL, NULL);
INSERT INTO public.chapters (id, num, book_id, project_id, text, verses, started_at, finished_at, tests) OVERRIDING SYSTEM VALUE VALUES (3, 3, 1, 1, NULL, 13, '2022-11-23 11:07:53.202925', NULL, NULL);
INSERT INTO public.chapters (id, num, book_id, project_id, text, verses, started_at, finished_at, tests) OVERRIDING SYSTEM VALUE VALUES (2, 2, 1, 1, '{"1": "first", "2": "ыусщтв", "3": null, "4": null, "5": null, "6": null, "7": null, "8": null, "9": null, "10": null, "11": null, "12": null, "13": "text", "14": "text", "15": "text", "16": "text", "17": "text", "18": "text", "19": "text", "20": "text", "21": "text", "22": "text", "23": "tedt", "24": "text", "25": null, "26": null, "27": null, "28": null, "29": null, "30": null, "31": null, "32": null, "33": null, "34": null, "35": null, "36": null, "37": null, "38": null, "39": null, "40": null, "41": null, "42": null, "43": null, "44": null, "45": null, "46": null, "47": null, "48": null, "49": null, "50": null, "51": null, "52": null, "53": null, "54": null, "55": null, "56": null, "57": null, "58": null, "59": null, "60": null, "61": null, "62": null, "63": null, "64": null, "65": null, "66": null, "67": null, "68": null, "69": null, "70": null}', 70, '2023-01-11 08:12:22.128914', '2023-01-11 10:28:29.671917', NULL);
INSERT INTO public.chapters (id, num, book_id, project_id, text, verses, started_at, finished_at, tests) OVERRIDING SYSTEM VALUE VALUES (4, 4, 1, 1, '{"1": "first dtep", "2": "second", "3": "third", "4": "fourth", "5": "fifth", "6": "sixth", "7": "seventh", "8": "eight", "9": null, "10": null, "11": null, "12": null, "13": null, "14": null, "15": null, "16": null, "17": null, "18": null, "19": null, "20": null, "21": null, "22": null, "23": null, "24": null}', 24, '2023-01-10 12:43:29', '2023-01-10 14:59:26.774273', 'chapter');
INSERT INTO public.chapters (id, num, book_id, project_id, text, verses, started_at, finished_at, tests) OVERRIDING SYSTEM VALUE VALUES (13, 3, 2, 1, NULL, 24, NULL, NULL, NULL);
INSERT INTO public.chapters (id, num, book_id, project_id, text, verses, started_at, finished_at, tests) OVERRIDING SYSTEM VALUE VALUES (14, 4, 2, 1, NULL, 21, NULL, NULL, NULL);
INSERT INTO public.chapters (id, num, book_id, project_id, text, verses, started_at, finished_at, tests) OVERRIDING SYSTEM VALUE VALUES (15, 5, 2, 1, NULL, 21, NULL, NULL, NULL);
INSERT INTO public.chapters (id, num, book_id, project_id, text, verses, started_at, finished_at, tests) OVERRIDING SYSTEM VALUE VALUES (11, 1, 2, 1, '{"1": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "2": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "3": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "4": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "5": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "6": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "7": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "8": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "9": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "10": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit."}', 10, '2023-01-13 12:15:44.269858', '2023-01-13 12:31:45.309248', NULL);
INSERT INTO public.chapters (id, num, book_id, project_id, text, verses, started_at, finished_at, tests) OVERRIDING SYSTEM VALUE VALUES (12, 2, 2, 1, '{"1": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "2": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "3": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "4": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "5": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "6": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "7": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "8": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "9": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "10": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "11": "v\nLorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "12": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.\nLorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "13": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "14": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "15": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "16": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "17": "v\nLorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "18": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "19": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "20": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "21": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "22": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "23": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "24": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "25": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "26": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "27": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "28": "v\nLorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.", "29": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit."}', 29, '2023-01-13 12:16:22.139787', '2023-01-13 12:31:54.048505', NULL);


--
-- Data for Name: dictionaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('009ip1j14', 1, 'FCD', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-11-30 14:34:04.828874', '2022-11-30 14:34:04.828874');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00mmb7sox', 1, '1 мститель
', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-01 13:40:06.8316', '2022-12-01 13:40:06.8316');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00df7mrwk', 1, 'апельсин', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-14 19:55:52.999344', '2022-12-14 19:55:52.999344');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('002c6zsiq', 1, '16', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-01 11:59:31.402452', '2022-12-01 11:59:31.402452');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00wu17sup', 1, 'морковь', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-14 21:17:00.143807', '2022-12-14 21:17:00.143807');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('008ny5yjx', 1, 'американский', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-11-30 09:31:42.162681', '2022-11-30 09:31:42.162681');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00q81b7em', 1, '3 мститель
', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-01 13:41:18.869872', '2022-12-01 13:41:18.869872');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00iw5dof4', 1, '89', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-01 14:31:22.340327', '2022-12-01 14:31:22.340327');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00nc5uvj2', 1, 'собако', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-11-30 13:44:58.390769', '2022-11-30 13:44:58.390769');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('003qp81q5', 1, '177', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-01 12:24:03.506915', '2022-12-01 12:24:03.506915');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00b54kqqf', 1, '2 мстител
', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-11-30 13:56:59.480149', '2022-11-30 13:56:59.480149');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00k31nxv3', 1, 'собаки
', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-01 14:31:30.747852', '2022-12-01 14:31:30.747852');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00wqw6qj0', 1, '1 мстит
', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-01 13:43:38.252405', '2022-12-01 13:43:38.252405');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00nkch3n5', 1, 'f', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-11-30 14:34:20.022253', '2022-11-30 14:34:20.022253');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00ro9zkbp', 1, '55', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-11-30 14:24:33.311338', '2022-11-30 14:24:33.311338');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00o0ggq5g', 1, '2234', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-01 12:00:33.668031', '2022-12-01 12:00:33.668031');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00stu0o1h', 1, '8989', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-11-30 14:16:58.089635', '2022-11-30 14:16:58.089635');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('005xwugei', 1, '4', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-01 11:59:06.181906', '2022-12-01 11:59:06.181906');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00kcfyhu8', 1, '45', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-01 14:31:03.370236', '2022-12-01 14:31:03.370236');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00w0g000x', 1, 'верность', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-14 19:47:09.771728', '2022-12-14 19:47:09.771728');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('00ls6lofi', 1, 'банан', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-14 19:57:11.34475', '2022-12-14 19:57:11.34475');
INSERT INTO public.dictionaries (id, project_id, title, data, created_at, changed_at) VALUES ('008kzdlzl', 1, 'яблоко
', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-12-14 21:16:42.3418', '2022-12-14 21:16:42.3418');


--
-- Data for Name: languages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.languages (id, eng, code, orig_name, is_gl) OVERRIDING SYSTEM VALUE VALUES (1, 'english', 'en', 'english', true);
INSERT INTO public.languages (id, eng, code, orig_name, is_gl) OVERRIDING SYSTEM VALUE VALUES (2, 'russian', 'ru', 'русский', true);
INSERT INTO public.languages (id, eng, code, orig_name, is_gl) OVERRIDING SYSTEM VALUE VALUES (3, 'kazakh', 'kk', 'казахский', false);


--
-- Data for Name: methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.methods (id, title, steps, resources, type) OVERRIDING SYSTEM VALUE VALUES (1, 'CANA Bible', '[
        {
          "title": "1 ШАГ - ОБЗОР КНИГИ",
          "description": "Это индивидуальная работа и выполняется до встречи с другими участниками команды КРАШ-ТЕСТА.\n\n\n\nЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: убедиться, что материалы букпэкеджа подготовлены корректно и не содержат ошибок или каких-либо трудностей для использования переводчиками.\n\nЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.\n\n\n\n\n\nОБЩИЙ ОБЗОР К КНИГЕ\n\nПрочитайте общий обзор к книге. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в общем обзоре к книге.\n\nЭто задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно. \n\n\n\nОБЗОР К ГЛАВЕ\n\nПрочитайте обзор к главе. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в обзоре к главе.\n\n\n\nЧТЕНИЕ ДОСЛОВНОЙ БИБЛИИ РОБ-Д (RLOB)\n\nПрочитайте ГЛАВУ ДОСЛОВНОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nЧТЕНИЕ СМЫСЛОВОЙ БИБЛИИ РОБ-С (RSOB)\n\nПрочитайте ГЛАВУ СМЫСЛОВОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА»\n\nПрочитайте СЛОВА к главе. Необходимо прочитать статьи к каждому слову. Отметьте для обсуждения командой статьи к словам, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ»\n\nПрочитайте ЗАМЕТКИ к главе. Необходимо прочитать ЗАМЕТКИ к каждому отрывку. Отметьте для обсуждения командой ЗАМЕТКИ, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.",
          "time": 60,
          "whole_chapter": true,
          "count_of_users": 1,
          "intro": "https://youtu.be/IAxFRRy5qw8\n\nЭто индивидуальная работа и выполняется до встречи с другими участниками команды КРАШ-ТЕСТА.\n\n\n\nЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: убедиться, что материалы букпэкеджа подготовлены корректно и не содержат ошибок или каких-либо трудностей для использования переводчиками.\n\nЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.\n\n\n\n\n\nОБЩИЙ ОБЗОР К КНИГЕ\n\nПрочитайте общий обзор к книге. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в общем обзоре к книге.\n\nЭто задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно. \n\n\n\nОБЗОР К ГЛАВЕ\n\nПрочитайте обзор к главе. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в обзоре к главе.\n\n\n\nЧТЕНИЕ ДОСЛОВНОЙ БИБЛИИ РОБ-Д (RLOB)\n\nПрочитайте ГЛАВУ ДОСЛОВНОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nЧТЕНИЕ СМЫСЛОВОЙ БИБЛИИ РОБ-С (RSOB)\n\nПрочитайте ГЛАВУ СМЫСЛОВОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА»\n\nПрочитайте СЛОВА к главе. Необходимо прочитать статьи к каждому слову. Отметьте для обсуждения командой статьи к словам, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ»\n\nПрочитайте ЗАМЕТКИ к главе. Необходимо прочитать ЗАМЕТКИ к каждому отрывку. Отметьте для обсуждения командой ЗАМЕТКИ, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.","config": [
            {
              "size": 4,
              "tools": [
                {
                  "name": "literal",
                  "config": {}
                },
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                },
                {
                  "name": "twords",
                  "config": {}
                }
              ]
            },
            {
              "size": 2,
              "tools": [
                {
                  "name": "personalNotes",
                  "config": {}
                },
                {
                  "name": "teamNotes",
                  "config": {}
                },
                {
                  "name": "dictionary",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "2 ШАГ - КОМАНДНОЕ ИЗУЧЕНИЕ ТЕКСТА",
          "description": "Это командная работа и мы рекомендуем потратить на нее не более 120 минут.\n\n\n\nЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: обсудить с командой материалы букпэкеджа. Для этого поделитесь заметками, которые вы сделали при индивидуальной работе. Обсудите все предложенные правки по инструментам букпэкеджа. Запишите командное резюме по ним для передачи команде, работающей над букпэкеджом.\n\nЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: обсудить командой общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к началу перевода.\n\n\n\n\n\nОБЩИЙ ОБЗОР К КНИГЕ - Обсудите ОБЩИЙ ОБЗОР К КНИГЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения этого инструмента. Также обсудите найденные ошибки или неточности в общем обзоре к книге. Уделите этому этапу 10 минут.\n\nЭто задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно.\n\n\n\nОБЗОР К ГЛАВЕ - Обсудите ОБЗОР К ГЛАВЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в общем обзоре к главе. Уделите этому этапу 10 минут.\n\n\n\nЧТЕНИЕ РОБ-Д (RLOB) - Прочитайте вслух ГЛАВУ ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 20 мин.\n\n\n\nЧТЕНИЕ РОБ-С (RSOB) - Прочитайте вслух ГЛАВУ СМЫСЛОВОГО ПЕРЕВОДА БИБЛИИ РОБ-С (RSOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 10 мин.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Обсудите инструмент СЛОВА. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в статьях этого инструмента. Уделите этому этапу 60 минут.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Обсудите инструмент ЗАМЕТКИ. Что полезного для перевода вы нашли в ЗАМЕТКАХ. Используйте свои записи по этому инструменту с самостоятельного изучения. Также обсудите найденные ошибки или неточности в этом инструменте. Уделите этому этапу 10 минут.",
          "time": 120,
          "whole_chapter": true,
          "count_of_users": 4,
          "intro": "https://youtu.be/d6kvUVRttUw\n\nЭто командная работа и мы рекомендуем потратить на нее не более 120 минут.\n\n\n\nЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: обсудить с командой материалы букпэкеджа. Для этого поделитесь заметками, которые вы сделали при индивидуальной работе. Обсудите все предложенные правки по инструментам букпэкеджа. Запишите командное резюме по ним для передачи команде, работающей над букпэкеджом.\n\nЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: обсудить командой общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к началу перевода.\n\n\n\n\n\nОБЩИЙ ОБЗОР К КНИГЕ - Обсудите ОБЩИЙ ОБЗОР К КНИГЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения этого инструмента. Также обсудите найденные ошибки или неточности в общем обзоре к книге. Уделите этому этапу 10 минут.\n\nЭто задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно.\n\n\n\nОБЗОР К ГЛАВЕ - Обсудите ОБЗОР К ГЛАВЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в общем обзоре к главе. Уделите этому этапу 10 минут.\n\n\n\nЧТЕНИЕ РОБ-Д (RLOB) - Прочитайте вслух ГЛАВУ ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 20 мин.\n\n\n\nЧТЕНИЕ РОБ-С (RSOB) - Прочитайте вслух ГЛАВУ СМЫСЛОВОГО ПЕРЕВОДА БИБЛИИ РОБ-С (RSOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 10 мин.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Обсудите инструмент СЛОВА. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в статьях этого инструмента. Уделите этому этапу 60 минут.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Обсудите инструмент ЗАМЕТКИ. Что полезного для перевода вы нашли в ЗАМЕТКАХ. Используйте свои записи по этому инструменту с самостоятельного изучения. Также обсудите найденные ошибки или неточности в этом инструменте. Уделите этому этапу 10 минут.\n\n","config": [
            {
              "size": 4,
              "tools": [
                {
                  "name": "literal",
                  "config": {}
                },
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                },
                {
                  "name": "twords",
                  "config": {}
                }
              ]
            },
            {
              "size": 2,
              "tools": [
                {
                  "name": "personalNotes",
                  "config": {}
                },
                {
                  "name": "teamNotes",
                  "config": {}
                },
                {
                  "name": "dictionary",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "3 ШАГ - ПОДГОТОВКА К ПЕРЕВОДУ",
          "description": "Это работа в паре и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.\n\nВ этом шаге вам необходимо выполнить два задания.\n\n\n\nПЕРЕСКАЗ НА РУССКОМ - Прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB). Если необходимо - изучите отрывок вместе со всеми инструментами, чтобы как можно лучше передать этот текст более естественным русским языком. Перескажите смысл отрывка своему напарнику, используя максимально понятные и естественные слова русского языка. Не старайтесь пересказывать в точности исходный текст ДОСЛОВНОГО ПЕРЕВОДА. Перескажите текст в максимальной для себя простоте.\n\nПосле этого послушайте вашего напарника, пересказывающего свой отрывок. \n\nНе обсуждайте ваши пересказы - это только проговаривание и слушание.\n\n\n\nПЕРЕСКАЗ НА ЦЕЛЕВОМ - Еще раз просмотрите ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и подумайте, как пересказать этот текст на языке, на который делается перевод, помня о Резюме к переводу о стиле языка. \n\nПерескажите ваш отрывок напарнику на целевом языке, используя максимально понятные и естественные слова этого языка. Передайте всё, что вы запомнили, не подглядывая в текст. \n\nЗатем послушайте вашего напарника, пересказывающего свой отрывок таким же образом.\n\nНе обсуждайте ваши пересказы - это только проговаривание и слушание.",
          "time": 30,
          "whole_chapter": false,
          "count_of_users": 2,
          "intro": "https://youtu.be/ujMGcdkGGhI\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.\n\nВ этом шаге вам необходимо выполнить два задания.\n\n\n\nПЕРЕСКАЗ НА РУССКОМ - Прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB). Если необходимо - изучите отрывок вместе со всеми инструментами, чтобы как можно лучше передать этот текст более естественным русским языком. Перескажите смысл отрывка своему напарнику, используя максимально понятные и естественные слова русского языка. Не старайтесь пересказывать в точности исходный текст ДОСЛОВНОГО ПЕРЕВОДА. Перескажите текст в максимальной для себя простоте.\n\nПосле этого послушайте вашего напарника, пересказывающего свой отрывок. \n\nНе обсуждайте ваши пересказы - это только проговаривание и слушание.\n\n\n\nПЕРЕСКАЗ НА ЦЕЛЕВОМ - Еще раз просмотрите ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и подумайте, как пересказать этот текст на языке, на который делается перевод, помня о Резюме к переводу о стиле языка. \n\nПерескажите ваш отрывок напарнику на целевом языке, используя максимально понятные и естественные слова этого языка. Передайте всё, что вы запомнили, не подглядывая в текст. \n\nЗатем послушайте вашего напарника, пересказывающего свой отрывок таким же образом.\n\nНе обсуждайте ваши пересказы - это только проговаривание и слушание.\n\n","config": [
            {
              "size": 4,
              "tools": [
                {
                  "name": "literal",
                  "config": {}
                },
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                },
                {
                  "name": "twords",
                  "config": {}
                }
              ]
            },
            {
              "size": 2,
              "tools": [
                {
                  "name": "audio",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "4 ШАГ - НАБРОСОК «ВСЛЕПУЮ»",
          "description": "Это индивидуальная работа и мы рекомендуем потратить на нее не более 20 минут.\n\n\n\nЦЕЛЬ этого шага: сделать первый набросок в первую очередь естественным языком.\n\n\n\nРОБ-Д + НАБРОСОК «ВСЛЕПУЮ» - Еще раз прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и если вам необходимо, просмотрите все инструменты к этому отрывку. Как только вы будете готовы сделать «набросок», перейдите на панель «слепого» наброска и напишите ваш перевод на своем языке, используя максимально понятные и естественные слова вашего языка. Пишите по памяти. Не подглядывайте! Главная цель этого шага - естественность языка. Не бойтесь ошибаться! Ошибки на этом этапе допустимы. Точность перевода будет проверена на следующих шагах работы над текстом.",
          "time": 20,
          "whole_chapter": false,
          "count_of_users": 1,
          "intro": "https://youtu.be/3RJQxjnxJ-I\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 20 минут.\n\n\n\nЦЕЛЬ этого шага: сделать первый набросок в первую очередь естественным языком.\n\n\n\nРОБ-Д + НАБРОСОК «ВСЛЕПУЮ» - Еще раз прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и если вам необходимо, просмотрите все инструменты к этому отрывку. Как только вы будете готовы сделать «набросок», перейдите на панель «слепого» наброска и напишите ваш перевод на своем языке, используя максимально понятные и естественные слова вашего языка. Пишите по памяти. Не подглядывайте! Главная цель этого шага - естественность языка. Не бойтесь ошибаться! Ошибки на этом этапе допустимы. Точность перевода будет проверена на следующих шагах работы над текстом. \n\n","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "literal",
                  "config": {
                    "draft":true
                  }
                },
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                },
                {
                  "name": "twords",
                  "config": {}
                }
              ]
            },
            {
              "size": 3,
              "tools": [
                {
                  "name": "draftTranslate",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "5 ШАГ - САМОПРОВЕРКА",
          "description": "Это индивидуальная работа и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным.\n\n\n\nПроверьте ваш перевод на ТОЧНОСТЬ, сравнив с текстом - ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). При необходимости используйте все инструменты к переводу. Оцените по вопросам: ничего не добавлено, ничего не пропущено, смысл не изменён? Если есть ошибки, исправьте.\n\n\n\nПрочитайте ВОПРОСЫ и ответьте на них, глядя в свой текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте.\n\n\n\nПосле этого прочитайте себе ваш перевод вслух и оцените - звучит ли ваш текст ПОНЯТНО И ЕСТЕСТВЕННО? Если нет, то исправьте.\n\n\n\nПерейдите к следующему вашему отрывку и повторите шаги Подготовка-Набросок-Проверка со всеми вашими отрывками до конца главы.",
          "time": 30,
          "whole_chapter": false,
          "count_of_users": 1,
          "intro": "https://youtu.be/WgvaOH9Lnpc\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным.\n\n\n\nПроверьте ваш перевод на ТОЧНОСТЬ, сравнив с текстом - ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). При необходимости используйте все инструменты к переводу. Оцените по вопросам: ничего не добавлено, ничего не пропущено, смысл не изменён? Если есть ошибки, исправьте.\n\n\n\nПрочитайте ВОПРОСЫ и ответьте на них, глядя в свой текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте.\n\n\n\nПосле этого прочитайте себе ваш перевод вслух и оцените - звучит ли ваш текст ПОНЯТНО И ЕСТЕСТВЕННО? Если нет, то исправьте.\n\n\n\nПерейдите к следующему вашему отрывку и повторите шаги Подготовка-Набросок-Проверка со всеми вашими отрывками до конца главы.\n\n","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "literal",
                  "config": {}
                },
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                },
                {
                  "name": "twords",
                  "config": {}
                },
                {
                  "name": "tquestions",
                  "config": {
                    "viewAllQuestions": true
                  }
                }
              ]
            },
            {
              "size": 3,
              "tools": [
                {
                  "name": "translate",
                  "config": {}
                },
                {
                  "name": "personalNotes",
                  "config": {}
                },
                {
                  "name": "teamNotes",
                  "config": {}
                },
                {
                  "name": "dictionary",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "6 ШАГ - ВЗАИМНАЯ ПРОВЕРКА",
          "description": "Это работа в паре и мы рекомендуем потратить на нее не более 40 минут.\n\n\n\nЦЕЛЬ этого шага: улучшить набросок перевода, пригласив другого человека, чтобы проверить перевод на точность и естественность.\n\n\n\nПРОВЕРКА НА ТОЧНОСТЬ - Прочитайте вслух свой текст напарнику, который параллельно следит за текстом ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д(RLOB) и обращает внимание только на ТОЧНОСТЬ перевода. \n\nОбсудите текст насколько он точен. \n\nИзменения в текст вносит переводчик, работавший над ним. Если не удалось договориться о каких-либо изменениях, оставьте этот вопрос для обсуждения всей командой.\n\nПоменяйтесь ролями и поработайте над отрывком партнёра.\n\n\n\nПРОВЕРКА НА ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ - Еще раз прочитайте вслух свой текст напарнику, который теперь не смотрит ни в какой текст, а просто слушает ваше чтение вслух, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка.\n\nОбсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте.\n\nПоменяйтесь ролями и поработайте над отрывком партнёра.\n\n\n\n\n\n_Примечание к шагу:_ \n\n- Не влюбляйтесь в свой текст. Будьте гибкими к тому, чтобы слышать другое мнение и улучшать свой набросок перевода.  Это групповая работа и текст должен соответствовать пониманию большинства в вашей команде. Если даже будут допущены ошибки в этом случае, то на проверках последующих уровней они будут исправлены.\n\n- Если в работе с напарником вам не удалось договориться по каким-то вопросам, касающихся текста, оставьте этот вопрос на обсуждение со всей командой. Ваша цель - не победить напарника, а с его помощью улучшить перевод.",
          "time": 40,
          "whole_chapter": false,
          "count_of_users": 2,
          "intro": "https://youtu.be/xtgTo3oWxKs\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 40 минут.\n\n\n\nЦЕЛЬ этого шага: улучшить набросок перевода, пригласив другого человека, чтобы проверить перевод на точность и естественность.\n\n\n\nПРОВЕРКА НА ТОЧНОСТЬ - Прочитайте вслух свой текст напарнику, который параллельно следит за текстом ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д(RLOB) и обращает внимание только на ТОЧНОСТЬ перевода. \n\nОбсудите текст насколько он точен. \n\nИзменения в текст вносит переводчик, работавший над ним. Если не удалось договориться о каких-либо изменениях, оставьте этот вопрос для обсуждения всей командой.\n\nПоменяйтесь ролями и поработайте над отрывком партнёра.\n\n\n\nПРОВЕРКА НА ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ - Еще раз прочитайте вслух свой текст напарнику, который теперь не смотрит ни в какой текст, а просто слушает ваше чтение вслух, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка.\n\nОбсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте.\n\nПоменяйтесь ролями и поработайте над отрывком партнёра.\n\n\n\n\n\n_Примечание к шагу:_ \n\n- Не влюбляйтесь в свой текст. Будьте гибкими к тому, чтобы слышать другое мнение и улучшать свой набросок перевода.  Это групповая работа и текст должен соответствовать пониманию большинства в вашей команде. Если даже будут допущены ошибки в этом случае, то на проверках последующих уровней они будут исправлены.\n\n- Если в работе с напарником вам не удалось договориться по каким-то вопросам, касающихся текста, оставьте этот вопрос на обсуждение со всей командой. Ваша цель - не победить напарника, а с его помощью улучшить перевод.\n\n","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "literal",
                  "config": {}
                },
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                },
                {
                  "name": "twords",
                  "config": {}
                },
                {
                  "name": "tquestions",
                  "config": {}
                }
              ]
            },
            {
              "size": 3,
              "tools": [
                {
                  "name": "translate",
                  "config": {}
                },
                {
                  "name": "personalNotes",
                  "config": {}
                },
                {
                  "name": "teamNotes",
                  "config": {}
                },
                {
                  "name": "dictionary",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "7 ШАГ - ПРОВЕРКА КЛЮЧЕВЫХ СЛОВ",
          "description": "Это командная работа и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: всей командой улучшить перевод, выслушав больше мнений относительно самых важных слов и фраз в переводе, а также решить разногласия, оставшиеся после взаимопроверки.\n\n\n\nПРОВЕРКА ТЕКСТА ПО КЛЮЧЕВЫМ СЛОВАМ - Прочитайте текст всех переводчиков по очереди всей командой. Проверьте перевод на наличие ключевых слов из инструмента СЛОВА. Все ключевые слова на месте? Все ключевые слова переведены корректно?\n\nКоманда принимает решения, как переводить эти слова или фразы – переводчик вносит эти изменения в свой отрывок. В некоторых случаях, вносить изменения, которые принимает команда, может один человек, выбранный из переводчиков.",
          "time": 30,
          "whole_chapter": true,
          "count_of_users": 4,
          "intro": "https://youtu.be/w5766JEVCyU\n\nЭто командная работа и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: всей командой улучшить перевод, выслушав больше мнений относительно самых важных слов и фраз в переводе, а также решить разногласия, оставшиеся после взаимопроверки.\n\n\n\nПРОВЕРКА ТЕКСТА ПО КЛЮЧЕВЫМ СЛОВАМ - Прочитайте текст всех переводчиков по очереди всей командой. Проверьте перевод на наличие ключевых слов из инструмента СЛОВА. Все ключевые слова на месте? Все ключевые слова переведены корректно?\n\nКоманда принимает решения, как переводить эти слова или фразы – переводчик вносит эти изменения в свой отрывок. В некоторых случаях, вносить изменения, которые принимает команда, может один человек, выбранный из переводчиков. \n\n","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "twords",
                  "config": {}
                },
                {
                  "name": "literal",
                  "config": {}
                },
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                }
              ]
            },
            {
              "size": 3,
              "tools": [
                {
                  "name": "commandTranslate",
                  "config": {
                    "moderatorOnly": false
                  }
                },
                {
                  "name": "personalNotes",
                  "config": {}
                },
                {
                  "name": "teamNotes",
                  "config": {}
                },
                {
                  "name": "dictionary",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "8 ШАГ - КОМАНДНЫЙ ОБЗОР ПЕРЕВОДА",
          "description": "Это командная работа и мы рекомендуем потратить на нее не более 60 минут.\n\nЦЕЛЬ этого шага: улучшить перевод, приняв решения командой о трудных словах или фразах, делая текст хорошим как с точки зрения точности, так и с точки зрения естественности. Это финальный шаг в работе над текстом.\n\n\n\nПРОВЕРКА НА ТОЧНОСТЬ - Прочитайте вслух свой текст команде. Команда в это время смотрит в текст ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB) и обращает внимание только на ТОЧНОСТЬ перевода. \n\nОбсудите текст насколько он точен. Если есть ошибки в вашем тексте, исправьте. Всей командой проверьте на точность работу каждого члена команды, каждую законченную главу.\n\n\n\nПрочитайте ВОПРОСЫ и ответьте на них, глядя в ваш текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте.\n\n\n\nПРОВЕРКА НА ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ - Еще раз прочитайте вслух свой текст команде, которая теперь не смотрит ни в какой текст, а просто слушает, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка. Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте. Проработайте каждую главу/ каждый отрывок, пока команда не будет довольна результатом.\n\n\n\nПримечание к шагу: \n\n- Не оставляйте текст с несколькими вариантами перевода предложения или слова. После восьмого шага не должны оставаться нерешенные вопросы. Текст должен быть готовым к чтению.",
          "time": 60,
          "whole_chapter": true,
          "count_of_users": 4,
          "intro": "https://youtu.be/EiVuJd9ijF0\n\nЭто командная работа и мы рекомендуем потратить на нее не более 60 минут.\n\nЦЕЛЬ этого шага: улучшить перевод, приняв решения командой о трудных словах или фразах, делая текст хорошим как с точки зрения точности, так и с точки зрения естественности. Это финальный шаг в работе над текстом.\n\n\n\nПРОВЕРКА НА ТОЧНОСТЬ - Прочитайте вслух свой текст команде. Команда в это время смотрит в текст ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB) и обращает внимание только на ТОЧНОСТЬ перевода. \n\nОбсудите текст насколько он точен. Если есть ошибки в вашем тексте, исправьте. Всей командой проверьте на точность работу каждого члена команды, каждую законченную главу.\n\n\n\nПрочитайте ВОПРОСЫ и ответьте на них, глядя в ваш текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте.\n\n\n\nПРОВЕРКА НА ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ - Еще раз прочитайте вслух свой текст команде, которая теперь не смотрит ни в какой текст, а просто слушает, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка. Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте. Проработайте каждую главу/ каждый отрывок, пока команда не будет довольна результатом.\n\n\n\nПримечание к шагу: \n\n- Не оставляйте текст с несколькими вариантами перевода предложения или слова. После восьмого шага не должны оставаться нерешенные вопросы. Текст должен быть готовым к чтению. \n\n",
          "config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "literal",
                  "config": {}
                },
                {
                  "name": "tquestions",
                  "config": {}
                },
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                },
                {
                  "name": "twords",
                  "config": {}
                }
              ]
            },
            {
              "size": 3,
              "tools": [
                {
                  "name": "commandTranslate",
                  "config": {
                    "moderatorOnly": true
                  }
                },
                {
                  "name": "personalNotes",
                  "config": {}
                },
                {
                  "name": "teamNotes",
                  "config": {}
                },
                {
                  "name": "dictionary",
                  "config": {}
                }
              ]
            }
          ]
        }
      ]', '{"simplified":false, "literal":true, "tnotes":false, "twords":false, "tquestions":false}', 'bible');
INSERT INTO public.methods (id, title, steps, resources, type) OVERRIDING SYSTEM VALUE VALUES (2, 'CANA OBS', '[
        {
          "title": "Шаг 1: Самостоятельное изучение",
          "description": "понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.",
          "time": 60,
          "whole_chapter": true,
          "count_of_users": 1,
          "intro": "# Первый шаг - самостоятельное изучение\n\nhttps://www.youtube.com/watch?v=gxawAAQ9xbQ\n\nЭто индивидуальная работа и выполняется без участия других членов команды. Каждый читает материалы самостоятельно, не обсуждая прочитанное, но записывая свои комментарии. Если ваш проект по переводу ведется онлайн, то этот шаг можно выполнить до встречи с другими участниками команды переводчиков.\n\nЦЕЛЬ этого шага: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.\n\nЗАДАНИЯ ДЛЯ ПЕРВОГО ШАГА:\n\nВ этом шаге вам необходимо выполнить несколько заданий:\n\nИСТОРИЯ - Прочитайте историю (главу, над которой предстоит работа). Запишите для обсуждения командой предложения и слова, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков.\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Прочитайте СЛОВА к главе. Необходимо прочитать статьи к каждому слову. Отметьте для обсуждения командой статьи к словам, которые могут быть полезными для перевода Открытых Библейских Историй.\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Прочитайте ЗАМЕТКИ к главе. Необходимо прочитать ЗАМЕТКИ к каждому отрывку. Отметьте для обсуждения командой ЗАМЕТКИ, которые могут быть полезными для перевода Открытых Библейских Историй.","config": [
            {
              "size": 4,
              "tools": [
                {
                  "name": "obs",
                  "config": {}
                },
                {
                  "name": "twords",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                }
              ]
            },
            {
              "size": 2,
              "tools": [
                {
                  "name": "personalNotes",
                  "config": {}
                },
                {
                  "name": "teamNotes",
                  "config": {}
                },
                {
                  "name": "dictionary",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "Шаг 2: Командное изучение текста",
          "description": "хорошо понять смысл текста и слов всей командой, а также принять командное решение по переводу некоторых слов перед тем, как начать основную работу.",
          "time": 60,
          "whole_chapter": true,
          "count_of_users": 4,
          "intro": "# Второй шаг - командное изучение текста\n\nhttps://www.youtube.com/watch?v=HK6SXnU5zEw\n\nЭто командная работа и мы рекомендуем потратить на нее не более 60 минут.\n\nЦЕЛЬ этого шага: хорошо понять смысл текста и слов всей командой, а также принять командное решение по переводу некоторых слов перед тем, как начать основную работу.\n\nЗАДАНИЯ ДЛЯ ВТОРОГО ШАГА:\n\nВ этом шаге вам необходимо выполнить несколько заданий.\n\nИСТОРИЯ - Прочитайте вслух историю(главу, над которой предстоит работа). Обсудите предложения и слова, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Уделите этому этапу 20 минут.\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Обсудите инструмент СЛОВА. Что полезного для перевода вы нашли в этих статьях? Используйте свои комментарии с самостоятельного изучения. Уделите этому этапу 20 минут.\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Обсудите инструмент ЗАМЕТКИ. Что полезного для перевода вы нашли в ЗАМЕТКАХ. Используйте свои комментарии по этому инструменту с самостоятельного изучения. Уделите этому этапу 20 минут.","config": [
            {
              "size": 4,
              "tools": [
                {
                  "name": "obs",
                  "config": {}
                },
                {
                  "name": "twords",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                }
              ]
            },
            {
              "size": 2,
              "tools": [
                {
                  "name": "personalNotes",
                  "config": {}
                },
                {
                  "name": "teamNotes",
                  "config": {}
                },
                {
                  "name": "dictionary",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "Шаг 3: Подготовка к переводу",
          "description": "подготовиться к переводу текста естественным языком.",
          "time": 20,
          "whole_chapter": false,
          "count_of_users": 2,
          "intro": "# ТРЕТИЙ шаг - ПОДГОТОВКА К ПЕРЕВОДУ\n\nhttps://www.youtube.com/watch?v=jlhwA9SIWXQ\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 20 минут.\n\nЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.\n\nВ этом шаге вам необходимо выполнить два задания.\n\nПервое задание - ПЕРЕСКАЗ НА РУССКОМ - Прочитайте ваш отрывок из главы в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ. Если необходимо - изучите отрывок вместе со всеми инструментами, чтобы как можно лучше понять этот текст. Перескажите смысл отрывка своему напарнику, используя максимально понятные и естественные слова русского языка. Не старайтесь пересказывать в точности исходный текст. Перескажите текст в максимальной для себя простоте. После этого послушайте вашего напарника, пересказывающего свой отрывок.\n\nУделите этому этапу 10 минут. Не обсуждайте ваши пересказы. В этом шаге только проговаривание текста и слушание.\n\nВторое задание - ПЕРЕСКАЗ НА ЦЕЛЕВОМ - Еще раз просмотрите ваш отрывок или главу в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ, и подумайте, как пересказать этот текст на языке, на который делается перевод, помня о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу) и о стиле языка.\n\nПерескажите ваш отрывок напарнику на целевом языке, используя максимально понятные и естественные слова этого языка. Передайте всё, что вы запомнили, не подглядывая в текст. Затем послушайте вашего напарника, пересказывающего свой отрывок таким же образом. Уделите этому этапу 10 минут. Не обсуждайте ваши пересказы. В этом шаге только проговаривание текста и слушание.","config": [
            {
              "size": 4,
              "tools": [
                {
                  "name": "obs",
                  "config": {}
                },
                {
                  "name": "twords",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                }
              ]
            },
            {
              "size": 2,
              "tools": [
                {
                  "name": "audio",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "Шаг 4: Набросок \"Вслепую\"",
          "description": "сделать первый набросок естественным языком.",
          "time": 20,
          "whole_chapter": false,
          "count_of_users": 1,
          "intro": "# ЧЕТВЕРТЫЙ ШАГ - НАБРОСОК «ВСЛЕПУЮ»\n\nhttps://www.youtube.com/watch?v=HVXOiKUsXSI\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 20 минут.\n\nЦЕЛЬ этого шага: сделать первый набросок естественным языком.\n\nЕще раз прочитайте ваш отрывок  или главу в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ. Если вам необходимо, просмотрите все инструменты к этому отрывку. Как только вы будете готовы сделать «набросок», перейдите на панель «слепого» наброска в программе Translation Studio или в другой программе, в которой вы работаете и напишите ваш перевод на своем языке, используя максимально понятные и естественные слова вашего языка. Пишите по памяти. Не подглядывайте!\n\nГлавная цель этого шага - естественность языка. Не бойтесь ошибаться! Ошибки на этом этапе допустимы. Точность перевода будет проверена на следующих шагах работы над текстом.","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "obs",
                  "config": {
                    "draft":true
                  }
                },
                {
                  "name": "twords",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                }
              ]
            },
            {
              "size": 3,
              "tools": [
                {
                  "name": "draftTranslate",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "Шаг 5: Самостоятельная проверка",
          "description": "поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным.",
          "time": 30,
          "whole_chapter": false,
          "count_of_users": 1,
          "intro": "# ПЯТЫЙ ШАГ - САМОСТОЯТЕЛЬНАЯ ПРОВЕРКА\n\nhttps://www.youtube.com/watch?v=p3p8c_K-O3c\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 30 минут.\n\nЦЕЛЬ этого шага: поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным.\n\nВ этом шаге вам необходимо выполнить три задания.\n\nЗадание первое. Проверьте ваш перевод на ТОЧНОСТЬ, сравнив с текстом ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке. При необходимости используйте все инструменты к переводу. Оцените по вопросам: ничего не добавлено, ничего не пропущено, смысл не изменён? Если есть ошибки, исправьте. Уделите этому заданию 10 минут.\n\nЗадание второе. Прочитайте ВОПРОСЫ и ответьте на них, глядя в свой текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте. Уделите этому заданию 10 минут.\n\nЗадание третье. Прочитайте себе ваш перевод вслух и оцените - звучит ли ваш текст ПОНЯТНО И ЕСТЕСТВЕННО? Если нет, то исправьте. Уделите этому заданию 10 минут.","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "obs",
                  "config": {}
                },
                {
                  "name": "twords",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                },
                {
                  "name": "tquestions",
                  "config": {
                    "viewAllQuestions": true
                  }
                }
              ]
            },
            {
              "size": 3,
              "tools": [
                {
                  "name": "translate",
                  "config": {}
                },
                {
                  "name": "personalNotes",
                  "config": {}
                },
                {
                  "name": "teamNotes",
                  "config": {}
                },
                {
                  "name": "dictionary",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "Шаг 6: Взаимная проверка",
          "description": "улучшить набросок перевода, пригласив другогого человека, чтобы проверить перевод на точность и естественность.",
          "time": 40,
          "whole_chapter": false,
          "count_of_users": 2,
          "intro": "# ШЕСТОЙ ШАГ - ВЗАИМНАЯ ПРОВЕРКА\n\nhttps://www.youtube.com/watch?v=cAgypQsWgQk\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 40 минут.\n\nЦЕЛЬ этого шага: улучшить набросок перевода, пригласив другогого человека, чтобы проверить перевод на точность и естественность.\n\nВ этом шаге вам необходимо выполнить два задания.\n\nЗадание первое - Прочитайте вслух свой текст напарнику, который параллельно следит за текстом ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке и обращает внимание только на ТОЧНОСТЬ вашего перевода. Обсудите текст насколько он точен. Изменения в текст вносит переводчик, работавший над ним. Если не удалось договориться о каких-либо изменениях, оставьте этот вопрос для обсуждения всей командой. Поменяйтесь ролями и поработайте над отрывком партнёра. Уделите этому заданию 20 минут.\n\nЗадание второе - Еще раз прочитайте вслух свой текст напарнику, который теперь не смотрит ни в какой текст, а просто слушает ваше чтение вслух, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка. Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте. Поменяйтесь ролями и поработайте над отрывком партнёра. Уделите этому заданию 20 минут.\n\nПримечание к шагу:\n\n- Не влюбляйтесь в свой текст. Будьте гибкими к тому, чтобы слышать другое мнение и улучшать свой набросок перевода. Это групповая работа и текст должен соответствовать пониманию большинства в вашей команде. Если даже будут допущены ошибки в этом случае, то на проверках последующих уровней они будут исправлены.\n- Если в работе с напарником вам не удалось договориться по каким-то вопросам, касающихся текста, оставьте этот вопрос на обсуждение со всей командой. Ваша цель - не победить напарника, а с его помощью улучшить перевод.","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "obs",
                  "config": {}
                },
                {
                  "name": "twords",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                },
                {
                  "name": "tquestions",
                  "config": {}
                }
              ]
            },
            {
              "size": 3,
              "tools": [
                {
                  "name": "translate",
                  "config": {}
                },
                {
                  "name": "personalNotes",
                  "config": {}
                },
                {
                  "name": "teamNotes",
                  "config": {}
                },
                {
                  "name": "dictionary",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "Шаг 7: Командная проверка",
          "description": "улучшить перевод, приняв решения командой о трудных словах или фразах, делая текст хорошим как с точки зрения точности, так и с точки зрения естественности. Это финальный шаг в работе над текстом.",
          "time": 60,
          "whole_chapter": true,
          "count_of_users": 4,
          "intro": "# СЕДЬМОЙ шаг - КОМАНДНЫЙ ОБЗОР ПЕРЕВОДА\n\nhttps://www.youtube.com/watch?v=P2MbEKDw8U4\n\nЭто командная работа и мы рекомендуем потратить на нее не более 60 минут.\n\nЦЕЛЬ этого шага: улучшить перевод, приняв решения командой о трудных словах или фразах, делая текст хорошим как с точки зрения точности, так и с точки зрения естественности. Это финальный шаг в работе над текстом.\n\nВ этом шаге вам необходимо выполнить три задания.\n\nЗадание первое - Прочитайте вслух свой текст команде. Команда в это время смотрит в текст ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке и обращает внимание только на ТОЧНОСТЬ вашего перевода.Обсудите текст насколько он точен. Если есть ошибки в вашем тексте, исправьте. Всей командой проверьте на точность работу каждого члена команды. Уделите этому заданию 20 минут.\n\nЗадание второе - Проверьте вместе с командой ваш перевод на наличие ключевых слов из инструмента СЛОВА. Все ключевые слова на месте? Все ключевые слова переведены корректно? Уделите этому заданию 20 минут.\n\nЗадание третье - Еще раз прочитайте вслух свой текст команде, которая теперь не смотрит ни в какой текст, а просто слушает, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка. Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте. Проработайте каждую главу/каждый отрывок, пока команда не будет довольна результатом. Уделите этому заданию 20 минут.\n\nПримечание к шагу:\n\n- Не оставляйте текст с несколькими вариантами перевода предложения или слова. После седьмого шага не должны оставаться нерешенные вопросы. Текст должен быть готовым к чтению.","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "obs",
                  "config": {}
                },
                {
                  "name": "twords",
                  "config": {}
                },
                {
                  "name": "tnotes",
                  "config": {}
                },
                {
                  "name": "tquestions",
                  "config": {}
                }
              ]
            },
            {
              "size": 3,
              "tools": [
                {
                  "name": "commandTranslate",
                  "config": {}
                },
                {
                  "name": "personalNotes",
                  "config": {}
                },
                {
                  "name": "teamNotes",
                  "config": {}
                },
                {
                  "name": "dictionary",
                  "config": {}
                }
              ]
            }
          ]
        }
      ]', '{"obs":true, "tnotes":false, "twords":false, "tquestions":false}', 'obs');


--
-- Data for Name: personal_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.personal_notes (id, user_id, title, data, created_at, changed_at, is_folder, parent_id) VALUES ('00trbdbe6', 'b75a51d5-ee4d-4ea0-afa3-2366d7716742', 'new note', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-11-23 12:26:00.175314', '2022-11-23 12:26:05.456165', false, NULL);
INSERT INTO public.personal_notes (id, user_id, title, data, created_at, changed_at, is_folder, parent_id) VALUES ('00u3qiu7l', '1dfaa269-2eda-41c4-9a71-72db8cbd6db2', '334', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-11-30 14:42:54.081739', '2022-12-08 14:49:38.992253', false, NULL);
INSERT INTO public.personal_notes (id, user_id, title, data, created_at, changed_at, is_folder, parent_id) VALUES ('00mxwzelu', 'e63f8dfb-53a4-43ec-9fd9-510b27c1b7ad', 'new note', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2023-01-09 14:48:12.63538', '2023-01-09 14:48:12.63538', false, NULL);


--
-- Data for Name: progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (12, 16, 1, NULL, '2022-11-23 12:25:44.79323');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (13, 17, 1, NULL, '2022-11-23 12:25:44.79323');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (14, 18, 1, NULL, '2022-11-23 12:25:44.79323');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (15, 19, 1, NULL, '2022-11-23 12:25:44.79323');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (16, 20, 1, NULL, '2022-11-23 12:25:44.79323');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (17, 21, 1, NULL, '2022-11-23 12:25:44.79323');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (18, 22, 1, NULL, '2022-11-23 12:25:44.79323');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (19, 23, 1, NULL, '2022-11-23 12:25:44.79323');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (20, 12, 1, NULL, '2022-11-24 07:10:43.013131');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (21, 13, 1, NULL, '2022-11-24 07:10:43.013131');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (22, 14, 1, NULL, '2022-11-24 07:10:43.013131');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (23, 15, 1, NULL, '2022-11-24 07:10:43.013131');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (24, 12, 2, NULL, '2022-11-28 17:32:48.553265');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (25, 13, 2, NULL, '2022-11-28 17:32:48.553265');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (26, 14, 2, NULL, '2022-11-28 17:32:48.553265');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (27, 15, 2, NULL, '2022-11-28 17:32:48.553265');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (28, 12, 3, NULL, '2022-11-28 17:59:56.593083');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (29, 13, 3, NULL, '2022-11-28 17:59:56.593083');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (30, 14, 3, NULL, '2022-11-28 17:59:56.593083');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (31, 15, 3, NULL, '2022-11-28 17:59:56.593083');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (32, 12, 4, NULL, '2022-11-28 18:07:30.458285');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (33, 13, 4, NULL, '2022-11-28 18:07:30.458285');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (34, 14, 4, NULL, '2022-11-28 18:07:30.458285');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (35, 15, 4, NULL, '2022-11-28 18:07:30.458285');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (36, 12, 5, NULL, '2022-11-28 18:08:30.707747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (37, 13, 5, NULL, '2022-11-28 18:08:30.707747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (38, 14, 5, NULL, '2022-11-28 18:08:30.707747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (39, 15, 5, NULL, '2022-11-28 18:08:30.707747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (40, 12, 6, NULL, '2022-11-28 18:08:40.501499');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (41, 13, 6, NULL, '2022-11-28 18:08:40.501499');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (42, 14, 6, NULL, '2022-11-28 18:08:40.501499');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (43, 15, 6, NULL, '2022-11-28 18:08:40.501499');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (44, 12, 7, NULL, '2022-11-28 18:08:47.219201');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (45, 13, 7, NULL, '2022-11-28 18:08:47.219201');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (46, 14, 7, NULL, '2022-11-28 18:08:47.219201');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (47, 15, 7, NULL, '2022-11-28 18:08:47.219201');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (48, 16, 2, NULL, '2022-11-28 18:36:48.693394');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (49, 17, 2, NULL, '2022-11-28 18:36:48.693394');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (50, 18, 2, NULL, '2022-11-28 18:36:48.693394');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (51, 19, 2, NULL, '2022-11-28 18:36:48.693394');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (52, 20, 2, NULL, '2022-11-28 18:36:48.693394');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (53, 21, 2, NULL, '2022-11-28 18:36:48.693394');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (54, 22, 2, NULL, '2022-11-28 18:36:48.693394');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (55, 23, 2, NULL, '2022-11-28 18:36:48.693394');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (56, 16, 3, NULL, '2022-11-29 06:09:10.645581');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (57, 17, 3, NULL, '2022-11-29 06:09:10.645581');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (58, 18, 3, NULL, '2022-11-29 06:09:10.645581');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (59, 19, 3, NULL, '2022-11-29 06:09:10.645581');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (60, 20, 3, NULL, '2022-11-29 06:09:10.645581');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (61, 21, 3, NULL, '2022-11-29 06:09:10.645581');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (62, 22, 3, NULL, '2022-11-29 06:09:10.645581');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (63, 23, 3, NULL, '2022-11-29 06:09:10.645581');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (64, 16, 4, NULL, '2022-11-29 06:09:22.403318');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (65, 17, 4, NULL, '2022-11-29 06:09:22.403318');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (66, 18, 4, NULL, '2022-11-29 06:09:22.403318');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (67, 19, 4, NULL, '2022-11-29 06:09:22.403318');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (68, 20, 4, NULL, '2022-11-29 06:09:22.403318');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (69, 21, 4, NULL, '2022-11-29 06:09:22.403318');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (70, 22, 4, NULL, '2022-11-29 06:09:22.403318');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (71, 23, 4, NULL, '2022-11-29 06:09:22.403318');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (90, 95, 1, NULL, '2023-01-10 13:17:20.355747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (91, 96, 1, NULL, '2023-01-10 13:17:20.355747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (92, 97, 1, NULL, '2023-01-10 13:17:20.355747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (93, 98, 1, NULL, '2023-01-10 13:17:20.355747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (94, 99, 1, NULL, '2023-01-10 13:17:20.355747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (95, 100, 1, NULL, '2023-01-10 13:17:20.355747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (96, 101, 1, NULL, '2023-01-10 13:17:20.355747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (97, 102, 1, NULL, '2023-01-10 13:17:20.355747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (98, 95, 2, NULL, '2023-01-10 13:17:25.967396');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (99, 96, 2, NULL, '2023-01-10 13:17:25.967396');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (100, 97, 2, NULL, '2023-01-10 13:17:25.967396');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (101, 98, 2, NULL, '2023-01-10 13:17:25.967396');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (102, 99, 2, NULL, '2023-01-10 13:17:25.967396');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (103, 100, 2, NULL, '2023-01-10 13:17:25.967396');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (104, 101, 2, NULL, '2023-01-10 13:17:25.967396');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (105, 102, 2, NULL, '2023-01-10 13:17:25.967396');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (106, 95, 3, NULL, '2023-01-10 13:17:31.085093');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (107, 96, 3, NULL, '2023-01-10 13:17:31.085093');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (108, 97, 3, NULL, '2023-01-10 13:17:31.085093');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (109, 98, 3, NULL, '2023-01-10 13:17:31.085093');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (110, 99, 3, NULL, '2023-01-10 13:17:31.085093');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (111, 100, 3, NULL, '2023-01-10 13:17:31.085093');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (112, 101, 3, NULL, '2023-01-10 13:17:31.085093');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (113, 102, 3, NULL, '2023-01-10 13:17:31.085093');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (114, 95, 4, 'first dtep', '2023-01-10 13:25:47.238464');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (115, 96, 4, 'second', '2023-01-10 13:25:47.238464');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (116, 97, 4, 'third', '2023-01-10 13:25:47.238464');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (117, 98, 4, 'fourth', '2023-01-10 13:25:47.238464');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (118, 99, 4, 'fifth', '2023-01-10 13:25:47.238464');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (119, 100, 4, 'sixth', '2023-01-10 13:25:47.238464');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (120, 101, 4, 'seventh', '2023-01-10 13:25:47.238464');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (121, 102, 4, 'eight', '2023-01-10 13:25:47.238464');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (122, 24, 1, NULL, '2023-01-10 17:47:01.9773');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (123, 25, 1, NULL, '2023-01-10 17:47:01.9773');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (124, 26, 1, NULL, '2023-01-10 17:47:01.9773');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (125, 27, 1, NULL, '2023-01-10 17:47:01.9773');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (126, 28, 1, NULL, '2023-01-10 17:47:01.9773');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (127, 29, 1, NULL, '2023-01-10 17:47:01.9773');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (128, 30, 1, NULL, '2023-01-10 17:47:01.9773');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (129, 31, 1, NULL, '2023-01-10 17:47:01.9773');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (130, 32, 1, NULL, '2023-01-10 17:47:01.9773');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (131, 33, 1, NULL, '2023-01-10 17:47:01.9773');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (132, 34, 1, NULL, '2023-01-10 17:47:01.9773');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (133, 35, 1, NULL, '2023-01-10 17:47:01.9773');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (134, 24, 2, NULL, '2023-01-10 17:47:11.003023');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (135, 25, 2, NULL, '2023-01-10 17:47:11.003023');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (136, 26, 2, NULL, '2023-01-10 17:47:11.003023');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (137, 27, 2, NULL, '2023-01-10 17:47:11.003023');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (138, 28, 2, NULL, '2023-01-10 17:47:11.003023');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (139, 29, 2, NULL, '2023-01-10 17:47:11.003023');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (140, 30, 2, NULL, '2023-01-10 17:47:11.003023');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (141, 31, 2, NULL, '2023-01-10 17:47:11.003023');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (142, 32, 2, NULL, '2023-01-10 17:47:11.003023');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (143, 33, 2, NULL, '2023-01-10 17:47:11.003023');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (144, 34, 2, NULL, '2023-01-10 17:47:11.003023');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (145, 35, 2, NULL, '2023-01-10 17:47:11.003023');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (146, 24, 3, NULL, '2023-01-10 17:47:17.208838');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (147, 25, 3, NULL, '2023-01-10 17:47:17.208838');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (148, 26, 3, NULL, '2023-01-10 17:47:17.208838');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (149, 27, 3, NULL, '2023-01-10 17:47:17.208838');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (150, 28, 3, NULL, '2023-01-10 17:47:17.208838');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (151, 29, 3, NULL, '2023-01-10 17:47:17.208838');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (152, 30, 3, NULL, '2023-01-10 17:47:17.208838');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (153, 31, 3, NULL, '2023-01-10 17:47:17.208838');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (154, 32, 3, NULL, '2023-01-10 17:47:17.208838');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (155, 33, 3, NULL, '2023-01-10 17:47:17.208838');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (156, 34, 3, NULL, '2023-01-10 17:47:17.208838');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (157, 35, 3, NULL, '2023-01-10 17:47:17.208838');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (158, 34, 4, 'tedt', '2023-01-10 17:47:59.739747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (159, 35, 4, 'text', '2023-01-10 17:47:59.739747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (160, 24, 4, 'text', '2023-01-10 17:47:59.739747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (161, 25, 4, 'text', '2023-01-10 17:47:59.739747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (162, 26, 4, 'text', '2023-01-10 17:47:59.739747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (163, 27, 4, 'text', '2023-01-10 17:47:59.739747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (164, 28, 4, 'text', '2023-01-10 17:47:59.739747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (165, 29, 4, 'text', '2023-01-10 17:47:59.739747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (166, 30, 4, 'text', '2023-01-10 17:47:59.739747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (167, 31, 4, 'text', '2023-01-10 17:47:59.739747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (168, 32, 4, 'text', '2023-01-10 17:47:59.739747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (169, 33, 4, 'text', '2023-01-10 17:47:59.739747');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (170, 34, 5, 'tedt', '2023-01-11 08:11:18.004188');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (171, 35, 5, 'text', '2023-01-11 08:11:18.004188');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (172, 25, 5, 'text', '2023-01-11 08:11:18.004188');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (173, 26, 5, 'text', '2023-01-11 08:11:18.004188');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (174, 27, 5, 'text', '2023-01-11 08:11:18.004188');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (175, 28, 5, 'text', '2023-01-11 08:11:18.004188');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (176, 29, 5, 'text', '2023-01-11 08:11:18.004188');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (177, 30, 5, 'text', '2023-01-11 08:11:18.004188');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (178, 31, 5, 'text', '2023-01-11 08:11:18.004188');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (179, 32, 5, 'text', '2023-01-11 08:11:18.004188');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (180, 33, 5, 'text', '2023-01-11 08:11:18.004188');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (181, 24, 5, 'text', '2023-01-11 08:11:18.004188');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (182, 34, 6, 'tedt', '2023-01-11 08:11:25.515344');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (183, 35, 6, 'text', '2023-01-11 08:11:25.515344');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (184, 25, 6, 'text', '2023-01-11 08:11:25.515344');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (185, 26, 6, 'text', '2023-01-11 08:11:25.515344');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (186, 27, 6, 'text', '2023-01-11 08:11:25.515344');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (187, 28, 6, 'text', '2023-01-11 08:11:25.515344');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (188, 29, 6, 'text', '2023-01-11 08:11:25.515344');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (189, 30, 6, 'text', '2023-01-11 08:11:25.515344');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (190, 31, 6, 'text', '2023-01-11 08:11:25.515344');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (191, 32, 6, 'text', '2023-01-11 08:11:25.515344');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (192, 33, 6, 'text', '2023-01-11 08:11:25.515344');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (193, 24, 6, 'text', '2023-01-11 08:11:25.515344');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (194, 34, 7, 'tedt', '2023-01-11 08:11:33.189518');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (195, 35, 7, 'text', '2023-01-11 08:11:33.189518');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (196, 25, 7, 'text', '2023-01-11 08:11:33.189518');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (197, 26, 7, 'text', '2023-01-11 08:11:33.189518');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (198, 27, 7, 'text', '2023-01-11 08:11:33.189518');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (199, 28, 7, 'text', '2023-01-11 08:11:33.189518');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (200, 29, 7, 'text', '2023-01-11 08:11:33.189518');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (201, 30, 7, 'text', '2023-01-11 08:11:33.189518');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (202, 31, 7, 'text', '2023-01-11 08:11:33.189518');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (203, 32, 7, 'text', '2023-01-11 08:11:33.189518');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (204, 33, 7, 'text', '2023-01-11 08:11:33.189518');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (205, 24, 7, 'text', '2023-01-11 08:11:33.189518');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (206, 119, 1, NULL, '2023-01-13 12:17:19.231362');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (207, 120, 1, NULL, '2023-01-13 12:17:19.231362');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (208, 121, 1, NULL, '2023-01-13 12:17:19.231362');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (209, 122, 1, NULL, '2023-01-13 12:17:19.231362');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (210, 123, 1, NULL, '2023-01-13 12:17:19.231362');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (211, 124, 1, NULL, '2023-01-13 12:17:19.231362');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (212, 125, 1, NULL, '2023-01-13 12:17:19.231362');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (213, 126, 1, NULL, '2023-01-13 12:17:19.231362');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (214, 127, 1, NULL, '2023-01-13 12:17:19.231362');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (215, 128, 1, NULL, '2023-01-13 12:17:19.231362');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (216, 119, 2, NULL, '2023-01-13 12:17:28.077745');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (217, 120, 2, NULL, '2023-01-13 12:17:28.077745');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (218, 121, 2, NULL, '2023-01-13 12:17:28.077745');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (219, 122, 2, NULL, '2023-01-13 12:17:28.077745');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (220, 123, 2, NULL, '2023-01-13 12:17:28.077745');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (221, 124, 2, NULL, '2023-01-13 12:17:28.077745');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (222, 125, 2, NULL, '2023-01-13 12:17:28.077745');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (223, 126, 2, NULL, '2023-01-13 12:17:28.077745');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (224, 127, 2, NULL, '2023-01-13 12:17:28.077745');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (225, 128, 2, NULL, '2023-01-13 12:17:28.077745');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (226, 119, 3, NULL, '2023-01-13 12:17:36.54227');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (227, 120, 3, NULL, '2023-01-13 12:17:36.54227');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (228, 121, 3, NULL, '2023-01-13 12:17:36.54227');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (229, 122, 3, NULL, '2023-01-13 12:17:36.54227');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (230, 123, 3, NULL, '2023-01-13 12:17:36.54227');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (231, 124, 3, NULL, '2023-01-13 12:17:36.54227');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (232, 125, 3, NULL, '2023-01-13 12:17:36.54227');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (233, 126, 3, NULL, '2023-01-13 12:17:36.54227');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (234, 127, 3, NULL, '2023-01-13 12:17:36.54227');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (235, 128, 3, NULL, '2023-01-13 12:17:36.54227');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (236, 119, 4, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:19:23.739586');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (246, 129, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (237, 120, 4, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:19:23.739586');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (238, 121, 4, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:19:23.739586');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (239, 122, 4, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:19:23.739586');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (240, 123, 4, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:19:23.739586');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (241, 124, 4, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:19:23.739586');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (242, 125, 4, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:19:23.739586');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (243, 126, 4, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:19:23.739586');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (244, 127, 4, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:19:23.739586');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (245, 128, 4, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:19:23.739586');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (333, 129, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (334, 130, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (335, 131, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (336, 132, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (337, 133, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (338, 134, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (339, 135, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (340, 136, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (341, 137, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (342, 138, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (343, 139, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (344, 140, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (345, 141, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (346, 142, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (347, 143, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (348, 144, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (349, 145, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (350, 146, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (351, 147, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (352, 148, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (353, 149, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (354, 150, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (355, 151, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (356, 152, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (357, 153, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (358, 154, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (359, 155, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (360, 156, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (361, 157, 4, NULL, '2023-01-13 12:20:04.080067');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (247, 130, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (248, 131, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (249, 132, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (250, 133, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (251, 134, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (252, 135, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (253, 136, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (254, 137, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (255, 138, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (256, 139, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (257, 140, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (258, 141, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (259, 142, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (260, 143, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (261, 144, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (262, 145, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (263, 146, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (264, 147, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (265, 148, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (266, 149, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (267, 150, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (268, 151, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (269, 152, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (270, 153, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (271, 154, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (272, 155, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (273, 156, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (274, 157, 1, NULL, '2023-01-13 12:19:43.886076');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (275, 129, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (276, 130, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (277, 131, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (278, 132, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (279, 133, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (280, 134, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (281, 135, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (282, 136, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (283, 137, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (284, 138, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (285, 139, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (286, 140, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (287, 141, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (288, 142, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (289, 143, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (290, 144, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (291, 145, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (292, 146, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (293, 147, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (294, 148, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (295, 149, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (296, 150, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (297, 151, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (298, 152, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (299, 153, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (300, 154, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (301, 155, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (302, 156, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (303, 157, 2, NULL, '2023-01-13 12:19:49.94736');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (304, 129, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (305, 130, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (306, 131, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (307, 132, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (308, 133, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (309, 134, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (310, 135, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (311, 136, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (312, 137, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (313, 138, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (314, 139, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (315, 140, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (316, 141, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (317, 142, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (318, 143, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (319, 144, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (320, 145, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (321, 146, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (322, 147, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (323, 148, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (324, 149, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (325, 150, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (326, 151, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (327, 152, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (328, 153, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (329, 154, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (330, 155, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (331, 156, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (332, 157, 3, NULL, '2023-01-13 12:19:56.056219');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (362, 135, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (363, 132, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (364, 140, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.
Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (365, 133, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (366, 136, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (367, 134, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (368, 137, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (369, 139, 5, 'v
Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (370, 138, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (371, 144, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (372, 129, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (373, 130, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (374, 131, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (375, 141, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (376, 142, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (377, 143, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (378, 145, 5, 'v
Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (379, 149, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (380, 146, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (381, 147, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (382, 150, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (383, 148, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (384, 153, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (385, 151, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (386, 157, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (387, 154, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (388, 152, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (389, 155, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');
INSERT INTO public.progress (id, verse_id, step_id, text, created_at) OVERRIDING SYSTEM VALUE VALUES (390, 156, 5, 'v
Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', '2023-01-13 12:21:29.70267');


--
-- Data for Name: project_coordinators; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.project_coordinators (id, project_id, user_id) OVERRIDING SYSTEM VALUE VALUES (1, 1, '1dfaa269-2eda-41c4-9a71-72db8cbd6db2');


--
-- Data for Name: project_translators; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.project_translators (id, project_id, is_moderator, user_id) OVERRIDING SYSTEM VALUE VALUES (1, 1, false, '1dfaa269-2eda-41c4-9a71-72db8cbd6db2');
INSERT INTO public.project_translators (id, project_id, is_moderator, user_id) OVERRIDING SYSTEM VALUE VALUES (2, 1, false, 'b75a51d5-ee4d-4ea0-afa3-2366d7716742');
INSERT INTO public.project_translators (id, project_id, is_moderator, user_id) OVERRIDING SYSTEM VALUE VALUES (3, 1, false, 'e63f8dfb-53a4-43ec-9fd9-510b27c1b7ad');


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.projects (id, title, code, language_id, type, resources, method, base_manifest, dictionaries_alphabet) OVERRIDING SYSTEM VALUE VALUES (1, 'test22', 'en_test', 1, 'bible', '{"simplified":{"owner":"unfoldingWord","repo":"en_ust","commit":"1459487d93349d5d7fa4501ec2dd864d7476fc89","manifest":{"dublin_core":{"conformsto":"rc0.2","contributor":["Nicholas Alsop","Larry T Brooks, M.Div., Assemblies of God Theological Seminary","Matt Carlton","George “Drew” Curley, M.Div., PhD, Professor of Biblical Languages","Paul M Fahnestock, M.Div. Reformed Theological Seminary, D. Min. Pittsburgh Theological Seminary","Michael Francis","Laura Glassel, MA in Bible Translation","Kailey Gregory","Jesse Griffin, BA Biblical Studies, MA Biblical Languages","C. Harry Harriss, M.Div.","Alrick G. Headley, M.Div., Th.M.","Bram van den Heuvel, M.A.","John Huffman","D. Allen Hutchison, MA in Old Testament, MA in New Testament","Robert Hunt","Demsin Lachin","Jack Messarra","Gene Mullen","Adam W. Nagelvoort, M.Div. Academic Ministries, Columbia International University","Timothy Neu, Ph.D. Biblical Studies","Kristy Nickell","Tom Nickell","Elizabeth Oakes, BA in Religious Studies, Linguistics","Perry Oakes, PhD in Old Testament, MA in Linguistics","James N. Pohlig, M.Div., MA in Linguistics, D. Litt. in Biblical Languages","Ward Pyles, M.Div., Western Baptist Theological Seminary","Susan Quigley, MA in Linguistics","Dean Ropp","Joel D. Ruark, M.A.Th., Th.M., Ph.D. in Old Testament, University of Stellenbosch","Larry Sallee, Th.M Dallas Theological Seminary, D.Min. Columbia Biblical Seminary","Peter Smircich, BA Philosophy","Christopher Smith, M.A.T.S. Gordon-Conwell Theological Seminary, Ph.D. Boston College","Leonard Smith","Dave Statezni, BA Orig langs., M.Div. Fuller Theological Seminary","David Trombold, M. Div.","James Vigen","Hendrik “Henry” de Vries","Thomas Warren, M.Div., Trinity Evangelical Divinity School, D.Min, Reformed Theological Seminary","Angela Westmoreland, M.A. in Theological Studies (Biblical Language track)","Henry Whitney, BA Linguistics","Benjamin Wright, MA Applied Linguistics, Dallas International University","Door43 World Missions Community"],"creator":"Door43 World Missions Community","description":"An open-licensed translation, intended to provide a ‘functional’ understanding of the Bible. It increases the translator’s understanding of the text by translating theological terms as descriptive phrases.","format":"text/usfm3","identifier":"ust","issued":"2022-10-11","language":{"direction":"ltr","identifier":"en","title":"English"},"modified":"2022-10-11","publisher":"unfoldingWord","relation":["en/tw?v=36","en/tq?v=38","en/tn?v=66"],"rights":"CC BY-SA 4.0","source":[{"identifier":"t4t","language":"en","version":"2014"},{"identifier":"uhb","language":"hbo","version":"2.1.26"},{"identifier":"ugnt","language":"el-x-koine","version":"0.26"},{"identifier":"ust","language":"en","version":"35"}],"subject":"Aligned Bible","title":"unfoldingWord® Simplified Text","type":"bundle","version":"40"},"checking":{"checking_entity":["unfoldingWord"],"checking_level":"3"},"projects":[{"title":"Genesis","versification":"ufw","identifier":"gen","sort":1,"path":"./01-GEN.usfm","categories":["bible-ot"]},{"title":"Exodus","versification":"ufw","identifier":"exo","sort":2,"path":"./02-EXO.usfm","categories":["bible-ot"]},{"title":"Leviticus","versification":"ufw","identifier":"lev","sort":3,"path":"./03-LEV.usfm","categories":["bible-ot"]},{"title":"Numbers","versification":"ufw","identifier":"num","sort":4,"path":"./04-NUM.usfm","categories":["bible-ot"]},{"title":"Deuteronomy","versification":"ufw","identifier":"deu","sort":5,"path":"./05-DEU.usfm","categories":["bible-ot"]},{"title":"Joshua","versification":"ufw","identifier":"jos","sort":6,"path":"./06-JOS.usfm","categories":["bible-ot"]},{"title":"Judges","versification":"ufw","identifier":"jdg","sort":7,"path":"./07-JDG.usfm","categories":["bible-ot"]},{"title":"Ruth","versification":"ufw","identifier":"rut","sort":8,"path":"./08-RUT.usfm","categories":["bible-ot"]},{"title":"1 Samuel","versification":"ufw","identifier":"1sa","sort":9,"path":"./09-1SA.usfm","categories":["bible-ot"]},{"title":"2 Samuel","versification":"ufw","identifier":"2sa","sort":10,"path":"./10-2SA.usfm","categories":["bible-ot"]},{"title":"1 Kings","versification":"ufw","identifier":"1ki","sort":11,"path":"./11-1KI.usfm","categories":["bible-ot"]},{"title":"2 Kings","versification":"ufw","identifier":"2ki","sort":12,"path":"./12-2KI.usfm","categories":["bible-ot"]},{"title":"1 Chronicles","versification":"ufw","identifier":"1ch","sort":13,"path":"./13-1CH.usfm","categories":["bible-ot"]},{"title":"2 Chronicles","versification":"ufw","identifier":"2ch","sort":14,"path":"./14-2CH.usfm","categories":["bible-ot"]},{"title":"Ezra","versification":"ufw","identifier":"ezr","sort":15,"path":"./15-EZR.usfm","categories":["bible-ot"]},{"title":"Nehemiah","versification":"ufw","identifier":"neh","sort":16,"path":"./16-NEH.usfm","categories":["bible-ot"]},{"title":"Esther","versification":"ufw","identifier":"est","sort":17,"path":"./17-EST.usfm","categories":["bible-ot"]},{"title":"Job","versification":"ufw","identifier":"job","sort":18,"path":"./18-JOB.usfm","categories":["bible-ot"]},{"title":"Psalms","versification":"ufw","identifier":"psa","sort":19,"path":"./19-PSA.usfm","categories":["bible-ot"]},{"title":"Proverbs","versification":"ufw","identifier":"pro","sort":20,"path":"./20-PRO.usfm","categories":["bible-ot"]},{"title":"Ecclesiastes","versification":"ufw","identifier":"ecc","sort":21,"path":"./21-ECC.usfm","categories":["bible-ot"]},{"title":"Song of Solomon","versification":"ufw","identifier":"sng","sort":22,"path":"./22-SNG.usfm","categories":["bible-ot"]},{"title":"Isaiah","versification":"ufw","identifier":"isa","sort":23,"path":"./23-ISA.usfm","categories":["bible-ot"]},{"title":"Jeremiah","versification":"ufw","identifier":"jer","sort":24,"path":"./24-JER.usfm","categories":["bible-ot"]},{"title":"Lamentations","versification":"ufw","identifier":"lam","sort":25,"path":"./25-LAM.usfm","categories":["bible-ot"]},{"title":"Ezekiel","versification":"ufw","identifier":"ezk","sort":26,"path":"./26-EZK.usfm","categories":["bible-ot"]},{"title":"Daniel","versification":"ufw","identifier":"dan","sort":27,"path":"./27-DAN.usfm","categories":["bible-ot"]},{"title":"Hosea","versification":"ufw","identifier":"hos","sort":28,"path":"./28-HOS.usfm","categories":["bible-ot"]},{"title":"Joel","versification":"ufw","identifier":"jol","sort":29,"path":"./29-JOL.usfm","categories":["bible-ot"]},{"title":"Amos","versification":"ufw","identifier":"amo","sort":30,"path":"./30-AMO.usfm","categories":["bible-ot"]},{"title":"Obadiah","versification":"ufw","identifier":"oba","sort":31,"path":"./31-OBA.usfm","categories":["bible-ot"]},{"title":"Jonah","versification":"ufw","identifier":"jon","sort":32,"path":"./32-JON.usfm","categories":["bible-ot"]},{"title":"Micah","versification":"ufw","identifier":"mic","sort":33,"path":"./33-MIC.usfm","categories":["bible-ot"]},{"title":"Nahum","versification":"ufw","identifier":"nam","sort":34,"path":"./34-NAM.usfm","categories":["bible-ot"]},{"title":"Habakkuk","versification":"ufw","identifier":"hab","sort":35,"path":"./35-HAB.usfm","categories":["bible-ot"]},{"title":"Zephaniah","versification":"ufw","identifier":"zep","sort":36,"path":"./36-ZEP.usfm","categories":["bible-ot"]},{"title":"Haggai","versification":"ufw","identifier":"hag","sort":37,"path":"./37-HAG.usfm","categories":["bible-ot"]},{"title":"Zechariah","versification":"ufw","identifier":"zec","sort":38,"path":"./38-ZEC.usfm","categories":["bible-ot"]},{"title":"Malachi","versification":"ufw","identifier":"mal","sort":39,"path":"./39-MAL.usfm","categories":["bible-ot"]},{"title":"Matthew","versification":"ufw","identifier":"mat","sort":40,"path":"./41-MAT.usfm","categories":["bible-nt"]},{"title":"Mark","versification":"ufw","identifier":"mrk","sort":41,"path":"./42-MRK.usfm","categories":["bible-nt"]},{"title":"Luke","versification":"ufw","identifier":"luk","sort":42,"path":"./43-LUK.usfm","categories":["bible-nt"]},{"title":"John","versification":"ufw","identifier":"jhn","sort":43,"path":"./44-JHN.usfm","categories":["bible-nt"]},{"title":"Acts","versification":"ufw","identifier":"act","sort":44,"path":"./45-ACT.usfm","categories":["bible-nt"]},{"title":"Romans","versification":"ufw","identifier":"rom","sort":45,"path":"./46-ROM.usfm","categories":["bible-nt"]},{"title":"1 Corinthians","versification":"ufw","identifier":"1co","sort":46,"path":"./47-1CO.usfm","categories":["bible-nt"]},{"title":"2 Corinthians","versification":"ufw","identifier":"2co","sort":47,"path":"./48-2CO.usfm","categories":["bible-nt"]},{"title":"Galatians","versification":"ufw","identifier":"gal","sort":48,"path":"./49-GAL.usfm","categories":["bible-nt"]},{"title":"Ephesians","versification":"ufw","identifier":"eph","sort":49,"path":"./50-EPH.usfm","categories":["bible-nt"]},{"title":"Philippians","versification":"ufw","identifier":"php","sort":50,"path":"./51-PHP.usfm","categories":["bible-nt"]},{"title":"Colossians","versification":"ufw","identifier":"col","sort":51,"path":"./52-COL.usfm","categories":["bible-nt"]},{"title":"1 Thessalonians","versification":"ufw","identifier":"1th","sort":52,"path":"./53-1TH.usfm","categories":["bible-nt"]},{"title":"2 Thessalonians","versification":"ufw","identifier":"2th","sort":53,"path":"./54-2TH.usfm","categories":["bible-nt"]},{"title":"1 Timothy","versification":"ufw","identifier":"1ti","sort":54,"path":"./55-1TI.usfm","categories":["bible-nt"]},{"title":"2 Timothy","versification":"ufw","identifier":"2ti","sort":55,"path":"./56-2TI.usfm","categories":["bible-nt"]},{"title":"Titus","versification":"ufw","identifier":"tit","sort":56,"path":"./57-TIT.usfm","categories":["bible-nt"]},{"title":"Philemon","versification":"ufw","identifier":"phm","sort":57,"path":"./58-PHM.usfm","categories":["bible-nt"]},{"title":"Hebrews","versification":"ufw","identifier":"heb","sort":58,"path":"./59-HEB.usfm","categories":["bible-nt"]},{"title":"James","versification":"ufw","identifier":"jas","sort":59,"path":"./60-JAS.usfm","categories":["bible-nt"]},{"title":"1 Peter","versification":"ufw","identifier":"1pe","sort":60,"path":"./61-1PE.usfm","categories":["bible-nt"]},{"title":"2 Peter","versification":"ufw","identifier":"2pe","sort":61,"path":"./62-2PE.usfm","categories":["bible-nt"]},{"title":"1 John","versification":"ufw","identifier":"1jn","sort":62,"path":"./63-1JN.usfm","categories":["bible-nt"]},{"title":"2 John","versification":"ufw","identifier":"2jn","sort":63,"path":"./64-2JN.usfm","categories":["bible-nt"]},{"title":"3 John","versification":"ufw","identifier":"3jn","sort":64,"path":"./65-3JN.usfm","categories":["bible-nt"]},{"title":"Jude","versification":"ufw","identifier":"jud","sort":65,"path":"./66-JUD.usfm","categories":["bible-nt"]},{"title":"Revelation","versification":"ufw","identifier":"rev","sort":66,"path":"./67-REV.usfm","categories":["bible-nt"]}]}},"literal":{"owner":"unfoldingWord","repo":"en_ult","commit":"067c19a79e089914e2ce31f7c7dc67ef6be76abd","manifest":{"dublin_core":{"conformsto":"rc0.2","contributor":["Nicholas Alsop","Scott Bayer","Larry T Brooks, M.Div., Assemblies of God Theological Seminary","Matt Carlton","George “Drew” Curley, M.Div., PhD, Professor of Biblical Languages","Dan Dennison","Jamie Duguid","Paul M Fahnestock, M.Div. Reformed Theological Seminary, D.Min. Pittsburgh Theological Seminary","Michael Francis","Laura Glassel, MA in Bible Translation","Jesse Griffin, BA Biblical Studies, MA Biblical Languages","Jesse Harris","C. Harry Harriss, M.Div.","Alrick G. Headley, M.Div., Th.M.","Bram van den Heuvel, M.A.","John Huffman","D. Allen Hutchison, MA in Old Testament, MA in New Testament","Jack Messarra","Gene Mullen","Adam W. Nagelvoort, M.Div. Academic Ministries, Columbia International University","Timothy Neu, Ph.D. Biblical Studies","Kristy Nickell","Tom Nickell","Elizabeth Oakes, BA in Religious Studies, Linguistics","Perry Oakes, PhD in Old Testament, MA in Linguistics","James N. Pohlig, M.Div., MA in Linguistics, D. Litt. in Biblical Languages","Ward Pyles, M.Div., Western Baptist Theological Seminary","Susan Quigley, MA in Linguistics","Dean Ropp","Joel D. Ruark, M.A.Th., Th.M., Ph.D. in Old Testament, University of Stellenbosch","Larry Sallee, Th.M Dallas Theological Seminary, D.Min. Columbia Biblical Seminary","Peter Smircich, BA Philosophy","Doug Smith, M.T.S., M.Div., Th.M., Midwestern Baptist Theological Seminary","Leonard Smith","Suzanna Smith","Tim Span","Dave Statezni, BA Orig langs., M.Div. Fuller Theological Seminary","Maria Tijerina","David Trombold, M. Div.","Aaron Valdizan, M.Div., Th.M. in Old Testament, The Masters Seminary","James Vigen","Hendrik “Henry” de Vries","Thomas Warren, M.Div., Trinity Evangelical Divinity School, D.Min, Reformed Theological Seminary","Angela Westmoreland, M.A. in Theological Studies (Biblical Language track)","Henry Whitney, BA Linguistics","Benjamin Wright, MA Applied Linguistics, Dallas International University","Grant Ailie, BA Biblical Studies, M.Div.","Door43 World Missions Community"],"creator":"unfoldingWord","description":"An open-licensed update of the ASV, intended to provide a ‘form-centric’ understanding of the Bible. It increases the translator''s understanding of the lexical and grammatical composition of the underlying text by adhering closely to the word order and structure of the originals.","format":"text/usfm3","identifier":"ult","issued":"2022-10-11","language":{"direction":"ltr","identifier":"en","title":"English"},"modified":"2022-10-11","publisher":"unfoldingWord","relation":["en/tw?v=36","en/tq?v=38","en/tn?v=66","el-x-koine/ugnt?v=0.30","hbo/uhb?v=2.1.30"],"rights":"CC BY-SA 4.0","source":[{"identifier":"asv","language":"en","version":"1901"},{"identifier":"uhb","language":"hbo","version":"2.1.26"},{"identifier":"ugnt","language":"el-x-koine","version":"0.26"},{"identifier":"ult","language":"en","version":"36"}],"subject":"Aligned Bible","title":"unfoldingWord® Literal Text","type":"bundle","version":"41"},"checking":{"checking_entity":["unfoldingWord"],"checking_level":"3"},"projects":[{"title":"Front Matter","versification":"ufw","identifier":"frt","sort":0,"path":"./A0-FRT.usfm","categories":["bible-frt"]},{"title":"Genesis","versification":"ufw","identifier":"gen","sort":1,"path":"./01-GEN.usfm","categories":["bible-ot"]},{"title":"Exodus","versification":"ufw","identifier":"exo","sort":2,"path":"./02-EXO.usfm","categories":["bible-ot"]},{"title":"Leviticus","versification":"ufw","identifier":"lev","sort":3,"path":"./03-LEV.usfm","categories":["bible-ot"]},{"title":"Numbers","versification":"ufw","identifier":"num","sort":4,"path":"./04-NUM.usfm","categories":["bible-ot"]},{"title":"Deuteronomy","versification":"ufw","identifier":"deu","sort":5,"path":"./05-DEU.usfm","categories":["bible-ot"]},{"title":"Joshua","versification":"ufw","identifier":"jos","sort":6,"path":"./06-JOS.usfm","categories":["bible-ot"]},{"title":"Judges","versification":"ufw","identifier":"jdg","sort":7,"path":"./07-JDG.usfm","categories":["bible-ot"]},{"title":"Ruth","versification":"ufw","identifier":"rut","sort":8,"path":"./08-RUT.usfm","categories":["bible-ot"]},{"title":"1 Samuel","versification":"ufw","identifier":"1sa","sort":9,"path":"./09-1SA.usfm","categories":["bible-ot"]},{"title":"2 Samuel","versification":"ufw","identifier":"2sa","sort":10,"path":"./10-2SA.usfm","categories":["bible-ot"]},{"title":"1 Kings","versification":"ufw","identifier":"1ki","sort":11,"path":"./11-1KI.usfm","categories":["bible-ot"]},{"title":"2 Kings","versification":"ufw","identifier":"2ki","sort":12,"path":"./12-2KI.usfm","categories":["bible-ot"]},{"title":"1 Chronicles","versification":"ufw","identifier":"1ch","sort":13,"path":"./13-1CH.usfm","categories":["bible-ot"]},{"title":"2 Chronicles","versification":"ufw","identifier":"2ch","sort":14,"path":"./14-2CH.usfm","categories":["bible-ot"]},{"title":"Ezra","versification":"ufw","identifier":"ezr","sort":15,"path":"./15-EZR.usfm","categories":["bible-ot"]},{"title":"Nehemiah","versification":"ufw","identifier":"neh","sort":16,"path":"./16-NEH.usfm","categories":["bible-ot"]},{"title":"Esther","versification":"ufw","identifier":"est","sort":17,"path":"./17-EST.usfm","categories":["bible-ot"]},{"title":"Job","versification":"ufw","identifier":"job","sort":18,"path":"./18-JOB.usfm","categories":["bible-ot"]},{"title":"Psalms","versification":"ufw","identifier":"psa","sort":19,"path":"./19-PSA.usfm","categories":["bible-ot"]},{"title":"Proverbs","versification":"ufw","identifier":"pro","sort":20,"path":"./20-PRO.usfm","categories":["bible-ot"]},{"title":"Ecclesiastes","versification":"ufw","identifier":"ecc","sort":21,"path":"./21-ECC.usfm","categories":["bible-ot"]},{"title":"Song of Solomon","versification":"ufw","identifier":"sng","sort":22,"path":"./22-SNG.usfm","categories":["bible-ot"]},{"title":"Isaiah","versification":"ufw","identifier":"isa","sort":23,"path":"./23-ISA.usfm","categories":["bible-ot"]},{"title":"Jeremiah","versification":"ufw","identifier":"jer","sort":24,"path":"./24-JER.usfm","categories":["bible-ot"]},{"title":"Lamentations","versification":"ufw","identifier":"lam","sort":25,"path":"./25-LAM.usfm","categories":["bible-ot"]},{"title":"Ezekiel","versification":"ufw","identifier":"ezk","sort":26,"path":"./26-EZK.usfm","categories":["bible-ot"]},{"title":"Daniel","versification":"ufw","identifier":"dan","sort":27,"path":"./27-DAN.usfm","categories":["bible-ot"]},{"title":"Hosea","versification":"ufw","identifier":"hos","sort":28,"path":"./28-HOS.usfm","categories":["bible-ot"]},{"title":"Joel","versification":"ufw","identifier":"jol","sort":29,"path":"./29-JOL.usfm","categories":["bible-ot"]},{"title":"Amos","versification":"ufw","identifier":"amo","sort":30,"path":"./30-AMO.usfm","categories":["bible-ot"]},{"title":"Obadiah","versification":"ufw","identifier":"oba","sort":31,"path":"./31-OBA.usfm","categories":["bible-ot"]},{"title":"Jonah","versification":"ufw","identifier":"jon","sort":32,"path":"./32-JON.usfm","categories":["bible-ot"]},{"title":"Micah","versification":"ufw","identifier":"mic","sort":33,"path":"./33-MIC.usfm","categories":["bible-ot"]},{"title":"Nahum","versification":"ufw","identifier":"nam","sort":34,"path":"./34-NAM.usfm","categories":["bible-ot"]},{"title":"Habakkuk","versification":"ufw","identifier":"hab","sort":35,"path":"./35-HAB.usfm","categories":["bible-ot"]},{"title":"Zephaniah","versification":"ufw","identifier":"zep","sort":36,"path":"./36-ZEP.usfm","categories":["bible-ot"]},{"title":"Haggai","versification":"ufw","identifier":"hag","sort":37,"path":"./37-HAG.usfm","categories":["bible-ot"]},{"title":"Zechariah","versification":"ufw","identifier":"zec","sort":38,"path":"./38-ZEC.usfm","categories":["bible-ot"]},{"title":"Malachi","versification":"ufw","identifier":"mal","sort":39,"path":"./39-MAL.usfm","categories":["bible-ot"]},{"title":"Matthew","versification":"ufw","identifier":"mat","sort":40,"path":"./41-MAT.usfm","categories":["bible-nt"]},{"title":"Mark","versification":"ufw","identifier":"mrk","sort":41,"path":"./42-MRK.usfm","categories":["bible-nt"]},{"title":"Luke","versification":"ufw","identifier":"luk","sort":42,"path":"./43-LUK.usfm","categories":["bible-nt"]},{"title":"John","versification":"ufw","identifier":"jhn","sort":43,"path":"./44-JHN.usfm","categories":["bible-nt"]},{"title":"Acts","versification":"ufw","identifier":"act","sort":44,"path":"./45-ACT.usfm","categories":["bible-nt"]},{"title":"Romans","versification":"ufw","identifier":"rom","sort":45,"path":"./46-ROM.usfm","categories":["bible-nt"]},{"title":"1 Corinthians","versification":"ufw","identifier":"1co","sort":46,"path":"./47-1CO.usfm","categories":["bible-nt"]},{"title":"2 Corinthians","versification":"ufw","identifier":"2co","sort":47,"path":"./48-2CO.usfm","categories":["bible-nt"]},{"title":"Galatians","versification":"ufw","identifier":"gal","sort":48,"path":"./49-GAL.usfm","categories":["bible-nt"]},{"title":"Ephesians","versification":"ufw","identifier":"eph","sort":49,"path":"./50-EPH.usfm","categories":["bible-nt"]},{"title":"Philippians","versification":"ufw","identifier":"php","sort":50,"path":"./51-PHP.usfm","categories":["bible-nt"]},{"title":"Colossians","versification":"ufw","identifier":"col","sort":51,"path":"./52-COL.usfm","categories":["bible-nt"]},{"title":"1 Thessalonians","versification":"ufw","identifier":"1th","sort":52,"path":"./53-1TH.usfm","categories":["bible-nt"]},{"title":"2 Thessalonians","versification":"ufw","identifier":"2th","sort":53,"path":"./54-2TH.usfm","categories":["bible-nt"]},{"title":"1 Timothy","versification":"ufw","identifier":"1ti","sort":54,"path":"./55-1TI.usfm","categories":["bible-nt"]},{"title":"2 Timothy","versification":"ufw","identifier":"2ti","sort":55,"path":"./56-2TI.usfm","categories":["bible-nt"]},{"title":"Titus","versification":"ufw","identifier":"tit","sort":56,"path":"./57-TIT.usfm","categories":["bible-nt"]},{"title":"Philemon","versification":"ufw","identifier":"phm","sort":57,"path":"./58-PHM.usfm","categories":["bible-nt"]},{"title":"Hebrews","versification":"ufw","identifier":"heb","sort":58,"path":"./59-HEB.usfm","categories":["bible-nt"]},{"title":"James","versification":"ufw","identifier":"jas","sort":59,"path":"./60-JAS.usfm","categories":["bible-nt"]},{"title":"1 Peter","versification":"ufw","identifier":"1pe","sort":60,"path":"./61-1PE.usfm","categories":["bible-nt"]},{"title":"2 Peter","versification":"ufw","identifier":"2pe","sort":61,"path":"./62-2PE.usfm","categories":["bible-nt"]},{"title":"1 John","versification":"ufw","identifier":"1jn","sort":62,"path":"./63-1JN.usfm","categories":["bible-nt"]},{"title":"2 John","versification":"ufw","identifier":"2jn","sort":63,"path":"./64-2JN.usfm","categories":["bible-nt"]},{"title":"3 John","versification":"ufw","identifier":"3jn","sort":64,"path":"./65-3JN.usfm","categories":["bible-nt"]},{"title":"Jude","versification":"ufw","identifier":"jud","sort":65,"path":"./66-JUD.usfm","categories":["bible-nt"]},{"title":"Revelation","versification":"ufw","identifier":"rev","sort":66,"path":"./67-REV.usfm","categories":["bible-nt"]}]}},"tnotes":{"owner":"unfoldingWord","repo":"en_tn","commit":"c725c9c72e171d7c78c5efe87dc4fa25e8e23fea","manifest":{"dublin_core":{"conformsto":"rc0.2","contributor":["Door43 World Missions Community","Aaron Fenlason","Abner Bauman","Adam Van Goor","Alan Bird","Alan Borkenhagen","Alfred Van Dellen","Alice Wright","Allen Bair","Allyson Presswood Nance","Amanda Adams","Andrew Belcher","Andrew Johnson","Andrew Rice","Angelo Palo","Anita Moreau","April Linton","Aurora Lee","Barbara Summers","Barbara White","Becky Hancock","Beryl Carpenter","Bethany Fenlason","Betty Forbes","Bianca Elliott","Bill Cleveland","Bill Pruett","Bob Britting","Bram van den Heuvel","Brian Metzger","Bruce Bridges","Bruce Collier","Bruce Smith","Caleb Worgess","Carlyle Kilmore","Carol Pace","Carol Heim","Caroline Crawford","Caroline Fleming","Caroline S Wong","Carol Lee","Carol Moyer","Carolyn Lafferty","Catherine C Newton","Charese Jackson","Charlotte Gibson","Charlotte Hobbs","Cheryl A Chojnacki","Cheryl Stieben","Cheryl Warren","Christian Berry","Christine Harrison","Clairmene Pascal","Connie Bryan","Connie Goss","Craig Balden","Craig Lins","Craig Scott","Cynthia J Puckett","Dale Hahs","Dale Masser","Daniel Lauk","Daniel Summers","Darlene M Hopkins","Darlene Silas","David Boerschlein","David F Withee","David Glover","David J Forbes","David Mullen","David N Hanley","David Sandlin","David Shortess","David Smith","David Whisler","Debbie Nispel","Debbie Piper","Deborah Bartow","Deborah Bush","Deborah Miniard","Dennis Jackson","Dianne Forrest","Donna Borkenhagen","Donna Mullis","Douglas Hayes","Drew Curley","Ed Davis","Edgar Navera","Edward Kosky","Edward Quigley","Elaine VanRegenmorter","Elizabeth Nataly Silvestre Herbas","Ellen Lee","Emeline Thermidor","Emily Lee","Esther Roman","Esther Trew","Esther Zirk","Ethel Lynn Baker","Evangeline Puen","Evelyn Wildgust","Fletcher Coleman","Freda Dibble","Gail Spell","Gary Greer","Gary Shogren","Gay Ellen Stulp","Gene Gossman","George Arlyn Briggs","Gerald L. Naughton","Glen Tallent","Grace Balwit","Grace Bird","Greg Stoffregen","Gretchen Stencil","Hallie Miller","Harry Harriss","Heather Hicks","Helen Morse","Hendrik deVries","Henry Bult","Henry Whitney","Hilary O''Sullivan","Ibrahim Audu","Ines Gipson","Irene J Dodson","Jackie Jones","Jacqueline Bartley","James Giddens","James Pedersen","James Pohlig","James Roe","Janet O''Herron","Janice Connor","Jaqueline Rotruck","Jeanette Friesen","Jeff Graf","Jeff Kennedy","Jeff Martin","Jennifer Cunneen","Jenny Thomas","Jerry Lund","Jessica Lauk","Jim Frederick","Jim Lee","Jimmy Warren","Jim Rotruck","Jim Swartzentruber","Jody Garcia","Joe Chater","Joel Bryan","Joey Howell","John Anderson","John Geddis","John D Rogers","John Hutchins","John Luton","John Pace","John P Tornifolio","Jolene Valeu","Jon Haahr","Joseph Fithian","Joseph Greene","Joseph Wharton","Joshua Berkowitz","Joshua Calhoun","Joshua Rister","Josh Wondra","Joy Anderson","Joyce Jacobs","Joyce Pedersen","JT Crowder","Judi Brodeen","Judith Cline","Judith C Yon","Julia N Bult","Patty Li","Julie Susanto","Kahar Barat","Kannahi Sellers","Kara Anderson","Karen Davie","Karen Dreesen","Karen Fabean","Karen Riecks","Karen Smith","Karen Turner","Kathleen Glover","Kathryn Hendrix","Kathy Mentink","Katrina Geurink","Kay Myers","Kelly Strong","Ken Haugh","Kim Puterbaugh","Kristin Butts Page","Kristin Rinne","Kwesi Opoku-debrah","Langston Spell","Larry Sallee","Lawrence Lipe","Lee Sipe","Leonard Smith","Lester Harper","Lia Hadley","Linda Buckman","Linda Dale Barton","Linda Havemeier","Linda Homer","Linda Lee Sebastien","Linn Peterson","Liz Dakota","Lloyd Box","Luis Keelin","Madeline Kilmore","Maggie D Paul","Marc Nelson","Mardi Welo","Margo Hoffman","Marilyn Cook","Marjean Swann","Marjorie Francis","Mark Albertini","Mark Chapman","Mark Thomas","Marselene Norton","Mary Jane Davis","Mary Jean Stout","Mary Landon","Mary Scarborough","Megan Kidwell","Melissa Roe","Merton Dibble","Meseret Abraham-Zemede","Michael Bush","Michael Connor","Michael Francis","Michael Geurink","Mike Tisdell","Mickey White","Miel Horrilleno","Monique Greer","Morgan Mellette","Morris Anderson","Nancy C. Naughton","Nancy Neu","Nancy VanCott","Neal Snook","Nicholas Scovil","Nick Dettman","Nils Friberg","Noah Crabtree","Pamela B Johnston","Pamela Nungesser","Pamela Roberts","Pam Gullifer","Pat Ankney","Pat Giddens","Patricia Brougher","Patricia Carson","Patricia Cleveland","Patricia Foster","Patricia Middlebrooks","Paul Mellema","Paula Carlson","Paula Oestreich","Paul Holloway","Paul Nungesser","Peggy Anderson","Peggyrose Swartzentruber","Peter Polloni","Phillip Harms","Phyllis Mortensen","Priscilla Enggren","Rachel Agheyisi","Rachel Ropp","Raif Turner","Ray Puen","Reina Y Mora","Rene Bahrenfuss","Renee Triplett","Rhonda Bartels","Richard Beatty","Richard Moreau","Richard Rutter","Richard Stevens","Rick Keaton","Robby Little","Robert W Johnson","Rochelle Hook","Rodney White","Rolaine Franz","Ronald D Hook","Rosario Baria","Roxann Carey","Roxanne Pittard","Ruben Michael Garay","Russell Isham","Russ Perry","Ruth Calo","Ruth E Withee","Ruth Montgomery","Ryan Blizek","Sam Todd","Samuel Njuguna","Sandy Anderson","Sandy Blanes","Sara Giesmann","Sara Van Cott (Barnes)","Sharon Johnson","Sharon Peterson","Sharon Shortess","Shelly Harms","Sherie Nelson","Sherman Sebastien","Sherry Mosher","Stacey Swanson","Steve Gibbs","Steve Mercier","Susan Langohr","Susan Quigley","Susan Snook","Suzanne Richards","Sylvia Thomas","Sze Suze Lau","Tabitha Price","Tammy L Enns","Tammy White","Teresa Everett-Leone","Teresa Linn","Terri Collins","Theresa Baker","Thomas Jopling","Thomas Nickell","Thomas Warren","Tim Coleman","Tim Ingram","Tim Linn","Tim Lovestrand","Tim Mentink","Tom Penry","Tom William Warren","Toni Shuma","Tracie Pogue","Tricia Coffman","Vicki Ivester","Victoria G DeKraker","Victor M Prieto","Vivian Kamph","Vivian Richardson","Ward Pyles","Warren Blaisdell","Wayne Homer","Wendy Coleman","Wendy Colon","Wilbur Zirk","Wil Gipson","William Carson","William Cline","William Dickerson","William Smitherman","William Wilder","Yvonne Tallent"],"creator":"Door43 World Missions Community","description":"Open-licensed exegetical notes that provide historical, cultural, and linguistic information for translators. It provides translators and checkers with pertinent, just-in-time information to help them make the best possible translation decisions.","format":"text/tsv","identifier":"tn","issued":"2022-10-11","language":{"direction":"ltr","identifier":"en","title":"English"},"modified":"2022-10-11","publisher":"unfoldingWord","relation":["en/ult?v=41","en/ust?v=40","hbo/uhb?v=2.1.30","el-x-koine/ugnt?v=0.30","en/ta?v=33","en/tq?v=38","en/tw?v=36"],"rights":"CC BY-SA 4.0","source":[{"identifier":"tn","language":"en","version":"61"}],"subject":"TSV Translation Notes","title":"unfoldingWord® Translation Notes","type":"help","version":"66"},"checking":{"checking_entity":["unfoldingWord"],"checking_level":"3"},"projects":[{"title":"Genesis","versification":"ufw","identifier":"gen","sort":1,"path":"./en_tn_01-GEN.tsv","categories":["bible-ot"]},{"title":"Exodus","versification":"ufw","identifier":"exo","sort":2,"path":"./en_tn_02-EXO.tsv","categories":["bible-ot"]},{"title":"Leviticus","versification":"ufw","identifier":"lev","sort":3,"path":"./en_tn_03-LEV.tsv","categories":["bible-ot"]},{"title":"Numbers","versification":"ufw","identifier":"num","sort":4,"path":"./en_tn_04-NUM.tsv","categories":["bible-ot"]},{"title":"Deuteronomy","versification":"ufw","identifier":"deu","sort":5,"path":"./en_tn_05-DEU.tsv","categories":["bible-ot"]},{"title":"Joshua","versification":"ufw","identifier":"jos","sort":6,"path":"./en_tn_06-JOS.tsv","categories":["bible-ot"]},{"title":"Judges","versification":"ufw","identifier":"jdg","sort":7,"path":"./en_tn_07-JDG.tsv","categories":["bible-ot"]},{"title":"Ruth","versification":"ufw","identifier":"rut","sort":8,"path":"./en_tn_08-RUT.tsv","categories":["bible-ot"]},{"title":"1 Samuel","versification":"ufw","identifier":"1sa","sort":9,"path":"./en_tn_09-1SA.tsv","categories":["bible-ot"]},{"title":"2 Samuel","versification":"ufw","identifier":"2sa","sort":10,"path":"./en_tn_10-2SA.tsv","categories":["bible-ot"]},{"title":"1 Kings","versification":"ufw","identifier":"1ki","sort":11,"path":"./en_tn_11-1KI.tsv","categories":["bible-ot"]},{"title":"2 Kings","versification":"ufw","identifier":"2ki","sort":12,"path":"./en_tn_12-2KI.tsv","categories":["bible-ot"]},{"title":"1 Chronicles","versification":"ufw","identifier":"1ch","sort":13,"path":"./en_tn_13-1CH.tsv","categories":["bible-ot"]},{"title":"2 Chronicles","versification":"ufw","identifier":"2ch","sort":14,"path":"./en_tn_14-2CH.tsv","categories":["bible-ot"]},{"title":"Ezra","versification":"ufw","identifier":"ezr","sort":15,"path":"./en_tn_15-EZR.tsv","categories":["bible-ot"]},{"title":"Nehemiah","versification":"ufw","identifier":"neh","sort":16,"path":"./en_tn_16-NEH.tsv","categories":["bible-ot"]},{"title":"Esther","versification":"ufw","identifier":"est","sort":17,"path":"./en_tn_17-EST.tsv","categories":["bible-ot"]},{"title":"Job","versification":"ufw","identifier":"job","sort":18,"path":"./en_tn_18-JOB.tsv","categories":["bible-ot"]},{"title":"Psalms","versification":"ufw","identifier":"psa","sort":19,"path":"./en_tn_19-PSA.tsv","categories":["bible-ot"]},{"title":"Proverbs","versification":"ufw","identifier":"pro","sort":20,"path":"./en_tn_20-PRO.tsv","categories":["bible-ot"]},{"title":"Ecclesiastes","versification":"ufw","identifier":"ecc","sort":21,"path":"./en_tn_21-ECC.tsv","categories":["bible-ot"]},{"title":"Song of Solomon","versification":"ufw","identifier":"sng","sort":22,"path":"./en_tn_22-SNG.tsv","categories":["bible-ot"]},{"title":"Isaiah","versification":"ufw","identifier":"isa","sort":23,"path":"./en_tn_23-ISA.tsv","categories":["bible-ot"]},{"title":"Jeremiah","versification":"ufw","identifier":"jer","sort":24,"path":"./en_tn_24-JER.tsv","categories":["bible-ot"]},{"title":"Lamentations","versification":"ufw","identifier":"lam","sort":25,"path":"./en_tn_25-LAM.tsv","categories":["bible-ot"]},{"title":"Ezekiel","versification":"ufw","identifier":"ezk","sort":26,"path":"./en_tn_26-EZK.tsv","categories":["bible-ot"]},{"title":"Daniel","versification":"ufw","identifier":"dan","sort":27,"path":"./en_tn_27-DAN.tsv","categories":["bible-ot"]},{"title":"Hosea","versification":"ufw","identifier":"hos","sort":28,"path":"./en_tn_28-HOS.tsv","categories":["bible-ot"]},{"title":"Joel","versification":"ufw","identifier":"jol","sort":29,"path":"./en_tn_29-JOL.tsv","categories":["bible-ot"]},{"title":"Amos","versification":"ufw","identifier":"amo","sort":30,"path":"./en_tn_30-AMO.tsv","categories":["bible-ot"]},{"title":"Obadiah","versification":"ufw","identifier":"oba","sort":31,"path":"./en_tn_31-OBA.tsv","categories":["bible-ot"]},{"title":"Jonah","versification":"ufw","identifier":"jon","sort":32,"path":"./en_tn_32-JON.tsv","categories":["bible-ot"]},{"title":"Micah","versification":"ufw","identifier":"mic","sort":33,"path":"./en_tn_33-MIC.tsv","categories":["bible-ot"]},{"title":"Nahum","versification":"ufw","identifier":"nam","sort":34,"path":"./en_tn_34-NAM.tsv","categories":["bible-ot"]},{"title":"Habakkuk","versification":"ufw","identifier":"hab","sort":35,"path":"./en_tn_35-HAB.tsv","categories":["bible-ot"]},{"title":"Zephaniah","versification":"ufw","identifier":"zep","sort":36,"path":"./en_tn_36-ZEP.tsv","categories":["bible-ot"]},{"title":"Haggai","versification":"ufw","identifier":"hag","sort":37,"path":"./en_tn_37-HAG.tsv","categories":["bible-ot"]},{"title":"Zechariah","versification":"ufw","identifier":"zec","sort":38,"path":"./en_tn_38-ZEC.tsv","categories":["bible-ot"]},{"title":"Malachi","versification":"ufw","identifier":"mal","sort":39,"path":"./en_tn_39-MAL.tsv","categories":["bible-ot"]},{"title":"Matthew","versification":"ufw","identifier":"mat","sort":40,"path":"./en_tn_41-MAT.tsv","categories":["bible-nt"]},{"title":"Mark","versification":"ufw","identifier":"mrk","sort":41,"path":"./en_tn_42-MRK.tsv","categories":["bible-nt"]},{"title":"Luke","versification":"ufw","identifier":"luk","sort":42,"path":"./en_tn_43-LUK.tsv","categories":["bible-nt"]},{"title":"John","versification":"ufw","identifier":"jhn","sort":43,"path":"./en_tn_44-JHN.tsv","categories":["bible-nt"]},{"title":"Acts","versification":"ufw","identifier":"act","sort":44,"path":"./en_tn_45-ACT.tsv","categories":["bible-nt"]},{"title":"Romans","versification":"ufw","identifier":"rom","sort":45,"path":"./en_tn_46-ROM.tsv","categories":["bible-nt"]},{"title":"1 Corinthians","versification":"ufw","identifier":"1co","sort":46,"path":"./en_tn_47-1CO.tsv","categories":["bible-nt"]},{"title":"2 Corinthians","versification":"ufw","identifier":"2co","sort":47,"path":"./en_tn_48-2CO.tsv","categories":["bible-nt"]},{"title":"Galatians","versification":"ufw","identifier":"gal","sort":48,"path":"./en_tn_49-GAL.tsv","categories":["bible-nt"]},{"title":"Ephesians","versification":"ufw","identifier":"eph","sort":49,"path":"./en_tn_50-EPH.tsv","categories":["bible-nt"]},{"title":"Philippians","versification":"ufw","identifier":"php","sort":50,"path":"./en_tn_51-PHP.tsv","categories":["bible-nt"]},{"title":"Colossians","versification":"ufw","identifier":"col","sort":51,"path":"./en_tn_52-COL.tsv","categories":["bible-nt"]},{"title":"1 Thessalonians","versification":"ufw","identifier":"1th","sort":52,"path":"./en_tn_53-1TH.tsv","categories":["bible-nt"]},{"title":"2 Thessalonians","versification":"ufw","identifier":"2th","sort":53,"path":"./en_tn_54-2TH.tsv","categories":["bible-nt"]},{"title":"1 Timothy","versification":"ufw","identifier":"1ti","sort":54,"path":"./en_tn_55-1TI.tsv","categories":["bible-nt"]},{"title":"2 Timothy","versification":"ufw","identifier":"2ti","sort":55,"path":"./en_tn_56-2TI.tsv","categories":["bible-nt"]},{"title":"Titus","versification":"ufw","identifier":"tit","sort":56,"path":"./en_tn_57-TIT.tsv","categories":["bible-nt"]},{"title":"Philemon","versification":"ufw","identifier":"phm","sort":57,"path":"./en_tn_58-PHM.tsv","categories":["bible-nt"]},{"title":"Hebrews","versification":"ufw","identifier":"heb","sort":58,"path":"./en_tn_59-HEB.tsv","categories":["bible-nt"]},{"title":"James","versification":"ufw","identifier":"jas","sort":59,"path":"./en_tn_60-JAS.tsv","categories":["bible-nt"]},{"title":"1 Peter","versification":"ufw","identifier":"1pe","sort":60,"path":"./en_tn_61-1PE.tsv","categories":["bible-nt"]},{"title":"2 Peter","versification":"ufw","identifier":"2pe","sort":61,"path":"./en_tn_62-2PE.tsv","categories":["bible-nt"]},{"title":"1 John","versification":"ufw","identifier":"1jn","sort":62,"path":"./en_tn_63-1JN.tsv","categories":["bible-nt"]},{"title":"2 John","versification":"ufw","identifier":"2jn","sort":63,"path":"./en_tn_64-2JN.tsv","categories":["bible-nt"]},{"title":"3 John","versification":"ufw","identifier":"3jn","sort":64,"path":"./en_tn_65-3JN.tsv","categories":["bible-nt"]},{"title":"Jude","versification":"ufw","identifier":"jud","sort":65,"path":"./en_tn_66-JUD.tsv","categories":["bible-nt"]},{"title":"Revelation","versification":"ufw","identifier":"rev","sort":66,"path":"./en_tn_67-REV.tsv","categories":["bible-nt"]}]}},"tquestions":{"owner":"unfoldingWord","repo":"en_tq","commit":"cc4908a3d8e3ef6f4d9665ee859a8e0ffb95845e","manifest":{"dublin_core":{"conformsto":"rc0.2","contributor":["Larry Sallee (Th.M Dallas Theological Seminary, D.Min. Columbia Biblical Seminary)","Perry Oakes (BA Biblical Studies, Taylor University; MA Theology, Fuller Seminary; MA Linguistics, University of Texas at Arlington; PhD Old Testament, Southwestern Baptist Theological Seminary)","Joel D. Ruark (M.A.Th. Gordon-Conwell Theological Seminary; Th.M. Stellenbosch University; Ph.D. Candidate in Old Testament Studies, Stellenbosch University)","Jesse Griffin (BA Biblical Studies, Liberty University; MA Biblical Languages, Gordon-Conwell Theological Seminary)","Susan Quigley, MA in Linguistics","Jerrell Hein","Cheryl Stauter","Deb Richey","Don Ritchey","Gena Schottmuller","Irene Little","Marsha Rogne","Pat Naber","Randy Stauter","Russ Isham","Vickey DeKraker","Door43 World Missions Community"],"creator":"Door43 World Missions Community","description":"Comprehension and theological questions for each chapter of the Bible. It enables translators and translation checkers to confirm that the intended meaning of their translations is clearly communicated to the speakers of that language.","format":"text/tsv","identifier":"tq","issued":"2022-10-11","language":{"direction":"ltr","identifier":"en","title":"English"},"modified":"2022-10-11","publisher":"unfoldingWord","relation":["en/ult?v=41","en/ust?v=40","hbo/uhb?v=2.1.30","el-x-koine/ugnt?v=0.30","en/ta?v=33","en/tn?v=66","en/tw?v=36"],"rights":"CC BY-SA 4.0","source":[{"identifier":"tq","language":"en","version":"33"}],"subject":"TSV Translation Questions","title":"unfoldingWord® Translation Questions","type":"help","version":"38"},"checking":{"checking_entity":["unfoldingWord"],"checking_level":"3"},"projects":[{"title":"Genesis","versification":"ufw","identifier":"gen","sort":1,"path":"./tq_GEN.tsv","categories":["bible-ot"]},{"title":"Exodus","versification":"ufw","identifier":"exo","sort":2,"path":"./tq_EXO.tsv","categories":["bible-ot"]},{"title":"Leviticus","versification":"ufw","identifier":"lev","sort":3,"path":"./tq_LEV.tsv","categories":["bible-ot"]},{"title":"Numbers","versification":"ufw","identifier":"num","sort":4,"path":"./tq_NUM.tsv","categories":["bible-ot"]},{"title":"Deuteronomy","versification":"ufw","identifier":"deu","sort":5,"path":"./tq_DEU.tsv","categories":["bible-ot"]},{"title":"Joshua","versification":"ufw","identifier":"jos","sort":6,"path":"./tq_JOS.tsv","categories":["bible-ot"]},{"title":"Judges","versification":"ufw","identifier":"jdg","sort":7,"path":"./tq_JDG.tsv","categories":["bible-ot"]},{"title":"Ruth","versification":"ufw","identifier":"rut","sort":8,"path":"./tq_RUT.tsv","categories":["bible-ot"]},{"title":"1 Samuel","versification":"ufw","identifier":"1sa","sort":9,"path":"./tq_1SA.tsv","categories":["bible-ot"]},{"title":"2 Samuel","versification":"ufw","identifier":"2sa","sort":10,"path":"./tq_2SA.tsv","categories":["bible-ot"]},{"title":"1 Kings","versification":"ufw","identifier":"1ki","sort":11,"path":"./tq_1KI.tsv","categories":["bible-ot"]},{"title":"2 Kings","versification":"ufw","identifier":"2ki","sort":12,"path":"./tq_2KI.tsv","categories":["bible-ot"]},{"title":"1 Chronicles","versification":"ufw","identifier":"1ch","sort":13,"path":"./tq_1CH.tsv","categories":["bible-ot"]},{"title":"2 Chronicles","versification":"ufw","identifier":"2ch","sort":14,"path":"./tq_2CH.tsv","categories":["bible-ot"]},{"title":"Ezra","versification":"ufw","identifier":"ezr","sort":15,"path":"./tq_EZR.tsv","categories":["bible-ot"]},{"title":"Nehemiah","versification":"ufw","identifier":"neh","sort":16,"path":"./tq_NEH.tsv","categories":["bible-ot"]},{"title":"Esther","versification":"ufw","identifier":"est","sort":17,"path":"./tq_EST.tsv","categories":["bible-ot"]},{"title":"Job","versification":"ufw","identifier":"job","sort":18,"path":"./tq_JOB.tsv","categories":["bible-ot"]},{"title":"Psalms","versification":"ufw","identifier":"psa","sort":19,"path":"./tq_PSA.tsv","categories":["bible-ot"]},{"title":"Proverbs","versification":"ufw","identifier":"pro","sort":20,"path":"./tq_PRO.tsv","categories":["bible-ot"]},{"title":"Ecclesiastes","versification":"ufw","identifier":"ecc","sort":21,"path":"./tq_ECC.tsv","categories":["bible-ot"]},{"title":"Song of Solomon","versification":"ufw","identifier":"sng","sort":22,"path":"./tq_SNG.tsv","categories":["bible-ot"]},{"title":"Isaiah","versification":"ufw","identifier":"isa","sort":23,"path":"./tq_ISA.tsv","categories":["bible-ot"]},{"title":"Jeremiah","versification":"ufw","identifier":"jer","sort":24,"path":"./tq_JER.tsv","categories":["bible-ot"]},{"title":"Lamentations","versification":"ufw","identifier":"lam","sort":25,"path":"./tq_LAM.tsv","categories":["bible-ot"]},{"title":"Ezekiel","versification":"ufw","identifier":"ezk","sort":26,"path":"./tq_EZK.tsv","categories":["bible-ot"]},{"title":"Daniel","versification":"ufw","identifier":"dan","sort":27,"path":"./tq_DAN.tsv","categories":["bible-ot"]},{"title":"Hosea","versification":"ufw","identifier":"hos","sort":28,"path":"./tq_HOS.tsv","categories":["bible-ot"]},{"title":"Joel","versification":"ufw","identifier":"jol","sort":29,"path":"./tq_JOL.tsv","categories":["bible-ot"]},{"title":"Amos","versification":"ufw","identifier":"amo","sort":30,"path":"./tq_AMO.tsv","categories":["bible-ot"]},{"title":"Obadiah","versification":"ufw","identifier":"oba","sort":31,"path":"./tq_OBA.tsv","categories":["bible-ot"]},{"title":"Jonah","versification":"ufw","identifier":"jon","sort":32,"path":"./tq_JON.tsv","categories":["bible-ot"]},{"title":"Micah","versification":"ufw","identifier":"mic","sort":33,"path":"./tq_MIC.tsv","categories":["bible-ot"]},{"title":"Nahum","versification":"ufw","identifier":"nam","sort":34,"path":"./tq_NAM.tsv","categories":["bible-ot"]},{"title":"Habakkuk","versification":"ufw","identifier":"hab","sort":35,"path":"./tq_HAB.tsv","categories":["bible-ot"]},{"title":"Zephaniah","versification":"ufw","identifier":"zep","sort":36,"path":"./tq_ZEP.tsv","categories":["bible-ot"]},{"title":"Haggai","versification":"ufw","identifier":"hag","sort":37,"path":"./tq_HAG.tsv","categories":["bible-ot"]},{"title":"Zechariah","versification":"ufw","identifier":"zec","sort":38,"path":"./tq_ZEC.tsv","categories":["bible-ot"]},{"title":"Malachi","versification":"ufw","identifier":"mal","sort":39,"path":"./tq_MAL.tsv","categories":["bible-ot"]},{"title":"Matthew","versification":"ufw","identifier":"mat","sort":40,"path":"./tq_MAT.tsv","categories":["bible-nt"]},{"title":"Mark","versification":"ufw","identifier":"mrk","sort":41,"path":"./tq_MRK.tsv","categories":["bible-nt"]},{"title":"Luke","versification":"ufw","identifier":"luk","sort":42,"path":"./tq_LUK.tsv","categories":["bible-nt"]},{"title":"John","versification":"ufw","identifier":"jhn","sort":43,"path":"./tq_JHN.tsv","categories":["bible-nt"]},{"title":"Acts","versification":"ufw","identifier":"act","sort":44,"path":"./tq_ACT.tsv","categories":["bible-nt"]},{"title":"Romans","versification":"ufw","identifier":"rom","sort":45,"path":"./tq_ROM.tsv","categories":["bible-nt"]},{"title":"1 Corinthians","versification":"ufw","identifier":"1co","sort":46,"path":"./tq_1CO.tsv","categories":["bible-nt"]},{"title":"2 Corinthians","versification":"ufw","identifier":"2co","sort":47,"path":"./tq_2CO.tsv","categories":["bible-nt"]},{"title":"Galatians","versification":"ufw","identifier":"gal","sort":48,"path":"./tq_GAL.tsv","categories":["bible-nt"]},{"title":"Ephesians","versification":"ufw","identifier":"eph","sort":49,"path":"./tq_EPH.tsv","categories":["bible-nt"]},{"title":"Philippians","versification":"ufw","identifier":"php","sort":50,"path":"./tq_PHP.tsv","categories":["bible-nt"]},{"title":"Colossians","versification":"ufw","identifier":"col","sort":51,"path":"./tq_COL.tsv","categories":["bible-nt"]},{"title":"1 Thessalonians","versification":"ufw","identifier":"1th","sort":52,"path":"./tq_1TH.tsv","categories":["bible-nt"]},{"title":"2 Thessalonians","versification":"ufw","identifier":"2th","sort":53,"path":"./tq_2TH.tsv","categories":["bible-nt"]},{"title":"1 Timothy","versification":"ufw","identifier":"1ti","sort":54,"path":"./tq_1TI.tsv","categories":["bible-nt"]},{"title":"2 Timothy","versification":"ufw","identifier":"2ti","sort":55,"path":"./tq_2TI.tsv","categories":["bible-nt"]},{"title":"Titus","versification":"ufw","identifier":"tit","sort":56,"path":"./tq_TIT.tsv","categories":["bible-nt"]},{"title":"Philemon","versification":"ufw","identifier":"phm","sort":57,"path":"./tq_PHM.tsv","categories":["bible-nt"]},{"title":"Hebrews","versification":"ufw","identifier":"heb","sort":58,"path":"./tq_HEB.tsv","categories":["bible-nt"]},{"title":"James","versification":"ufw","identifier":"jas","sort":59,"path":"./tq_JAS.tsv","categories":["bible-nt"]},{"title":"1 Peter","versification":"ufw","identifier":"1pe","sort":60,"path":"./tq_1PE.tsv","categories":["bible-nt"]},{"title":"2 Peter","versification":"ufw","identifier":"2pe","sort":61,"path":"./tq_2PE.tsv","categories":["bible-nt"]},{"title":"1 John","versification":"ufw","identifier":"1jn","sort":62,"path":"./tq_1JN.tsv","categories":["bible-nt"]},{"title":"2 John","versification":"ufw","identifier":"2jn","sort":63,"path":"./tq_2JN.tsv","categories":["bible-nt"]},{"title":"3 John","versification":"ufw","identifier":"3jn","sort":64,"path":"./tq_3JN.tsv","categories":["bible-nt"]},{"title":"Jude","versification":"ufw","identifier":"jud","sort":65,"path":"./tq_JUD.tsv","categories":["bible-nt"]},{"title":"Revelation","versification":"ufw","identifier":"rev","sort":66,"path":"./tq_REV.tsv","categories":["bible-nt"]}]}},"twords":{"owner":"unfoldingWord","repo":"en_twl","commit":"91f9b4aa713165570db304d9ae79c310043f7651","manifest":{"dublin_core":{"conformsto":"rc0.2","contributor":["Door43 World Missions Community","Jesse Griffin (BA Biblical Studies, Liberty University; MA Biblical Languages, Gordon-Conwell Theological Seminary)","Perry Oakes (BA Biblical Studies, Taylor University; MA Theology, Fuller Seminary; MA Linguistics, University of Texas at Arlington; PhD Old Testament, Southwestern Baptist Theological Seminary)","Larry Sallee (Th.M Dallas Theological Seminary, D.Min. Columbia Biblical Seminary)","Joel D. Ruark (M.A.Th. Gordon-Conwell Theological Seminary; Th.M. Stellenbosch University; Ph.D. Candidate in Old Testament Studies, Stellenbosch University)"],"creator":"Door43 World Missions Community","description":"Open-licensed links from particular original languages words to Translation Words articles.","format":"text/tsv","identifier":"twl","issued":"2022-10-11","language":{"direction":"ltr","identifier":"en","title":"English"},"modified":"2022-10-11","publisher":"unfoldingWord","relation":["el-x-koine/ugnt?v=0.30","hbo/uhb?v=2.1.30"],"rights":"CC BY-SA 4.0","source":[{"identifier":"twl","language":"en","version":"13"}],"subject":"TSV Translation Words Links","title":"unfoldingWord® Translation Words Links","type":"help","version":"18"},"checking":{"checking_entity":["unfoldingWord"],"checking_level":"3"},"projects":[{"title":"Genesis","versification":"ufw","identifier":"gen","sort":1,"path":"./twl_GEN.tsv","categories":["bible-ot"]},{"title":"Exodus","versification":"ufw","identifier":"exo","sort":2,"path":"./twl_EXO.tsv","categories":["bible-ot"]},{"title":"Leviticus","versification":"ufw","identifier":"lev","sort":3,"path":"./twl_LEV.tsv","categories":["bible-ot"]},{"title":"Numbers","versification":"ufw","identifier":"num","sort":4,"path":"./twl_NUM.tsv","categories":["bible-ot"]},{"title":"Deuteronomy","versification":"ufw","identifier":"deu","sort":5,"path":"./twl_DEU.tsv","categories":["bible-ot"]},{"title":"Joshua","versification":"ufw","identifier":"jos","sort":6,"path":"./twl_JOS.tsv","categories":["bible-ot"]},{"title":"Judges","versification":"ufw","identifier":"jdg","sort":7,"path":"./twl_JDG.tsv","categories":["bible-ot"]},{"title":"Ruth","versification":"ufw","identifier":"rut","sort":8,"path":"./twl_RUT.tsv","categories":["bible-ot"]},{"title":"1 Samuel","versification":"ufw","identifier":"1sa","sort":9,"path":"./twl_1SA.tsv","categories":["bible-ot"]},{"title":"2 Samuel","versification":"ufw","identifier":"2sa","sort":10,"path":"./twl_2SA.tsv","categories":["bible-ot"]},{"title":"1 Kings","versification":"ufw","identifier":"1ki","sort":11,"path":"./twl_1KI.tsv","categories":["bible-ot"]},{"title":"2 Kings","versification":"ufw","identifier":"2ki","sort":12,"path":"./twl_2KI.tsv","categories":["bible-ot"]},{"title":"1 Chronicles","versification":"ufw","identifier":"1ch","sort":13,"path":"./twl_1CH.tsv","categories":["bible-ot"]},{"title":"2 Chronicles","versification":"ufw","identifier":"2ch","sort":14,"path":"./twl_2CH.tsv","categories":["bible-ot"]},{"title":"Ezra","versification":"ufw","identifier":"ezr","sort":15,"path":"./twl_EZR.tsv","categories":["bible-ot"]},{"title":"Nehemiah","versification":"ufw","identifier":"neh","sort":16,"path":"./twl_NEH.tsv","categories":["bible-ot"]},{"title":"Esther","versification":"ufw","identifier":"est","sort":17,"path":"./twl_EST.tsv","categories":["bible-ot"]},{"title":"Job","versification":"ufw","identifier":"job","sort":18,"path":"./twl_JOB.tsv","categories":["bible-ot"]},{"title":"Psalms","versification":"ufw","identifier":"psa","sort":19,"path":"./twl_PSA.tsv","categories":["bible-ot"]},{"title":"Proverbs","versification":"ufw","identifier":"pro","sort":20,"path":"./twl_PRO.tsv","categories":["bible-ot"]},{"title":"Ecclesiastes","versification":"ufw","identifier":"ecc","sort":21,"path":"./twl_ECC.tsv","categories":["bible-ot"]},{"title":"Song of Solomon","versification":"ufw","identifier":"sng","sort":22,"path":"./twl_SNG.tsv","categories":["bible-ot"]},{"title":"Isaiah","versification":"ufw","identifier":"isa","sort":23,"path":"./twl_ISA.tsv","categories":["bible-ot"]},{"title":"Jeremiah","versification":"ufw","identifier":"jer","sort":24,"path":"./twl_JER.tsv","categories":["bible-ot"]},{"title":"Lamentations","versification":"ufw","identifier":"lam","sort":25,"path":"./twl_LAM.tsv","categories":["bible-ot"]},{"title":"Ezekiel","versification":"ufw","identifier":"ezk","sort":26,"path":"./twl_EZK.tsv","categories":["bible-ot"]},{"title":"Daniel","versification":"ufw","identifier":"dan","sort":27,"path":"./twl_DAN.tsv","categories":["bible-ot"]},{"title":"Hosea","versification":"ufw","identifier":"hos","sort":28,"path":"./twl_HOS.tsv","categories":["bible-ot"]},{"title":"Joel","versification":"ufw","identifier":"jol","sort":29,"path":"./twl_JOL.tsv","categories":["bible-ot"]},{"title":"Amos","versification":"ufw","identifier":"amo","sort":30,"path":"./twl_AMO.tsv","categories":["bible-ot"]},{"title":"Obadiah","versification":"ufw","identifier":"oba","sort":31,"path":"./twl_OBA.tsv","categories":["bible-ot"]},{"title":"Jonah","versification":"ufw","identifier":"jon","sort":32,"path":"./twl_JON.tsv","categories":["bible-ot"]},{"title":"Micah","versification":"ufw","identifier":"mic","sort":33,"path":"./twl_MIC.tsv","categories":["bible-ot"]},{"title":"Nahum","versification":"ufw","identifier":"nam","sort":34,"path":"./twl_NAM.tsv","categories":["bible-ot"]},{"title":"Habakkuk","versification":"ufw","identifier":"hab","sort":35,"path":"./twl_HAB.tsv","categories":["bible-ot"]},{"title":"Zephaniah","versification":"ufw","identifier":"zep","sort":36,"path":"./twl_ZEP.tsv","categories":["bible-ot"]},{"title":"Haggai","versification":"ufw","identifier":"hag","sort":37,"path":"./twl_HAG.tsv","categories":["bible-ot"]},{"title":"Zechariah","versification":"ufw","identifier":"zec","sort":38,"path":"./twl_ZEC.tsv","categories":["bible-ot"]},{"title":"Malachi","versification":"ufw","identifier":"mal","sort":39,"path":"./twl_MAL.tsv","categories":["bible-ot"]},{"title":"Matthew","versification":"ufw","identifier":"mat","sort":40,"path":"./twl_MAT.tsv","categories":["bible-nt"]},{"title":"Mark","versification":"ufw","identifier":"mrk","sort":41,"path":"./twl_MRK.tsv","categories":["bible-nt"]},{"title":"Luke","versification":"ufw","identifier":"luk","sort":42,"path":"./twl_LUK.tsv","categories":["bible-nt"]},{"title":"John","versification":"ufw","identifier":"jhn","sort":43,"path":"./twl_JHN.tsv","categories":["bible-nt"]},{"title":"Acts","versification":"ufw","identifier":"act","sort":44,"path":"./twl_ACT.tsv","categories":["bible-nt"]},{"title":"Romans","versification":"ufw","identifier":"rom","sort":45,"path":"./twl_ROM.tsv","categories":["bible-nt"]},{"title":"1 Corinthians","versification":"ufw","identifier":"1co","sort":46,"path":"./twl_1CO.tsv","categories":["bible-nt"]},{"title":"2 Corinthians","versification":"ufw","identifier":"2co","sort":47,"path":"./twl_2CO.tsv","categories":["bible-nt"]},{"title":"Galatians","versification":"ufw","identifier":"gal","sort":48,"path":"./twl_GAL.tsv","categories":["bible-nt"]},{"title":"Ephesians","versification":"ufw","identifier":"eph","sort":49,"path":"./twl_EPH.tsv","categories":["bible-nt"]},{"title":"Philippians","versification":"ufw","identifier":"php","sort":50,"path":"./twl_PHP.tsv","categories":["bible-nt"]},{"title":"Colossians","versification":"ufw","identifier":"col","sort":51,"path":"./twl_COL.tsv","categories":["bible-nt"]},{"title":"1 Thessalonians","versification":"ufw","identifier":"1th","sort":52,"path":"./twl_1TH.tsv","categories":["bible-nt"]},{"title":"2 Thessalonians","versification":"ufw","identifier":"2th","sort":53,"path":"./twl_2TH.tsv","categories":["bible-nt"]},{"title":"1 Timothy","versification":"ufw","identifier":"1ti","sort":54,"path":"./twl_1TI.tsv","categories":["bible-nt"]},{"title":"2 Timothy","versification":"ufw","identifier":"2ti","sort":55,"path":"./twl_2TI.tsv","categories":["bible-nt"]},{"title":"Titus","versification":"ufw","identifier":"tit","sort":56,"path":"./twl_TIT.tsv","categories":["bible-nt"]},{"title":"Philemon","versification":"ufw","identifier":"phm","sort":57,"path":"./twl_PHM.tsv","categories":["bible-nt"]},{"title":"Hebrews","versification":"ufw","identifier":"heb","sort":58,"path":"./twl_HEB.tsv","categories":["bible-nt"]},{"title":"James","versification":"ufw","identifier":"jas","sort":59,"path":"./twl_JAS.tsv","categories":["bible-nt"]},{"title":"1 Peter","versification":"ufw","identifier":"1pe","sort":60,"path":"./twl_1PE.tsv","categories":["bible-nt"]},{"title":"2 Peter","versification":"ufw","identifier":"2pe","sort":61,"path":"./twl_2PE.tsv","categories":["bible-nt"]},{"title":"1 John","versification":"ufw","identifier":"1jn","sort":62,"path":"./twl_1JN.tsv","categories":["bible-nt"]},{"title":"2 John","versification":"ufw","identifier":"2jn","sort":63,"path":"./twl_2JN.tsv","categories":["bible-nt"]},{"title":"3 John","versification":"ufw","identifier":"3jn","sort":64,"path":"./twl_3JN.tsv","categories":["bible-nt"]},{"title":"Jude","versification":"ufw","identifier":"jud","sort":65,"path":"./twl_JUD.tsv","categories":["bible-nt"]},{"title":"Revelation","versification":"ufw","identifier":"rev","sort":66,"path":"./twl_REV.tsv","categories":["bible-nt"]}]}}}', 'CANA Bible', '{"resource":"literal","books":[{"name":"frt","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/A0-FRT.usfm"},{"name":"gen","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/01-GEN.usfm"},{"name":"exo","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/02-EXO.usfm"},{"name":"lev","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/03-LEV.usfm"},{"name":"num","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/04-NUM.usfm"},{"name":"deu","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/05-DEU.usfm"},{"name":"jos","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/06-JOS.usfm"},{"name":"jdg","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/07-JDG.usfm"},{"name":"rut","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/08-RUT.usfm"},{"name":"1sa","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/09-1SA.usfm"},{"name":"2sa","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/10-2SA.usfm"},{"name":"1ki","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/11-1KI.usfm"},{"name":"2ki","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/12-2KI.usfm"},{"name":"1ch","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/13-1CH.usfm"},{"name":"2ch","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/14-2CH.usfm"},{"name":"ezr","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/15-EZR.usfm"},{"name":"neh","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/16-NEH.usfm"},{"name":"est","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/17-EST.usfm"},{"name":"job","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/18-JOB.usfm"},{"name":"psa","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/19-PSA.usfm"},{"name":"pro","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/20-PRO.usfm"},{"name":"ecc","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/21-ECC.usfm"},{"name":"sng","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/22-SNG.usfm"},{"name":"isa","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/23-ISA.usfm"},{"name":"jer","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/24-JER.usfm"},{"name":"lam","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/25-LAM.usfm"},{"name":"ezk","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/26-EZK.usfm"},{"name":"dan","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/27-DAN.usfm"},{"name":"hos","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/28-HOS.usfm"},{"name":"jol","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/29-JOL.usfm"},{"name":"amo","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/30-AMO.usfm"},{"name":"oba","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/31-OBA.usfm"},{"name":"jon","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/32-JON.usfm"},{"name":"mic","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/33-MIC.usfm"},{"name":"nam","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/34-NAM.usfm"},{"name":"hab","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/35-HAB.usfm"},{"name":"zep","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/36-ZEP.usfm"},{"name":"hag","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/37-HAG.usfm"},{"name":"zec","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/38-ZEC.usfm"},{"name":"mal","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/39-MAL.usfm"},{"name":"mat","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/41-MAT.usfm"},{"name":"mrk","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/42-MRK.usfm"},{"name":"luk","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/43-LUK.usfm"},{"name":"jhn","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/44-JHN.usfm"},{"name":"act","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/45-ACT.usfm"},{"name":"rom","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/46-ROM.usfm"},{"name":"1co","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/47-1CO.usfm"},{"name":"2co","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/48-2CO.usfm"},{"name":"gal","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/49-GAL.usfm"},{"name":"eph","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/50-EPH.usfm"},{"name":"php","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/51-PHP.usfm"},{"name":"col","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/52-COL.usfm"},{"name":"1th","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/53-1TH.usfm"},{"name":"2th","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/54-2TH.usfm"},{"name":"1ti","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/55-1TI.usfm"},{"name":"2ti","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/56-2TI.usfm"},{"name":"tit","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/57-TIT.usfm"},{"name":"phm","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/58-PHM.usfm"},{"name":"heb","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/59-HEB.usfm"},{"name":"jas","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/60-JAS.usfm"},{"name":"1pe","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/61-1PE.usfm"},{"name":"2pe","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/62-2PE.usfm"},{"name":"1jn","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/63-1JN.usfm"},{"name":"2jn","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/64-2JN.usfm"},{"name":"3jn","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/65-3JN.usfm"},{"name":"jud","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/66-JUD.usfm"},{"name":"rev","link":"https://git.door43.org/unfoldingWord/en_ult/raw/commit/067c19a79e089914e2ce31f7c7dc67ef6be76abd/67-REV.usfm"}]}', '["5", "2", "н", "с", "1", "4", "e", "[", "3", "8", "в", "а", "б", "Я", "М"]');


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.role_permissions (id, role, permission) OVERRIDING SYSTEM VALUE VALUES (1, 'moderator', 'dictionaries');
INSERT INTO public.role_permissions (id, role, permission) OVERRIDING SYSTEM VALUE VALUES (2, 'moderator', 'notes');
INSERT INTO public.role_permissions (id, role, permission) OVERRIDING SYSTEM VALUE VALUES (3, 'moderator', 'translator.set');
INSERT INTO public.role_permissions (id, role, permission) OVERRIDING SYSTEM VALUE VALUES (4, 'coordinator', 'dictionaries');
INSERT INTO public.role_permissions (id, role, permission) OVERRIDING SYSTEM VALUE VALUES (5, 'coordinator', 'notes');
INSERT INTO public.role_permissions (id, role, permission) OVERRIDING SYSTEM VALUE VALUES (6, 'coordinator', 'verses.set');
INSERT INTO public.role_permissions (id, role, permission) OVERRIDING SYSTEM VALUE VALUES (7, 'coordinator', 'moderator.set');
INSERT INTO public.role_permissions (id, role, permission) OVERRIDING SYSTEM VALUE VALUES (8, 'coordinator', 'user_projects');
INSERT INTO public.role_permissions (id, role, permission) OVERRIDING SYSTEM VALUE VALUES (9, 'coordinator', 'translator.set');


--
-- Data for Name: steps; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.steps (id, title, description, intro, count_of_users, whole_chapter, "time", project_id, config, sorting) OVERRIDING SYSTEM VALUE VALUES (1, '1 ШАГ - ОБЗОР КНИГИ', 'Это индивидуальная работа и выполняется до встречи с другими участниками команды КРАШ-ТЕСТА.



ЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: убедиться, что материалы букпэкеджа подготовлены корректно и не содержат ошибок или каких-либо трудностей для использования переводчиками.

ЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.





ОБЩИЙ ОБЗОР К КНИГЕ

Прочитайте общий обзор к книге. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в общем обзоре к книге.

Это задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно. 



ОБЗОР К ГЛАВЕ

Прочитайте обзор к главе. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в обзоре к главе.



ЧТЕНИЕ ДОСЛОВНОЙ БИБЛИИ РОБ-Д (RLOB)

Прочитайте ГЛАВУ ДОСЛОВНОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.



ЧТЕНИЕ СМЫСЛОВОЙ БИБЛИИ РОБ-С (RSOB)

Прочитайте ГЛАВУ СМЫСЛОВОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.



ОБЗОР ИНСТРУМЕНТА «СЛОВА»

Прочитайте СЛОВА к главе. Необходимо прочитать статьи к каждому слову. Отметьте для обсуждения командой статьи к словам, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.



ОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ»

Прочитайте ЗАМЕТКИ к главе. Необходимо прочитать ЗАМЕТКИ к каждому отрывку. Отметьте для обсуждения командой ЗАМЕТКИ, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.', 'https://youtu.be/IAxFRRy5qw8

Это индивидуальная работа и выполняется до встречи с другими участниками команды КРАШ-ТЕСТА.



ЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: убедиться, что материалы букпэкеджа подготовлены корректно и не содержат ошибок или каких-либо трудностей для использования переводчиками.

ЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.





ОБЩИЙ ОБЗОР К КНИГЕ

Прочитайте общий обзор к книге. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в общем обзоре к книге.

Это задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно. 



ОБЗОР К ГЛАВЕ

Прочитайте обзор к главе. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в обзоре к главе.



ЧТЕНИЕ ДОСЛОВНОЙ БИБЛИИ РОБ-Д (RLOB)

Прочитайте ГЛАВУ ДОСЛОВНОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.



ЧТЕНИЕ СМЫСЛОВОЙ БИБЛИИ РОБ-С (RSOB)

Прочитайте ГЛАВУ СМЫСЛОВОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.



ОБЗОР ИНСТРУМЕНТА «СЛОВА»

Прочитайте СЛОВА к главе. Необходимо прочитать статьи к каждому слову. Отметьте для обсуждения командой статьи к словам, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.



ОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ»

Прочитайте ЗАМЕТКИ к главе. Необходимо прочитать ЗАМЕТКИ к каждому отрывку. Отметьте для обсуждения командой ЗАМЕТКИ, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.', 1, true, 60, 1, '[{"size":4,"tools":[{"name":"literal","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}}]},{"size":2,"tools":[{"name":"personalNotes","config":{}},{"name":"teamNotes","config":{}},{"name":"dictionary","config":{}}]}]', 1);
INSERT INTO public.steps (id, title, description, intro, count_of_users, whole_chapter, "time", project_id, config, sorting) OVERRIDING SYSTEM VALUE VALUES (2, '2 ШАГ - КОМАНДНОЕ ИЗУЧЕНИЕ ТЕКСТА', 'Это командная работа и мы рекомендуем потратить на нее не более 120 минут.



ЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: обсудить с командой материалы букпэкеджа. Для этого поделитесь заметками, которые вы сделали при индивидуальной работе. Обсудите все предложенные правки по инструментам букпэкеджа. Запишите командное резюме по ним для передачи команде, работающей над букпэкеджом.

ЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: обсудить командой общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к началу перевода.





ОБЩИЙ ОБЗОР К КНИГЕ - Обсудите ОБЩИЙ ОБЗОР К КНИГЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения этого инструмента. Также обсудите найденные ошибки или неточности в общем обзоре к книге. Уделите этому этапу 10 минут.

Это задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно.



ОБЗОР К ГЛАВЕ - Обсудите ОБЗОР К ГЛАВЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в общем обзоре к главе. Уделите этому этапу 10 минут.



ЧТЕНИЕ РОБ-Д (RLOB) - Прочитайте вслух ГЛАВУ ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 20 мин.



ЧТЕНИЕ РОБ-С (RSOB) - Прочитайте вслух ГЛАВУ СМЫСЛОВОГО ПЕРЕВОДА БИБЛИИ РОБ-С (RSOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 10 мин.



ОБЗОР ИНСТРУМЕНТА «СЛОВА» - Обсудите инструмент СЛОВА. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в статьях этого инструмента. Уделите этому этапу 60 минут.



ОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Обсудите инструмент ЗАМЕТКИ. Что полезного для перевода вы нашли в ЗАМЕТКАХ. Используйте свои записи по этому инструменту с самостоятельного изучения. Также обсудите найденные ошибки или неточности в этом инструменте. Уделите этому этапу 10 минут.', 'https://youtu.be/d6kvUVRttUw

Это командная работа и мы рекомендуем потратить на нее не более 120 минут.



ЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: обсудить с командой материалы букпэкеджа. Для этого поделитесь заметками, которые вы сделали при индивидуальной работе. Обсудите все предложенные правки по инструментам букпэкеджа. Запишите командное резюме по ним для передачи команде, работающей над букпэкеджом.

ЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: обсудить командой общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к началу перевода.





ОБЩИЙ ОБЗОР К КНИГЕ - Обсудите ОБЩИЙ ОБЗОР К КНИГЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения этого инструмента. Также обсудите найденные ошибки или неточности в общем обзоре к книге. Уделите этому этапу 10 минут.

Это задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно.



ОБЗОР К ГЛАВЕ - Обсудите ОБЗОР К ГЛАВЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в общем обзоре к главе. Уделите этому этапу 10 минут.



ЧТЕНИЕ РОБ-Д (RLOB) - Прочитайте вслух ГЛАВУ ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 20 мин.



ЧТЕНИЕ РОБ-С (RSOB) - Прочитайте вслух ГЛАВУ СМЫСЛОВОГО ПЕРЕВОДА БИБЛИИ РОБ-С (RSOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 10 мин.



ОБЗОР ИНСТРУМЕНТА «СЛОВА» - Обсудите инструмент СЛОВА. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в статьях этого инструмента. Уделите этому этапу 60 минут.



ОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Обсудите инструмент ЗАМЕТКИ. Что полезного для перевода вы нашли в ЗАМЕТКАХ. Используйте свои записи по этому инструменту с самостоятельного изучения. Также обсудите найденные ошибки или неточности в этом инструменте. Уделите этому этапу 10 минут.

', 4, true, 120, 1, '[{"size":4,"tools":[{"name":"literal","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}}]},{"size":2,"tools":[{"name":"personalNotes","config":{}},{"name":"teamNotes","config":{}},{"name":"dictionary","config":{}}]}]', 2);
INSERT INTO public.steps (id, title, description, intro, count_of_users, whole_chapter, "time", project_id, config, sorting) OVERRIDING SYSTEM VALUE VALUES (3, '3 ШАГ - ПОДГОТОВКА К ПЕРЕВОДУ', 'Это работа в паре и мы рекомендуем потратить на нее не более 30 минут.



ЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.

В этом шаге вам необходимо выполнить два задания.



ПЕРЕСКАЗ НА РУССКОМ - Прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB). Если необходимо - изучите отрывок вместе со всеми инструментами, чтобы как можно лучше передать этот текст более естественным русским языком. Перескажите смысл отрывка своему напарнику, используя максимально понятные и естественные слова русского языка. Не старайтесь пересказывать в точности исходный текст ДОСЛОВНОГО ПЕРЕВОДА. Перескажите текст в максимальной для себя простоте.

После этого послушайте вашего напарника, пересказывающего свой отрывок. 

Не обсуждайте ваши пересказы - это только проговаривание и слушание.



ПЕРЕСКАЗ НА ЦЕЛЕВОМ - Еще раз просмотрите ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и подумайте, как пересказать этот текст на языке, на который делается перевод, помня о Резюме к переводу о стиле языка. 

Перескажите ваш отрывок напарнику на целевом языке, используя максимально понятные и естественные слова этого языка. Передайте всё, что вы запомнили, не подглядывая в текст. 

Затем послушайте вашего напарника, пересказывающего свой отрывок таким же образом.

Не обсуждайте ваши пересказы - это только проговаривание и слушание.', 'https://youtu.be/ujMGcdkGGhI

Это работа в паре и мы рекомендуем потратить на нее не более 30 минут.



ЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.

В этом шаге вам необходимо выполнить два задания.



ПЕРЕСКАЗ НА РУССКОМ - Прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB). Если необходимо - изучите отрывок вместе со всеми инструментами, чтобы как можно лучше передать этот текст более естественным русским языком. Перескажите смысл отрывка своему напарнику, используя максимально понятные и естественные слова русского языка. Не старайтесь пересказывать в точности исходный текст ДОСЛОВНОГО ПЕРЕВОДА. Перескажите текст в максимальной для себя простоте.

После этого послушайте вашего напарника, пересказывающего свой отрывок. 

Не обсуждайте ваши пересказы - это только проговаривание и слушание.



ПЕРЕСКАЗ НА ЦЕЛЕВОМ - Еще раз просмотрите ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и подумайте, как пересказать этот текст на языке, на который делается перевод, помня о Резюме к переводу о стиле языка. 

Перескажите ваш отрывок напарнику на целевом языке, используя максимально понятные и естественные слова этого языка. Передайте всё, что вы запомнили, не подглядывая в текст. 

Затем послушайте вашего напарника, пересказывающего свой отрывок таким же образом.

Не обсуждайте ваши пересказы - это только проговаривание и слушание.

', 2, false, 30, 1, '[{"size":4,"tools":[{"name":"literal","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}}]},{"size":2,"tools":[{"name":"audio","config":{}}]}]', 3);
INSERT INTO public.steps (id, title, description, intro, count_of_users, whole_chapter, "time", project_id, config, sorting) OVERRIDING SYSTEM VALUE VALUES (4, '4 ШАГ - НАБРОСОК «ВСЛЕПУЮ»', 'Это индивидуальная работа и мы рекомендуем потратить на нее не более 20 минут.



ЦЕЛЬ этого шага: сделать первый набросок в первую очередь естественным языком.



РОБ-Д + НАБРОСОК «ВСЛЕПУЮ» - Еще раз прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и если вам необходимо, просмотрите все инструменты к этому отрывку. Как только вы будете готовы сделать «набросок», перейдите на панель «слепого» наброска и напишите ваш перевод на своем языке, используя максимально понятные и естественные слова вашего языка. Пишите по памяти. Не подглядывайте! Главная цель этого шага - естественность языка. Не бойтесь ошибаться! Ошибки на этом этапе допустимы. Точность перевода будет проверена на следующих шагах работы над текстом.', 'https://youtu.be/3RJQxjnxJ-I

Это индивидуальная работа и мы рекомендуем потратить на нее не более 20 минут.



ЦЕЛЬ этого шага: сделать первый набросок в первую очередь естественным языком.



РОБ-Д + НАБРОСОК «ВСЛЕПУЮ» - Еще раз прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и если вам необходимо, просмотрите все инструменты к этому отрывку. Как только вы будете готовы сделать «набросок», перейдите на панель «слепого» наброска и напишите ваш перевод на своем языке, используя максимально понятные и естественные слова вашего языка. Пишите по памяти. Не подглядывайте! Главная цель этого шага - естественность языка. Не бойтесь ошибаться! Ошибки на этом этапе допустимы. Точность перевода будет проверена на следующих шагах работы над текстом. 

', 1, false, 20, 1, '[{"size":3,"tools":[{"name":"literal","config":{"draft":true}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}}]},{"size":3,"tools":[{"name":"draftTranslate","config":{}}]}]', 4);
INSERT INTO public.steps (id, title, description, intro, count_of_users, whole_chapter, "time", project_id, config, sorting) OVERRIDING SYSTEM VALUE VALUES (5, '5 ШАГ - САМОПРОВЕРКА', 'Это индивидуальная работа и мы рекомендуем потратить на нее не более 30 минут.



ЦЕЛЬ этого шага: поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным.



Проверьте ваш перевод на ТОЧНОСТЬ, сравнив с текстом - ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). При необходимости используйте все инструменты к переводу. Оцените по вопросам: ничего не добавлено, ничего не пропущено, смысл не изменён? Если есть ошибки, исправьте.



Прочитайте ВОПРОСЫ и ответьте на них, глядя в свой текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте.



После этого прочитайте себе ваш перевод вслух и оцените - звучит ли ваш текст ПОНЯТНО И ЕСТЕСТВЕННО? Если нет, то исправьте.



Перейдите к следующему вашему отрывку и повторите шаги Подготовка-Набросок-Проверка со всеми вашими отрывками до конца главы.', 'https://youtu.be/WgvaOH9Lnpc

Это индивидуальная работа и мы рекомендуем потратить на нее не более 30 минут.



ЦЕЛЬ этого шага: поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным.



Проверьте ваш перевод на ТОЧНОСТЬ, сравнив с текстом - ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). При необходимости используйте все инструменты к переводу. Оцените по вопросам: ничего не добавлено, ничего не пропущено, смысл не изменён? Если есть ошибки, исправьте.



Прочитайте ВОПРОСЫ и ответьте на них, глядя в свой текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте.



После этого прочитайте себе ваш перевод вслух и оцените - звучит ли ваш текст ПОНЯТНО И ЕСТЕСТВЕННО? Если нет, то исправьте.



Перейдите к следующему вашему отрывку и повторите шаги Подготовка-Набросок-Проверка со всеми вашими отрывками до конца главы.

', 1, false, 30, 1, '[{"size":3,"tools":[{"name":"literal","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}},{"name":"tquestions","config":{"viewAllQuestions":true}}]},{"size":3,"tools":[{"name":"translate","config":{}},{"name":"personalNotes","config":{}},{"name":"teamNotes","config":{}},{"name":"dictionary","config":{}}]}]', 5);
INSERT INTO public.steps (id, title, description, intro, count_of_users, whole_chapter, "time", project_id, config, sorting) OVERRIDING SYSTEM VALUE VALUES (6, '6 ШАГ - ВЗАИМНАЯ ПРОВЕРКА', 'Это работа в паре и мы рекомендуем потратить на нее не более 40 минут.



ЦЕЛЬ этого шага: улучшить набросок перевода, пригласив другого человека, чтобы проверить перевод на точность и естественность.



ПРОВЕРКА НА ТОЧНОСТЬ - Прочитайте вслух свой текст напарнику, который параллельно следит за текстом ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д(RLOB) и обращает внимание только на ТОЧНОСТЬ перевода. 

Обсудите текст насколько он точен. 

Изменения в текст вносит переводчик, работавший над ним. Если не удалось договориться о каких-либо изменениях, оставьте этот вопрос для обсуждения всей командой.

Поменяйтесь ролями и поработайте над отрывком партнёра.



ПРОВЕРКА НА ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ - Еще раз прочитайте вслух свой текст напарнику, который теперь не смотрит ни в какой текст, а просто слушает ваше чтение вслух, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка.

Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте.

Поменяйтесь ролями и поработайте над отрывком партнёра.





_Примечание к шагу:_ 

- Не влюбляйтесь в свой текст. Будьте гибкими к тому, чтобы слышать другое мнение и улучшать свой набросок перевода.  Это групповая работа и текст должен соответствовать пониманию большинства в вашей команде. Если даже будут допущены ошибки в этом случае, то на проверках последующих уровней они будут исправлены.

- Если в работе с напарником вам не удалось договориться по каким-то вопросам, касающихся текста, оставьте этот вопрос на обсуждение со всей командой. Ваша цель - не победить напарника, а с его помощью улучшить перевод.', 'https://youtu.be/xtgTo3oWxKs

Это работа в паре и мы рекомендуем потратить на нее не более 40 минут.



ЦЕЛЬ этого шага: улучшить набросок перевода, пригласив другого человека, чтобы проверить перевод на точность и естественность.



ПРОВЕРКА НА ТОЧНОСТЬ - Прочитайте вслух свой текст напарнику, который параллельно следит за текстом ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д(RLOB) и обращает внимание только на ТОЧНОСТЬ перевода. 

Обсудите текст насколько он точен. 

Изменения в текст вносит переводчик, работавший над ним. Если не удалось договориться о каких-либо изменениях, оставьте этот вопрос для обсуждения всей командой.

Поменяйтесь ролями и поработайте над отрывком партнёра.



ПРОВЕРКА НА ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ - Еще раз прочитайте вслух свой текст напарнику, который теперь не смотрит ни в какой текст, а просто слушает ваше чтение вслух, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка.

Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте.

Поменяйтесь ролями и поработайте над отрывком партнёра.





_Примечание к шагу:_ 

- Не влюбляйтесь в свой текст. Будьте гибкими к тому, чтобы слышать другое мнение и улучшать свой набросок перевода.  Это групповая работа и текст должен соответствовать пониманию большинства в вашей команде. Если даже будут допущены ошибки в этом случае, то на проверках последующих уровней они будут исправлены.

- Если в работе с напарником вам не удалось договориться по каким-то вопросам, касающихся текста, оставьте этот вопрос на обсуждение со всей командой. Ваша цель - не победить напарника, а с его помощью улучшить перевод.

', 2, false, 40, 1, '[{"size":3,"tools":[{"name":"literal","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}},{"name":"tquestions","config":{}}]},{"size":3,"tools":[{"name":"translate","config":{}},{"name":"personalNotes","config":{}},{"name":"teamNotes","config":{}},{"name":"dictionary","config":{}}]}]', 6);
INSERT INTO public.steps (id, title, description, intro, count_of_users, whole_chapter, "time", project_id, config, sorting) OVERRIDING SYSTEM VALUE VALUES (7, '7 ШАГ - ПРОВЕРКА КЛЮЧЕВЫХ СЛОВ', 'Это командная работа и мы рекомендуем потратить на нее не более 30 минут.



ЦЕЛЬ этого шага: всей командой улучшить перевод, выслушав больше мнений относительно самых важных слов и фраз в переводе, а также решить разногласия, оставшиеся после взаимопроверки.



ПРОВЕРКА ТЕКСТА ПО КЛЮЧЕВЫМ СЛОВАМ - Прочитайте текст всех переводчиков по очереди всей командой. Проверьте перевод на наличие ключевых слов из инструмента СЛОВА. Все ключевые слова на месте? Все ключевые слова переведены корректно?

Команда принимает решения, как переводить эти слова или фразы – переводчик вносит эти изменения в свой отрывок. В некоторых случаях, вносить изменения, которые принимает команда, может один человек, выбранный из переводчиков.', 'https://youtu.be/w5766JEVCyU

Это командная работа и мы рекомендуем потратить на нее не более 30 минут.



ЦЕЛЬ этого шага: всей командой улучшить перевод, выслушав больше мнений относительно самых важных слов и фраз в переводе, а также решить разногласия, оставшиеся после взаимопроверки.



ПРОВЕРКА ТЕКСТА ПО КЛЮЧЕВЫМ СЛОВАМ - Прочитайте текст всех переводчиков по очереди всей командой. Проверьте перевод на наличие ключевых слов из инструмента СЛОВА. Все ключевые слова на месте? Все ключевые слова переведены корректно?

Команда принимает решения, как переводить эти слова или фразы – переводчик вносит эти изменения в свой отрывок. В некоторых случаях, вносить изменения, которые принимает команда, может один человек, выбранный из переводчиков. 

', 4, true, 30, 1, '[{"size":3,"tools":[{"name":"twords","config":{}},{"name":"literal","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}}]},{"size":3,"tools":[{"name":"commandTranslate","config":{"moderatorOnly":false}},{"name":"personalNotes","config":{}},{"name":"teamNotes","config":{}},{"name":"dictionary","config":{}}]}]', 7);
INSERT INTO public.steps (id, title, description, intro, count_of_users, whole_chapter, "time", project_id, config, sorting) OVERRIDING SYSTEM VALUE VALUES (8, '8 ШАГ - КОМАНДНЫЙ ОБЗОР ПЕРЕВОДА', 'Это командная работа и мы рекомендуем потратить на нее не более 60 минут.

ЦЕЛЬ этого шага: улучшить перевод, приняв решения командой о трудных словах или фразах, делая текст хорошим как с точки зрения точности, так и с точки зрения естественности. Это финальный шаг в работе над текстом.



ПРОВЕРКА НА ТОЧНОСТЬ - Прочитайте вслух свой текст команде. Команда в это время смотрит в текст ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB) и обращает внимание только на ТОЧНОСТЬ перевода. 

Обсудите текст насколько он точен. Если есть ошибки в вашем тексте, исправьте. Всей командой проверьте на точность работу каждого члена команды, каждую законченную главу.



Прочитайте ВОПРОСЫ и ответьте на них, глядя в ваш текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте.



ПРОВЕРКА НА ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ - Еще раз прочитайте вслух свой текст команде, которая теперь не смотрит ни в какой текст, а просто слушает, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка. Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте. Проработайте каждую главу/ каждый отрывок, пока команда не будет довольна результатом.



Примечание к шагу: 

- Не оставляйте текст с несколькими вариантами перевода предложения или слова. После восьмого шага не должны оставаться нерешенные вопросы. Текст должен быть готовым к чтению.', 'https://youtu.be/EiVuJd9ijF0

Это командная работа и мы рекомендуем потратить на нее не более 60 минут.

ЦЕЛЬ этого шага: улучшить перевод, приняв решения командой о трудных словах или фразах, делая текст хорошим как с точки зрения точности, так и с точки зрения естественности. Это финальный шаг в работе над текстом.



ПРОВЕРКА НА ТОЧНОСТЬ - Прочитайте вслух свой текст команде. Команда в это время смотрит в текст ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB) и обращает внимание только на ТОЧНОСТЬ перевода. 

Обсудите текст насколько он точен. Если есть ошибки в вашем тексте, исправьте. Всей командой проверьте на точность работу каждого члена команды, каждую законченную главу.



Прочитайте ВОПРОСЫ и ответьте на них, глядя в ваш текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте.



ПРОВЕРКА НА ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ - Еще раз прочитайте вслух свой текст команде, которая теперь не смотрит ни в какой текст, а просто слушает, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка. Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте. Проработайте каждую главу/ каждый отрывок, пока команда не будет довольна результатом.



Примечание к шагу: 

- Не оставляйте текст с несколькими вариантами перевода предложения или слова. После восьмого шага не должны оставаться нерешенные вопросы. Текст должен быть готовым к чтению. 

', 4, true, 60, 1, '[{"size":3,"tools":[{"name":"literal","config":{}},{"name":"tquestions","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}}]},{"size":3,"tools":[{"name":"commandTranslate","config":{"moderatorOnly":true}},{"name":"personalNotes","config":{}},{"name":"teamNotes","config":{}},{"name":"dictionary","config":{}}]}]', 8);


--
-- Data for Name: team_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.team_notes (id, project_id, title, data, created_at, changed_at, is_folder, parent_id) VALUES ('00v4j5cq9', 1, 'new note', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-11-24 18:32:10.079043', '2022-11-28 11:38:37.29727', false, NULL);
INSERT INTO public.team_notes (id, project_id, title, data, created_at, changed_at, is_folder, parent_id) VALUES ('008rizc9b', 1, 'new note', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-11-28 13:24:54.101696', '2022-11-28 13:24:54.101696', false, NULL);
INSERT INTO public.team_notes (id, project_id, title, data, created_at, changed_at, is_folder, parent_id) VALUES ('00r15nyxh', 1, 'rr', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-11-30 14:40:21.332547', '2022-11-30 14:41:08.993638', false, NULL);
INSERT INTO public.team_notes (id, project_id, title, data, created_at, changed_at, is_folder, parent_id) VALUES ('00698za4q', 1, 'fffff', '{"blocks":[{"type":"paragraph","data":{}}],"version":"2.8.1"}', '2022-11-28 13:24:53.163333', '2022-12-14 19:32:12.624419', false, NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, email, login, agreement, confession, is_admin, blocked) VALUES ('b75a51d5-ee4d-4ea0-afa3-2366d7716742', 't1@mail.com', 't1', true, true, false, NULL);
INSERT INTO public.users (id, email, login, agreement, confession, is_admin, blocked) VALUES ('1dfaa269-2eda-41c4-9a71-72db8cbd6db2', 'admin@mail.com', 'admin', true, true, true, NULL);
INSERT INTO public.users (id, email, login, agreement, confession, is_admin, blocked) VALUES ('e63f8dfb-53a4-43ec-9fd9-510b27c1b7ad', 'admin2@mail.com', 'admin2', true, true, true, NULL);
INSERT INTO public.users (id, email, login, agreement, confession, is_admin, blocked) VALUES ('7fd248bc-218a-4aec-97df-7a4e76a887ae', 'moderator@mail.com', 'moderator', true, false, false, NULL);
INSERT INTO public.users (id, email, login, agreement, confession, is_admin, blocked) VALUES ('ba11c49a-9c52-4f87-8a01-d0300c82b8b3', 'test@mail.com', 'test', false, false, false, NULL);


--
-- Data for Name: verses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (82, 1, NULL, 1, 3, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (83, 2, NULL, 1, 3, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (84, 3, NULL, 1, 3, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (85, 4, NULL, 1, 3, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (86, 5, NULL, 1, 3, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (87, 6, NULL, 1, 3, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (88, 7, NULL, 1, 3, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (89, 8, NULL, 1, 3, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (90, 9, NULL, 1, 3, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (12, 1, 'first', 8, 2, 1, 1);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (13, 2, 'ыусщтв', 8, 2, 1, 1);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (91, 10, NULL, 1, 3, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (92, 11, NULL, 1, 3, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (93, 12, NULL, 1, 3, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (94, 13, NULL, 1, 3, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (34, 23, 'tedt', 8, 2, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (35, 24, 'text', 8, 2, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (25, 14, 'text', 8, 2, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (26, 15, 'text', 8, 2, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (27, 16, 'text', 8, 2, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (28, 17, 'text', 8, 2, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (29, 18, 'text', 8, 2, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (95, 1, 'first dtep', 5, 4, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (96, 2, 'second', 5, 4, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (97, 3, 'third', 5, 4, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (98, 4, 'fourth', 5, 4, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (30, 19, 'text', 8, 2, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (31, 20, 'text', 8, 2, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (32, 21, 'text', 8, 2, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (33, 22, 'text', 8, 2, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (24, 13, 'text', 8, 2, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (99, 5, 'fifth', 5, 4, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (100, 6, 'sixth', 5, 4, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (101, 7, 'seventh', 5, 4, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (102, 8, 'eight', 5, 4, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (103, 9, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (104, 10, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (105, 11, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (106, 12, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (107, 13, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (108, 14, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (109, 15, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (110, 16, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (111, 17, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (112, 18, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (113, 19, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (114, 20, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (115, 21, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (116, 22, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (117, 23, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (118, 24, NULL, 1, 4, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (14, 3, NULL, 8, 2, 1, 1);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (15, 4, NULL, 8, 2, 1, 1);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (16, 5, NULL, 5, 2, 1, 2);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (17, 6, NULL, 5, 2, 1, 2);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (18, 7, NULL, 5, 2, 1, 2);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (19, 8, NULL, 5, 2, 1, 2);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (20, 9, NULL, 5, 2, 1, 2);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (21, 10, NULL, 5, 2, 1, 2);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (22, 11, NULL, 5, 2, 1, 2);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (23, 12, NULL, 5, 2, 1, 2);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (36, 25, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (37, 26, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (38, 27, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (39, 28, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (40, 29, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (41, 30, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (42, 31, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (43, 32, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (44, 33, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (45, 34, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (46, 35, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (77, 66, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (78, 67, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (79, 68, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (80, 69, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (81, 70, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (135, 7, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (119, 1, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 5, 11, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (120, 2, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 5, 11, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (121, 3, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 5, 11, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (47, 36, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (48, 37, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (49, 38, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (50, 39, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (51, 40, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (52, 41, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (53, 42, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (54, 43, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (55, 44, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (56, 45, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (57, 46, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (58, 47, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (59, 48, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (60, 49, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (61, 50, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (62, 51, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (63, 52, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (64, 53, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (65, 54, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (66, 55, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (67, 56, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (68, 57, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (69, 58, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (70, 59, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (71, 60, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (72, 61, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (73, 62, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (74, 63, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (75, 64, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (76, 65, NULL, 1, 2, 1, NULL);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (141, 13, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (122, 4, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 5, 11, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (123, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 5, 11, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (124, 6, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 5, 11, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (125, 7, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 5, 11, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (126, 8, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 5, 11, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (127, 9, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 5, 11, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (128, 10, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 5, 11, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (132, 4, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (140, 12, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.
Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (133, 5, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (136, 8, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (134, 6, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (137, 9, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (139, 11, 'v
Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (138, 10, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (144, 16, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (129, 1, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (130, 2, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (131, 3, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (142, 14, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (143, 15, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (145, 17, 'v
Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (149, 21, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (146, 18, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (147, 19, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (150, 22, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (148, 20, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (153, 25, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (151, 23, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (157, 29, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (154, 26, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (152, 24, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (155, 27, 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);
INSERT INTO public.verses (id, num, text, current_step, chapter_id, project_id, project_translator_id) OVERRIDING SYSTEM VALUE VALUES (156, 28, 'v
Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam blanditiis quasi quos cum nostrum. Ipsam hic repudiandae, saepe dolore vitae quo cupiditate deserunt quaerat quasi voluptate debitis dolor at impedit.', 6, 12, 1, 3);


--
-- Name: books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.books_id_seq', 2, true);


--
-- Name: briefs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.briefs_id_seq', 1, true);


--
-- Name: chapters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chapters_id_seq', 15, true);


--
-- Name: languages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.languages_id_seq', 3, true);


--
-- Name: methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.methods_id_seq', 2, true);


--
-- Name: progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.progress_id_seq', 390, true);


--
-- Name: project_coordinators_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_coordinators_id_seq', 1, true);


--
-- Name: project_translators_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_translators_id_seq', 3, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, true);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 9, true);


--
-- Name: steps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.steps_id_seq', 8, true);


--
-- Name: verses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.verses_id_seq', 157, true);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: books books_project_id_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_project_id_code_key UNIQUE (project_id, code);


--
-- Name: briefs briefs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.briefs
    ADD CONSTRAINT briefs_pkey PRIMARY KEY (id);


--
-- Name: briefs briefs_project_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.briefs
    ADD CONSTRAINT briefs_project_id_key UNIQUE (project_id);


--
-- Name: chapters chapters_book_id_num_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_book_id_num_key UNIQUE (book_id, num);


--
-- Name: chapters chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_pkey PRIMARY KEY (id);


--
-- Name: dictionaries dictionaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dictionaries
    ADD CONSTRAINT dictionaries_pkey PRIMARY KEY (id);


--
-- Name: dictionaries dictionaries_project_id_title_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dictionaries
    ADD CONSTRAINT dictionaries_project_id_title_key UNIQUE (project_id, title);


--
-- Name: languages languages_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_code_key UNIQUE (code);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (id);


--
-- Name: methods methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.methods
    ADD CONSTRAINT methods_pkey PRIMARY KEY (id);


--
-- Name: personal_notes personal_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_notes
    ADD CONSTRAINT personal_notes_pkey PRIMARY KEY (id);


--
-- Name: progress progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (id);


--
-- Name: project_coordinators project_coordinators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_coordinators
    ADD CONSTRAINT project_coordinators_pkey PRIMARY KEY (id);


--
-- Name: project_coordinators project_coordinators_project_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_coordinators
    ADD CONSTRAINT project_coordinators_project_id_user_id_key UNIQUE (project_id, user_id);


--
-- Name: project_translators project_translators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_translators
    ADD CONSTRAINT project_translators_pkey PRIMARY KEY (id);


--
-- Name: project_translators project_translators_project_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_translators
    ADD CONSTRAINT project_translators_project_id_user_id_key UNIQUE (project_id, user_id);


--
-- Name: projects projects_code_language_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_code_language_id_key UNIQUE (code, language_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_role_permission_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_permission_key UNIQUE (role, permission);


--
-- Name: steps steps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.steps
    ADD CONSTRAINT steps_pkey PRIMARY KEY (id);


--
-- Name: steps steps_project_id_sorting_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.steps
    ADD CONSTRAINT steps_project_id_sorting_key UNIQUE (project_id, sorting);


--
-- Name: team_notes team_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_notes
    ADD CONSTRAINT team_notes_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_login_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verses verses_chapter_id_num_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verses
    ADD CONSTRAINT verses_chapter_id_num_key UNIQUE (chapter_id, num);


--
-- Name: verses verses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verses
    ADD CONSTRAINT verses_pkey PRIMARY KEY (id);


--
-- Name: chapters on_chapters_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_chapters_update BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.handle_compile_chapter();


--
-- Name: dictionaries on_dictionaries_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_dictionaries_update BEFORE UPDATE ON public.dictionaries FOR EACH ROW EXECUTE FUNCTION public.handle_update_dictionaries();


--
-- Name: books on_public_book_created; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_public_book_created AFTER INSERT ON public.books FOR EACH ROW EXECUTE FUNCTION public.handle_new_book();


--
-- Name: personal_notes on_public_personal_notes_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_public_personal_notes_update BEFORE UPDATE ON public.personal_notes FOR EACH ROW EXECUTE FUNCTION public.handle_update_personal_notes();


--
-- Name: projects on_public_project_created; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_public_project_created AFTER INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_new_project();


--
-- Name: team_notes on_public_team_notes_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_public_team_notes_update BEFORE UPDATE ON public.team_notes FOR EACH ROW EXECUTE FUNCTION public.handle_update_team_notes();


--
-- Name: verses on_public_verses_next_step; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_public_verses_next_step AFTER UPDATE ON public.verses FOR EACH ROW EXECUTE FUNCTION public.handle_next_step();


--
-- Name: books books_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: briefs briefs_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.briefs
    ADD CONSTRAINT briefs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: chapters chapters_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: chapters chapters_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: dictionaries dictionaries_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dictionaries
    ADD CONSTRAINT dictionaries_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: personal_notes personal_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_notes
    ADD CONSTRAINT personal_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: progress progress_step_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.steps(id) ON DELETE CASCADE;


--
-- Name: progress progress_verse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_verse_id_fkey FOREIGN KEY (verse_id) REFERENCES public.verses(id) ON DELETE CASCADE;


--
-- Name: project_coordinators project_coordinators_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_coordinators
    ADD CONSTRAINT project_coordinators_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_coordinators project_coordinators_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_coordinators
    ADD CONSTRAINT project_coordinators_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_translators project_translators_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_translators
    ADD CONSTRAINT project_translators_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_translators project_translators_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_translators
    ADD CONSTRAINT project_translators_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id) ON DELETE CASCADE;


--
-- Name: steps steps_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.steps
    ADD CONSTRAINT steps_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: team_notes team_notes_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_notes
    ADD CONSTRAINT team_notes_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: verses verses_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verses
    ADD CONSTRAINT verses_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;


--
-- Name: verses verses_current_step_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verses
    ADD CONSTRAINT verses_current_step_fkey FOREIGN KEY (current_step) REFERENCES public.steps(id) ON DELETE CASCADE;


--
-- Name: verses verses_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verses
    ADD CONSTRAINT verses_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: verses verses_project_translator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verses
    ADD CONSTRAINT verses_project_translator_id_fkey FOREIGN KEY (project_translator_id) REFERENCES public.project_translators(id) ON DELETE CASCADE;


--
-- Name: books; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

--
-- Name: briefs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

--
-- Name: dictionaries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.dictionaries ENABLE ROW LEVEL SECURITY;

--
-- Name: languages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

--
-- Name: methods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.methods ENABLE ROW LEVEL SECURITY;

--
-- Name: personal_notes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.personal_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: progress; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

--
-- Name: project_coordinators; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.project_coordinators ENABLE ROW LEVEL SECURITY;

--
-- Name: project_translators; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.project_translators ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: role_permissions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: steps; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;

--
-- Name: team_notes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.team_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: team_notes team_notes delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "team_notes delete" ON public.team_notes FOR DELETE USING ((public.authorize(auth.uid(), project_id) = ANY (ARRAY['admin'::text, 'coordinator'::text, 'moderator'::text])));


--
-- Name: team_notes team_notes insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "team_notes insert" ON public.team_notes FOR INSERT WITH CHECK ((public.authorize(auth.uid(), project_id) = ANY (ARRAY['admin'::text, 'coordinator'::text, 'moderator'::text])));


--
-- Name: team_notes team_notes select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "team_notes select" ON public.team_notes FOR SELECT USING ((public.authorize(auth.uid(), project_id) <> 'user'::text));


--
-- Name: team_notes team_notes update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "team_notes update" ON public.team_notes FOR UPDATE USING ((public.authorize(auth.uid(), project_id) = ANY (ARRAY['admin'::text, 'coordinator'::text, 'moderator'::text])));


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: verses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.verses ENABLE ROW LEVEL SECURITY;

--
-- Name: dictionaries word delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "word delete" ON public.dictionaries FOR DELETE USING ((public.authorize(auth.uid(), project_id) = ANY (ARRAY['admin'::text, 'coordinator'::text, 'moderator'::text])));


--
-- Name: dictionaries word insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "word insert" ON public.dictionaries FOR INSERT WITH CHECK ((public.authorize(auth.uid(), project_id) = ANY (ARRAY['admin'::text, 'coordinator'::text, 'moderator'::text])));


--
-- Name: dictionaries word update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "word update" ON public.dictionaries FOR UPDATE USING ((public.authorize(auth.uid(), project_id) = ANY (ARRAY['admin'::text, 'coordinator'::text, 'moderator'::text])));


--
-- Name: dictionaries words select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "words select" ON public.dictionaries FOR SELECT USING ((public.authorize(auth.uid(), project_id) <> 'user'::text));


--
-- Name: projects Админ видит все проекты, остальные; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Админ видит все проекты, остальные" ON public.projects FOR SELECT TO authenticated USING ((public.authorize(auth.uid(), id) <> 'user'::text));


--
-- Name: project_coordinators Админ видит всех, остальные только; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Админ видит всех, остальные только" ON public.project_coordinators FOR SELECT TO authenticated USING ((public.authorize(auth.uid(), project_id) <> 'user'::text));


--
-- Name: project_translators Админ видит всех, остальные только; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Админ видит всех, остальные только" ON public.project_translators FOR SELECT TO authenticated USING ((public.authorize(auth.uid(), project_id) <> 'user'::text));


--
-- Name: methods Админ может получить список всех м; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Админ может получить список всех м" ON public.methods FOR SELECT TO authenticated USING (public.admin_only());


--
-- Name: briefs Видят все кто на проекте и админ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Видят все кто на проекте и админ" ON public.briefs FOR SELECT TO authenticated USING ((public.authorize(auth.uid(), project_id) <> 'user'::text));


--
-- Name: books Добавлять можно только админу; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Добавлять можно только админу" ON public.books FOR INSERT WITH CHECK (public.admin_only());


--
-- Name: steps Добавлять можно только админу; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Добавлять можно только админу" ON public.steps FOR INSERT WITH CHECK (public.admin_only());


--
-- Name: project_translators Добавлять на проект может админ ил; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Добавлять на проект может админ ил" ON public.project_translators FOR INSERT WITH CHECK ((public.authorize(auth.uid(), project_id) = ANY (ARRAY['admin'::text, 'coordinator'::text])));


--
-- Name: project_coordinators Добавлять на проект может только а; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Добавлять на проект может только а" ON public.project_coordinators FOR INSERT WITH CHECK (public.admin_only());


--
-- Name: personal_notes Залогиненый юзер может добавить л; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Залогиненый юзер может добавить л" ON public.personal_notes FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: personal_notes Залогиненый юзер может изменить л; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Залогиненый юзер может изменить л" ON public.personal_notes FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: languages Залогиненый юзер может получить с; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Залогиненый юзер может получить с" ON public.languages FOR SELECT TO authenticated USING (true);


--
-- Name: users Залогиненый юзер может получить с; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Залогиненый юзер может получить с" ON public.users FOR SELECT TO authenticated USING (true);


--
-- Name: personal_notes Залогиненый юзер может удалить ли; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Залогиненый юзер может удалить ли" ON public.personal_notes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: briefs Изменять может админ, кординатор и; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Изменять может админ, кординатор и" ON public.briefs FOR UPDATE USING ((public.authorize(auth.uid(), project_id) <> ALL (ARRAY['user'::text, 'translator'::text])));


--
-- Name: languages Обновлять может только админ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Обновлять может только админ" ON public.languages FOR UPDATE USING (public.admin_only());


--
-- Name: projects Обновлять может только админ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Обновлять может только админ" ON public.projects FOR UPDATE USING (public.admin_only());


--
-- Name: personal_notes Показывать личные заметки данного; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Показывать личные заметки данного" ON public.personal_notes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: steps Получают данные по шагам все кто н; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Получают данные по шагам все кто н" ON public.steps FOR SELECT TO authenticated USING ((public.authorize(auth.uid(), project_id) <> 'user'::text));


--
-- Name: books Получают книги все кто на проекте; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Получают книги все кто на проекте" ON public.books FOR SELECT TO authenticated USING ((public.authorize(auth.uid(), project_id) <> 'user'::text));


--
-- Name: chapters Получают книги все кто на проекте; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Получают книги все кто на проекте" ON public.chapters FOR SELECT TO authenticated USING ((public.authorize(auth.uid(), project_id) <> 'user'::text));


--
-- Name: languages Создавать может только админ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Создавать может только админ" ON public.languages FOR INSERT WITH CHECK (public.admin_only());


--
-- Name: projects Создавать может только админ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Создавать может только админ" ON public.projects FOR INSERT WITH CHECK (public.admin_only());


--
-- Name: verses Стих получить может переводчик, ко; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Стих получить может переводчик, ко" ON public.verses FOR SELECT TO authenticated USING ((public.authorize(auth.uid(), project_id) <> 'user'::text));


--
-- Name: languages Удалять может только админ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Удалять может только админ" ON public.languages FOR DELETE USING (public.admin_only());


--
-- Name: project_translators Удалять с проекта может админ или ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Удалять с проекта может админ или " ON public.project_translators FOR DELETE USING ((public.authorize(auth.uid(), project_id) = ANY (ARRAY['admin'::text, 'coordinator'::text])));


--
-- Name: project_coordinators Удалять только админ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Удалять только админ" ON public.project_coordinators FOR DELETE USING (public.admin_only());


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION admin_only(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.admin_only() TO anon;
GRANT ALL ON FUNCTION public.admin_only() TO authenticated;
GRANT ALL ON FUNCTION public.admin_only() TO service_role;


--
-- Name: FUNCTION assign_moderator(user_id uuid, project_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.assign_moderator(user_id uuid, project_id bigint) TO anon;
GRANT ALL ON FUNCTION public.assign_moderator(user_id uuid, project_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.assign_moderator(user_id uuid, project_id bigint) TO service_role;


--
-- Name: FUNCTION authorize(user_id uuid, project_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.authorize(user_id uuid, project_id bigint) TO anon;
GRANT ALL ON FUNCTION public.authorize(user_id uuid, project_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.authorize(user_id uuid, project_id bigint) TO service_role;


--
-- Name: FUNCTION block_user(user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.block_user(user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.block_user(user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.block_user(user_id uuid) TO service_role;


--
-- Name: FUNCTION can_translate(translator_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.can_translate(translator_id bigint) TO anon;
GRANT ALL ON FUNCTION public.can_translate(translator_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.can_translate(translator_id bigint) TO service_role;


--
-- Name: FUNCTION change_finish_chapter(chapter_id bigint, project_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.change_finish_chapter(chapter_id bigint, project_id bigint) TO anon;
GRANT ALL ON FUNCTION public.change_finish_chapter(chapter_id bigint, project_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.change_finish_chapter(chapter_id bigint, project_id bigint) TO service_role;


--
-- Name: FUNCTION change_start_chapter(chapter_id bigint, project_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.change_start_chapter(chapter_id bigint, project_id bigint) TO anon;
GRANT ALL ON FUNCTION public.change_start_chapter(chapter_id bigint, project_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.change_start_chapter(chapter_id bigint, project_id bigint) TO service_role;


--
-- Name: FUNCTION check_agreement(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_agreement() TO anon;
GRANT ALL ON FUNCTION public.check_agreement() TO authenticated;
GRANT ALL ON FUNCTION public.check_agreement() TO service_role;


--
-- Name: FUNCTION check_confession(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_confession() TO anon;
GRANT ALL ON FUNCTION public.check_confession() TO authenticated;
GRANT ALL ON FUNCTION public.check_confession() TO service_role;


--
-- Name: FUNCTION create_chapters(book_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_chapters(book_id bigint) TO anon;
GRANT ALL ON FUNCTION public.create_chapters(book_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.create_chapters(book_id bigint) TO service_role;


--
-- Name: FUNCTION create_verses(chapter_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_verses(chapter_id bigint) TO anon;
GRANT ALL ON FUNCTION public.create_verses(chapter_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.create_verses(chapter_id bigint) TO service_role;


--
-- Name: FUNCTION divide_verses(divider character varying, project_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.divide_verses(divider character varying, project_id bigint) TO anon;
GRANT ALL ON FUNCTION public.divide_verses(divider character varying, project_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.divide_verses(divider character varying, project_id bigint) TO service_role;


--
-- Name: FUNCTION finished_chapter(chapter_id bigint, project_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.finished_chapter(chapter_id bigint, project_id bigint) TO anon;
GRANT ALL ON FUNCTION public.finished_chapter(chapter_id bigint, project_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.finished_chapter(chapter_id bigint, project_id bigint) TO service_role;


--
-- Name: FUNCTION get_current_steps(project_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_current_steps(project_id bigint) TO anon;
GRANT ALL ON FUNCTION public.get_current_steps(project_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.get_current_steps(project_id bigint) TO service_role;


--
-- Name: FUNCTION get_verses(project_id bigint, chapter smallint, book public.book_code); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_verses(project_id bigint, chapter smallint, book public.book_code) TO anon;
GRANT ALL ON FUNCTION public.get_verses(project_id bigint, chapter smallint, book public.book_code) TO authenticated;
GRANT ALL ON FUNCTION public.get_verses(project_id bigint, chapter smallint, book public.book_code) TO service_role;


--
-- Name: FUNCTION get_whole_chapter(project_code text, chapter_num smallint, book_code public.book_code); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_whole_chapter(project_code text, chapter_num smallint, book_code public.book_code) TO anon;
GRANT ALL ON FUNCTION public.get_whole_chapter(project_code text, chapter_num smallint, book_code public.book_code) TO authenticated;
GRANT ALL ON FUNCTION public.get_whole_chapter(project_code text, chapter_num smallint, book_code public.book_code) TO service_role;


--
-- Name: FUNCTION go_to_next_step(project text, chapter smallint, book public.book_code); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.go_to_next_step(project text, chapter smallint, book public.book_code) TO anon;
GRANT ALL ON FUNCTION public.go_to_next_step(project text, chapter smallint, book public.book_code) TO authenticated;
GRANT ALL ON FUNCTION public.go_to_next_step(project text, chapter smallint, book public.book_code) TO service_role;


--
-- Name: FUNCTION go_to_step(project text, chapter smallint, book public.book_code, current_step smallint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.go_to_step(project text, chapter smallint, book public.book_code, current_step smallint) TO anon;
GRANT ALL ON FUNCTION public.go_to_step(project text, chapter smallint, book public.book_code, current_step smallint) TO authenticated;
GRANT ALL ON FUNCTION public.go_to_step(project text, chapter smallint, book public.book_code, current_step smallint) TO service_role;


--
-- Name: FUNCTION handle_compile_book(books_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_compile_book(books_id bigint) TO anon;
GRANT ALL ON FUNCTION public.handle_compile_book(books_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.handle_compile_book(books_id bigint) TO service_role;


--
-- Name: FUNCTION handle_compile_chapter(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_compile_chapter() TO anon;
GRANT ALL ON FUNCTION public.handle_compile_chapter() TO authenticated;
GRANT ALL ON FUNCTION public.handle_compile_chapter() TO service_role;


--
-- Name: FUNCTION handle_new_book(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_book() TO anon;
GRANT ALL ON FUNCTION public.handle_new_book() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_book() TO service_role;


--
-- Name: FUNCTION handle_new_project(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_project() TO anon;
GRANT ALL ON FUNCTION public.handle_new_project() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_project() TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION handle_next_step(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_next_step() TO anon;
GRANT ALL ON FUNCTION public.handle_next_step() TO authenticated;
GRANT ALL ON FUNCTION public.handle_next_step() TO service_role;


--
-- Name: FUNCTION handle_update_dictionaries(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_update_dictionaries() TO anon;
GRANT ALL ON FUNCTION public.handle_update_dictionaries() TO authenticated;
GRANT ALL ON FUNCTION public.handle_update_dictionaries() TO service_role;


--
-- Name: FUNCTION handle_update_personal_notes(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_update_personal_notes() TO anon;
GRANT ALL ON FUNCTION public.handle_update_personal_notes() TO authenticated;
GRANT ALL ON FUNCTION public.handle_update_personal_notes() TO service_role;


--
-- Name: FUNCTION handle_update_team_notes(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_update_team_notes() TO anon;
GRANT ALL ON FUNCTION public.handle_update_team_notes() TO authenticated;
GRANT ALL ON FUNCTION public.handle_update_team_notes() TO service_role;


--
-- Name: FUNCTION has_access(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.has_access() TO anon;
GRANT ALL ON FUNCTION public.has_access() TO authenticated;
GRANT ALL ON FUNCTION public.has_access() TO service_role;


--
-- Name: FUNCTION remove_moderator(user_id uuid, project_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.remove_moderator(user_id uuid, project_id bigint) TO anon;
GRANT ALL ON FUNCTION public.remove_moderator(user_id uuid, project_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.remove_moderator(user_id uuid, project_id bigint) TO service_role;


--
-- Name: FUNCTION save_verse(verse_id bigint, new_verse text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.save_verse(verse_id bigint, new_verse text) TO anon;
GRANT ALL ON FUNCTION public.save_verse(verse_id bigint, new_verse text) TO authenticated;
GRANT ALL ON FUNCTION public.save_verse(verse_id bigint, new_verse text) TO service_role;


--
-- Name: FUNCTION save_verses(verses json); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.save_verses(verses json) TO anon;
GRANT ALL ON FUNCTION public.save_verses(verses json) TO authenticated;
GRANT ALL ON FUNCTION public.save_verses(verses json) TO service_role;


--
-- Name: FUNCTION start_chapter(chapter_id bigint, project_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.start_chapter(chapter_id bigint, project_id bigint) TO anon;
GRANT ALL ON FUNCTION public.start_chapter(chapter_id bigint, project_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.start_chapter(chapter_id bigint, project_id bigint) TO service_role;


--
-- Name: TABLE books; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.books TO anon;
GRANT ALL ON TABLE public.books TO authenticated;
GRANT ALL ON TABLE public.books TO service_role;


--
-- Name: SEQUENCE books_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.books_id_seq TO anon;
GRANT ALL ON SEQUENCE public.books_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.books_id_seq TO service_role;


--
-- Name: TABLE briefs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.briefs TO anon;
GRANT ALL ON TABLE public.briefs TO authenticated;
GRANT ALL ON TABLE public.briefs TO service_role;


--
-- Name: SEQUENCE briefs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.briefs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.briefs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.briefs_id_seq TO service_role;


--
-- Name: TABLE chapters; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.chapters TO anon;
GRANT ALL ON TABLE public.chapters TO authenticated;
GRANT ALL ON TABLE public.chapters TO service_role;


--
-- Name: SEQUENCE chapters_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.chapters_id_seq TO anon;
GRANT ALL ON SEQUENCE public.chapters_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.chapters_id_seq TO service_role;


--
-- Name: TABLE dictionaries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.dictionaries TO anon;
GRANT ALL ON TABLE public.dictionaries TO authenticated;
GRANT ALL ON TABLE public.dictionaries TO service_role;


--
-- Name: TABLE languages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.languages TO anon;
GRANT ALL ON TABLE public.languages TO authenticated;
GRANT ALL ON TABLE public.languages TO service_role;


--
-- Name: SEQUENCE languages_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.languages_id_seq TO anon;
GRANT ALL ON SEQUENCE public.languages_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.languages_id_seq TO service_role;


--
-- Name: TABLE methods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.methods TO anon;
GRANT ALL ON TABLE public.methods TO authenticated;
GRANT ALL ON TABLE public.methods TO service_role;


--
-- Name: SEQUENCE methods_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.methods_id_seq TO anon;
GRANT ALL ON SEQUENCE public.methods_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.methods_id_seq TO service_role;


--
-- Name: TABLE personal_notes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.personal_notes TO anon;
GRANT ALL ON TABLE public.personal_notes TO authenticated;
GRANT ALL ON TABLE public.personal_notes TO service_role;


--
-- Name: TABLE progress; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.progress TO anon;
GRANT ALL ON TABLE public.progress TO authenticated;
GRANT ALL ON TABLE public.progress TO service_role;


--
-- Name: SEQUENCE progress_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.progress_id_seq TO anon;
GRANT ALL ON SEQUENCE public.progress_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.progress_id_seq TO service_role;


--
-- Name: TABLE project_coordinators; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.project_coordinators TO anon;
GRANT ALL ON TABLE public.project_coordinators TO authenticated;
GRANT ALL ON TABLE public.project_coordinators TO service_role;


--
-- Name: SEQUENCE project_coordinators_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.project_coordinators_id_seq TO anon;
GRANT ALL ON SEQUENCE public.project_coordinators_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.project_coordinators_id_seq TO service_role;


--
-- Name: TABLE project_translators; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.project_translators TO anon;
GRANT ALL ON TABLE public.project_translators TO authenticated;
GRANT ALL ON TABLE public.project_translators TO service_role;


--
-- Name: SEQUENCE project_translators_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.project_translators_id_seq TO anon;
GRANT ALL ON SEQUENCE public.project_translators_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.project_translators_id_seq TO service_role;


--
-- Name: TABLE projects; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.projects TO anon;
GRANT ALL ON TABLE public.projects TO authenticated;
GRANT ALL ON TABLE public.projects TO service_role;


--
-- Name: SEQUENCE projects_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.projects_id_seq TO anon;
GRANT ALL ON SEQUENCE public.projects_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.projects_id_seq TO service_role;


--
-- Name: TABLE role_permissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.role_permissions TO anon;
GRANT ALL ON TABLE public.role_permissions TO authenticated;
GRANT ALL ON TABLE public.role_permissions TO service_role;


--
-- Name: SEQUENCE role_permissions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.role_permissions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.role_permissions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.role_permissions_id_seq TO service_role;


--
-- Name: TABLE steps; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.steps TO anon;
GRANT ALL ON TABLE public.steps TO authenticated;
GRANT ALL ON TABLE public.steps TO service_role;


--
-- Name: SEQUENCE steps_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.steps_id_seq TO anon;
GRANT ALL ON SEQUENCE public.steps_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.steps_id_seq TO service_role;


--
-- Name: TABLE team_notes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.team_notes TO anon;
GRANT ALL ON TABLE public.team_notes TO authenticated;
GRANT ALL ON TABLE public.team_notes TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: TABLE verses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.verses TO anon;
GRANT ALL ON TABLE public.verses TO authenticated;
GRANT ALL ON TABLE public.verses TO service_role;


--
-- Name: SEQUENCE verses_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.verses_id_seq TO anon;
GRANT ALL ON SEQUENCE public.verses_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.verses_id_seq TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- PostgreSQL database dump complete
--

