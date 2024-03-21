-- DROP ALL DATA
  -- DROP TABLE
    DROP TABLE IF EXISTS PUBLIC.briefs;
    DROP TABLE IF EXISTS PUBLIC.progress;
    DROP TABLE IF EXISTS PUBLIC.verses;
    DROP TABLE IF EXISTS PUBLIC.chapters;
    DROP TABLE IF EXISTS PUBLIC.books;
    DROP TABLE IF EXISTS PUBLIC.steps;
    DROP TABLE IF EXISTS PUBLIC.project_translators;
    DROP TABLE IF EXISTS PUBLIC.project_coordinators;
    DROP TABLE IF EXISTS PUBLIC.personal_notes;
    DROP TABLE IF EXISTS PUBLIC.team_notes;
    DROP TABLE IF EXISTS PUBLIC.dictionaries;
    DROP TABLE IF EXISTS PUBLIC.projects;
    DROP TABLE IF EXISTS PUBLIC.methods;
    DROP TABLE IF EXISTS PUBLIC.users;
    DROP TABLE IF EXISTS PUBLIC.role_permissions;
    DROP TABLE IF EXISTS PUBLIC.languages;
    DROP TABLE IF EXISTS PUBLIC.logs;

  -- END DROP TABLE

  -- DROP TRIGGER
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS on_public_book_created ON PUBLIC.books;
    DROP TRIGGER IF EXISTS on_public_verses_next_step ON PUBLIC.verses;
    DROP TRIGGER IF EXISTS on_public_personal_notes_update ON PUBLIC.personal_notes;
    DROP TRIGGER IF EXISTS on_public_team_notes_update ON PUBLIC.team_notes;
    DROP TRIGGER IF EXISTS alphabet_change_trigger ON PUBLIC.dictionaries;
    DROP TRIGGER IF EXISTS alphabet_insert_trigger ON PUBLIC.dictionaries;
    DROP TRIGGER IF EXISTS on_public_chapters_update ON PUBLIC.chapters;
    DROP TRIGGER IF EXISTS before_insert_set_sorting_personal_notes ON PUBLIC.personal_notes;
    DROP TRIGGER IF EXISTS before_insert_set_sorting_team_notes ON PUBLIC.team_notes;
    DROP TRIGGER IF EXISTS sorting_correction_on_deletion_personal_notes ON PUBLIC.personal_notes;
    DROP TRIGGER IF EXISTS sorting_correction_on_deletion_team_notes ON PUBLIC.team_notes;

  -- END DROP TRIGGER

  -- DROP FUNCTION
    DROP FUNCTION IF EXISTS PUBLIC.authorize;
    DROP FUNCTION IF EXISTS PUBLIC.has_access;
    DROP FUNCTION IF EXISTS PUBLIC.create_brief;
    DROP FUNCTION IF EXISTS PUBLIC.get_current_steps;
    DROP FUNCTION IF EXISTS PUBLIC.assign_moderator;
    DROP FUNCTION IF EXISTS PUBLIC.remove_moderator;
    DROP FUNCTION IF EXISTS PUBLIC.divide_verses;
    DROP FUNCTION IF EXISTS PUBLIC.check_confession;
    DROP FUNCTION IF EXISTS PUBLIC.check_agreement;
    DROP FUNCTION IF EXISTS PUBLIC.admin_only;
    DROP FUNCTION IF EXISTS PUBLIC.can_translate;
    DROP FUNCTION IF EXISTS PUBLIC.block_user;
    DROP FUNCTION IF EXISTS PUBLIC.save_verse;
    DROP FUNCTION IF EXISTS PUBLIC.save_verses;
    DROP FUNCTION IF EXISTS PUBLIC.handle_new_user;
    DROP FUNCTION IF EXISTS PUBLIC.handle_new_book;
    DROP FUNCTION IF EXISTS PUBLIC.handle_next_step;
    DROP FUNCTION IF EXISTS PUBLIC.handle_update_personal_notes;
    DROP FUNCTION IF EXISTS PUBLIC.handle_update_team_notes;
    DROP FUNCTION IF EXISTS PUBLIC.create_chapters;
    DROP FUNCTION IF EXISTS PUBLIC.create_verses;
    DROP FUNCTION IF EXISTS PUBLIC.go_to_step;
    DROP FUNCTION IF EXISTS PUBLIC.get_whole_chapter;
    DROP FUNCTION IF EXISTS PUBLIC.change_finish_chapter;
    DROP FUNCTION IF EXISTS PUBLIC.change_start_chapter;
    DROP FUNCTION IF EXISTS PUBLIC.alphabet_change_handler;
    DROP FUNCTION IF EXISTS PUBLIC.alphabet_insert_handler;
    DROP FUNCTION IF EXISTS PUBLIC.handle_compile_chapter;
    DROP FUNCTION IF EXISTS PUBLIC.update_chapters_in_books;
    DROP FUNCTION IF EXISTS PUBLIC.insert_additional_chapter;
    DROP FUNCTION IF EXISTS PUBLIC.update_verses_in_chapters;
    DROP FUNCTION IF EXISTS PUBLIC.insert_additional_verses;
    DROP FUNCTION IF EXISTS PUBLIC.update_resources_in_projects;
    DROP FUNCTION IF EXISTS PUBLIC.update_project_basic;
    DROP FUNCTION IF EXISTS PUBLIC.update_multiple_steps;
    DROP FUNCTION IF EXISTS PUBLIC.get_max_sorting;
    DROP FUNCTION IF EXISTS PUBLIC.set_sorting_before_insert;
    DROP FUNCTION IF EXISTS PUBLIC.correct_sorting_on_deletion;
    DROP FUNCTION IF EXISTS PUBLIC.move_node;
    DROP FUNCTION IF EXISTS PUBLIC.get_books_not_null_level_checks;
    DROP FUNCTION IF EXISTS PUBLIC.find_books_with_chapters_and_verses;
    DROP FUNCTION IF EXISTS PUBLIC.get_words_page;
    DROP FUNCTION IF EXISTS PUBLIC.chapter_assign;
    DROP FUNCTION IF EXISTS PUBLIC.save_verses_if_null;
    DROP FUNCTION IF EXISTS PUBLIC.get_is_await_team;



  -- END DROP FUNCTION

  -- DROP TYPE
    DROP TYPE IF EXISTS PUBLIC.app_permission;
    DROP TYPE IF EXISTS PUBLIC.project_role;
    DROP TYPE IF EXISTS PUBLIC.project_type;
    DROP TYPE IF EXISTS PUBLIC.book_code;
  -- END DROP TYPE
-- END DROP ALL DATA

-- CREATE CUSTOM TYPE
  CREATE TYPE PUBLIC.app_permission AS enum (
    'dictionaries', 'notes', 'projects', 'verses.set', 'moderator.set', 'user_projects',
    'project_source', 'coordinator.set', 'languages', 'user_languages', 'translator.set'
  );

  CREATE TYPE PUBLIC.project_role AS enum ('coordinator', 'moderator', 'translator');

  CREATE TYPE PUBLIC.project_type AS enum ('obs', 'bible');

  CREATE TYPE PUBLIC.book_code AS enum (
    'gen', 'exo', 'lev', 'num', 'deu', 'jos', 'jdg', 'rut', '1sa', '2sa', '1ki', '2ki', '1ch',
    '2ch', 'ezr', 'neh', 'est', 'job', 'psa', 'pro', 'ecc', 'sng', 'isa', 'jer', 'lam', 'ezk',
    'dan', 'hos', 'jol', 'amo', 'oba', 'jon', 'mic', 'nam', 'hab', 'zep', 'hag', 'zec', 'mal',
    'mat', 'mrk', 'luk', 'jhn', 'act', 'rom', '1co', '2co', 'gal', 'eph', 'php', 'col', '1th',
    '2th', '1ti', '2ti', 'tit', 'phm', 'heb', 'jas', '1pe', '2pe', '1jn', '2jn', '3jn', 'jud',
    'rev', 'obs'
  );
-- END CREATE CUSTOM TYPE

-- CREATE FUNCTION

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


CREATE FUNCTION PUBLIC.get_whole_chapter(project_code TEXT, chapter_num INT2, book_code PUBLIC.book_code) RETURNS TABLE(verse_id BIGINT, num INT2, verse TEXT, translator TEXT)
    LANGUAGE plpgsql SECURITY DEFINER AS $$
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
      WHERE chapters.num = get_whole_chapter.chapter_num AND chapters.project_id = cur_project_id AND chapters.book_id = (SELECT id FROM PUBLIC.books WHERE books.code = get_whole_chapter.book_code AND books.project_id = cur_project_id);

      -- find out the chapter id
      IF cur_chapter_id IS NULL THEN
        RETURN;
      END IF;

      -- return the verse id, number, and text from a specific chapter
      RETURN query SELECT verses.id AS verse_id, verses.num, verses.text AS verse, users.login AS translator
      FROM public.verses LEFT OUTER JOIN public.project_translators ON (verses.project_translator_id = project_translators.id) LEFT OUTER JOIN public.users ON (project_translators.user_id = users.id)
      WHERE verses.project_id = cur_project_id
        AND verses.chapter_id = cur_chapter_id
        AND verses.num < '201'
      ORDER BY verses.num;

    END;
  $$;
  
--save verses if it have at least 1 null value
CREATE FUNCTION PUBLIC.save_verses_if_null(verses JSON, project_id BIGINT) RETURNS BOOLEAN
    LANGUAGE plpgsql SECURITY DEFINER AS $$
    DECLARE
    new_verses RECORD;
    current_verse RECORD;
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

-- assign read-only mode for translator in specific chapter
CREATE FUNCTION PUBLIC.chapter_assign(chapter INT, translators BIGINT[], project_id BIGINT) RETURNS BOOLEAN
  LANGUAGE plpgsql SECURITY DEFINER AS $$
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

-- return words from pages dict
CREATE FUNCTION get_words_page(
    search_query TEXT,  
    words_per_page INT,  
    page_number INT,  
    project_id_param BIGINT
  ) 
  RETURNS TABLE (
    dict_id TEXT,
    dict_project_id BIGINT,
    dict_title TEXT,
    dict_data JSON,
    dict_created_at TIMESTAMP,
    dict_changed_at TIMESTAMP,
    dict_deleted_at TIMESTAMP,
    total_records BIGINT
  )  
  LANGUAGE plpgsql SECURITY DEFINER AS $$
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



  -- function returns your maximum role on the project
  CREATE FUNCTION PUBLIC.authorize(
        user_id uuid,
        project_id BIGINT
      ) RETURNS TEXT
      LANGUAGE plpgsql SECURITY DEFINER AS $$
      DECLARE
        bind_permissions INT;
        priv RECORD;
      BEGIN
        SELECT u.is_admin AS is_admin,
          pc.project_id*1 IS NOT NULL AS is_coordinator,
          pt.project_id*1 IS NOT NULL AS is_translator,
          pt.is_moderator IS TRUE AS is_moderator
        FROM public.users AS u
          LEFT JOIN public.project_coordinators AS pc
            ON (u.id = pc.user_id AND pc.project_id = authorize.project_id)
          LEFT JOIN public.project_translators AS pt
            ON (u.id = pt.user_id AND pt.project_id = authorize.project_id)
        WHERE u.id = authorize.user_id AND u.blocked IS NULL INTO priv;

        IF priv.is_admin THEN
          RETURN 'admin';
        END IF;

        IF priv.is_coordinator THEN
          RETURN 'coordinator';
        END IF;

        IF priv.is_moderator THEN
          RETURN 'moderator';
        END IF;

        IF priv.is_translator THEN
          RETURN 'translator';
        END IF;

        RETURN 'user';

      END;
    $$;

-- getting all the books that specify the levels of checks
CREATE FUNCTION get_books_not_null_level_checks(project_code text) 
  RETURNS TABLE (book_code public.book_code, level_checks json) 
  LANGUAGE plpgsql SECURITY DEFINER AS $$
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

-- getting all books with verses that are started and non-zero translation texts
CREATE FUNCTION find_books_with_chapters_and_verses(project_code text)
  RETURNS TABLE (book_code public.book_code, chapter_num smallint, verse_num smallint, verse_text text)  
  LANGUAGE plpgsql SECURITY DEFINER AS $$
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

