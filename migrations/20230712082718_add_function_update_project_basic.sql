CREATE FUNCTION PUBLIC.update_project_basic( project_code TEXT,title TEXT,orig_title TEXT,code TEXT, language_id BIGINT ) RETURNS BOOLEAN
    LANGUAGE plpgsql SECURITY DEFINER AS $$
    DECLARE
      project_id BIGINT;
    BEGIN
      SELECT id FROM public.projects WHERE projects.code = project_code INTO project_id;
      IF authorize(auth.uid(), project_id) NOT IN ('admin') THEN
        RAISE EXCEPTION SQLSTATE '42000' USING MESSAGE = 'No access rights to this function';
      END IF;
      
      IF update_project_basic.project_code != update_project_basic.code THEN
        SELECT id FROM public.projects WHERE projects.code = update_project_basic.code INTO project_id;
        IF project_id IS NOT NULL THEN
          RAISE EXCEPTION SQLSTATE '23505' USING MESSAGE = 'This project code is already in use';
        END IF;
      END IF;     

      UPDATE PUBLIC.projects SET code = update_project_basic.code, title=update_project_basic.title, orig_title = update_project_basic.orig_title, language_id = update_project_basic.language_id WHERE projects.id = project_id;

      RETURN TRUE;

    END;
    $$;
