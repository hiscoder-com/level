-- trigger the function every time a user is created

    CREATE TRIGGER on_auth_user_created AFTER
      INSERT
        ON auth.users FOR each ROW EXECUTE FUNCTION PUBLIC.handle_new_user();
