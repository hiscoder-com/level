--UPDATING TABLES (adding a sorting column)
  ALTER TABLE PUBLIC.personal_notes
  ADD COLUMN sorting INT;

  WITH numbered_notes AS (
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY id) - 1 AS sorting
    FROM PUBLIC.personal_notes
  )
  UPDATE PUBLIC.personal_notes
  SET sorting = numbered_notes.sorting
  FROM numbered_notes
  WHERE personal_notes.id = numbered_notes.id;

  ALTER TABLE PUBLIC.team_notes
  ADD COLUMN sorting INT;

  WITH numbered_notes AS (
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY id) - 1 AS sorting
    FROM PUBLIC.team_notes
  )
  UPDATE PUBLIC.team_notes
  SET sorting = numbered_notes.sorting
  FROM numbered_notes
  WHERE team_notes.id = numbered_notes.id;

-- PROCESSING ADDING A NODE (determining the correct sorting value)
  DROP TRIGGER IF EXISTS before_insert_set_sorting_personal_notes ON PUBLIC.personal_notes;
  DROP TRIGGER IF EXISTS before_insert_set_sorting_team_notes ON PUBLIC.team_notes;

  DROP FUNCTION IF EXISTS PUBLIC.get_max_sorting;
  DROP FUNCTION IF EXISTS PUBLIC.set_sorting_before_insert;

  -- This function calculates the next available sorting value for root records in the personal_notes & team_notes table
  CREATE FUNCTION PUBLIC.get_max_sorting(table_name TEXT) RETURNS integer
      LANGUAGE plpgsql SECURITY DEFINER AS $$
    DECLARE
      max_sorting_value integer;
    BEGIN
      EXECUTE format('
        SELECT COALESCE(MAX(sorting), -1)
        FROM %I
        WHERE parent_id IS NULL', table_name) INTO max_sorting_value;

      RETURN max_sorting_value + 1;
    END;
  $$;

  -- This function sets the sort value for a new entry in the personal_notes & team_notes table
  CREATE FUNCTION PUBLIC.set_sorting_before_insert() RETURNS TRIGGER
      LANGUAGE plpgsql SECURITY DEFINER AS $$
    BEGIN
      IF TG_TABLE_NAME = 'personal_notes' THEN
        NEW.sorting := get_max_sorting('personal_notes');
      ELSIF TG_TABLE_NAME = 'team_notes' THEN
        NEW.sorting := get_max_sorting('team_notes');
      END IF;
      RETURN NEW;
    END;
  $$;

  -- This trigger automatically sets the sorting when a new record is inserted.
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

  -- Updating sorting values for the remaining records in the table after deleting an element
  CREATE FUNCTION PUBLIC.correct_sorting_on_deletion() RETURNS TRIGGER
    LANGUAGE plpgsql SECURITY DEFINER AS $$
    DECLARE
      parent_sorting INT;
    BEGIN
      IF NEW.sorting IS NULL THEN
        EXECUTE format('
          UPDATE PUBLIC.%I
          SET sorting = sorting - 1
          WHERE (parent_id = $1 OR (parent_id IS NULL AND $2 IS NULL)) AND sorting > $3',
          TG_TABLE_NAME) USING OLD.parent_id, OLD.parent_id, OLD.sorting;
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


-- Function for Drag and Drop node repositioning in the notes tree
  DROP FUNCTION IF EXISTS PUBLIC.move_node;

  CREATE FUNCTION PUBLIC.move_node(new_sorting_value INT, dragged_node_id VARCHAR, new_parent_id VARCHAR, table_name TEXT, project_id BIGINT) RETURNS VOID
    LANGUAGE plpgsql SECURITY DEFINER AS $$
    DECLARE
      old_sorting INT;
      old_parent_id VARCHAR;
    BEGIN
      IF authorize(auth.uid(), project_id) NOT IN ('moderator','admin', 'coordinator') THEN RETURN;
      END IF;
      EXECUTE format('
        SELECT sorting, parent_id
        FROM PUBLIC.%I
        WHERE id = $1', table_name) INTO old_sorting, old_parent_id
      USING dragged_node_id;

      IF old_sorting IS NOT NULL THEN
        -- if the new sorting is equal to the old one, or greater than the old one by one and the action is in the common parent, then we do nothing
        IF (new_sorting_value = old_sorting OR new_sorting_value = old_sorting + 1) AND (old_parent_id = new_parent_id OR (old_parent_id IS NULL AND new_parent_id IS NULL)) THEN
          RETURN;

        -- if the new sorting is greater than the old sorting and the action is in a common parent
        ELSIF new_sorting_value > old_sorting AND (new_parent_id = old_parent_id OR (old_parent_id IS NULL AND new_parent_id IS NULL)) THEN
          new_sorting_value := new_sorting_value - 1;
          EXECUTE format('
            UPDATE PUBLIC.%I
            SET sorting = sorting - 1
            WHERE sorting > $1 AND sorting <= $2 AND (parent_id = $3 OR (parent_id IS NULL AND $4 IS NULL))', table_name)
          USING old_sorting, new_sorting_value, new_parent_id, new_parent_id;

        -- if the new sorting is smaller than the old sorting and the action is in the common parent
        ELSIF new_sorting_value < old_sorting AND (new_parent_id = old_parent_id OR (old_parent_id IS NULL AND new_parent_id IS NULL)) THEN
          EXECUTE format('
            UPDATE PUBLIC.%I
            SET sorting = sorting + 1
            WHERE sorting < $1 AND sorting >= $2 AND (parent_id = $3 OR (parent_id IS NULL AND $4 IS NULL))', table_name)
          USING old_sorting, new_sorting_value, new_parent_id, new_parent_id;

        -- if we move to a new folder, then in the old folder we reduce the sorting of all elements that are larger than the old sorting
        ELSIF new_parent_id IS DISTINCT FROM old_parent_id THEN
          EXECUTE format('
            UPDATE PUBLIC.%I
            SET sorting = sorting - 1
            WHERE sorting > $1 AND (parent_id = $2 OR (parent_id IS NULL AND $3 IS NULL))', table_name)
          USING old_sorting, old_parent_id, old_parent_id;

          -- in the new folder we increase the sorting of all elements whose sorting is equal to or greater than the new sorting
          EXECUTE format('
            UPDATE PUBLIC.%I
            SET sorting = sorting + 1
            WHERE sorting >= $1 AND (parent_id = $2 OR (parent_id IS NULL AND $3 IS NULL))', table_name)
          USING new_sorting_value, new_parent_id, new_parent_id;
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
