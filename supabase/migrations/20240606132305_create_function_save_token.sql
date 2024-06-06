CREATE OR REPLACE FUNCTION "public"."save_token"("token" text, "project_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    DECLARE
      chap RECORD;
    BEGIN
      IF authorize(auth.uid(), change_finish_chapter.project_id) NOT IN ('admin', 'coordinator')THEN RETURN FALSE;
      END IF;  

      UPDATE PUBLIC.users SET comcheck_token = token WHERE id = auth.uid();
      RETURN true;
    END;
  $$;

ALTER FUNCTION "public"."save_token"("token" text, "project_id" bigint) OWNER TO "postgres";
