DROP POLICY IF EXISTS "Изменять может админ" ON PUBLIC.steps;

CREATE POLICY "Изменять может админ" ON PUBLIC.steps FOR
  UPDATE
    USING (authorize(auth.uid(), project_id) IN ('admin'));
