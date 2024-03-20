-- PROCESSING ADDING A NODE (determining the correct sorting value)
  DROP TRIGGER IF EXISTS before_insert_set_sorting_personal_notes ON PUBLIC.personal_notes;
  DROP TRIGGER IF EXISTS before_insert_set_sorting_team_notes ON PUBLIC.team_notes;
  DROP FUNCTION IF EXISTS PUBLIC.get_max_sorting;
  DROP FUNCTION IF EXISTS PUBLIC.set_sorting_before_insert;

  -- This function calculates the next available sorting value for root records in the personal_notes & team_notes table
    CREATE FUNCTION PUBLIC.get_max_sorting(table_name TEXT, user_id UUID DEFAULT NULL, project_id INT8 DEFAULT NULL) RETURNS integer
      LANGUAGE plpgsql SECURITY DEFINER AS $$
      DECLARE
        max_sorting_value integer;
      BEGIN
        IF table_name = 'personal_notes' THEN
          EXECUTE format('
            SELECT COALESCE(MAX(sorting), -1)
            FROM %I
            WHERE parent_id IS NULL AND user_id = $1', table_name)
          INTO max_sorting_value
          USING user_id;
        ELSIF table_name = 'team_notes' THEN
          EXECUTE format('
            SELECT COALESCE(MAX(sorting), -1)
            FROM %I
            WHERE parent_id IS NULL AND project_id = $1', table_name)
          INTO max_sorting_value
          USING project_id;
        END IF;

        RETURN max_sorting_value + 1;
      END;
    $$;

  -- This function sets the sort value for a new entry in the personal_notes & team_notes table
    CREATE FUNCTION PUBLIC.set_sorting_before_insert() RETURNS TRIGGER
        LANGUAGE plpgsql SECURITY DEFINER AS $$
      DECLARE
        user_id UUID;
        project_id INT8;
      BEGIN
        IF TG_TABLE_NAME = 'personal_notes' THEN
          SELECT NEW.user_id INTO user_id;
          NEW.sorting := get_max_sorting('personal_notes', user_id, NULL);
        ELSIF TG_TABLE_NAME = 'team_notes' THEN
          SELECT NEW.project_id INTO project_id;
          NEW.sorting := get_max_sorting('team_notes', NULL, project_id);
        END IF;
        RETURN NEW;
      END;
    $$;

  CREATE TRIGGER before_insert_set_sorting_personal_notes BEFORE
    INSERT
      ON PUBLIC.personal_notes FOR each ROW EXECUTE FUNCTION PUBLIC.set_sorting_before_insert();

  CREATE TRIGGER before_insert_set_sorting_team_notes BEFORE
    INSERT
      ON PUBLIC.team_notes FOR each ROW EXECUTE FUNCTION PUBLIC.set_sorting_before_insert();


-- DELETION PROCESSING (we change the sorting of all records that come AFTER the deleted node)
  DROP TRIGGER IF EXISTS sorting_correction_on_deletion_personal_notes ON PUBLIC.personal_notes;
  DROP TRIGGER IF EXISTS sorting_correction_on_deletion_team_notes ON PUBLIC.team_notes;

  DROP FUNCTION IF EXISTS PUBLIC.correct_sorting_on_deletion;

  CREATE FUNCTION PUBLIC.correct_sorting_on_deletion() RETURNS TRIGGER
  LANGUAGE plpgsql SECURITY DEFINER AS $$
  DECLARE
    parent_sorting INT;
    user_id UUID;
    project_id INT8;
  BEGIN
    IF TG_TABLE_NAME = 'personal_notes' THEN
      SELECT OLD.user_id INTO user_id;

      IF OLD.parent_id IS NULL THEN
        IF NEW.sorting IS NULL THEN
          EXECUTE format('
            UPDATE PUBLIC.%I
            SET sorting = sorting - 1
            WHERE user_id = $1 AND parent_id IS NULL AND sorting > $2',
            TG_TABLE_NAME)
          USING user_id, OLD.sorting;
        END IF;
        ELSE
          SELECT sorting INTO parent_sorting
          FROM PUBLIC.personal_notes
          WHERE id = OLD.parent_id;

          IF NEW.sorting IS NULL THEN
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting - 1
              WHERE user_id = $1 AND parent_id = $2 AND sorting > $3',
              TG_TABLE_NAME)
            USING user_id, OLD.parent_id, OLD.sorting - parent_sorting;
          END IF;
      END IF;
    ELSE -- TG_TABLE_NAME = 'team_notes'
      SELECT OLD.project_id INTO project_id;

      IF OLD.parent_id IS NULL THEN
        IF NEW.sorting IS NULL THEN
          EXECUTE format('
            UPDATE PUBLIC.%I
            SET sorting = sorting - 1
            WHERE project_id = $1 AND parent_id IS NULL AND sorting > $2',
            TG_TABLE_NAME)
          USING project_id, OLD.sorting;
        END IF;
      ELSE
        SELECT sorting INTO parent_sorting
        FROM PUBLIC.team_notes
        WHERE id = OLD.parent_id;

        IF NEW.sorting IS NULL THEN
          EXECUTE format('
            UPDATE PUBLIC.%I
            SET sorting = sorting - 1
            WHERE project_id = $1 AND parent_id = $2 AND sorting > $3',
            TG_TABLE_NAME)
          USING project_id, OLD.parent_id, OLD.sorting - parent_sorting;
        END IF;
      END IF;
    END IF;

    RETURN OLD;
  END;
  $$;

  -- After deleting a table element, we update the sorting for the remaining records
  CREATE TRIGGER sorting_correction_on_deletion_personal_notes AFTER
    UPDATE
      ON PUBLIC.personal_notes FOR each ROW EXECUTE FUNCTION PUBLIC.correct_sorting_on_deletion();

  CREATE TRIGGER sorting_correction_on_deletion_team_notes AFTER
    UPDATE
      ON PUBLIC.team_notes FOR each ROW EXECUTE FUNCTION PUBLIC.correct_sorting_on_deletion();

-- MOVE PROCESSING
  -- Function for Drag and Drop node repositioning in the notes tree
    DROP FUNCTION IF EXISTS PUBLIC.move_node;

    CREATE FUNCTION PUBLIC.move_node(
      new_sorting_value INT,
      dragged_node_id VARCHAR,
      new_parent_id VARCHAR,
      table_name TEXT,
      project_id INT8 DEFAULT NULL,
      user_id UUID DEFAULT NULL
    ) RETURNS VOID
    LANGUAGE plpgsql SECURITY DEFINER AS $$
    DECLARE
      old_sorting INT;
      old_parent_id VARCHAR;
      note_user_id UUID;
      note_project_id INT8;
    BEGIN
      IF table_name = 'personal_notes' THEN
        EXECUTE format('
          SELECT sorting, parent_id, user_id
          FROM PUBLIC.%I
          WHERE id = $1', table_name)
        INTO old_sorting, old_parent_id, note_user_id
        USING dragged_node_id;

        IF note_user_id != user_id THEN
          RAISE EXCEPTION 'You are not allowed to move this note';
        END IF;
      ELSIF table_name = 'team_notes' THEN
        EXECUTE format('
          SELECT sorting, parent_id, project_id
          FROM PUBLIC.%I
          WHERE id = $1', table_name)
        INTO old_sorting, old_parent_id, note_project_id
        USING dragged_node_id;

        IF note_project_id != project_id THEN
          RAISE EXCEPTION 'You are not allowed to move this note';
        END IF;
      END IF;

      IF old_sorting IS NOT NULL THEN
        -- if the new sorting is equal to the old one, or greater than the old one by one and the action is in the common parent, then we do nothing
        IF (new_sorting_value = old_sorting OR new_sorting_value = old_sorting + 1) AND (old_parent_id = new_parent_id OR (old_parent_id IS NULL AND new_parent_id IS NULL)) THEN
          RETURN;

        -- if the new sorting is greater than the old sorting and the action is in a common parent
        ELSIF new_sorting_value > old_sorting AND (new_parent_id = old_parent_id OR (old_parent_id IS NULL AND new_parent_id IS NULL)) THEN
          new_sorting_value := new_sorting_value - 1;
          IF table_name = 'personal_notes' THEN
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting - 1
              WHERE user_id = $1 AND sorting > $2 AND sorting <= $3 AND (parent_id = $4 OR (parent_id IS NULL AND $5 IS NULL))', table_name)
            USING note_user_id, old_sorting, new_sorting_value, new_parent_id, new_parent_id;
          ELSIF table_name = 'team_notes' THEN
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting - 1
              WHERE project_id = $1 AND sorting > $2 AND sorting <= $3 AND (parent_id = $4 OR (parent_id IS NULL AND $5 IS NULL))', table_name)
            USING note_project_id, old_sorting, new_sorting_value, new_parent_id, new_parent_id;
          END IF;

        -- if the new sorting is smaller than the old sorting and the action is in the common parent
        ELSIF new_sorting_value < old_sorting AND (new_parent_id = old_parent_id OR (old_parent_id IS NULL AND new_parent_id IS NULL)) THEN
          IF table_name = 'personal_notes' THEN
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting + 1
              WHERE user_id = $1 AND sorting < $2 AND sorting >= $3 AND (parent_id = $4 OR (parent_id IS NULL AND $5 IS NULL))', table_name)
            USING note_user_id, old_sorting, new_sorting_value, new_parent_id, new_parent_id;
          ELSIF table_name = 'team_notes' THEN
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting + 1
              WHERE project_id = $1 AND sorting < $2 AND sorting >= $3 AND (parent_id = $4 OR (parent_id IS NULL AND $5 IS NULL))', table_name)
            USING note_project_id, old_sorting, new_sorting_value, new_parent_id, new_parent_id;
          END IF;

        -- if we move to a new folder, then in the old folder we reduce the sorting of all elements that are larger than the old sorting
        ELSIF new_parent_id IS DISTINCT FROM old_parent_id THEN
          IF table_name = 'personal_notes' THEN
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting - 1
              WHERE user_id = $1 AND sorting > $2 AND (parent_id = $3 OR (parent_id IS NULL AND $4 IS NULL))', table_name)
            USING note_user_id, old_sorting, old_parent_id, old_parent_id;

            -- in the new folder we increase the sorting of all elements whose sorting is equal to or greater than the new sorting
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting + 1
              WHERE user_id = $1 AND sorting >= $2 AND (parent_id = $3 OR (parent_id IS NULL AND $4 IS NULL))', table_name)
            USING note_user_id, new_sorting_value, new_parent_id, new_parent_id;
          ELSIF table_name = 'team_notes' THEN
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting - 1
              WHERE project_id = $1 AND sorting > $2 AND (parent_id = $3 OR (parent_id IS NULL AND $4 IS NULL))', table_name)
            USING note_project_id, old_sorting, old_parent_id, old_parent_id;

            -- in the new folder we increase the sorting of all elements whose sorting is equal to or greater than the new sorting
            EXECUTE format('
              UPDATE PUBLIC.%I
              SET sorting = sorting + 1
              WHERE project_id = $1 AND sorting >= $2 AND (parent_id = $3 OR (parent_id IS NULL AND $4 IS NULL))', table_name)
            USING note_project_id, new_sorting_value, new_parent_id, new_parent_id;
          END IF;
        END IF;
      END IF;

      -- update the moved node
      EXECUTE format('
        UPDATE PUBLIC.%I
        SET sorting = $1, parent_id = $2
        WHERE id = $3', table_name)
      USING new_sorting_value, new_parent_id, dragged_node_id;
    END;
    $$;

-- SCRIPT for checking and correcting sorting
  DROP FUNCTION IF EXISTS PUBLIC.fix_sorting;

  CREATE FUNCTION PUBLIC.fix_sorting(table_name text, column_name text)
  RETURNS VOID
  LANGUAGE plpgsql
  AS $$
  DECLARE
    sql text;
  BEGIN
    sql := format('
      WITH sorted_notes AS (
        SELECT id,
          row_number() OVER (PARTITION BY %I, parent_id ORDER BY sorting) - 1 AS new_sorting
        FROM %I
        WHERE sorting IS NOT NULL
      )
      UPDATE %I tn
      SET sorting = sn.new_sorting
      FROM sorted_notes sn
      WHERE tn.id = sn.id', column_name, table_name, table_name);

    EXECUTE sql;
  END;
  $$;
