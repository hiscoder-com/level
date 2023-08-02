DROP TRIGGER IF EXISTS on_dictionaries_update ON PUBLIC.dictionaries;
DROP TRIGGER IF EXISTS update_alphabet_upon_soft_delete ON PUBLIC.dictionaries;
DROP TRIGGER IF EXISTS alphabet_change_trigger ON PUBLIC.dictionaries;
DROP TRIGGER IF EXISTS alphabet_insert_trigger ON PUBLIC.dictionaries;

DROP FUNCTION IF EXISTS PUBLIC.handle_update_dictionaries;
DROP FUNCTION IF EXISTS PUBLIC.remove_alphabet_letter_upon_soft_delete;
DROP FUNCTION IF EXISTS PUBLIC.alphabet_change_handler;
DROP FUNCTION IF EXISTS PUBLIC.alphabet_insert_handler;

-- update the alphabet array in the projects column when updating or restoring a new word, or when soft deleting a word
CREATE FUNCTION PUBLIC.alphabet_change_handler() RETURNS TRIGGER
  LANGUAGE plpgsql SECURITY DEFINER AS $$
  DECLARE
    old_letter_exists BOOLEAN;
    new_letter_exists BOOLEAN;
    letter_count INT;
  BEGIN
    -- If the record was undeleted, check if the letter exists in the alphabet
    IF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      SELECT EXISTS(
        SELECT 1 FROM PUBLIC.projects
        WHERE jsonb_exists(dictionaries_alphabet, upper(NEW.title::VARCHAR(1)))
        AND projects.id = NEW.project_id
      ) INTO new_letter_exists;

      -- If the letter does not exist, add it to the project alphabet
      IF NOT new_letter_exists THEN
        UPDATE PUBLIC.projects
        SET dictionaries_alphabet = dictionaries_alphabet || jsonb_build_array(upper(NEW.title::VARCHAR(1)))
        WHERE projects.id = NEW.project_id;
      END IF;
      RETURN NEW;
    END IF;

    -- If the word was updated or soft deleted
    IF OLD.title <> NEW.title OR (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL) THEN
      -- Check if there are other words starting with the same letter as the old word
      SELECT EXISTS(
        SELECT 1 FROM PUBLIC.dictionaries
        WHERE upper(title::VARCHAR(1)) = upper(OLD.title::VARCHAR(1))
        AND project_id = OLD.project_id AND deleted_at IS NULL
      ) INTO old_letter_exists;

      -- If not, remove the letter from the project alphabet
      IF NOT old_letter_exists THEN
        UPDATE PUBLIC.projects
        SET dictionaries_alphabet = dictionaries_alphabet - upper(OLD.title::VARCHAR(1))
        WHERE projects.id = OLD.project_id;
      END IF;

      -- If the word was updated (not soft deleted), check if there are other words starting with the same letter as the new word
      IF NEW.deleted_at IS NULL AND OLD.title <> NEW.title THEN
        SELECT COUNT(id) > 1 FROM PUBLIC.dictionaries
          WHERE upper(title::VARCHAR(1)) = upper(NEW.title::VARCHAR(1))
          AND project_id = NEW.project_id AND deleted_at IS NULL
        INTO new_letter_exists;

        -- If not, add the letter to the project alphabet
        IF NOT new_letter_exists THEN
          UPDATE PUBLIC.projects
          SET dictionaries_alphabet = dictionaries_alphabet || jsonb_build_array(upper(NEW.title::VARCHAR(1)))
          WHERE projects.id = NEW.project_id;
        END IF;
      END IF;
    END IF;

    RETURN NEW;
  END;
$$;

CREATE FUNCTION PUBLIC.alphabet_insert_handler() RETURNS TRIGGER
  LANGUAGE plpgsql SECURITY DEFINER AS $$
  DECLARE
    new_letter_exists BOOLEAN;
  BEGIN
    -- Check if the letter exists in the alphabet
    SELECT EXISTS(
      SELECT 1 FROM PUBLIC.projects
      WHERE jsonb_exists(dictionaries_alphabet, upper(NEW.title::VARCHAR(1)))
      AND projects.id = NEW.project_id
    ) INTO new_letter_exists;

    -- If the letter does not exist, add it to the project alphabet
    IF NOT new_letter_exists THEN
      UPDATE PUBLIC.projects
      SET dictionaries_alphabet = dictionaries_alphabet || jsonb_build_array(upper(NEW.title::VARCHAR(1)))
      WHERE projects.id = NEW.project_id;
    END IF;

    RETURN NEW;
  END;
$$;

CREATE TRIGGER alphabet_change_trigger AFTER
  UPDATE
    ON PUBLIC.dictionaries FOR each ROW EXECUTE FUNCTION PUBLIC.alphabet_change_handler();

CREATE TRIGGER alphabet_insert_trigger BEFORE
  INSERT
    ON PUBLIC.dictionaries FOR each ROW EXECUTE FUNCTION PUBLIC.alphabet_insert_handler();
