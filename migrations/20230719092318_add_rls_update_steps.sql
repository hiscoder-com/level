DROP POLICY IF EXISTS "Изменять может админ" ON PUBLIC.steps;

CREATE POLICY "Обновлять может только админ" ON PUBLIC.steps FOR
  UPDATE
      USING (admin_only());
