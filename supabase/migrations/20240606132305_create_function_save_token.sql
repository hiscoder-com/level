ALTER TABLE public.projects
ALTER COLUMN comcheck_token TYPE text;

CREATE OR REPLACE FUNCTION "public"."save_token"("token" text, "project_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$    
    BEGIN
      IF authorize(auth.uid(), save_token.project_id) NOT IN ('admin', 'coordinator')THEN RETURN FALSE;
      END IF;  

      UPDATE PUBLIC.projects SET comcheck_token = token WHERE id = save_token.project_id;
      RETURN true;
    END;
  $$;

ALTER FUNCTION "public"."save_token"("token" text, "project_id" bigint) OWNER TO "postgres";
