CREATE OR REPLACE FUNCTION PUBLIC.compile_book(book_id BIGINT, project_id BIGINT) RETURNS TABLE (num SMALLINT, "text" JSONB, id BIGINT)
    LANGUAGE plpgsql SECURITY DEFINER AS $$
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
