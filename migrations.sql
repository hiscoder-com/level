--Here added scripts for updating live db before setup migrating settings for supabase

--Update chapters - change type for column text from 'text' to jsonb
ALTER TABLE chapters ADD text_temp json;
UPDATE chapters SET text_temp = to_json('text');
ALTER TABLE chapters DROP COLUMN 'text';
ALTER TABLE chapters RENAME COLUMN text_temp To 'text';

CREATE TABLE PUBLIC.logs (
      id bigint GENERATED ALWAYS AS IDENTITY primary key,
      created_at TIMESTAMP DEFAULT now(),
      log jsonb,        
    );
    --TODO Надо сделать RLS для аутентифицированных пользователей для чтения и инсерта, но ошибка вылетает, нужно проверить ещё раз 
    ALTER TABLE
      PUBLIC.dictionaries disable ROW LEVEL security; 

    --Администратор или координатор может изменить запись
    DROP POLICY IF EXISTS "books update" ON PUBLIC.books;
    CREATE policy "books update" ON PUBLIC.books FOR
    UPDATE
      WITH CHECK (authorize(auth.uid(), project_id) IN ('admin', 'coordinator'));
    --Администратор или координатор может добавить запись
    DROP POLICY IF EXISTS "chapters insert" ON PUBLIC.chapters;
    CREATE policy "chapters insert" ON PUBLIC.chapters FOR
    INSERT
      WITH CHECK (authorize(auth.uid(), project_id) IN ('admin', 'coordinator'));
    --Администратор или координатор может изменить запись
    DROP POLICY IF EXISTS "chapters update" ON PUBLIC.chapters;
    CREATE policy "chapters update" ON PUBLIC.chapters FOR
    UPDATE
      WITH CHECK (authorize(auth.uid(), project_id) IN ('admin', 'coordinator'));
    --Администратор или координатор может добавить запись
    DROP POLICY IF EXISTS "verses insert" ON PUBLIC.verses;
    CREATE policy "verses insert" ON PUBLIC.verses FOR
    INSERT
      WITH CHECK (authorize(auth.uid(), project_id) IN ('admin', 'coordinator'));
    --Администратор или координатор может изменить запись
    DROP POLICY IF EXISTS "projects update" ON PUBLIC.projects;
    CREATE policy "projects update" ON PUBLIC.projects FOR
    UPDATE
      WITH CHECK (authorize(auth.uid(), project_id) IN ('admin', 'coordinator'));

