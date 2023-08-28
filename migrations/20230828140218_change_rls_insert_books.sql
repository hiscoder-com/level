DROP POLICY IF EXISTS "Добавлять можно только админу" ON PUBLIC.books;

CREATE POLICY "Добавлять можно админу или координатору" ON PUBLIC.books FOR
  INSERT
    WITH CHECK (authorize(auth.uid(), project_id) IN ('admin', 'coordinator'));
