DROP FUNCTION IF EXISTS PUBLIC.go_to_specific_step;

CREATE FUNCTION PUBLIC.go_to_specific_step(new_step INT2, login TEXT, project TEXT, chapter INT2, book PUBLIC.book_code, current_step INT2) RETURNS INTEGER
    LANGUAGE plpgsql SECURITY DEFINER AS $$
    DECLARE
      proj_trans RECORD;
      cur_step INT2;
      max_step INT2;
      verse BIGINT;
      cur_chapter_id BIGINT;
      next_step RECORD;
    BEGIN
      SELECT
        project_translators.id, projects.id AS project_id INTO proj_trans
      FROM
        PUBLIC.project_translators LEFT JOIN PUBLIC.projects ON (projects.id = project_translators.project_id) LEFT JOIN PUBLIC.users ON (users.id = project_translators.user_id)
      WHERE
        users.login = go_to_specific_step.login AND projects.code = go_to_specific_step.project;

      IF proj_trans.id IS NULL THEN
        RETURN 0;
      END IF;

      SELECT chapters.id INTO cur_chapter_id
      FROM PUBLIC.chapters
      WHERE chapters.num = go_to_specific_step.chapter AND chapters.project_id = proj_trans.project_id AND chapters.book_id = (SELECT id FROM PUBLIC.books WHERE books.code = go_to_specific_step.book AND books.project_id = proj_trans.project_id);

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

      SELECT
        verses.id INTO verse
      FROM
        PUBLIC.verses 
      WHERE verses.chapter_id = cur_chapter_id
        AND project_translator_id = proj_trans.id
      LIMIT 1;

      -- Are there verses assigned to him, and find out at what step now
      IF cur_step IS NULL THEN
        RETURN 0;
      END IF;

      IF cur_step != go_to_specific_step.current_step THEN
        RETURN cur_step;
      END IF;

      SELECT MAX(steps.sorting) FROM Public.progress LEFT JOIN PUBLIC.steps ON (steps.id = progress.step_id) INTO max_step
      WHERE progress.verse_id = verse;

      IF max_step IS NULL THEN
        RETURN cur_step;
      END IF;

      If new_step > max_step THEN
        RETURN cur_step;
      END IF;

      SELECT id, sorting INTO next_step FROM PUBLIC.steps
      WHERE steps.project_id = proj_trans.project_id
      AND steps.sorting = new_step
      ORDER BY steps.sorting
      LIMIT 1;

      -- get from the base, what is the next step, if it is not there, then do nothing
      IF next_step.id IS NULL THEN
        RETURN cur_step;
      END IF;

      -- If yes, then update the database
      UPDATE PUBLIC.verses SET current_step = next_step.id WHERE verses.chapter_id = cur_chapter_id
      AND verses.project_translator_id = proj_trans.id;

      RETURN next_step.sorting;

    END;
  $$;

