ALTER TABLE public.methods
ALTER COLUMN resources TYPE jsonb;

ALTER TABLE public.steps
ALTER COLUMN config TYPE jsonb;

ALTER TABLE public.languages
ADD COLUMN is_rtl boolean DEFAULT false;

ALTER TABLE public.steps
ADD COLUMN subtitle text DEFAULT NULL;

UPDATE public.methods
SET resources = resources || '{"reference": false}'::jsonb
WHERE resources IS NOT NULL 
  AND title= 'RuGL';

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

UPDATE public.steps
SET config = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'size', tool->'size',
      'tools', (
        SELECT jsonb_agg(
          CASE
            WHEN tool_obj->>'name' = 'audio' THEN jsonb_set(tool_obj, '{name}', '"retelling"')
            ELSE tool_obj
          END
        )
        FROM jsonb_array_elements(tool->'tools') AS tool_obj
      )
    )
  )
  FROM jsonb_array_elements(config) as tool
) 
WHERE config @> '[{"tools":[{"name":"audio"}]}]';

UPDATE methods
SET steps = (
    SELECT jsonb_agg(
        CASE
            -- Трансформируем объект steps
            WHEN jsonb_typeof(step) = 'object' AND step->'config' IS NOT NULL THEN
                jsonb_set(step, '{config}', (
                    -- Трансформируем массив объектов config
                    SELECT jsonb_agg(
                        CASE
                            -- Трансформируем объект config
                            WHEN jsonb_typeof(config) = 'object' AND config->'tools' IS NOT NULL THEN
                                jsonb_set(config, '{tools}', (
                                    -- Трансформируем массив объектов tools
                                    SELECT jsonb_agg(
                                        CASE
                                            -- Заменяем audio на retelling
                                            WHEN tool->>'name' = 'audio' THEN
                                                jsonb_set(tool, '{name}', '"retelling"')
                                            ELSE
                                                tool
                                        END
                                    )
                                    FROM jsonb_array_elements(config->'tools') tool
                                ))
                            ELSE                                              
                                config
                        END
                    )
                    FROM jsonb_array_elements(step->'config') config
                ))
            ELSE
                step
        END
    )
    FROM jsonb_array_elements(steps) step
)
WHERE steps @> '[{"config": [{"tools": [{"name": "audio"}]}]}]';
