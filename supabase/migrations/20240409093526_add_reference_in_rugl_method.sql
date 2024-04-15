ALTER TABLE public.methods
ALTER COLUMN resources TYPE jsonb;

ALTER TABLE public.steps
ALTER COLUMN config TYPE jsonb;

UPDATE public.methods
SET resources = (resources || '{"reference": false}'::jsonb)
WHERE resources IS NOT NULL
  AND title = 'RuGL';

UPDATE public.methods
SET steps = (
  SELECT jsonb_agg(
      CASE 
          WHEN value->'config'->0->'tools' IS NOT NULL 
            AND NOT EXISTS (
                SELECT 1 
                FROM jsonb_array_elements(value->'config'->0->'tools') t 
                WHERE t = '{"name": "reference", "config": {}}'::jsonb
            ) 
          THEN jsonb_set(value, '{config,0,tools}', value->'config'->0->'tools' || '{"name": "reference", "config": {}}'::jsonb)
          ELSE value
      END
  )
  FROM jsonb_array_elements(steps)
)
WHERE steps IS NOT NULL 
  AND title = 'RuGL';

UPDATE public.steps
SET config = jsonb_set(
    config,
    '{0,tools}',
    jsonb_insert(
      config->0->'tools',
      '{-1}',
      '{"name": "reference", "config": {}}'::jsonb,
      true
    )
  )
FROM public.projects
JOIN public.methods ON projects.method = methods.title
WHERE steps.project_id = projects.id
  AND methods.title = 'RuGL'
  AND (config->0->'tools') IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(config->0->'tools') t
      WHERE t = '{"name": "reference", "config": {}}'::jsonb
    );
