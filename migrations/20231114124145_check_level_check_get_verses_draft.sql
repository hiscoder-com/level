-- getting all the books that specify the levels of checks
DROP FUNCTION IF EXISTS PUBLIC.get_books_not_null_level_checks;

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
DROP FUNCTION IF EXISTS PUBLIC.find_books_with_chapters_and_verses;

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
