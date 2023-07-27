DROP TRIGGER IF EXISTS update_alphabet_upon_soft_delete ON PUBLIC.dictionaries;
DROP FUNCTION IF EXISTS PUBLIC.remove_alphabet_letter_upon_soft_delete;

CREATE FUNCTION PUBLIC.remove_alphabet_letter_upon_soft_delete() RETURNS TRIGGER
  LANGUAGE plpgsql SECURITY DEFINER AS $$
  DECLARE
    alphabet JSONB;
    word_exists BOOLEAN;
  BEGIN
    IF OLD.deleted_at IS NOT NULL OR NEW.deleted_at IS NULL THEN
      RETURN NEW;
    END IF;
    SELECT dictionaries_alphabet INTO alphabet FROM PUBLIC.projects WHERE NEW.project_id = projects.id;
    SELECT EXISTS(SELECT 1 FROM PUBLIC.dictionaries WHERE upper(title::VARCHAR(1)) = upper(OLD.title::VARCHAR(1)) AND project_id = OLD.project_id AND deleted_at IS NULL) INTO word_exists;
    IF word_exists THEN
      RETURN NEW;
    ELSE
      UPDATE PUBLIC.projects SET dictionaries_alphabet = alphabet - upper(OLD.title::VARCHAR(1)) WHERE projects.id = OLD.project_id;
    END IF;
    RETURN NEW;
  END;
$$;

CREATE TRIGGER update_alphabet_upon_soft_delete AFTER
  UPDATE
    ON PUBLIC.dictionaries FOR each ROW EXECUTE FUNCTION PUBLIC.remove_alphabet_letter_upon_soft_delete();
