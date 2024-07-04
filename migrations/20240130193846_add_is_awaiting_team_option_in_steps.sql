ALTER TABLE public.steps
ADD COLUMN is_awaiting_team BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE PUBLIC.methods
SET steps = (
  SELECT json_agg(step::json)::json
  FROM (
    SELECT jsonb_set(step::jsonb, '{is_awaiting_team}', 'false')::jsonb AS step
    FROM json_array_elements(steps::json) step 
  ) subquery
)
WHERE steps IS NOT NULL;
