https://github.com/supabase/supabase/tree/master/examples/auth/nextjs-auth
Пример аутентификации серверной и через клиента


Создание нового метода перевода
  const { data, error } = await supabase.from('methods').insert({
    title: 'Linguical',
    type: 'obs',
    resources: { obs: true, obs_tn: false, obs_tq: false },
    steps: [
      {
        title: 'Step 1',
        description: 'Desc of 1',
        intro: '## Test',
        config: [
          {
            size: 4,
            tools: [
              { name: 'obs', props: {} },
              { name: 'obs_tq', props: {} },
            ],
          },
          {
            size: 2,
            tools: [{ name: 'notepad', props: {} }],
          },
        ],
      },

      {
        title: 'Step 2',
        description: 'Desc of step 2',
        intro: '## Test\n#### header\n\nSome Text Here',
        config: [
          {
            size: 3,
            tools: [
              { name: 'obs', props: {} },
              { name: 'obs_tn', props: {} },
            ],
          },
          {
            size: 3,
            tools: [
              { name: 'editor', props: {} },
              { name: 'notepad', props: { team: 'OBS' } },
            ],
          },
        ],
      },
    ],
  })


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

SELECT verses, current_step, chapters.id, chapters.num, chapters.book_id, started_at, finished_at, books.code
FROM verses LEFT JOIN chapters ON (verses.chapter_id = chapters.id) LEFT JOIN books ON (chapters.book_id = books.id)
WHERE verses.project_id=2
  AND project_translator_id=(SELECT id FROM project_translators WHERE project_id=2 AND user_id='73c91d38-0eb8-4d6b-8b4f-8de41d6a9399') GROUP BY books.id, chapters.id, verses.current_step;
