 -- creating a new brief for the project

  DROP FUNCTION IF EXISTS PUBLIC.create_brief;

  CREATE FUNCTION PUBLIC.create_brief(project_id BIGINT, is_enable BOOLEAN, data_collection JSON) RETURNS BIGINT
      LANGUAGE plpgsql SECURITY DEFINER AS $$
      DECLARE
        brief_id BIGINT;
      BEGIN
        IF authorize(auth.uid(), create_brief.project_id) NOT IN ('admin', 'coordinator') THEN
          RETURN false;
        END IF;
        INSERT INTO PUBLIC.briefs (project_id, data_collection, is_enable) VALUES (project_id, data_collection, is_enable) RETURNING id INTO brief_id;
        RETURN brief_id;
      END;
  $$;
