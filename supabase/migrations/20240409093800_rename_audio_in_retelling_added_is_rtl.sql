ALTER TABLE public.languages
ADD COLUMN is_rtl boolean DEFAULT false;

ALTER TABLE public.briefs
ADD COLUMN name text DEFAULT 'Brief';

ALTER TABLE public.projects
ADD COLUMN is_rtl boolean DEFAULT false;

ALTER TABLE public.steps
ADD COLUMN subtitle text DEFAULT NULL;

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
      WHEN jsonb_typeof(step) = 'object' AND step->'config' IS NOT NULL THEN
        jsonb_set(step, '{config}', (                    
          SELECT jsonb_agg(
            CASE                            
              WHEN jsonb_typeof(config) = 'object' AND config->'tools' IS NOT NULL THEN
                jsonb_set(config, '{tools}', (
                  SELECT jsonb_agg(
                    CASE
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
