DROP FUNCTION IF EXISTS PUBLIC.change_time_step;
CREATE FUNCTION PUBLIC.change_time_step(project_code TEXT, step_num INT2, time_count INT2) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  project BIGINT;
BEGIN
    SELECT id FROM projects WHERE projects.code = change_time_step.project_code INTO project;
    -- must be on the project
    IF authorize(auth.uid(), project) NOT IN ( 'admin', 'coordinator', 'moderator') THEN
        RETURN FALSE;
    END IF;
UPDATE public.steps
SET time = change_time_step.time_count
WHERE steps.project_id  = project
AND steps.sorting = change_time_step.step_num; 
RETURN TRUE;    
END
$$;
