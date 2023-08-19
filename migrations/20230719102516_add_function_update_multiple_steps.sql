CREATE FUNCTION update_multiple_steps(steps jsonb[], project_id BIGINT) RETURNS BOOLEAN AS $$
DECLARE
  step jsonb;
BEGIN
  IF authorize(auth.uid(), update_multiple_steps.project_id) NOT IN ('admin') THEN
    RETURN FALSE;
  END IF;
  FOREACH step IN ARRAY steps
  LOOP
    UPDATE public.steps
    SET
      title = (step->>'title')::TEXT,
      description = (step->>'description')::TEXT,
      intro = (step->>'intro')::TEXT
     WHERE id = (step->>'id')::BIGINT AND update_multiple_steps.project_id = public.steps.project_id;
  END LOOP;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
