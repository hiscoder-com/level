 DROP FUNCTION IF EXISTS PUBLIC.get_all_steps_by_chapter;
  CREATE FUNCTION PUBLIC.get_all_steps_by_chapter(project_code TEXT, book_code PUBLIC.book_code, chapter_num INT2) RETURNS TABLE(title TEXT, project TEXT, book PUBLIC.book_code, chapter INT2, step INT2, started_at TIMESTAMP,translator_id BIGINT,login TEXT,chapter_id BIGINT)
    LANGUAGE plpgsql SECURITY DEFINER AS $$
    BEGIN
      -- must be on the project
      IF authorize(auth.uid(), (SELECT id FROM projects WHERE code = get_all_steps_by_chapter.project_code)) NOT IN ('admin', 'supporter') THEN
        RETURN;
      END IF;

      RETURN query SELECT steps.title, projects.code AS project, books.code AS book, chapters.num AS chapter, steps.sorting AS step, chapters.started_at, project_translator_id as translator_id,users.login as login, chapters.id as chapter_id
      FROM verses
        LEFT JOIN chapters ON (verses.chapter_id = chapters.id)
        LEFT JOIN books ON (chapters.book_id = books.id)
        LEFT JOIN steps ON (verses.current_step = steps.id)
        LEFT JOIN projects ON (projects.id = verses.project_id)
        LEFT JOIN project_translators ON (project_translators.id = verses.project_translator_id)
        LEFT JOIN users ON (users.id = project_translators.user_id)
      WHERE projects.code = get_all_steps_by_chapter.project_code
        AND books.code = get_all_steps_by_chapter.book_code
        AND chapters.num = get_all_steps_by_chapter.chapter_num
        AND chapters.started_at IS NOT NULL
        AND chapters.finished_at IS NULL
        AND verses.project_translator_id IS NOT NULL        
      GROUP BY books.id, chapters.id, verses.current_step, steps.id, projects.id,project_translator_id,users.login ORDER BY users.login;
    END;
  $$
