--Here added scripts for updating live db before setup migrating settings for supabase

--Update chapters - change type for column text from 'text' to jsonb
--14.01.23
--запустил в Develop, нужно запустить в Main, апрув --TODO после запуска в Main  - убрать эту надпись
ALTER TABLE chapters ADD text_temp json;
UPDATE chapters SET text_temp = to_json('text');
ALTER TABLE chapters DROP COLUMN 'text';
ALTER TABLE chapters RENAME COLUMN text_temp To 'text';
--26.01.23
-- ещё нигде не запускал -- TODO нужно переписать
CREATE TABLE PUBLIC.logs (
      id bigint GENERATED ALWAYS AS IDENTITY primary key,
      created_at TIMESTAMP DEFAULT now(),
      log jsonb,        
    );
    
ALTER TABLE
      PUBLIC.logs enable ROW LEVEL security;   

DROP FUNCTION IF EXISTS PUBLIC.update_chapters_in_books;

CREATE FUNCTION PUBLIC.update_chapters_in_books(book_id BIGINT, chapters JSON, project_id BIGINT) RETURNS BOOLEAN
    LANGUAGE plpgsql SECURITY definer AS $$         
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
      END IF;
      UPDATE PUBLIC.books SET chapters = update_chapters_in_books.chapters WHERE books.id = book_id;
      RETURN TRUE;
    END;
  $$;

DROP FUNCTION IF EXISTS PUBLIC.insert_additional_chapter;

CREATE FUNCTION PUBLIC.insert_additional_chapter(book_id BIGINT, verses int4,project_id BIGINT,num int2) RETURNS BOOLEAN
    LANGUAGE plpgsql SECURITY definer AS $$         
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
      END IF;
      INSERT INTO PUBLIC.chapters (num, verses, book_id, project_id) VALUES (num , verses, book_id, project_id);
      RETURN TRUE;
    END;
  $$; 

DROP FUNCTION IF EXISTS PUBLIC.update_verses_in_chapters;

CREATE FUNCTION PUBLIC.update_verses_in_chapters(book_id BIGINT, verses INTEGER, num int2,project_id BIGINT) RETURNS JSON
    LANGUAGE plpgsql SECURITY definer AS $$ 
    DECLARE chapter JSON;        
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
      END IF;
      UPDATE PUBLIC.chapters SET verses = update_verses_in_chapters.verses WHERE chapters.book_id = update_verses_in_chapters.book_id AND chapters.num = update_verses_in_chapters.num;
      SELECT JSON_build_object(  'id',id,'started_at',started_at) FROM PUBLIC.chapters WHERE chapters.book_id = update_verses_in_chapters.book_id AND chapters.num = update_verses_in_chapters.num INTO chapter;
      RETURN chapter;
    END;
  $$; 






DROP FUNCTION IF EXISTS PUBLIC.insert_additional_verses;

CREATE FUNCTION PUBLIC.insert_additional_verses(start_verse int2, finish_verse int2, chapter_id BIGINT, project_id INTEGER) RETURNS BOOLEAN
    LANGUAGE plpgsql SECURITY definer AS $$ 
    DECLARE step_id BIGINT;    
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
      END IF;
      IF finish_verse < start_verse THEN
        RETURN false;
      END IF;
      SELECT id FROM steps WHERE steps.project_id=insert_additional_verses.project_id AND sorting=1 INTO step_id;
      FOR i IN start_verse..finish_verse LOOP
        INSERT INTO
          PUBLIC.verses (num, chapter_id, current_step, project_id)
        VALUES
          (i , chapter_id, step_id, project_id);
      END LOOP;
      RETURN true;
    END;
  $$; 


DROP FUNCTION IF EXISTS PUBLIC.update_resources_in_projects;

CREATE FUNCTION PUBLIC.update_resources_in_projects(resources JSON, base_manifest JSON, project_id BIGINT) RETURNS BOOLEAN
    LANGUAGE plpgsql SECURITY definer AS $$ 
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
      END IF;
      UPDATE PUBLIC.projects SET resources = update_resources_in_projects.resources ,  base_manifest = update_resources_in_projects.base_manifest WHERE id= project_id;
      RETURN true;
    END;
  $$; 