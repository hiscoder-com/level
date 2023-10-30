-- We add a sorting column and assign sorting values to the records in the table.
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

DROP TRIGGER IF EXISTS before_insert_set_sorting ON PUBLIC.personal_notes;

DROP FUNCTION IF EXISTS PUBLIC.set_sorting_before_insert;
DROP FUNCTION IF EXISTS PUBLIC.get_max_sorting;

-- This function calculates the next available sorting value for root records in the personal_notes table
  CREATE FUNCTION PUBLIC.get_max_sorting() RETURNS integer
      LANGUAGE plpgsql SECURITY DEFINER AS $$
  DECLARE
    max_sorting_value integer;
  BEGIN
    SELECT COALESCE(MAX(sorting), -1) INTO max_sorting_value
    FROM PUBLIC.personal_notes
    WHERE parent_id IS NULL;

    RETURN max_sorting_value + 1;
  END;
  $$;

-- This function sets the sort value for a new entry in the personal_notes table
  CREATE FUNCTION PUBLIC.set_sorting_before_insert() RETURNS TRIGGER
    LANGUAGE plpgsql SECURITY DEFINER AS $$
    BEGIN
      NEW.sorting := get_max_sorting();
      RETURN NEW;
    END;
  $$;

-- This trigger automatically sets the sorting when a new record is inserted.
  CREATE TRIGGER before_insert_set_sorting BEFORE
    INSERT
      ON PUBLIC.personal_notes FOR each ROW EXECUTE FUNCTION PUBLIC.set_sorting_before_insert();


DROP TRIGGER IF EXISTS update_sorting_trigger ON PUBLIC.personal_notes;

DROP FUNCTION IF EXISTS PUBLIC.update_sorting_on_delete;

-- Updating sorting values for the remaining records in the table after deleting an element
  CREATE FUNCTION PUBLIC.update_sorting_on_delete() RETURNS TRIGGER
    LANGUAGE plpgsql SECURITY DEFINER AS $$
    DECLARE
      parent_sorting INT;
    BEGIN
        IF NEW.sorting IS NULL THEN
          UPDATE PUBLIC.personal_notes
          SET sorting = sorting - 1
          WHERE (parent_id = OLD.parent_id OR (parent_id IS NULL AND OLD.parent_id IS NULL)) AND sorting > OLD.sorting;
        END IF;
      RETURN OLD;
    END;
  $$;

-- After deleting a table element, we update the sorting for the remaining records
  CREATE TRIGGER update_sorting_trigger AFTER
    UPDATE
      ON PUBLIC.personal_notes FOR each ROW EXECUTE FUNCTION PUBLIC.update_sorting_on_delete();
