DROP FUNCTION IF EXISTS PUBLIC.get_words_page;

CREATE FUNCTION get_words_page(
    search_query TEXT,  
    words_per_page INT,  
    page_number INT,  
    project_id_param BIGINT
  ) 
  RETURNS TABLE (
    dict_id TEXT,
    dict_project_id BIGINT,
    dict_title TEXT,
    dict_data JSON,
    dict_created_at TIMESTAMP,
    dict_changed_at TIMESTAMP,
    dict_deleted_at TIMESTAMP,
    total_records BIGINT
  )  
  LANGUAGE plpgsql SECURITY DEFINER AS $$
  DECLARE
  from_offset INT;
  to_offset INT;
  BEGIN
    IF page_number = -1 THEN
      RETURN QUERY
       SELECT
        id AS dict_id,
        project_id AS dict_project_id,
        title AS dict_title,
        data AS dict_data,
        created_at AS dict_created_at,
        changed_at AS dict_changed_at,
        deleted_at AS dict_deleted_at,
        COUNT(*) OVER() AS total_records
      FROM dictionaries
      WHERE project_id = project_id_param
        AND deleted_at IS NULL
        AND title ILIKE (search_query || '%')
      ORDER BY title ASC;
    ELSE
      from_offset := page_number * words_per_page;
      to_offset := (page_number + 1) * words_per_page;

      RETURN QUERY
        SELECT
          id AS dict_id,
          project_id AS dict_project_id,
          title AS dict_title,
          data AS dict_data,
          created_at AS dict_created_at,
          changed_at AS dict_changed_at,
          deleted_at AS dict_deleted_at,
          COUNT(*) OVER() AS total_records
        FROM dictionaries
        WHERE project_id = project_id_param
        AND deleted_at IS NULL
        AND title ILIKE (search_query || '%')
        ORDER BY title ASC
        LIMIT words_per_page
        OFFSET from_offset;
    END IF;
  END 
$$;
