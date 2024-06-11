CREATE OR REPLACE TRIGGER on_auth_user_created AFTER
  INSERT
  ON auth.users FOR each ROW EXECUTE FUNCTION PUBLIC.handle_new_user();
