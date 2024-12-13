CREATE OR REPLACE FUNCTION public.has_assigned_verses(project_translator_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM verses 
    WHERE verses.project_translator_id = has_assigned_verses.project_translator_id
  );
END;
$function$
;