CREATE FUNCTION PUBLIC.handle_compile_chapter() RETURNS TRIGGER
    LANGUAGE plpgsql SECURITY DEFINER AS $$
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

  -- create chapters
  CREATE FUNCTION PUBLIC.create_chapters(book_id BIGINT) RETURNS BOOLEAN
    LANGUAGE plpgsql SECURITY DEFINER AS $$
    DECLARE
      book RECORD;
      chapter RECORD;
    BEGIN
      -- 1. Getting json list of chapters and verses for a book
      SELECT id, chapters, project_id FROM PUBLIC.books WHERE id = create_chapters.book_id INTO book;

      IF authorize(auth.uid(), book.project_id) NOT IN ('admin', 'coordinator') THEN
        RETURN FALSE;
      END IF;

      FOR chapter IN SELECT * FROM json_each_text(book.chapters)
      LOOP
        INSERT INTO
          PUBLIC.chapters (num, book_id, verses, project_id)
        VALUES
          (chapter.key::INT2 , book.id, chapter.value::int4, book.project_id);
      END LOOP;
      -- 2. Probably not an option to immediately create all the verses and all the chapters
      -- 3. Let's create all the chapters of the book. And we will make some thread function that will then create all the verses

      RETURN true;

    END;
  $$;

  -- batch save verses
  CREATE FUNCTION PUBLIC.save_verses(verses JSON) RETURNS BOOLEAN
    LANGUAGE plpgsql SECURITY DEFINER AS $$
    DECLARE
    new_verses RECORD;
    BEGIN
      -- find out the id of the translator on the project
      -- find out the ID of the chapter we are translating, make sure that the translation is still in progress
      -- in a loop update the text of the verses, taking into account the id of the translator and the chapter
      -- Maybe take the chapter number here. Get the IDs of all the verse that this user has. And then in the cycle to compare these IDs
      -- TODO correct necessarily
      FOR new_verses IN SELECT * FROM json_each_text(save_verses.verses)
      LOOP
        UPDATE
          PUBLIC.verses
        SET "text" = new_verses.value::TEXT
        WHERE
          verses.id = new_verses.key::BIGINT;
      END LOOP;

      RETURN true;

    END;
  $$;


  -- create verses
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

  -- create update_project_basic
  CREATE FUNCTION PUBLIC.update_project_basic( project_code TEXT,title TEXT,orig_title TEXT,code TEXT, language_id BIGINT ) RETURNS BOOLEAN
    LANGUAGE plpgsql SECURITY DEFINER AS $$
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

      UPDATE PUBLIC.projects SET code = update_project_basic.code, title=update_project_basic.title, orig_title = update_project_basic.orig_title, language_id = update_project_basic.language_id WHERE projects.id = project_id;

      RETURN TRUE;

    END;
   $$;

  -- update multiple steps
  CREATE FUNCTION update_multiple_steps(steps jsonb[], project_id BIGINT) RETURNS BOOLEAN
      LANGUAGE plpgsql SECURITY DEFINER AS $$
    DECLARE
      step jsonb;
    BEGIN
      IF authorize(auth.uid(), update_multiple_steps.project_id) NOT IN ('admin') THEN
        RETURN FALSE;
      END IF;
      FOREACH step IN ARRAY update_multiple_steps.steps
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

  -- This function calculates the next available sorting value for root records in the personal_notes & team_notes table
  CREATE FUNCTION PUBLIC.get_max_sorting(table_name TEXT, user_id UUID DEFAULT NULL, project_id INT8 DEFAULT NULL) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER AS $$
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
  $$;

  -- This function sets the sort value for a new entry in the personal_notes & team_notes table
  CREATE FUNCTION PUBLIC.set_sorting_before_insert() RETURNS TRIGGER
      LANGUAGE plpgsql SECURITY DEFINER AS $$
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

  -- Updating sorting values for the remaining records in the table after deleting an element
  CREATE FUNCTION PUBLIC.correct_sorting_on_deletion() RETURNS TRIGGER
  LANGUAGE plpgsql SECURITY DEFINER AS $$
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
  $$;

  -- Function for Drag and Drop node repositioning in the notes tree
  CREATE FUNCTION PUBLIC.move_node(
    new_sorting_value INT,
    dragged_node_id VARCHAR,
    new_parent_id VARCHAR,
    table_name TEXT,
    project_id INT8 DEFAULT NULL,
    user_id UUID DEFAULT NULL
  ) RETURNS VOID
  LANGUAGE plpgsql SECURITY DEFINER AS $$
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
  $$;

-- END CREATE FUNCTION

-- USERS
  -- TABLE
    CREATE TABLE PUBLIC.users (
      id uuid NOT NULL primary key,
      email TEXT NOT NULL UNIQUE,
      login TEXT NOT NULL UNIQUE,
      agreement BOOLEAN NOT NULL DEFAULT FALSE,
      confession BOOLEAN NOT NULL DEFAULT FALSE,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      blocked TIMESTAMP DEFAULT NULL,
      avatar_url VARCHAR(255) DEFAULT NULL
    );

    ALTER TABLE
      PUBLIC.users enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS
    -- Only the superadmin can directly work with this table
    -- Then fix it so that you can only get users with whom you work on the project. That it was impossible to receive all with one request.
    -- And put restrictions on which fields to return
    -- If the admin needs to work, then we will either set it up here, or he will work through the service key (all requests only through api)
    DROP POLICY IF EXISTS "Залогиненый юзер может получить список всех юзеров" ON PUBLIC.users;
    CREATE POLICY "Залогиненый юзер может получить список всех юзеров" ON PUBLIC.users FOR
    SELECT
      TO authenticated USING (TRUE);

  -- END RLS
-- END USERS

-- ROLE PERMISSIONS
  -- TABLE
    CREATE TABLE PUBLIC.role_permissions (
      id BIGINT GENERATED ALWAYS AS IDENTITY primary key,
      role project_role NOT NULL,
      permission app_permission NOT NULL,
      UNIQUE (role, permission)
    );
    COMMENT ON TABLE PUBLIC.role_permissions IS 'Application permissions for each role.';

    ALTER TABLE
      PUBLIC.role_permissions enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS
  -- END RLS
-- END ROLE PERMISSIONS

-- LANGUAGES
  --TABLE
    CREATE TABLE PUBLIC.languages (
      id BIGINT GENERATED ALWAYS AS IDENTITY primary key,
      eng TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      orig_name TEXT NOT NULL,
      is_gl BOOLEAN NOT NULL DEFAULT FALSE
    );

    -- Secure languages
    ALTER TABLE
      PUBLIC.languages enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Залогиненый юзер может получить список всех языков" ON PUBLIC.languages;

    CREATE POLICY "Залогиненый юзер может получить список всех языков" ON PUBLIC.languages FOR
    SELECT
      TO authenticated USING (TRUE);

    DROP POLICY IF EXISTS "Создавать может только админ" ON PUBLIC.languages;

    CREATE POLICY "Создавать может только админ" ON PUBLIC.languages FOR
    INSERT
      WITH CHECK (admin_only());

    DROP POLICY IF EXISTS "Обновлять может только админ" ON PUBLIC.languages;

    CREATE POLICY "Обновлять может только админ" ON PUBLIC.languages FOR
    UPDATE
      USING (admin_only());

    DROP POLICY IF EXISTS "Удалять может только админ" ON PUBLIC.languages;

    CREATE POLICY "Удалять может только админ" ON PUBLIC.languages FOR
    DELETE
      USING (admin_only());
  -- END RLS
-- END LANGUAGES

-- METHODS
  -- TABLE
    CREATE TABLE PUBLIC.methods (
      id BIGINT GENERATED ALWAYS AS IDENTITY primary key,
      title TEXT NOT NULL,
      steps JSON,
      resources JSON,
      "type" project_type NOT NULL DEFAULT 'bible'::project_type,
      brief JSON DEFAULT '[]'
    );
    -- Secure methods
    ALTER TABLE
      PUBLIC.methods enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS
    -- it is a global table with methods. I don't think admins should be allowed to edit here. Only superadmins can add methods, so that everyone does not fix anything here.
    -- If we imagine that other teams will connect to this platform, then I have two ideas. Or they can edit the method during project creation. Or add a user ID field to each method in this table. So that in the future he could only edit his methods.
    DROP POLICY IF EXISTS "Админ может получить список всех методов" ON PUBLIC.methods;

    CREATE POLICY "Админ может получить список всех методов" ON PUBLIC.methods FOR
    SELECT
      TO authenticated USING (admin_only());

    -- Now only the superadmin can add, delete, fix. There are not many methods, they do not appear every month.
  -- END RLS
-- END METHODS

-- PROJECTS
  -- TABLE
    CREATE TABLE PUBLIC.projects (
      id BIGINT GENERATED ALWAYS AS IDENTITY primary key,
      title TEXT NOT NULL,
      orig_title TEXT DEFAULT NULL,
      code TEXT NOT NULL,
      language_id BIGINT REFERENCES PUBLIC.languages ON
      DELETE
        CASCADE NOT NULL,
      "type" project_type NOT NULL,
      resources JSON,
      method TEXT NOT NULL,
      base_manifest JSON,
      dictionaries_alphabet jsonb DEFAULT '[]',
      UNIQUE (code, language_id)
    );

    COMMENT ON COLUMN public.projects.type
        IS 'копируется с таблицы методов';

    COMMENT ON COLUMN public.projects.resources
        IS 'копируем с таблицы методов, должны быть заполнены ссылки, указываем овнера, репо, коммит';

    COMMENT ON COLUMN public.projects.method
        IS 'копируем без изменений название метода с таблицы шаблонов';

    ALTER TABLE
      PUBLIC.projects enable ROW LEVEL SECURITY;
  -- END TABLE


  -- RLS
    DROP POLICY IF EXISTS "Админ видит все проекты, остальные только те, на которых они назначены" ON PUBLIC.projects;

    CREATE POLICY "Админ видит все проекты, остальные только те, на которых они назначены" ON PUBLIC.projects FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), id) != 'user');

    DROP POLICY IF EXISTS "Создавать может только админ" ON PUBLIC.projects;

    CREATE POLICY "Создавать может только админ" ON PUBLIC.projects FOR
    INSERT
      WITH CHECK (admin_only());

    -- meanwhile we will do that only the admin can update. Can the coordinator make a function to update only some fields
    DROP POLICY IF EXISTS "Обновлять может только админ" ON PUBLIC.projects;

    CREATE POLICY "Обновлять может только админ" ON PUBLIC.projects FOR
    UPDATE
      USING (admin_only());

    -- We won't delete anything for now. Only in super admin mode
  -- END RLS
-- END PROJECTS

-- PROJECT TRANSLATORS
  -- TABLE
    CREATE TABLE PUBLIC.project_translators (
      id BIGINT GENERATED ALWAYS AS IDENTITY primary key,
      project_id BIGINT REFERENCES PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      is_moderator BOOLEAN DEFAULT false,
      user_id uuid REFERENCES PUBLIC.users ON
      DELETE
        CASCADE NOT NULL,
      UNIQUE (project_id, user_id)
    );
    ALTER TABLE
      PUBLIC.project_translators enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Админ видит всех, остальные только тех кто с ними на проекте" ON PUBLIC.project_translators;

    CREATE POLICY "Админ видит всех, остальные только тех кто с ними на проекте" ON PUBLIC.project_translators FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

    DROP POLICY IF EXISTS "Добавлять на проект может админ или кординатор проекта" ON PUBLIC.project_translators;

    CREATE POLICY "Добавлять на проект может админ или кординатор проекта" ON PUBLIC.project_translators FOR
    INSERT
      WITH CHECK (authorize(auth.uid(), project_id) IN ('admin', 'coordinator'));

    DROP POLICY IF EXISTS "Удалять с проекта может админ или кординатор проекта" ON PUBLIC.project_translators;

    CREATE POLICY "Удалять с проекта может админ или кординатор проекта" ON PUBLIC.project_translators FOR
    DELETE
      USING (authorize(auth.uid(), project_id) IN ('admin', 'coordinator'));

  -- END RLS
-- END PROJECT TRANSLATORS

-- PROJECT COORDINATORS
  -- TABLE
    CREATE TABLE PUBLIC.project_coordinators (
      id BIGINT GENERATED ALWAYS AS IDENTITY primary key,
      project_id BIGINT REFERENCES PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      user_id uuid REFERENCES PUBLIC.users ON
      DELETE
        CASCADE NOT NULL,
      UNIQUE (project_id, user_id)
    );
    ALTER TABLE
      PUBLIC.project_coordinators enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Админ видит всех, остальные только тех кто с ними на проекте" ON PUBLIC.project_coordinators;

    CREATE POLICY "Админ видит всех, остальные только тех кто с ними на проекте" ON PUBLIC.project_coordinators FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

    DROP POLICY IF EXISTS "Добавлять на проект может только админ" ON PUBLIC.project_coordinators;

    CREATE POLICY "Добавлять на проект может только админ" ON PUBLIC.project_coordinators FOR
    INSERT
      WITH CHECK (admin_only());

    DROP POLICY IF EXISTS "Удалять только админ" ON PUBLIC.project_coordinators;

    CREATE POLICY "Удалять только админ" ON PUBLIC.project_coordinators FOR
    DELETE
      USING (admin_only());
  -- END RLS
-- END PROJECT COORDINATORS

-- BRIEFS
  -- TABLE
    CREATE TABLE PUBLIC.briefs (
      id BIGINT GENERATED ALWAYS AS IDENTITY primary key,
      project_id BIGINT REFERENCES PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL UNIQUE,
      data_collection JSON DEFAULT NULL,
      is_enable BOOLEAN DEFAULT true
    );

    ALTER TABLE
      PUBLIC.briefs enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Видят все кто на проекте и админ" ON PUBLIC.briefs;

    CREATE POLICY "Видят все кто на проекте и админ" ON PUBLIC.briefs FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

    DROP POLICY IF EXISTS "Изменять может админ, кординатор и модератор" ON PUBLIC.briefs;

    CREATE POLICY "Изменять может админ, кординатор и модератор" ON PUBLIC.briefs FOR
    UPDATE
      USING (authorize(auth.uid(), project_id) NOT IN ('user', 'translator'));
    -- cannot be created or deleted directly
  -- END RLS
-- END BRIEFS

-- STEPS
  -- TABLE
    CREATE TABLE PUBLIC.steps (
      id BIGINT GENERATED ALWAYS AS IDENTITY primary key,
      title TEXT NOT NULL,
      "description" TEXT DEFAULT NULL,
      intro TEXT DEFAULT NULL,
      count_of_users INT2 NOT NULL,
      whole_chapter BOOLEAN DEFAULT true,
      "time" INT2 NOT NULL,
      is_awaiting_team BOOLEAN DEFAULT false,
      project_id BIGINT REFERENCES PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      config JSON NOT NULL,
      sorting INT2 NOT NULL,
        UNIQUE (project_id, sorting)
    );

    COMMENT ON COLUMN public.steps.sorting
        IS 'это поле юзер не редактирует. Мы его указываем сами. Пока что будем получать с клиента.';
    ALTER TABLE
      PUBLIC.steps enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Получают данные по шагам все кто на проекте" ON PUBLIC.steps;

    CREATE POLICY "Получают данные по шагам все кто на проекте" ON PUBLIC.steps FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

    DROP POLICY IF EXISTS "Добавлять можно только админу" ON PUBLIC.steps;

    CREATE POLICY "Добавлять можно только админу" ON PUBLIC.steps FOR
    INSERT
      WITH CHECK (admin_only());

    DROP POLICY IF EXISTS "Обновлять может только админ" ON PUBLIC.steps;

    CREATE POLICY "Обновлять может только админ" ON PUBLIC.steps FOR
      UPDATE
          USING (admin_only());
  -- END RLS
