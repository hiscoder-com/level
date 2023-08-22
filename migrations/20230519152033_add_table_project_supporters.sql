-- PROJECT SUPPORTERS
  -- TABLE
    CREATE TABLE PUBLIC.project_supporters (
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
      PUBLIC.project_supporters enable ROW LEVEL SECURITY;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Админ видит всех, остальные только тех кто с ними на проекте" ON PUBLIC.project_supporters;

    CREATE POLICY "Админ видит всех, остальные только тех кто с ними на проекте" ON PUBLIC.project_supporters FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

    DROP POLICY IF EXISTS "Добавлять на проект может только админ" ON PUBLIC.project_supporters;

    CREATE POLICY "Добавлять на проект может только админ" ON PUBLIC.project_supporters FOR
    INSERT
      WITH CHECK (admin_only());

    DROP POLICY IF EXISTS "Удалять только админ" ON PUBLIC.project_supporters;

    CREATE POLICY "Удалять только админ" ON PUBLIC.project_supporters FOR
    DELETE
      USING (admin_only());
  -- END RLS
-- END PROJECT SUPPORTERS
