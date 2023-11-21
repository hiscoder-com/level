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
        'a15e7e6f-5fc8-49b4-8d58-f6b5e99ee1d3',
        'TranslatorF',
        'translator@fox.com',
        TRUE,
        TRUE,
        NULL,
        FALSE
      ),
      (
        'd68be542-7de7-4a95-8406-4f347bc2889a',
        'ModeratorF',
        'moderator@fox.com',
        TRUE,
        TRUE,
        NULL,
        FALSE
      ),
      (
        'b8960e4c-75b9-4853-953b-2ba94e45de1f',
        'CoordinatorF',
        'coordinator@fox.com',
        TRUE,
        TRUE,
        NULL,
        FALSE
      ),
      (
        'f96d1bfe-dda0-4f81-8a26-834e562bbcfd',
        'AdminF',
        'admin@fox.com',
        TRUE,
        TRUE,
        NULL,
        TRUE
      );
INSERT INTO public.project_coordinators (project_id, user_id) VALUES (1, 'b8960e4c-75b9-4853-953b-2ba94e45de1f');
INSERT INTO public.project_translators (project_id, is_moderator, user_id) VALUES
(1, false, 'a15e7e6f-5fc8-49b4-8d58-f6b5e99ee1d3'),
(1, true, 'd68be542-7de7-4a95-8406-4f347bc2889a');





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
  AND project_translator_id=(SELECT id FROM project_translators WHERE project_id=2 AND user_id='a15e7e6f-5fc8-49b4-8d58-f6b5e99ee1d3') GROUP BY books.id, chapters.id, verses.current_step;

pg_dump postgresql://postgres:postgres@localhost:64322/postgres --a --inserts -n public > backup.sql


Юзеры Александра


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
        'b75a51d5-ee4d-4ea0-afa3-2366d7716742',
        't1',
        't1@mail.com',
        TRUE,
        TRUE,
        NULL,
        FALSE
      ),
      (
        '1dfaa269-2eda-41c4-9a71-72db8cbd6db2',
        'admin',
        'admin@mail.com',
        TRUE,
        TRUE,
        NULL,
        TRUE
      );





      Юзеры Павла
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
        'ce3f61ee-f101-4cde-af6b-c99b86453b76',
        'Ali_M',
        'moderatorali@mail.com',
        TRUE,
        TRUE,
        NULL,
        FALSE
      ),
      (
        '5b289eaf-f224-4e33-8d61-1b8a8d429ac1',
        'Andrew_T',
        'translatorandrew@mail.com',
        TRUE,
        TRUE,
        NULL,
        FALSE
      ),
      (
        '883a6d93-1c72-4cc5-94fd-554b4357094d',
        'Brawn_A',
        'admin@mail.com',
        TRUE,
        TRUE,
        NULL,
        TRUE
      );