-- END STEPS

-- BOOKS
  -- TABLE
    CREATE TABLE PUBLIC.books (
      id BIGINT GENERATED ALWAYS AS IDENTITY primary key,
      code book_code NOT NULL,
      project_id BIGINT REFERENCES PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      "text" TEXT DEFAULT NULL,
      chapters JSON,
      level_checks JSON,
      properties JSON DEFAULT NULL,
      UNIQUE (project_id, code)
    );

    COMMENT ON TABLE public.books
        IS 'У каждой книги потом прописать ее вес. Рассчитать на основе англ или русских ресурсов (сколько там слов). Подумать о том, что будет если удалить проект. Так как в таблице книги мы хотим хранить текст. Отобразим 66 книг Библии или 1 ОБС. В будущем парсить манифест чтобы отображать книги которые уже готовы. Или в момент когда админ нажмет "Создать книгу" проверить есть ли они, если нет то выдать предупреждение. При создании проекта он указывает сразу метод. Придумать так чтобы нельзя было добавлять новые шаги после всего. Может сделать функцию, которая проверяет код книги, и добавляет. Тогда никто лишнего не отправит.';

    COMMENT ON COLUMN public.books.text
        IS 'Здесь мы будем собирать книгу чтобы не делать много запросов. Возьмем все главы и объединим. Так же тут со временем пропишем вес книги на основе англ или русского ресурса. Делать это надо через функцию какую-то, чтобы она собрала сама книгу.';
    ALTER TABLE
      PUBLIC.books enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Получают книги все кто на проекте" ON PUBLIC.books;

    CREATE POLICY "Получают книги все кто на проекте" ON PUBLIC.books FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

    DROP POLICY IF EXISTS "Добавлять можно админу или координатору" ON PUBLIC.books;

    CREATE POLICY "Добавлять можно админу или координатору" ON PUBLIC.books FOR
      INSERT
      WITH CHECK (authorize(auth.uid(), project_id) IN ('admin', 'coordinator'));

  -- END RLS
-- END BOOKS

-- CHAPTERS
  -- TABLE
    CREATE TABLE PUBLIC.chapters (
      id BIGINT GENERATED ALWAYS AS IDENTITY primary key,
      num INT2 NOT NULL,
      book_id BIGINT REFERENCES PUBLIC.books ON
      DELETE
        CASCADE NOT NULL,
      project_id BIGINT REFERENCES PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      "text" jsonb DEFAULT NULL,
      verses INTEGER,
      started_at TIMESTAMP DEFAULT NULL,
      finished_at TIMESTAMP DEFAULT NULL,
        UNIQUE (book_id, num)
    );
    ALTER TABLE
      PUBLIC.chapters enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Получают книги все кто на проекте" ON PUBLIC.chapters;

    CREATE POLICY "Получают книги все кто на проекте" ON PUBLIC.chapters FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

  -- END RLS

-- END CHAPTERS

-- VERSES
  -- TABLE
    CREATE TABLE PUBLIC.verses (
      id BIGINT GENERATED ALWAYS AS IDENTITY primary key,
      num INT2 NOT NULL,
      "text" TEXT DEFAULT NULL,
      current_step BIGINT REFERENCES PUBLIC.steps ON
      DELETE
        CASCADE NOT NULL,
      chapter_id BIGINT REFERENCES PUBLIC.chapters ON
      DELETE
        CASCADE NOT NULL,
      project_id BIGINT REFERENCES PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      project_translator_id BIGINT REFERENCES PUBLIC.project_translators ON
      DELETE
        CASCADE DEFAULT NULL,
        UNIQUE (chapter_id, num)
    );

    COMMENT ON COLUMN public.verses.text
        IS 'тут будет храниться последний текст. Когда мы переходим на следующий шаг, мы копируем текст и номер предыдущего шага';

    COMMENT ON COLUMN public.verses.current_step
        IS 'Скорее всего тут придется хранить айдишник шага. Так как несколько переводчиков то часть стихов может быть на одном а часть на другом шаге. Переводчик у нас на уровне проекта а не главы, чтобы можно было у переводчика хранить, на каком он шаге.';
    ALTER TABLE
      PUBLIC.verses enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Стих получить может переводчик, координатор проекта, модератор и админ" ON PUBLIC.verses;

    CREATE POLICY "Стих получить может переводчик, координатор проекта, модератор и админ" ON PUBLIC.verses FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

    -- We create verses automatically, so no one can add

    -- Direct editing is also forbidden. We can edit only two fields, the current step and the text of the verse

  -- END RLS
-- END VERSES

