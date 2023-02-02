--Here added scripts for updating live db before setup migrating settings for supabase

--Update chapters - change type for column text from 'text' to jsonb
--14.01.23
--запустил в Develop, нужно запустить в Main, апрув --TODO после запуска в Main  - убрать эту надпись
ALTER TABLE chapters ADD text_temp JSON;
UPDATE chapters SET text_temp = to_json('text');
ALTER TABLE chapters DROP COLUMN 'text';
ALTER TABLE chapters RENAME COLUMN text_temp TO 'text';
--26.01.23
-- ещё нигде не запускал -- TODO нужно переписать
CREATE TABLE PUBLIC.logs (
      id bigint GENERATED ALWAYS AS IDENTITY primary key,
      created_at TIMESTAMP DEFAULT NOW(),
      log JSONB,        
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
      SELECT json_build_object('chapters',chapters) FROM PUBLIC.books WHERE books.id = book_id AND books.project_id = update_chapters_in_books.project_id INTO chapters_old;
      INSERT INTO PUBLIC.logs (log) VALUES (json_build_object('function','update_chapters_in_books', 'book_id', book_id, 'chapters', update_chapters_in_books.chapters_new, 'project_id', project_id, 'old values', chapters_old));   
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
      INSERT INTO PUBLIC.logs (log) VALUES (json_build_object('function', 'update_resources_in_projects','resources', update_resources_in_projects.resources_new, 'base_manifest', update_resources_in_projects.base_manifest_new, 'project_id', project_id, 'old values', old_values));  
      UPDATE PUBLIC.projects SET resources = update_resources_in_projects.resources_new, base_manifest = update_resources_in_projects.base_manifest_new WHERE id = project_id;
      RETURN TRUE;
    END;
  $$; 
--31.01.23
DROP TRIGGER IF EXISTS on_public_project_created ON PUBLIC.projects;

DROP FUNCTION IF EXISTS PUBLIC.handle_new_project;
DROP FUNCTION IF EXISTS PUBLIC.create_brief;

ALTER TABLE PUBLIC.methods ADD brief json DEFAULT '[]';

ALTER TABLE PUBLIC.briefs
      ADD data_collection json DEFAULT NULL,
      ADD is_enable boolean DEFAULT true,
      DROP COLUMN text;

UPDATE PUBLIC.methods
SET brief = '[
          {
            "id": 1,
            "title": "О языке",
            "block": [
              {
                "question": "Как называется язык?",
                "answer": ""
              },
              {
                "question": "Какое межд.сокращение для языка?",
                "answer": ""
              },
              {
                "question": "Где распространён?",
                "answer": ""
              },
              {
                "question": "Почему выбран именно этот язык или диалект?",
                "answer": ""
              },
              {
                "question": "Какой алфавит используется в данном языке?",
                "answer": ""
              }
            ],
            "resume": ""
          },
          {
            "id": 2,
            "title": "О необходимости перевода",
            "block": [
              {
                "question": "Почему нужен этот перевод?",
                "answer": ""
              },
              {
                "question": "Какие переводы уже есть на этом языке?",
                "answer": ""
              },
              {
                "question": "Какие диалекты или другие языки могли бы пользоваться этим переводом?",
                "answer": ""
              },
              {
                "question": "Как вы думаете могут ли возникнуть трудности с другими командами, уже работающими над переводом библейского контента на этот язык?",
                "answer": ""
              }
            ],
            "resume": ""
          },
          {
            "id": 3,
            "title": "О целевой аудитории перевода",
            "block": [
              {
                "question": "кто будет пользоваться переводом?",
                "answer": ""
              },
              {
                "question": "На сколько человек в данной народности рассчитан этот перевод?",
                "answer": ""
              },
              {
                "question": "какие языки используют постоянно эти люди, кроме своего родного языка?",
                "answer": ""
              },
              {
                "question": "В этой народности больше мужчин/женщин, пожилых/молодых, грамотных/неграмотных?",
                "answer": ""
              }
            ],
            "resume": ""
          },
          {
            "id": 4,
            "title": "О стиле перевода",
            "block": [
              {
                "question": "Какой будет тип перевода, смысловой или подстрочный (дословный, буквальный)?",
                "answer": ""
              },
              {
                "question": "Какой будет стиль языка у перевода?",
                "answer": ""
              },
              {
                "question": "Как будет распространяться перевод?",
                "answer": ""
              }
            ],
            "resume": ""
          },
          {
            "id": 5,
            "title": "О команде",
            "block": [
              {
                "question": "Кто инициаторы перевода (кто проявил интерес к тому, чтобы начать работу над переводом)?",
                "answer": ""
              },
            {
                "question": "Кто будет работать над переводом?",
                "answer": ""
              }
            ],
            "resume": ""
          },
          {
            "id": 6,
            "title": "О качестве перевода",
            "block": [
              {
                "question": "О будет оценивать перевод?",
                "answer": ""
              },
              {
                "question": "Как будет поддерживаться качество перевода?",
                "answer": ""
              }
            ],
            "resume": ""
          }
]';

--обновление data_collection в уже созданных проектах
UPDATE PUBLIC.briefs
  SET data_collection = (SELECT brief FROM PUBLIC.methods join projects on (methods.title = projects.method) where projects.id = briefs.project_id) WHERE data_collection is null;

--создание нового брифа для проекта
CREATE FUNCTION PUBLIC.create_brief(project_id BIGINT) returns BOOLEAN
    LANGUAGE plpgsql security definer AS $$
    DECLARE 
      brief_JSON json;
    BEGIN
      IF authorize(auth.uid(), create_brief.project_id) NOT IN ('admin', 'coordinator') THEN
        RETURN false;
      END IF;
      SELECT brief FROM PUBLIC.methods 
        JOIN PUBLIC.projects ON (projects.method = methods.title) 
        WHERE projects.id = project_id into brief_JSON;
        INSERT INTO PUBLIC.briefs (project_id, data_collection) VALUES (project_id, brief_JSON);    
      RETURN true;
    END;
$$;
