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