-- PROGRESS
  -- TABLE
    CREATE TABLE PUBLIC.progress (
      id BIGINT GENERATED ALWAYS AS IDENTITY primary key,
      verse_id BIGINT REFERENCES PUBLIC.verses ON
      DELETE
        CASCADE NOT NULL,
      step_id BIGINT REFERENCES PUBLIC.steps ON
      DELETE
        CASCADE NOT NULL,
      "text" TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    ALTER TABLE
      PUBLIC.progress enable ROW LEVEL SECURITY;
  -- END TABLE

  -- I added a trigger when the step number in the verse table is updated - then we copy the new content and the old step ID

  -- RLS
  -- END RLS
-- END PROGRESS

-- PERSONAL NOTES
  -- TABLE
    CREATE TABLE PUBLIC.personal_notes (
      id TEXT NOT NULL primary key,
      user_id uuid REFERENCES PUBLIC.users ON
      DELETE
        CASCADE NOT NULL,
      title TEXT DEFAULT NULL,
      data JSON DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      changed_at TIMESTAMP DEFAULT NOW(),
      deleted_at TIMESTAMP DEFAULT NULL,
      is_folder BOOLEAN DEFAULT FALSE,
      parent_id TEXT DEFAULT NULL,
      sorting INT DEFAULT NULL
    );
    ALTER TABLE
      PUBLIC.personal_notes enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS

    DROP POLICY IF EXISTS "Залогиненый юзер может добавить личную заметку" ON PUBLIC.personal_notes;

    CREATE POLICY "Залогиненый юзер может добавить личную заметку" ON PUBLIC.personal_notes FOR
    INSERT
      TO authenticated WITH CHECK (TRUE);

    DROP POLICY IF EXISTS "Залогиненый юзер может удалить личную заметку" ON PUBLIC.personal_notes;

    CREATE POLICY "Залогиненый юзер может удалить личную заметку" ON PUBLIC.personal_notes FOR
    DELETE
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Залогиненый юзер может изменить личную заметку" ON PUBLIC.personal_notes;

    CREATE POLICY "Залогиненый юзер может изменить личную заметку" ON PUBLIC.personal_notes FOR
    UPDATE
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Показывать личные заметки данного пользователя" ON PUBLIC.personal_notes;

    CREATE POLICY "Показывать личные заметки данного пользователя" ON PUBLIC.personal_notes FOR
    SELECT
     USING (auth.uid() = user_id);

  -- END RLS
-- END PERSONAL NOTES

-- TEAM NOTES
  -- TABLE
    CREATE TABLE PUBLIC.team_notes (
      id TEXT NOT NULL primary key,
      project_id BIGINT REFERENCES PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      title TEXT DEFAULT NULL,
      data JSON DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      changed_at TIMESTAMP DEFAULT NOW(),
      deleted_at TIMESTAMP DEFAULT NULL,
      is_folder BOOLEAN DEFAULT FALSE,
      parent_id TEXT DEFAULT NULL,
      sorting INT DEFAULT NULL
    );
    ALTER TABLE
      PUBLIC.team_notes enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS
    -- An administrator or coordinator can add a team note
    DROP POLICY IF EXISTS "team_notes insert" ON PUBLIC.team_notes;
    CREATE POLICY "team_notes insert" ON PUBLIC.team_notes FOR
    INSERT
      WITH CHECK (authorize(auth.uid(), project_id) IN ('admin', 'coordinator', 'moderator'));

    -- An administrator or coordinator can delete a team note
    DROP POLICY IF EXISTS "team_notes delete" ON PUBLIC.team_notes;
    CREATE POLICY "team_notes delete" ON PUBLIC.team_notes FOR
    DELETE
      USING (authorize(auth.uid(), project_id) IN ('admin', 'coordinator', 'moderator'));

    -- The administrator or coordinator can change the team note
    DROP POLICY IF EXISTS "team_notes update" ON PUBLIC.team_notes;
    CREATE POLICY "team_notes update" ON PUBLIC.team_notes FOR
    UPDATE
      USING (authorize(auth.uid(), project_id) IN ('admin', 'coordinator', 'moderator'));

    -- Everyone on the project can read team notes
    DROP POLICY IF EXISTS "team_notes select" ON PUBLIC.team_notes;
    CREATE POLICY "team_notes select" ON PUBLIC.team_notes FOR
    SELECT
     USING (authorize(auth.uid(), project_id) != 'user');

  -- END RLS
-- END TEAM NOTES

-- DICTIONARIES
  -- TABLE
    CREATE TABLE PUBLIC.dictionaries (
      id TEXT NOT NULL primary key,
      project_id BIGINT REFERENCES PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      title TEXT DEFAULT NULL,
      data JSON DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      changed_at TIMESTAMP DEFAULT NOW(),
      deleted_at TIMESTAMP DEFAULT NULL
    );
    ALTER TABLE
      PUBLIC.dictionaries enable ROW LEVEL security;
    CREATE UNIQUE INDEX dictionaries_project_id_title_indx ON PUBLIC.dictionaries (project_id, title) WHERE deleted_at IS NULL;
  -- END TABLE

  -- RLS
    -- Administrator, coordinator or moderator can add a new word
    DROP POLICY IF EXISTS "word insert" ON PUBLIC.dictionaries;
    CREATE POLICY "word insert" ON PUBLIC.dictionaries FOR
    INSERT
      WITH CHECK (authorize(auth.uid(), project_id) IN ('admin', 'coordinator', 'moderator'));

    -- An administrator, coordinator or moderator can delete a word
    DROP POLICY IF EXISTS "word delete" ON PUBLIC.dictionaries;
    CREATE POLICY "word delete" ON PUBLIC.dictionaries FOR
    DELETE
      USING (authorize(auth.uid(), project_id) IN ('admin', 'coordinator', 'moderator'));

    -- Administrator, coordinator or moderator can change the word
    DROP POLICY IF EXISTS "word update" ON PUBLIC.dictionaries;
    CREATE POLICY "word update" ON PUBLIC.dictionaries FOR
    UPDATE
      USING (authorize(auth.uid(), project_id) IN ('admin', 'coordinator', 'moderator'));

    -- Everyone on the project can view the words
    DROP POLICY IF EXISTS "words select" ON PUBLIC.dictionaries;
    CREATE POLICY "words select" ON PUBLIC.dictionaries FOR
    SELECT
     USING (authorize(auth.uid(), project_id) != 'user');

  -- END RLS
-- END DICTIONARIES

-- LOGS
  -- TABLE
    CREATE TABLE PUBLIC.logs (
      id BIGINT GENERATED ALWAYS AS IDENTITY primary key,
      created_at TIMESTAMP DEFAULT NOW(),
      log jsonb
    );

    ALTER TABLE
      PUBLIC.logs enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS
  -- END RLS
-- END LOGS

-- Send "previous data" on change

  ALTER TABLE
    PUBLIC.users REPLICA IDENTITY full;

  ALTER TABLE
    PUBLIC.languages REPLICA IDENTITY full;
-- END Send "previous data" on change

-- TRIGGERS
  -- trigger the function every time a user is created

    CREATE TRIGGER on_auth_user_created AFTER
      INSERT
        ON auth.users FOR each ROW EXECUTE FUNCTION PUBLIC.handle_new_user();

  -- trigger the function every time a book is created

    CREATE TRIGGER on_public_book_created AFTER
      INSERT
        ON PUBLIC.books FOR each ROW EXECUTE FUNCTION PUBLIC.handle_new_book();

  -- trigger the function every time a project is created

    CREATE TRIGGER on_public_verses_next_step AFTER
      UPDATE
        ON PUBLIC.verses FOR each ROW EXECUTE FUNCTION PUBLIC.handle_next_step();

  -- trigger the function every time a note is update

    CREATE TRIGGER on_public_personal_notes_update BEFORE
      UPDATE
        ON PUBLIC.personal_notes FOR each ROW EXECUTE FUNCTION PUBLIC.handle_update_personal_notes();

  CREATE TRIGGER on_public_team_notes_update BEFORE
    UPDATE
      ON PUBLIC.team_notes FOR each ROW EXECUTE FUNCTION PUBLIC.handle_update_team_notes();

  CREATE TRIGGER alphabet_change_trigger AFTER
    UPDATE
      ON PUBLIC.dictionaries FOR each ROW EXECUTE FUNCTION PUBLIC.alphabet_change_handler();

  CREATE TRIGGER alphabet_insert_trigger BEFORE
  INSERT
    ON PUBLIC.dictionaries FOR each ROW EXECUTE FUNCTION PUBLIC.alphabet_insert_handler();

  CREATE TRIGGER on_public_chapters_update BEFORE
    UPDATE
      ON PUBLIC.chapters FOR each ROW EXECUTE FUNCTION PUBLIC.handle_compile_chapter();

  -- This trigger automatically sets the sorting when a new record is inserted.

    CREATE TRIGGER before_insert_set_sorting_personal_notes BEFORE
      INSERT
        ON PUBLIC.personal_notes FOR each ROW EXECUTE FUNCTION PUBLIC.set_sorting_before_insert();

    CREATE TRIGGER before_insert_set_sorting_team_notes BEFORE
      INSERT
        ON PUBLIC.team_notes FOR each ROW EXECUTE FUNCTION PUBLIC.set_sorting_before_insert();

  -- After deleting a table element, we update the sorting for the remaining records
  CREATE TRIGGER sorting_correction_on_deletion_personal_notes AFTER
    UPDATE
      ON PUBLIC.personal_notes FOR each ROW EXECUTE FUNCTION PUBLIC.correct_sorting_on_deletion();

  CREATE TRIGGER sorting_correction_on_deletion_team_notes AFTER
    UPDATE
      ON PUBLIC.team_notes FOR each ROW EXECUTE FUNCTION PUBLIC.correct_sorting_on_deletion();

-- END TRIGGERS

-- REALTIME SUBSCRIPTIONS
    -- Only allow realtime listening on public tables.
    BEGIN;

    -- remove the realtime publication
    DROP publication IF EXISTS supabase_realtime;

    -- re-create the publication but don't enable it for any tables
    CREATE publication supabase_realtime;

    COMMIT;

    -- add tables to the publication
      ALTER publication supabase_realtime
        ADD TABLE PUBLIC.verses;

      ALTER publication supabase_realtime
        ADD TABLE PUBLIC.users;

      ALTER publication supabase_realtime
      ADD TABLE PUBLIC.briefs;
-- END REALTIME SUBSCRIPTIONS

-- DUMMY DATA
  -- USERS
    DELETE FROM
      PUBLIC.users;
  -- END USERS

  -- LANGUAGES
    DELETE FROM
      PUBLIC.languages;

    INSERT INTO
      PUBLIC.languages (eng, code, orig_name, is_gl)
    VALUES
      ('english', 'en', 'english', TRUE),
      ('russian', 'ru', 'русский', TRUE),
      ('kazakh', 'kk', 'казахский', FALSE);
  -- END LANGUAGES

  -- METHODS
    DELETE FROM
      PUBLIC.methods;

    INSERT INTO
      PUBLIC.methods (title, resources, steps, "type", brief)
    VALUES
      ('CANA Bible crash test', '{"simplified":false, "literal":true, "tnotes":false, "twords":false, "tquestions":false}', '[
  {
    "title": "1 ШАГ - ОБЗОР КНИГИ",
    "description": "Это индивидуальная работа и выполняется до встречи с другими участниками команды КРАШ-ТЕСТА.\n\n\n\nЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: убедиться, что материалы букпэкеджа подготовлены корректно и не содержат ошибок или каких-либо трудностей для использования переводчиками.\n\nЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.\n\n\n\n\n\nОБЩИЙ ОБЗОР К КНИГЕ\n\nПрочитайте общий обзор к книге. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в общем обзоре к книге.\n\nЭто задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно. \n\n\n\nОБЗОР К ГЛАВЕ\n\nПрочитайте обзор к главе. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в обзоре к главе.\n\n\n\nЧТЕНИЕ ДОСЛОВНОЙ БИБЛИИ РОБ-Д (RLOB)\n\nПрочитайте ГЛАВУ ДОСЛОВНОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nЧТЕНИЕ СМЫСЛОВОЙ БИБЛИИ РОБ-С (RSOB)\n\nПрочитайте ГЛАВУ СМЫСЛОВОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА»\n\nПрочитайте СЛОВА к главе. Необходимо прочитать статьи к каждому слову. Отметьте для обсуждения командой статьи к словам, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ»\n\nПрочитайте ЗАМЕТКИ к главе. Необходимо прочитать ЗАМЕТКИ к каждому отрывку. Отметьте для обсуждения командой ЗАМЕТКИ, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.",
    "time": 60,
    "whole_chapter": true,
    "count_of_users": 1,
    "is_awaiting_team": false,
    "intro": "https://youtu.be/IAxFRRy5qw8\n\nЭто индивидуальная работа и выполняется до встречи с другими участниками команды КРАШ-ТЕСТА.\n\n\n\nЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: убедиться, что материалы букпэкеджа подготовлены корректно и не содержат ошибок или каких-либо трудностей для использования переводчиками.\n\nЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.\n\n\n\n\n\nОБЩИЙ ОБЗОР К КНИГЕ\n\nПрочитайте общий обзор к книге. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в общем обзоре к книге.\n\nЭто задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно. \n\n\n\nОБЗОР К ГЛАВЕ\n\nПрочитайте обзор к главе. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в обзоре к главе.\n\n\n\nЧТЕНИЕ ДОСЛОВНОЙ БИБЛИИ РОБ-Д (RLOB)\n\nПрочитайте ГЛАВУ ДОСЛОВНОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nЧТЕНИЕ СМЫСЛОВОЙ БИБЛИИ РОБ-С (RSOB)\n\nПрочитайте ГЛАВУ СМЫСЛОВОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА»\n\nПрочитайте СЛОВА к главе. Необходимо прочитать статьи к каждому слову. Отметьте для обсуждения командой статьи к словам, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ»\n\nПрочитайте ЗАМЕТКИ к главе. Необходимо прочитать ЗАМЕТКИ к каждому отрывку. Отметьте для обсуждения командой ЗАМЕТКИ, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.",
    "config": [
      {
        "size": 2,
        "tools": [
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
          },
          {
            "name": "literal",
            "config": {}
          },
          {
            "name": "simplified",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
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
    "title": "2 ШАГ - КОМАНДНОЕ ИЗУЧЕНИЕ ТЕКСТА",
    "description": "Это командная работа и мы рекомендуем потратить на нее не более 120 минут.\n\n\n\nЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: обсудить с командой материалы букпэкеджа. Для этого поделитесь заметками, которые вы сделали при индивидуальной работе. Обсудите все предложенные правки по инструментам букпэкеджа. Запишите командное резюме по ним для передачи команде, работающей над букпэкеджом.\n\nЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: обсудить командой общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к началу перевода.\n\n\n\n\n\nОБЩИЙ ОБЗОР К КНИГЕ - Обсудите ОБЩИЙ ОБЗОР К КНИГЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения этого инструмента. Также обсудите найденные ошибки или неточности в общем обзоре к книге. Уделите этому этапу 10 минут.\n\nЭто задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно.\n\n\n\nОБЗОР К ГЛАВЕ - Обсудите ОБЗОР К ГЛАВЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в общем обзоре к главе. Уделите этому этапу 10 минут.\n\n\n\nЧТЕНИЕ РОБ-Д (RLOB) - Прочитайте вслух ГЛАВУ ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 20 мин.\n\n\n\nЧТЕНИЕ РОБ-С (RSOB) - Прочитайте вслух ГЛАВУ СМЫСЛОВОГО ПЕРЕВОДА БИБЛИИ РОБ-С (RSOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 10 мин.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Обсудите инструмент СЛОВА. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в статьях этого инструмента. Уделите этому этапу 60 минут.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Обсудите инструмент ЗАМЕТКИ. Что полезного для перевода вы нашли в ЗАМЕТКАХ. Используйте свои записи по этому инструменту с самостоятельного изучения. Также обсудите найденные ошибки или неточности в этом инструменте. Уделите этому этапу 10 минут.",
    "time": 120,
    "whole_chapter": true,
    "count_of_users": 4,
    "is_awaiting_team": false,
    "intro": "https://youtu.be/d6kvUVRttUw\n\nЭто командная работа и мы рекомендуем потратить на нее не более 120 минут.\n\n\n\nЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: обсудить с командой материалы букпэкеджа. Для этого поделитесь заметками, которые вы сделали при индивидуальной работе. Обсудите все предложенные правки по инструментам букпэкеджа. Запишите командное резюме по ним для передачи команде, работающей над букпэкеджом.\n\nЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: обсудить командой общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к началу перевода.\n\n\n\n\n\nОБЩИЙ ОБЗОР К КНИГЕ - Обсудите ОБЩИЙ ОБЗОР К КНИГЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения этого инструмента. Также обсудите найденные ошибки или неточности в общем обзоре к книге. Уделите этому этапу 10 минут.\n\nЭто задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно.\n\n\n\nОБЗОР К ГЛАВЕ - Обсудите ОБЗОР К ГЛАВЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в общем обзоре к главе. Уделите этому этапу 10 минут.\n\n\n\nЧТЕНИЕ РОБ-Д (RLOB) - Прочитайте вслух ГЛАВУ ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 20 мин.\n\n\n\nЧТЕНИЕ РОБ-С (RSOB) - Прочитайте вслух ГЛАВУ СМЫСЛОВОГО ПЕРЕВОДА БИБЛИИ РОБ-С (RSOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 10 мин.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Обсудите инструмент СЛОВА. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в статьях этого инструмента. Уделите этому этапу 60 минут.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Обсудите инструмент ЗАМЕТКИ. Что полезного для перевода вы нашли в ЗАМЕТКАХ. Используйте свои записи по этому инструменту с самостоятельного изучения. Также обсудите найденные ошибки или неточности в этом инструменте. Уделите этому этапу 10 минут.\n\n",
    "config": [
      {
        "size": 2,
        "tools": [
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
          },
          {
            "name": "literal",
            "config": {}
          },
          {
            "name": "simplified",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
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
    "title": "3 ШАГ - ПОДГОТОВКА К ПЕРЕВОДУ",
    "description": "Это работа в паре и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.\n\nВ этом шаге вам необходимо выполнить два задания.\n\n\n\nПЕРЕСКАЗ НА РУССКОМ - Прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB). Если необходимо - изучите отрывок вместе со всеми инструментами, чтобы как можно лучше передать этот текст более естественным русским языком. Перескажите смысл отрывка своему напарнику, используя максимально понятные и естественные слова русского языка. Не старайтесь пересказывать в точности исходный текст ДОСЛОВНОГО ПЕРЕВОДА. Перескажите текст в максимальной для себя простоте.\n\nПосле этого послушайте вашего напарника, пересказывающего свой отрывок. \n\nНе обсуждайте ваши пересказы - это только проговаривание и слушание.\n\n\n\nПЕРЕСКАЗ НА ЦЕЛЕВОМ - Еще раз просмотрите ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и подумайте, как пересказать этот текст на языке, на который делается перевод, помня о Резюме к переводу о стиле языка. \n\nПерескажите ваш отрывок напарнику на целевом языке, используя максимально понятные и естественные слова этого языка. Передайте всё, что вы запомнили, не подглядывая в текст. \n\nЗатем послушайте вашего напарника, пересказывающего свой отрывок таким же образом.\n\nНе обсуждайте ваши пересказы - это только проговаривание и слушание.",
    "time": 30,
    "whole_chapter": false,
    "count_of_users": 2,
    "is_awaiting_team": false,
    "intro": "https://youtu.be/ujMGcdkGGhI\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.\n\nВ этом шаге вам необходимо выполнить два задания.\n\n\n\nПЕРЕСКАЗ НА РУССКОМ - Прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB). Если необходимо - изучите отрывок вместе со всеми инструментами, чтобы как можно лучше передать этот текст более естественным русским языком. Перескажите смысл отрывка своему напарнику, используя максимально понятные и естественные слова русского языка. Не старайтесь пересказывать в точности исходный текст ДОСЛОВНОГО ПЕРЕВОДА. Перескажите текст в максимальной для себя простоте.\n\nПосле этого послушайте вашего напарника, пересказывающего свой отрывок. \n\nНе обсуждайте ваши пересказы - это только проговаривание и слушание.\n\n\n\nПЕРЕСКАЗ НА ЦЕЛЕВОМ - Еще раз просмотрите ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и подумайте, как пересказать этот текст на языке, на который делается перевод, помня о Резюме к переводу о стиле языка. \n\nПерескажите ваш отрывок напарнику на целевом языке, используя максимально понятные и естественные слова этого языка. Передайте всё, что вы запомнили, не подглядывая в текст. \n\nЗатем послушайте вашего напарника, пересказывающего свой отрывок таким же образом.\n\nНе обсуждайте ваши пересказы - это только проговаривание и слушание.\n\n",
    "config": [
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
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
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
    "is_awaiting_team": false,
    "intro": "https://youtu.be/3RJQxjnxJ-I\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 20 минут.\n\n\n\nЦЕЛЬ этого шага: сделать первый набросок в первую очередь естественным языком.\n\n\n\nРОБ-Д + НАБРОСОК «ВСЛЕПУЮ» - Еще раз прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и если вам необходимо, просмотрите все инструменты к этому отрывку. Как только вы будете готовы сделать «набросок», перейдите на панель «слепого» наброска и напишите ваш перевод на своем языке, используя максимально понятные и естественные слова вашего языка. Пишите по памяти. Не подглядывайте! Главная цель этого шага - естественность языка. Не бойтесь ошибаться! Ошибки на этом этапе допустимы. Точность перевода будет проверена на следующих шагах работы над текстом. \n\n",
    "config": [
      {
        "size": 3,
        "tools": [
          {
            "name": "literal",
            "config": {
              "draft": true
            }
          },
          {
            "name": "simplified",
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
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
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
    "is_awaiting_team": false,
    "intro": "https://youtu.be/WgvaOH9Lnpc\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным.\n\n\n\nПроверьте ваш перевод на ТОЧНОСТЬ, сравнив с текстом - ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). При необходимости используйте все инструменты к переводу. Оцените по вопросам: ничего не добавлено, ничего не пропущено, смысл не изменён? Если есть ошибки, исправьте.\n\n\n\nПрочитайте ВОПРОСЫ и ответьте на них, глядя в свой текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте.\n\n\n\nПосле этого прочитайте себе ваш перевод вслух и оцените - звучит ли ваш текст ПОНЯТНО И ЕСТЕСТВЕННО? Если нет, то исправьте.\n\n\n\nПерейдите к следующему вашему отрывку и повторите шаги Подготовка-Набросок-Проверка со всеми вашими отрывками до конца главы.\n\n",
    "config": [
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
          },
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
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
    "is_awaiting_team": false,
    "intro": "https://youtu.be/xtgTo3oWxKs\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 40 минут.\n\n\n\nЦЕЛЬ этого шага: улучшить набросок перевода, пригласив другого человека, чтобы проверить перевод на точность и естественность.\n\n\n\nПРОВЕРКА НА ТОЧНОСТЬ - Прочитайте вслух свой текст напарнику, который параллельно следит за текстом ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д(RLOB) и обращает внимание только на ТОЧНОСТЬ перевода. \n\nОбсудите текст насколько он точен. \n\nИзменения в текст вносит переводчик, работавший над ним. Если не удалось договориться о каких-либо изменениях, оставьте этот вопрос для обсуждения всей командой.\n\nПоменяйтесь ролями и поработайте над отрывком партнёра.\n\n\n\nПРОВЕРКА НА ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ - Еще раз прочитайте вслух свой текст напарнику, который теперь не смотрит ни в какой текст, а просто слушает ваше чтение вслух, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка.\n\nОбсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте.\n\nПоменяйтесь ролями и поработайте над отрывком партнёра.\n\n\n\n\n\n_Примечание к шагу:_ \n\n- Не влюбляйтесь в свой текст. Будьте гибкими к тому, чтобы слышать другое мнение и улучшать свой набросок перевода.  Это групповая работа и текст должен соответствовать пониманию большинства в вашей команде. Если даже будут допущены ошибки в этом случае, то на проверках последующих уровней они будут исправлены.\n\n- Если в работе с напарником вам не удалось договориться по каким-то вопросам, касающихся текста, оставьте этот вопрос на обсуждение со всей командой. Ваша цель - не победить напарника, а с его помощью улучшить перевод.\n\n",
    "config": [
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
          },
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
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
    "title": "7 ШАГ - ПРОВЕРКА КЛЮЧЕВЫХ СЛОВ",
    "description": "Это командная работа и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: всей командой улучшить перевод, выслушав больше мнений относительно самых важных слов и фраз в переводе, а также решить разногласия, оставшиеся после взаимопроверки.\n\n\n\nПРОВЕРКА ТЕКСТА ПО КЛЮЧЕВЫМ СЛОВАМ - Прочитайте текст всех переводчиков по очереди всей командой. Проверьте перевод на наличие ключевых слов из инструмента СЛОВА. Все ключевые слова на месте? Все ключевые слова переведены корректно?\n\nКоманда принимает решения, как переводить эти слова или фразы – переводчик вносит эти изменения в свой отрывок. В некоторых случаях, вносить изменения, которые принимает команда, может один человек, выбранный из переводчиков.",
    "time": 30,
    "whole_chapter": true,
    "count_of_users": 4,
    "is_awaiting_team": false,
    "intro": "https://youtu.be/w5766JEVCyU\n\nЭто командная работа и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: всей командой улучшить перевод, выслушав больше мнений относительно самых важных слов и фраз в переводе, а также решить разногласия, оставшиеся после взаимопроверки.\n\n\n\nПРОВЕРКА ТЕКСТА ПО КЛЮЧЕВЫМ СЛОВАМ - Прочитайте текст всех переводчиков по очереди всей командой. Проверьте перевод на наличие ключевых слов из инструмента СЛОВА. Все ключевые слова на месте? Все ключевые слова переведены корректно?\n\nКоманда принимает решения, как переводить эти слова или фразы – переводчик вносит эти изменения в свой отрывок. В некоторых случаях, вносить изменения, которые принимает команда, может один человек, выбранный из переводчиков. \n\n",
    "config": [
      {
        "size": 2,
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
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
          }
        ]
      },
      {
        "size": 2,
        "tools": [
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
    "is_awaiting_team": false,
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
            "name": "simplified",
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
          },
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
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
]', 'bible'::project_type,'[
  {
    "id": 1,
    "block": [
      {
        "answer": "",
        "question": "Как называется язык?"
      },
      {
        "answer": "",
        "question": "Какое межд.сокращение для языка?"
      },
      {
        "answer": "",
        "question": "Где распространён?"
      },
      {
        "answer": "",
        "question": "Почему выбран именно этот язык или диалект?"
      },
      {
        "answer": "",
        "question": "Какой алфавит используется в данном языке?"
      }
    ],
    "title": "О языке",
    "resume": ""
  },
  {
    "id": 2,
    "block": [
      {
        "answer": "",
        "question": "Почему нужен этот перевод?"
      },
      {
        "answer": "",
        "question": "Какие переводы уже есть на этом языке?"
      },
      {
        "answer": "",
        "question": "Какие диалекты или другие языки могли бы пользоваться этим переводом?"
      },
      {
        "answer": "",
        "question": "Как вы думаете могут ли возникнуть трудности с другими командами, уже работающими над переводом библейского контента на этот язык?"
      }
    ],
    "title": "О необходимости перевода",
    "resume": ""
  },
  {
    "id": 3,
    "block": [
      {
        "answer": "",
        "question": "кто будет пользоваться переводом?"
      },
      {
        "answer": "",
        "question": "На сколько человек в данной народности рассчитан этот перевод?"
      },
      {
        "answer": "",
        "question": "какие языки используют постоянно эти люди, кроме своего родного языка?"
      },
      {
        "answer": "",
        "question": "В этой народности больше мужчин/женщин, пожилых/молодых, грамотных/неграмотных?"
      }
    ],
    "title": "О целевой аудитории перевода",
    "resume": ""
  },
  {
    "id": 4,
    "block": [
      {
        "answer": "",
        "question": "Какой будет тип перевода, смысловой или подстрочный (дословный, буквальный)?"
      },
      {
        "answer": "",
        "question": "Какой будет стиль языка у перевода?"
      },
      {
        "answer": "",
        "question": "Как будет распространяться перевод?"
      }
    ],
    "title": "О стиле перевода",
    "resume": ""
  },
  {
    "id": 5,
    "block": [
      {
        "answer": "",
        "question": "Кто инициаторы перевода (кто проявил интерес к тому, чтобы начать работу над переводом)?"
      },
      {
        "answer": "",
        "question": "Кто будет работать над переводом?"
      }
    ],
    "title": "О команде",
    "resume": ""
  },
  {
    "id": 6,
    "block": [
      {
        "answer": "",
        "question": "О будет оценивать перевод?"
      },
      {
        "answer": "",
        "question": "Как будет поддерживаться качество перевода?"
      }
    ],
    "title": "О качестве перевода",
    "resume": ""
  }
]'),

      ('CANA OBS', '{"obs":true, "tnotes":false, "twords":false, "tquestions":false}', '[
      {
        "title": "1 ШАГ - САМОСТОЯТЕЛЬНОЕ ИЗУЧЕНИЕ",
        "description": "Это индивидуальная работа и выполняется без участия других членов команды. Каждый читает материалы самостоятельно, не обсуждая прочитанное, но записывая свои комментарии. Если ваш проект по переводу ведется онлайн, то этот шаг можно выполнить до встречи с другими участниками команды переводчиков.\n\n\n\nЦЕЛЬ этого шага: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.\n\n\n\nЗАДАНИЯ ДЛЯ ПЕРВОГО ШАГА:\n\n\n\nВ этом шаге вам необходимо выполнить несколько заданий:\n\n\n\nИСТОРИЯ - Прочитайте историю (главу, над которой предстоит работа). Запишите для обсуждения командой предложения и слова, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Прочитайте СЛОВА к главе. Необходимо прочитать статьи к каждому слову. Отметьте для обсуждения командой статьи к словам, которые могут быть полезными для перевода Открытых Библейских Историй.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Прочитайте ЗАМЕТКИ к главе. Необходимо прочитать ЗАМЕТКИ к каждому отрывку. Отметьте для обсуждения командой ЗАМЕТКИ, которые могут быть полезными для перевода Открытых Библейских Историй.",
        "time": 60,
        "whole_chapter": true,
        "count_of_users": 1,
        "is_awaiting_team": false,
        "intro": "https://www.youtube.com/watch?v=gxawAAQ9xbQ\n\nЭто индивидуальная работа и выполняется без участия других членов команды. Каждый читает материалы самостоятельно, не обсуждая прочитанное, но записывая свои комментарии. Если ваш проект по переводу ведется онлайн, то этот шаг можно выполнить до встречи с другими участниками команды переводчиков.\n\n\n\nЦЕЛЬ этого шага: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.\n\n\n\nЗАДАНИЯ ДЛЯ ПЕРВОГО ШАГА:\n\n\n\nВ этом шаге вам необходимо выполнить несколько заданий:\n\n\n\nИСТОРИЯ - Прочитайте историю (главу, над которой предстоит работа). Запишите для обсуждения командой предложения и слова, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Прочитайте СЛОВА к главе. Необходимо прочитать статьи к каждому слову. Отметьте для обсуждения командой статьи к словам, которые могут быть полезными для перевода Открытых Библейских Историй.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Прочитайте ЗАМЕТКИ к главе. Необходимо прочитать ЗАМЕТКИ к каждому отрывку. Отметьте для обсуждения командой ЗАМЕТКИ, которые могут быть полезными для перевода Открытых Библейских Историй.\n\n",
        "config": [
          {
            "size": 2,
            "tools": [
              {
                "name": "obs",
                "config": {}
              }
            ]
          },
          {
            "size": 2,
            "tools": [
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
        "title": "2 ШАГ - КОМАНДНОЕ ИЗУЧЕНИЕ ТЕКСТА",
        "description": "Это командная работа и мы рекомендуем потратить на нее не более 60 минут.\n\n\n\nЦЕЛЬ этого шага: хорошо понять смысл текста и слов всей командой, а также принять командное решение по переводу некоторых слов перед тем, как начать основную работу.\n\n\n\nЗАДАНИЯ ДЛЯ ВТОРОГО ШАГА:\n\n\n\nВ этом шаге вам необходимо выполнить несколько заданий.\n\n\n\nИСТОРИЯ - Прочитайте вслух историю(главу, над которой предстоит работа). Обсудите предложения и слова, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Уделите этому этапу 20 минут.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Обсудите инструмент СЛОВА. Что полезного для перевода вы нашли в этих статьях? Используйте свои комментарии с самостоятельного изучения. Уделите этому этапу 20 минут.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Обсудите инструмент ЗАМЕТКИ. Что полезного для перевода вы нашли в ЗАМЕТКАХ. Используйте свои комментарии по этому инструменту с самостоятельного изучения. Уделите этому этапу 20 минут.",
        "time": 120,
        "whole_chapter": true,
        "count_of_users": 4,
        "is_awaiting_team": false,
        "intro": "https://www.youtube.com/watch?v=HK6SXnU5zEw\n\nЭто командная работа и мы рекомендуем потратить на нее не более 60 минут.\n\n\n\nЦЕЛЬ этого шага: хорошо понять смысл текста и слов всей командой, а также принять командное решение по переводу некоторых слов перед тем, как начать основную работу.\n\n\n\nЗАДАНИЯ ДЛЯ ВТОРОГО ШАГА:\n\n\n\nВ этом шаге вам необходимо выполнить несколько заданий.\n\n\n\nИСТОРИЯ - Прочитайте вслух историю(главу, над которой предстоит работа). Обсудите предложения и слова, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Уделите этому этапу 20 минут.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Обсудите инструмент СЛОВА. Что полезного для перевода вы нашли в этих статьях? Используйте свои комментарии с самостоятельного изучения. Уделите этому этапу 20 минут.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Обсудите инструмент ЗАМЕТКИ. Что полезного для перевода вы нашли в ЗАМЕТКАХ. Используйте свои комментарии по этому инструменту с самостоятельного изучения. Уделите этому этапу 20 минут.\n\n",
        "config": [
          {
            "size": 2,
            "tools": [
              {
                "name": "obs",
                "config": {}
              }
            ]
          },
          {
            "size": 2,
            "tools": [
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
        "title": "3 ШАГ - ПОДГОТОВКА К ПЕРЕВОДУ",
        "description": "Это работа в паре и мы рекомендуем потратить на нее не более 20 минут.\n\n\n\nЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.\n\n\n\nВ этом шаге вам необходимо выполнить два задания.\n\n\n\nПервое задание - ПЕРЕСКАЗ НА РУССКОМ - Прочитайте ваш отрывок из главы в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ. Если необходимо - изучите отрывок вместе со всеми инструментами, чтобы как можно лучше понять этот текст. Перескажите смысл отрывка своему напарнику, используя максимально понятные и естественные слова русского языка. Не старайтесь пересказывать в точности исходный текст. Перескажите текст в максимальной для себя простоте.\n\nПосле этого послушайте вашего напарника, пересказывающего свой отрывок.\n\nУделите этому этапу 10 минут.\n\nНе обсуждайте ваши пересказы. В этом шаге только проговаривание текста и слушание.\n\n\n\nВторое задание - ПЕРЕСКАЗ НА ЦЕЛЕВОМ - Еще раз просмотрите ваш отрывок или главу в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ, и подумайте, как пересказать этот текст на языке, на который делается перевод, помня о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу) и о стиле языка. \n\nПерескажите ваш отрывок напарнику на целевом языке, используя максимально понятные и естественные слова этого языка. Передайте всё, что вы запомнили, не подглядывая в текст. \n\nЗатем послушайте вашего напарника, пересказывающего свой отрывок таким же образом.\n\nУделите этому этапу 10 минут.\n\nНе обсуждайте ваши пересказы. В этом шаге только проговаривание текста и слушание.",
        "time": 30,
        "whole_chapter": false,
        "count_of_users": 2,
        "is_awaiting_team": false,
        "intro": "https://www.youtube.com/watch?v=jlhwA9SIWXQ\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 20 минут.\n\n\n\nЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.\n\n\n\nВ этом шаге вам необходимо выполнить два задания.\n\n\n\nПервое задание - ПЕРЕСКАЗ НА РУССКОМ - Прочитайте ваш отрывок из главы в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ. Если необходимо - изучите отрывок вместе со всеми инструментами, чтобы как можно лучше понять этот текст. Перескажите смысл отрывка своему напарнику, используя максимально понятные и естественные слова русского языка. Не старайтесь пересказывать в точности исходный текст. Перескажите текст в максимальной для себя простоте.\n\nПосле этого послушайте вашего напарника, пересказывающего свой отрывок.\n\nУделите этому этапу 10 минут.\n\nНе обсуждайте ваши пересказы. В этом шаге только проговаривание текста и слушание.\n\n\n\nВторое задание - ПЕРЕСКАЗ НА ЦЕЛЕВОМ - Еще раз просмотрите ваш отрывок или главу в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ, и подумайте, как пересказать этот текст на языке, на который делается перевод, помня о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу) и о стиле языка. \n\nПерескажите ваш отрывок напарнику на целевом языке, используя максимально понятные и естественные слова этого языка. Передайте всё, что вы запомнили, не подглядывая в текст. \n\nЗатем послушайте вашего напарника, пересказывающего свой отрывок таким же образом.\n\nУделите этому этапу 10 минут.\n\nНе обсуждайте ваши пересказы. В этом шаге только проговаривание текста и слушание.\n\n",
        "config": [
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
        "title": "4 ШАГ - НАБРОСОК «ВСЛЕПУЮ»",
        "description": "Это индивидуальная работа и мы рекомендуем потратить на нее не более 20 минут.\n\n\n\nЦЕЛЬ этого шага: сделать первый набросок естественным языком.\n\n\n\nЕще раз прочитайте ваш отрывок  или главу в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ. Если вам необходимо, просмотрите все инструменты к этому отрывку. Как только вы будете готовы сделать «набросок», перейдите на панель «слепого» наброска в программе Translation Studio или в другой программе, в которой вы работаете и напишите ваш перевод на своем языке, используя максимально понятные и естественные слова вашего языка. Пишите по памяти. Не подглядывайте!\n\nГлавная цель этого шага - естественность языка. Не бойтесь ошибаться! Ошибки на этом этапе допустимы. Точность перевода будет проверена на следующих шагах работы над текстом.",
        "time": 20,
        "whole_chapter": false,
        "count_of_users": 1,
        "is_awaiting_team": false,
        "intro": "https://www.youtube.com/watch?v=HVXOiKUsXSI\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 20 минут.\n\n\n\nЦЕЛЬ этого шага: сделать первый набросок естественным языком.\n\n\n\nЕще раз прочитайте ваш отрывок  или главу в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ. Если вам необходимо, просмотрите все инструменты к этому отрывку. Как только вы будете готовы сделать «набросок», перейдите на панель «слепого» наброска в программе Translation Studio или в другой программе, в которой вы работаете и напишите ваш перевод на своем языке, используя максимально понятные и естественные слова вашего языка. Пишите по памяти. Не подглядывайте!\n\nГлавная цель этого шага - естественность языка. Не бойтесь ошибаться! Ошибки на этом этапе допустимы. Точность перевода будет проверена на следующих шагах работы над текстом.\n\n",
        "config": [
          {
            "size": 3,
            "tools": [
              {
                "name": "obs",
                "config": {
                  "draft": true
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
        "title": "5 ШАГ - САМОПРОВЕРКА",
        "description": "Это индивидуальная работа и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным. \n\n\n\nВ этом шаге вам необходимо выполнить три задания.\n\n\n\nЗадание первое. Проверьте ваш перевод на ТОЧНОСТЬ, сравнив с текстом ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке. При необходимости используйте все инструменты к переводу. Оцените по вопросам: ничего не добавлено, ничего не пропущено, смысл не изменён? Если есть ошибки, исправьте. Уделите этому заданию 10 минут.\n\n\n\nЗадание второе. Прочитайте ВОПРОСЫ и ответьте на них, глядя в свой текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте. Уделите этому заданию 10 минут.\n\n\n\nЗадание третье. Прочитайте себе ваш перевод вслух и оцените - звучит ли ваш текст ПОНЯТНО И ЕСТЕСТВЕННО? Если нет, то исправьте. Уделите этому заданию 10 минут.",
        "time": 30,
        "whole_chapter": false,
        "count_of_users": 1,
        "is_awaiting_team": false,
        "intro": "https://www.youtube.com/watch?v=p3p8c_K-O3c\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным. \n\n\n\nВ этом шаге вам необходимо выполнить три задания.\n\n\n\nЗадание первое. Проверьте ваш перевод на ТОЧНОСТЬ, сравнив с текстом ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке. При необходимости используйте все инструменты к переводу. Оцените по вопросам: ничего не добавлено, ничего не пропущено, смысл не изменён? Если есть ошибки, исправьте. Уделите этому заданию 10 минут.\n\n\n\nЗадание второе. Прочитайте ВОПРОСЫ и ответьте на них, глядя в свой текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте. Уделите этому заданию 10 минут.\n\n\n\nЗадание третье. Прочитайте себе ваш перевод вслух и оцените - звучит ли ваш текст ПОНЯТНО И ЕСТЕСТВЕННО? Если нет, то исправьте. Уделите этому заданию 10 минут.\n\n",
        "config": [
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
        "title": "6 ШАГ - ВЗАИМНАЯ ПРОВЕРКА",
        "description": "Это работа в паре и мы рекомендуем потратить на нее не более 40 минут.\n\n\n\nЦЕЛЬ этого шага: улучшить набросок перевода, пригласив другогого человека, чтобы проверить перевод на точность и естественность.\n\n\n\nВ этом шаге вам необходимо выполнить два задания.\n\n\n\nЗадание первое - Прочитайте вслух свой текст напарнику, который параллельно следит за текстом ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке и обращает внимание только на ТОЧНОСТЬ вашего перевода.\n\nОбсудите текст насколько он точен.\n\nИзменения в текст вносит переводчик, работавший над ним. Если не удалось договориться о каких-либо изменениях, оставьте этот вопрос для обсуждения всей командой.\n\nПоменяйтесь ролями и поработайте над отрывком партнёра.\n\nУделите этому заданию 20 минут.\n\n\n\nЗадание второе - Еще раз прочитайте вслух свой текст напарнику, который теперь не смотрит ни в какой текст, а просто слушает ваше чтение вслух, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка.\n\nОбсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте.\n\nПоменяйтесь ролями и поработайте над отрывком партнёра.\n\nУделите этому заданию 20 минут.\n\n\n\n\n\n_Примечание к шагу:_ \n\n- Не влюбляйтесь в свой текст. Будьте гибкими к тому, чтобы слышать другое мнение и улучшать свой набросок перевода.  Это групповая работа и текст должен соответствовать пониманию большинства в вашей команде. Если даже будут допущены ошибки в этом случае, то на проверках последующих уровней они будут исправлены.\n\n- Если в работе с напарником вам не удалось договориться по каким-то вопросам, касающихся текста, оставьте этот вопрос на обсуждение со всей командой. Ваша цель - не победить напарника, а с его помощью улучшить перевод.",
        "time": 40,
        "whole_chapter": false,
        "count_of_users": 2,
        "is_awaiting_team": false,
        "intro": "https://www.youtube.com/watch?v=cAgypQsWgQk\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 40 минут.\n\n\n\nЦЕЛЬ этого шага: улучшить набросок перевода, пригласив другогого человека, чтобы проверить перевод на точность и естественность.\n\n\n\nВ этом шаге вам необходимо выполнить два задания.\n\n\n\nЗадание первое - Прочитайте вслух свой текст напарнику, который параллельно следит за текстом ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке и обращает внимание только на ТОЧНОСТЬ вашего перевода.\n\nОбсудите текст насколько он точен.\n\nИзменения в текст вносит переводчик, работавший над ним. Если не удалось договориться о каких-либо изменениях, оставьте этот вопрос для обсуждения всей командой.\n\nПоменяйтесь ролями и поработайте над отрывком партнёра.\n\nУделите этому заданию 20 минут.\n\n\n\nЗадание второе - Еще раз прочитайте вслух свой текст напарнику, который теперь не смотрит ни в какой текст, а просто слушает ваше чтение вслух, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка.\n\nОбсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте.\n\nПоменяйтесь ролями и поработайте над отрывком партнёра.\n\nУделите этому заданию 20 минут.\n\n\n\n\n\n_Примечание к шагу:_ \n\n- Не влюбляйтесь в свой текст. Будьте гибкими к тому, чтобы слышать другое мнение и улучшать свой набросок перевода.  Это групповая работа и текст должен соответствовать пониманию большинства в вашей команде. Если даже будут допущены ошибки в этом случае, то на проверках последующих уровней они будут исправлены.\n\n- Если в работе с напарником вам не удалось договориться по каким-то вопросам, касающихся текста, оставьте этот вопрос на обсуждение со всей командой. Ваша цель - не победить напарника, а с его помощью улучшить перевод.\n\n",
        "config": [
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
        "title": "7 ШАГ - КОМАНДНЫЙ ОБЗОР ПЕРЕВОДА",
        "description": "Это командная работа и мы рекомендуем потратить на нее не более 60 минут.\n\n\n\nЦЕЛЬ этого шага: улучшить перевод, приняв решения командой о трудных словах или фразах, делая текст хорошим как с точки зрения точности, так и с точки зрения естественности. Это финальный шаг в работе над текстом.\n\n\n\nВ этом шаге вам необходимо выполнить три задания.\n\n\n\nЗадание первое - Прочитайте вслух свой текст команде. Команда в это время смотрит в текст ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке и обращает внимание только на ТОЧНОСТЬ вашего перевода.\n\nОбсудите текст насколько он точен. Если есть ошибки в вашем тексте, исправьте. Всей командой проверьте на точность работу каждого члена команды. Уделите этому заданию 20 минут.\n\n\n\nЗадание второе - Проверьте вместе с командой ваш перевод на наличие ключевых слов из инструмента СЛОВА. Все ключевые слова на месте? Все ключевые слова переведены корректно? Уделите этому заданию 20 минут.\n\n\n\nЗадание третье - Еще раз прочитайте вслух свой текст команде, которая теперь не смотрит ни в какой текст, а просто слушает, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка. Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте. Проработайте каждую главу/ каждый отрывок, пока команда не будет довольна результатом. Уделите этому заданию 20 минут.\n\n\n\n\n\n_Примечание к шагу:_ \n\n- Не оставляйте текст с несколькими вариантами перевода предложения или слова. После седьмого шага не должны оставаться нерешенные вопросы. Текст должен быть готовым к чтению.",
        "time": 30,
        "whole_chapter": true,
        "count_of_users": 4,
        "is_awaiting_team": false,
        "intro": "https://www.youtube.com/watch?v=P2MbEKDw8U4\n\nЭто командная работа и мы рекомендуем потратить на нее не более 60 минут.\n\n\n\nЦЕЛЬ этого шага: улучшить перевод, приняв решения командой о трудных словах или фразах, делая текст хорошим как с точки зрения точности, так и с точки зрения естественности. Это финальный шаг в работе над текстом.\n\n\n\nВ этом шаге вам необходимо выполнить три задания.\n\n\n\nЗадание первое - Прочитайте вслух свой текст команде. Команда в это время смотрит в текст ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке и обращает внимание только на ТОЧНОСТЬ вашего перевода.\n\nОбсудите текст насколько он точен. Если есть ошибки в вашем тексте, исправьте. Всей командой проверьте на точность работу каждого члена команды. Уделите этому заданию 20 минут.\n\n\n\nЗадание второе - Проверьте вместе с командой ваш перевод на наличие ключевых слов из инструмента СЛОВА. Все ключевые слова на месте? Все ключевые слова переведены корректно? Уделите этому заданию 20 минут.\n\n\n\nЗадание третье - Еще раз прочитайте вслух свой текст команде, которая теперь не смотрит ни в какой текст, а просто слушает, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка. Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте. Проработайте каждую главу/ каждый отрывок, пока команда не будет довольна результатом. Уделите этому заданию 20 минут.\n\n\n\n\n\n_Примечание к шагу:_ \n\n- Не оставляйте текст с несколькими вариантами перевода предложения или слова. После седьмого шага не должны оставаться нерешенные вопросы. Текст должен быть готовым к чтению.\n\n",
        "config": [
          {
            "size": 2,
            "tools": [
              {
                "name": "obs",
                "config": {}
              }
            ]
          },
          {
            "size": 2,
            "tools": [
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
            "size": 2,
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
      }
    ]', 'obs'::project_type,'[
  {
    "id": 1,
    "block": [
      {
        "answer": "",
        "question": "Как называется язык?"
      },
      {
        "answer": "",
        "question": "Какое межд.сокращение для языка?"
      },
      {
        "answer": "",
        "question": "Где распространён?"
      },
      {
        "answer": "",
        "question": "Почему выбран именно этот язык или диалект?"
      },
      {
        "answer": "",
        "question": "Какой алфавит используется в данном языке?"
      }
    ],
    "title": "О языке",
    "resume": ""
  },
  {
    "id": 2,
    "block": [
      {
        "answer": "",
        "question": "Почему нужен этот перевод?"
      },
      {
        "answer": "",
        "question": "Какие переводы уже есть на этом языке?"
      },
      {
        "answer": "",
        "question": "Какие диалекты или другие языки могли бы пользоваться этим переводом?"
      },
      {
        "answer": "",
        "question": "Как вы думаете могут ли возникнуть трудности с другими командами, уже работающими над переводом библейского контента на этот язык?"
      }
    ],
    "title": "О необходимости перевода",
    "resume": ""
  },
  {
    "id": 3,
    "block": [
      {
        "answer": "",
        "question": "кто будет пользоваться переводом?"
      },
      {
        "answer": "",
        "question": "На сколько человек в данной народности рассчитан этот перевод?"
      },
      {
        "answer": "",
        "question": "какие языки используют постоянно эти люди, кроме своего родного языка?"
      },
      {
        "answer": "",
        "question": "В этой народности больше мужчин/женщин, пожилых/молодых, грамотных/неграмотных?"
      }
    ],
    "title": "О целевой аудитории перевода",
    "resume": ""
  },
  {
    "id": 4,
    "block": [
      {
        "answer": "",
        "question": "Какой будет тип перевода, смысловой или подстрочный (дословный, буквальный)?"
      },
      {
        "answer": "",
        "question": "Какой будет стиль языка у перевода?"
      },
      {
        "answer": "",
        "question": "Как будет распространяться перевод?"
      }
    ],
    "title": "О стиле перевода",
    "resume": ""
  },
  {
    "id": 5,
    "block": [
      {
        "answer": "",
        "question": "Кто инициаторы перевода (кто проявил интерес к тому, чтобы начать работу над переводом)?"
      },
      {
        "answer": "",
        "question": "Кто будет работать над переводом?"
      }
    ],
    "title": "О команде",
    "resume": ""
  },
  {
    "id": 6,
    "block": [
      {
        "answer": "",
        "question": "О будет оценивать перевод?"
      },
      {
        "answer": "",
        "question": "Как будет поддерживаться качество перевода?"
      }
    ],
    "title": "О качестве перевода",
    "resume": ""
  }
]'),('CANA Bible','{"simplified":false, "literal":true,"reference":false, "tnotes":false, "twords":false, "tquestions":false}','[
  {
    "title": "1 ШАГ - ОБЗОР КНИГИ",
    "description": "Это индивидуальная работа и выполняется до встречи с другими участниками команды КРАШ-ТЕСТА.\n\n\n\nЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: убедиться, что материалы букпэкеджа подготовлены корректно и не содержат ошибок или каких-либо трудностей для использования переводчиками.\n\nЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.\n\n\n\n\n\nОБЩИЙ ОБЗОР К КНИГЕ\n\nПрочитайте общий обзор к книге. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в общем обзоре к книге.\n\nЭто задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно. \n\n\n\nОБЗОР К ГЛАВЕ\n\nПрочитайте обзор к главе. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в обзоре к главе.\n\n\n\nЧТЕНИЕ ДОСЛОВНОЙ БИБЛИИ РОБ-Д (RLOB)\n\nПрочитайте ГЛАВУ ДОСЛОВНОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nЧТЕНИЕ СМЫСЛОВОЙ БИБЛИИ РОБ-С (RSOB)\n\nПрочитайте ГЛАВУ СМЫСЛОВОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА»\n\nПрочитайте СЛОВА к главе. Необходимо прочитать статьи к каждому слову. Отметьте для обсуждения командой статьи к словам, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ»\n\nПрочитайте ЗАМЕТКИ к главе. Необходимо прочитать ЗАМЕТКИ к каждому отрывку. Отметьте для обсуждения командой ЗАМЕТКИ, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.",
    "time": 60,
    "whole_chapter": true,
    "count_of_users": 1,
    "is_awaiting_team": false,
    "intro": "https://youtu.be/IAxFRRy5qw8\n\nЭто индивидуальная работа и выполняется до встречи с другими участниками команды КРАШ-ТЕСТА.\n\n\n\nЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: убедиться, что материалы букпэкеджа подготовлены корректно и не содержат ошибок или каких-либо трудностей для использования переводчиками.\n\nЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.\n\n\n\n\n\nОБЩИЙ ОБЗОР К КНИГЕ\n\nПрочитайте общий обзор к книге. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в общем обзоре к книге.\n\nЭто задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно. \n\n\n\nОБЗОР К ГЛАВЕ\n\nПрочитайте обзор к главе. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в обзоре к главе.\n\n\n\nЧТЕНИЕ ДОСЛОВНОЙ БИБЛИИ РОБ-Д (RLOB)\n\nПрочитайте ГЛАВУ ДОСЛОВНОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nЧТЕНИЕ СМЫСЛОВОЙ БИБЛИИ РОБ-С (RSOB)\n\nПрочитайте ГЛАВУ СМЫСЛОВОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА»\n\nПрочитайте СЛОВА к главе. Необходимо прочитать статьи к каждому слову. Отметьте для обсуждения командой статьи к словам, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ»\n\nПрочитайте ЗАМЕТКИ к главе. Необходимо прочитать ЗАМЕТКИ к каждому отрывку. Отметьте для обсуждения командой ЗАМЕТКИ, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.",
    "config": [
      {
        "size": 2,
        "tools": [
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
          },
          {
            "name": "literal",
            "config": {}
          },
          {
            "name": "simplified",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
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
    "title": "2 ШАГ - КОМАНДНОЕ ИЗУЧЕНИЕ ТЕКСТА",
    "description": "Это командная работа и мы рекомендуем потратить на нее не более 120 минут.\n\n\n\nЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: обсудить с командой материалы букпэкеджа. Для этого поделитесь заметками, которые вы сделали при индивидуальной работе. Обсудите все предложенные правки по инструментам букпэкеджа. Запишите командное резюме по ним для передачи команде, работающей над букпэкеджом.\n\nЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: обсудить командой общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к началу перевода.\n\n\n\n\n\nОБЩИЙ ОБЗОР К КНИГЕ - Обсудите ОБЩИЙ ОБЗОР К КНИГЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения этого инструмента. Также обсудите найденные ошибки или неточности в общем обзоре к книге. Уделите этому этапу 10 минут.\n\nЭто задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно.\n\n\n\nОБЗОР К ГЛАВЕ - Обсудите ОБЗОР К ГЛАВЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в общем обзоре к главе. Уделите этому этапу 10 минут.\n\n\n\nЧТЕНИЕ РОБ-Д (RLOB) - Прочитайте вслух ГЛАВУ ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 20 мин.\n\n\n\nЧТЕНИЕ РОБ-С (RSOB) - Прочитайте вслух ГЛАВУ СМЫСЛОВОГО ПЕРЕВОДА БИБЛИИ РОБ-С (RSOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 10 мин.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Обсудите инструмент СЛОВА. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в статьях этого инструмента. Уделите этому этапу 60 минут.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Обсудите инструмент ЗАМЕТКИ. Что полезного для перевода вы нашли в ЗАМЕТКАХ. Используйте свои записи по этому инструменту с самостоятельного изучения. Также обсудите найденные ошибки или неточности в этом инструменте. Уделите этому этапу 10 минут.",
    "time": 120,
    "whole_chapter": true,
    "count_of_users": 4,
    "is_awaiting_team": false,
    "intro": "https://youtu.be/d6kvUVRttUw\n\nЭто командная работа и мы рекомендуем потратить на нее не более 120 минут.\n\n\n\nЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: обсудить с командой материалы букпэкеджа. Для этого поделитесь заметками, которые вы сделали при индивидуальной работе. Обсудите все предложенные правки по инструментам букпэкеджа. Запишите командное резюме по ним для передачи команде, работающей над букпэкеджом.\n\nЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: обсудить командой общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к началу перевода.\n\n\n\n\n\nОБЩИЙ ОБЗОР К КНИГЕ - Обсудите ОБЩИЙ ОБЗОР К КНИГЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения этого инструмента. Также обсудите найденные ошибки или неточности в общем обзоре к книге. Уделите этому этапу 10 минут.\n\nЭто задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно.\n\n\n\nОБЗОР К ГЛАВЕ - Обсудите ОБЗОР К ГЛАВЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в общем обзоре к главе. Уделите этому этапу 10 минут.\n\n\n\nЧТЕНИЕ РОБ-Д (RLOB) - Прочитайте вслух ГЛАВУ ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 20 мин.\n\n\n\nЧТЕНИЕ РОБ-С (RSOB) - Прочитайте вслух ГЛАВУ СМЫСЛОВОГО ПЕРЕВОДА БИБЛИИ РОБ-С (RSOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 10 мин.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Обсудите инструмент СЛОВА. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в статьях этого инструмента. Уделите этому этапу 60 минут.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Обсудите инструмент ЗАМЕТКИ. Что полезного для перевода вы нашли в ЗАМЕТКАХ. Используйте свои записи по этому инструменту с самостоятельного изучения. Также обсудите найденные ошибки или неточности в этом инструменте. Уделите этому этапу 10 минут.\n\n",
    "config": [
      {
        "size": 2,
        "tools": [
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
          },
          {
            "name": "literal",
            "config": {}
          },
          {
            "name": "simplified",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
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
    "title": "3 ШАГ - ПОДГОТОВКА К ПЕРЕВОДУ",
    "description": "Это работа в паре и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.\n\nВ этом шаге вам необходимо выполнить два задания.\n\n\n\nПЕРЕСКАЗ НА РУССКОМ - Прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB). Если необходимо - изучите отрывок вместе со всеми инструментами, чтобы как можно лучше передать этот текст более естественным русским языком. Перескажите смысл отрывка своему напарнику, используя максимально понятные и естественные слова русского языка. Не старайтесь пересказывать в точности исходный текст ДОСЛОВНОГО ПЕРЕВОДА. Перескажите текст в максимальной для себя простоте.\n\nПосле этого послушайте вашего напарника, пересказывающего свой отрывок. \n\nНе обсуждайте ваши пересказы - это только проговаривание и слушание.\n\n\n\nПЕРЕСКАЗ НА ЦЕЛЕВОМ - Еще раз просмотрите ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и подумайте, как пересказать этот текст на языке, на который делается перевод, помня о Резюме к переводу о стиле языка. \n\nПерескажите ваш отрывок напарнику на целевом языке, используя максимально понятные и естественные слова этого языка. Передайте всё, что вы запомнили, не подглядывая в текст. \n\nЗатем послушайте вашего напарника, пересказывающего свой отрывок таким же образом.\n\nНе обсуждайте ваши пересказы - это только проговаривание и слушание.",
    "time": 30,
    "whole_chapter": false,
    "count_of_users": 2,
    "is_awaiting_team": false,
    "intro": "https://youtu.be/ujMGcdkGGhI\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.\n\nВ этом шаге вам необходимо выполнить два задания.\n\n\n\nПЕРЕСКАЗ НА РУССКОМ - Прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB). Если необходимо - изучите отрывок вместе со всеми инструментами, чтобы как можно лучше передать этот текст более естественным русским языком. Перескажите смысл отрывка своему напарнику, используя максимально понятные и естественные слова русского языка. Не старайтесь пересказывать в точности исходный текст ДОСЛОВНОГО ПЕРЕВОДА. Перескажите текст в максимальной для себя простоте.\n\nПосле этого послушайте вашего напарника, пересказывающего свой отрывок. \n\nНе обсуждайте ваши пересказы - это только проговаривание и слушание.\n\n\n\nПЕРЕСКАЗ НА ЦЕЛЕВОМ - Еще раз просмотрите ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и подумайте, как пересказать этот текст на языке, на который делается перевод, помня о Резюме к переводу о стиле языка. \n\nПерескажите ваш отрывок напарнику на целевом языке, используя максимально понятные и естественные слова этого языка. Передайте всё, что вы запомнили, не подглядывая в текст. \n\nЗатем послушайте вашего напарника, пересказывающего свой отрывок таким же образом.\n\nНе обсуждайте ваши пересказы - это только проговаривание и слушание.\n\n",
    "config": [
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
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
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
    "is_awaiting_team": false,
    "intro": "https://youtu.be/3RJQxjnxJ-I\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 20 минут.\n\n\n\nЦЕЛЬ этого шага: сделать первый набросок в первую очередь естественным языком.\n\n\n\nРОБ-Д + НАБРОСОК «ВСЛЕПУЮ» - Еще раз прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и если вам необходимо, просмотрите все инструменты к этому отрывку. Как только вы будете готовы сделать «набросок», перейдите на панель «слепого» наброска и напишите ваш перевод на своем языке, используя максимально понятные и естественные слова вашего языка. Пишите по памяти. Не подглядывайте! Главная цель этого шага - естественность языка. Не бойтесь ошибаться! Ошибки на этом этапе допустимы. Точность перевода будет проверена на следующих шагах работы над текстом. \n\n",
    "config": [
      {
        "size": 3,
        "tools": [
          {
            "name": "literal",
            "config": {
              "draft": true
            }
          },
          {
            "name": "simplified",
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
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
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
    "is_awaiting_team": false,
    "intro": "https://youtu.be/WgvaOH9Lnpc\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным.\n\n\n\nПроверьте ваш перевод на ТОЧНОСТЬ, сравнив с текстом - ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). При необходимости используйте все инструменты к переводу. Оцените по вопросам: ничего не добавлено, ничего не пропущено, смысл не изменён? Если есть ошибки, исправьте.\n\n\n\nПрочитайте ВОПРОСЫ и ответьте на них, глядя в свой текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте.\n\n\n\nПосле этого прочитайте себе ваш перевод вслух и оцените - звучит ли ваш текст ПОНЯТНО И ЕСТЕСТВЕННО? Если нет, то исправьте.\n\n\n\nПерейдите к следующему вашему отрывку и повторите шаги Подготовка-Набросок-Проверка со всеми вашими отрывками до конца главы.\n\n",
    "config": [
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
          },
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
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
    "is_awaiting_team": false,
    "intro": "https://youtu.be/xtgTo3oWxKs\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 40 минут.\n\n\n\nЦЕЛЬ этого шага: улучшить набросок перевода, пригласив другого человека, чтобы проверить перевод на точность и естественность.\n\n\n\nПРОВЕРКА НА ТОЧНОСТЬ - Прочитайте вслух свой текст напарнику, который параллельно следит за текстом ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д(RLOB) и обращает внимание только на ТОЧНОСТЬ перевода. \n\nОбсудите текст насколько он точен. \n\nИзменения в текст вносит переводчик, работавший над ним. Если не удалось договориться о каких-либо изменениях, оставьте этот вопрос для обсуждения всей командой.\n\nПоменяйтесь ролями и поработайте над отрывком партнёра.\n\n\n\nПРОВЕРКА НА ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ - Еще раз прочитайте вслух свой текст напарнику, который теперь не смотрит ни в какой текст, а просто слушает ваше чтение вслух, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка.\n\nОбсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте.\n\nПоменяйтесь ролями и поработайте над отрывком партнёра.\n\n\n\n\n\n_Примечание к шагу:_ \n\n- Не влюбляйтесь в свой текст. Будьте гибкими к тому, чтобы слышать другое мнение и улучшать свой набросок перевода.  Это групповая работа и текст должен соответствовать пониманию большинства в вашей команде. Если даже будут допущены ошибки в этом случае, то на проверках последующих уровней они будут исправлены.\n\n- Если в работе с напарником вам не удалось договориться по каким-то вопросам, касающихся текста, оставьте этот вопрос на обсуждение со всей командой. Ваша цель - не победить напарника, а с его помощью улучшить перевод.\n\n",
    "config": [
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
          },
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
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
    "title": "7 ШАГ - ПРОВЕРКА КЛЮЧЕВЫХ СЛОВ",
    "description": "Это командная работа и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: всей командой улучшить перевод, выслушав больше мнений относительно самых важных слов и фраз в переводе, а также решить разногласия, оставшиеся после взаимопроверки.\n\n\n\nПРОВЕРКА ТЕКСТА ПО КЛЮЧЕВЫМ СЛОВАМ - Прочитайте текст всех переводчиков по очереди всей командой. Проверьте перевод на наличие ключевых слов из инструмента СЛОВА. Все ключевые слова на месте? Все ключевые слова переведены корректно?\n\nКоманда принимает решения, как переводить эти слова или фразы – переводчик вносит эти изменения в свой отрывок. В некоторых случаях, вносить изменения, которые принимает команда, может один человек, выбранный из переводчиков.",
    "time": 30,
    "whole_chapter": true,
    "count_of_users": 4,
    "is_awaiting_team": false,
    "intro": "https://youtu.be/w5766JEVCyU\n\nЭто командная работа и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: всей командой улучшить перевод, выслушав больше мнений относительно самых важных слов и фраз в переводе, а также решить разногласия, оставшиеся после взаимопроверки.\n\n\n\nПРОВЕРКА ТЕКСТА ПО КЛЮЧЕВЫМ СЛОВАМ - Прочитайте текст всех переводчиков по очереди всей командой. Проверьте перевод на наличие ключевых слов из инструмента СЛОВА. Все ключевые слова на месте? Все ключевые слова переведены корректно?\n\nКоманда принимает решения, как переводить эти слова или фразы – переводчик вносит эти изменения в свой отрывок. В некоторых случаях, вносить изменения, которые принимает команда, может один человек, выбранный из переводчиков. \n\n",
    "config": [
      {
        "size": 2,
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
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
          }
        ]
      },
      {
        "size": 2,
        "tools": [
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
    "is_awaiting_team": false,
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
            "name": "simplified",
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
          },
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
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
]','bible'::project_type,'[
  {
    "id": 1,
    "block": [
      {
        "answer": "",
        "question": "Как называется язык?"
      },
      {
        "answer": "",
        "question": "Какое межд.сокращение для языка?"
      },
      {
        "answer": "",
        "question": "Где распространён?"
      },
      {
        "answer": "",
        "question": "Почему выбран именно этот язык или диалект?"
      },
      {
        "answer": "",
        "question": "Какой алфавит используется в данном языке?"
      }
    ],
    "title": "О языке",
    "resume": ""
  },
  {
    "id": 2,
    "block": [
      {
        "answer": "",
        "question": "Почему нужен этот перевод?"
      },
      {
        "answer": "",
        "question": "Какие переводы уже есть на этом языке?"
      },
      {
        "answer": "",
        "question": "Какие диалекты или другие языки могли бы пользоваться этим переводом?"
      },
      {
        "answer": "",
        "question": "Как вы думаете могут ли возникнуть трудности с другими командами, уже работающими над переводом библейского контента на этот язык?"
      }
    ],
    "title": "О необходимости перевода",
    "resume": ""
  },
  {
    "id": 3,
    "block": [
      {
        "answer": "",
        "question": "кто будет пользоваться переводом?"
      },
      {
        "answer": "",
        "question": "На сколько человек в данной народности рассчитан этот перевод?"
      },
      {
        "answer": "",
        "question": "какие языки используют постоянно эти люди, кроме своего родного языка?"
      },
      {
        "answer": "",
        "question": "В этой народности больше мужчин/женщин, пожилых/молодых, грамотных/неграмотных?"
      }
    ],
    "title": "О целевой аудитории перевода",
    "resume": ""
  },
  {
    "id": 4,
    "block": [
      {
        "answer": "",
        "question": "Какой будет тип перевода, смысловой или подстрочный (дословный, буквальный)?"
      },
      {
        "answer": "",
        "question": "Какой будет стиль языка у перевода?"
      },
      {
        "answer": "",
        "question": "Как будет распространяться перевод?"
      }
    ],
    "title": "О стиле перевода",
    "resume": ""
  },
  {
    "id": 5,
    "block": [
      {
        "answer": "",
        "question": "Кто инициаторы перевода (кто проявил интерес к тому, чтобы начать работу над переводом)?"
      },
      {
        "answer": "",
        "question": "Кто будет работать над переводом?"
      }
    ],
    "title": "О команде",
    "resume": ""
  },
  {
    "id": 6,
    "block": [
      {
        "answer": "",
        "question": "О будет оценивать перевод?"
      },
      {
        "answer": "",
        "question": "Как будет поддерживаться качество перевода?"
      }
    ],
    "title": "О качестве перевода",
    "resume": ""
  }
]'),  ('RuGL','{"simplified":true, "literal":false, "tnotes":false, "twords":false}','[
  {
    "time": 60,
    "intro": "Описание шага",
    "title": "1 ШАГ",
    "config": [
      {
        "size": 2,
        "tools": [
          {
            "name": "simplified",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "literal",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {
              "quote_resource": "https://git.door43.org/ru_gl/ru_rlob"
              }
          },
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
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
    ],
    "description": "Описание шага",
    "whole_chapter": true,
    "count_of_users": 1
  },
  {
    "time": 60,
    "intro": "Описание шага",
    "title": "2 ШАГ",
    "config": [
      {
        "size": 2,
        "tools": [
          {
            "name": "simplified",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "literal",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {
              "quote_resource": "https://git.door43.org/ru_gl/ru_rlob"
              }
          },
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "commandTranslate",
            "config": {
              "moderatorOnly": true,
              "getFromResource": true
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
    ],
    "description": "Описание шага",
    "whole_chapter": true,
    "count_of_users": 1
  },
  {
    "time": 60,
    "intro": "Описание шага",
    "title": "3 ШАГ",
    "config": [
      {
        "size": 2,
        "tools": [
          {
            "name": "simplified",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "literal",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {
              "quote_resource": "https://git.door43.org/ru_gl/ru_rlob"
              }
          },
          {
            "name": "info",
            "config": {
              "url": "https://git.door43.org/ru_gl/ru_tn"
            }
          }
        ]
      },
      {
        "size": 2,
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
    ],
    "description": "Описание шага",
    "whole_chapter": true,
    "count_of_users": 1
  }
]','bible'::project_type,'[
  {
    "id": 1,
    "block": [
      {
        "answer": "",
        "question": "Как называется язык?"
      },
      {
        "answer": "",
        "question": "Какое межд.сокращение для языка?"
      },
      {
        "answer": "",
        "question": "Где распространён?"
      },
      {
        "answer": "",
        "question": "Почему выбран именно этот язык или диалект?"
      },
      {
        "answer": "",
        "question": "Какой алфавит используется в данном языке?"
      }
    ],
    "title": "О языке",
    "resume": ""
  },
  {
    "id": 2,
    "block": [
      {
        "answer": "",
        "question": "Почему нужен этот перевод?"
      },
      {
        "answer": "",
        "question": "Какие переводы уже есть на этом языке?"
      },
      {
        "answer": "",
        "question": "Какие диалекты или другие языки могли бы пользоваться этим переводом?"
      },
      {
        "answer": "",
        "question": "Как вы думаете могут ли возникнуть трудности с другими командами, уже работающими над переводом библейского контента на этот язык?"
      }
    ],
    "title": "О необходимости перевода",
    "resume": ""
  },
  {
    "id": 3,
    "block": [
      {
        "answer": "",
        "question": "кто будет пользоваться переводом?"
      },
      {
        "answer": "",
        "question": "На сколько человек в данной народности рассчитан этот перевод?"
      },
      {
        "answer": "",
        "question": "какие языки используют постоянно эти люди, кроме своего родного языка?"
      },
      {
        "answer": "",
        "question": "В этой народности больше мужчин/женщин, пожилых/молодых, грамотных/неграмотных?"
      }
    ],
    "title": "О целевой аудитории перевода",
    "resume": ""
  },
  {
    "id": 4,
    "block": [
      {
        "answer": "",
        "question": "Какой будет тип перевода, смысловой или подстрочный (дословный, буквальный)?"
      },
      {
        "answer": "",
        "question": "Какой будет стиль языка у перевода?"
      },
      {
        "answer": "",
        "question": "Как будет распространяться перевод?"
      }
    ],
    "title": "О стиле перевода",
    "resume": ""
  },
  {
    "id": 5,
    "block": [
      {
        "answer": "",
        "question": "Кто инициаторы перевода (кто проявил интерес к тому, чтобы начать работу над переводом)?"
      },
      {
        "answer": "",
        "question": "Кто будет работать над переводом?"
      }
    ],
    "title": "О команде",
    "resume": ""
  },
  {
    "id": 6,
    "block": [
      {
        "answer": "",
        "question": "О будет оценивать перевод?"
      },
      {
        "answer": "",
        "question": "Как будет поддерживаться качество перевода?"
      }
    ],
    "title": "О качестве перевода",
    "resume": ""
  }
]');

  -- END METHODS

  -- ROLE PERMISSIONS
    DELETE FROM
      PUBLIC.role_permissions;

    INSERT INTO
      PUBLIC.role_permissions (role, permission)
    VALUES
      ('moderator', 'dictionaries'),
      ('moderator', 'notes'),
      ('moderator', 'translator.set'),
      ('coordinator', 'dictionaries'),
      ('coordinator', 'notes'),
      ('coordinator', 'verses.set'),
      ('coordinator', 'moderator.set'),
      ('coordinator', 'user_projects'),
      ('coordinator', 'translator.set');
  -- END ROLE PERMISSIONS

  -- PROJECTS
    DELETE FROM
      PUBLIC.projects;

  -- END PROJECTS

  -- PROJECT TRANSLATORS
    DELETE FROM
      PUBLIC.project_translators;

  -- END PROJECT TRANSLATORS

  -- PROJECT COORDINATORS
    DELETE FROM
      PUBLIC.project_coordinators;

  -- END PROJECT COORDINATORS

  -- STEPS
    DELETE FROM
      PUBLIC.steps;

  -- END STEPS

  -- BOOKS
    DELETE FROM
      PUBLIC.books;

  -- END BOOKS

  -- CHAPTERS
    DELETE FROM
      PUBLIC.chapters;

  -- END CHAPTERS

  -- VERSES
    DELETE FROM
      PUBLIC.verses;

  -- END VERSES

  -- PROGRESS
    DELETE FROM
      PUBLIC.progress;

  -- END PROGRESS
-- END DUMMY DATA

-- INSERT BUCKET IN STORAGE
  -- insert a bucket in storage to store avatars
    insert into storage.buckets
      (id, name, public)
    values
      ('avatars', 'avatars', true);

  -- create Policies
    CREATE POLICY "Give users authenticated access to folder 1oj01fe_0" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'private' AND auth.role() = 'authenticated');

    CREATE POLICY "Give users authenticated access to folder 1oj01fe_1" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'private' AND auth.role() = 'authenticated');

    CREATE POLICY "Give users authenticated access to folder 1oj01fe_2" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'private' AND auth.role() = 'authenticated');

    CREATE POLICY "Give users authenticated access to folder 1oj01fe_3" ON storage.objects FOR DELETE TO public USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'private' AND auth.role() = 'authenticated');
-- END INSERT BUCKET IN STORAGE
