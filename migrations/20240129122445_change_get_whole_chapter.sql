DROP FUNCTION IF EXISTS PUBLIC.get_whole_chapter;

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
    
  