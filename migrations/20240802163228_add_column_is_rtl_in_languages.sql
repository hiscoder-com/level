ALTER TABLE languages
ADD COLUMN is_rtl boolean DEFAULT false;

ALTER TABLE steps
ADD COLUMN subtitle text DEFAULT NULL;

UPDATE methods

SET steps = (

  SELECT jsonb_agg((jsonb_set(value, '{subtitle}', 'null')) ORDER BY (value->>'time')::int)

  FROM jsonb_array_elements(steps)

) - не использовать, меняется порядок шагов в массиве, проверить

;


UPDATE steps
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
