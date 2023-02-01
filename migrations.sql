--Here added scripts for updating live db before setup migrating settings for supabase

--14.01.23
  --Update chapters - change type for column text from 'text' to jsonb
  --Added function which added text from progress to chapters when chapter is finished

  ALTER TABLE chapters ADD text_temp JSONB;
  UPDATE chapters SET text_temp = to_jsonb("text");
  ALTER TABLE chapters DROP COLUMN "text";
  ALTER TABLE chapters RENAME COLUMN text_temp TO "text";

  CREATE FUNCTION PUBLIC.handle_compile_chapter() returns TRIGGER
      LANGUAGE plpgsql security definer AS $$
      DECLARE      
        chapter JSONB;
      BEGIN
        IF (NEW.finished_at IS NOT NULL) THEN
          SELECT jsonb_object_agg(num, text ORDER BY num ASC) FROM PUBLIC.verses WHERE project_id = OLD.project_id AND chapter_id = OLD.id INTO chapter;
          NEW.text=chapter;
        END IF;               
        RETURN NEW;
      END;
    $$;

  CREATE TRIGGER on_public_chapters_update BEFORE
    UPDATE
      ON PUBLIC.chapters FOR each ROW EXECUTE FUNCTION PUBLIC.handle_compile_chapter();

--26.01.23
  --Create table for logs
  --Create functions for update commits in settings of project

  CREATE TABLE PUBLIC.logs (
      id bigint GENERATED ALWAYS AS IDENTITY primary key,
      created_at TIMESTAMP DEFAULT NOW(),
      log JSONB        
    );
    
  ALTER TABLE
      PUBLIC.logs enable ROW LEVEL security;   

  DROP FUNCTION IF EXISTS PUBLIC.update_chapters_in_books;

  CREATE FUNCTION PUBLIC.update_chapters_in_books(book_id BIGINT, chapters_new JSON, project_id BIGINT) RETURNS BOOLEAN
      LANGUAGE plpgsql SECURITY definer AS $$  
      DECLARE chapters_old JSON;        
      BEGIN
        IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
        END IF;
        SELECT json_build_object('chapters', chapters) FROM PUBLIC.books WHERE books.id = book_id AND books.project_id = update_chapters_in_books.project_id INTO chapters_old;
        INSERT INTO PUBLIC.logs (log) VALUES (json_build_object('function', 'update_chapters_in_books', 'book_id', book_id, 'chapters', update_chapters_in_books.chapters_new, 'project_id', project_id, 'old values', chapters_old));   
        UPDATE PUBLIC.books SET chapters = update_chapters_in_books.chapters_new WHERE books.id = book_id AND books.project_id = update_chapters_in_books.project_id;
        RETURN TRUE;
      END;
    $$;

  DROP FUNCTION IF EXISTS PUBLIC.insert_additional_chapter;

  CREATE FUNCTION PUBLIC.insert_additional_chapter(book_id BIGINT, verses int4, project_id BIGINT, num INT2) RETURNS BOOLEAN
      LANGUAGE plpgsql SECURITY definer AS $$         
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

  DROP FUNCTION IF EXISTS PUBLIC.update_verses_in_chapters;

  CREATE FUNCTION PUBLIC.update_verses_in_chapters(book_id BIGINT, verses_new INTEGER, num INT2, project_id BIGINT) RETURNS JSON
      LANGUAGE plpgsql SECURITY definer AS $$ 
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


  DROP FUNCTION IF EXISTS PUBLIC.insert_additional_verses;

  CREATE FUNCTION PUBLIC.insert_additional_verses(start_verse INT2, finish_verse INT2, chapter_id BIGINT, project_id INTEGER) RETURNS BOOLEAN
      LANGUAGE plpgsql SECURITY definer AS $$ 
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

  DROP FUNCTION IF EXISTS PUBLIC.update_resources_in_projects;

  CREATE FUNCTION PUBLIC.update_resources_in_projects(resources_new JSON, base_manifest_new JSON, project_id BIGINT) RETURNS BOOLEAN
      LANGUAGE plpgsql SECURITY definer AS $$ 
      DECLARE old_values JSON;
      BEGIN
        IF authorize(auth.uid(), project_id) NOT IN ('admin', 'coordinator') THEN RETURN FALSE;
        END IF;
        SELECT json_build_object('resources', resources, 'base_manifest', base_manifest) FROM PUBLIC.projects WHERE id = update_resources_in_projects.project_id INTO old_values;
        INSERT INTO PUBLIC.logs (log) VALUES (json_build_object('function', 'update_resources_in_projects', 'resources', update_resources_in_projects.resources_new, 'base_manifest', update_resources_in_projects.base_manifest_new, 'project_id', project_id, 'old values', old_values));  
        UPDATE PUBLIC.projects SET resources = update_resources_in_projects.resources_new, base_manifest = update_resources_in_projects.base_manifest_new WHERE id = project_id;
        RETURN TRUE;
      END;
    $$; 