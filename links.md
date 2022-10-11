https://github.com/supabase/supabase/tree/master/examples/auth/nextjs-auth
Пример аутентификации серверной и через клиента

    INSERT INTO
      PUBLIC.users (
        id,
        login,
        email,
        agreement,
        confession,
        blocked,
        is_admin
      )
    VALUES
      (
        '73c91d38-0eb8-4d6b-8b4f-8de41d6a9399',
        'TranslatorF',
        'translator@fox.com',
        TRUE,
        TRUE,
        NULL,
        FALSE
      ),
      (
        'fc40caa3-fde8-4851-b6d4-84aa2c6cb628',
        'ModeratorF',
        'moderator@fox.com',
        TRUE,
        TRUE,
        NULL,
        FALSE
      ),
      (
        '29669e20-b05e-46f4-894a-d5a1de2bf626',
        'CoordinatorF',
        'coordinator@fox.com',
        TRUE,
        TRUE,
        NULL,
        FALSE
      ),
      (
        '8390f82c-ea82-4f5f-bf43-f60ad0e3ba18',
        'AdminF',
        'admin@fox.com',
        TRUE,
        TRUE,
        NULL,
        TRUE
      );


    INSERT INTO
      PUBLIC.users (
        id,
        login,
        email,
        agreement,
        confession,
        blocked,
        is_admin
      )
    VALUES
      (
        '7f045e7c-432e-4a9e-b4f7-e74d0fd724b9',
        'TranslatorL',
        'translator@local.com',
        TRUE,
        TRUE,
        NULL,
        FALSE
      ),
      (
        '428ce1cc-4c7e-4d27-9531-a0643802383f',
        'ModeratorL',
        'moderator@local.com',
        TRUE,
        TRUE,
        NULL,
        FALSE
      ),
      (
        '22a7ab09-0f5d-4682-bf65-6d59b0ff6c43',
        'CoordinatorL',
        'coordinator@local.com',
        TRUE,
        TRUE,
        NULL,
        FALSE
      ),
      (
        '0b7f65d3-889f-4fb4-b0ea-904d1e6ea08a',
        'AdminL',
        'admin@local.com',
        TRUE,
        TRUE,
        NULL,
        TRUE
      );

SELECT verses, current_step, chapters.id, chapters.num, chapters.book_id, started_at, finished_at, books.code
FROM verses LEFT JOIN chapters ON (verses.chapter_id = chapters.id) LEFT JOIN books ON (chapters.book_id = books.id)
WHERE verses.project_id=2
  AND project_translator_id=(SELECT id FROM project_translators WHERE project_id=2 AND user_id='73c91d38-0eb8-4d6b-8b4f-8de41d6a9399') GROUP BY books.id, chapters.id, verses.current_step;
