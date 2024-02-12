UPDATE public.methods
SET resources = resources::jsonb || '{"reference": false}'::jsonb
WHERE resources IS NOT NULL 
  AND title= 'RuGL';


UPDATE public.methods
SET steps = jsonb_set(steps, '{2,config,0,tools}', steps->2->'config'->0->'tools' || '{"name": "reference", "config": {}}'::jsonb)
WHERE steps IS NOT NULL 
  AND title = 'RuGL'
  AND (steps->2->'config'->0->'tools') IS NOT NULL;

  UPDATE public.steps
SET config = jsonb_set(
    config::jsonb,
    '{0,tools}',
    jsonb_insert(
      config::jsonb->0->'tools',
      '{-1}',
      '{"name": "reference", "config": {}}'::jsonb,
      true
    )
  )::json
FROM public.projects
JOIN public.methods ON projects.method = methods.title
WHERE steps.project_id = projects.id
  AND methods.title = 'RuGL'
  AND steps.sorting = 3
  AND (config->0->'tools') IS NOT NULL;
