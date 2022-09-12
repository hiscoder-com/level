export const reference = {
  book: 'tit',
  chapter: '1',
  verses: ['5', '6', '7', '8', '9'],
}
export const steps = [
  {
    name: 'Шаг 1: Самостоятельное изучение',
    description: 'Some text here...',
    introstep: 'Text в формате md вместе с ютубом',
    workspace: [
      {
        size: '4',
        tools: [
          {
            id: 1,
            name: 'literal',
            config: {
              owner: 'DevleskoDrom',
              repo: 'onpu',
              commit: '209a944b5d9e6d15833a807d8fe771c9758c7139',
              bookPath: './57-TIT.usfm',
              format: 'text/usfm3',
              title:
                'Biblica® Open New Ukrainian Translation 2022 (New Testament and Psalms)',
              subject: 'Aligned Bible',
              language: 'uk',
            },
          },
          {
            id: 7,
            name: 'dictionary',
            config: {
              owner: 'ru_gl',
              repo: 'obs',
              commit: '921aaa41e3fe2a24f1a66c789d1840abab019131',
              manifest: {},
              bookPath: './content',
              format: 'text/markdown',
              title: 'Russian Open Bible Stories',
              subject: 'Open Bible Stories',
              language: 'ru',
            },
          },
          {
            id: 2,
            name: 'obs-tq',
            config: {
              owner: 'unfoldingWord',
              repo: 'obs-tq',
              commit: 'b160230943b89798d7a6d4693c477c621601e34c',
              manifest: {},
              bookPath: './tq_OBS.tsv',
              format: 'text/tsv',
              title: 'unfoldingWord® Open Bible Stories Translation Questions',
              subject: 'TSV OBS Translation Questions',
              language: 'en',
            },
          },
          {
            id: 3,
            name: 'notes',
            config: {
              owner: 'ru_gl',
              repo: 'obs-tn',
              commit: '9c418b368b928e0cfdb8840cc8ddd418bcda5aec',
              manifest: {},
              bookPath: './tn_OBS.tsv',
              format: 'text/tsv',
              title: 'Russian Open Bible Stories Translation Notes',
              subject: 'OBS Translation Notes',
              language: 'ru',
            },
          },
          {
            id: 4,
            name: 'words',
            config: {
              owner: 'ru_gl',
              repo: 'twl',
              commit: '17383807b558d6a7268cb44a90ac105c864a2ca1',
              bookPath: './twl_TIT.tsv',
              format: 'text/tsv',
              title: 'unfoldingWord® Translation Words Links',
              subject: 'TSV Translation Words Links',
              language: 'ru',
            },
          },
        ],
      },
      {
        size: '2',
        tools: [
          {
            id: 5,
            name: 'ownNotes', // notepad c пометкой личный
            config: {
              owner: 'unfoldingWord',
              repo: 'obs-twl',
              commit: '80def64e540fed5da6394bd88ac4588a98c4a3ec',
              manifest: {},
              bookPath: './twl_OBS.tsv',
              format: 'text/tsv',
              title: 'unfoldingWord® OBS Translation Words Links',
              subject: 'TSV OBS Translation Words Links',
              language: 'en',
            },
          },
          {
            id: 10,
            name: 'notes',
            config: {
              owner: 'ru_gl',
              repo: 'tn',
              commit: 'f36b5a19fc6ebbd37a7baba671909cf71de775bc',
              bookPath: './en_tn_57-TIT.tsv',
              format: 'text/tsv',
              title: 'Russian Translation Notes',
              subject: 'TSV Translation Notes',
              language: 'ru',
            },
          },
          {
            id: 11,
            name: 'tq',
            config: {
              owner: 'unfoldingWord',
              repo: 'tq',
              commit: 'b09890c9166ba08d734c4acc9b232ad5f9c7a4f5',
              bookPath: './tq_TIT.tsv',
              format: 'text/tsv',
              title: 'unfoldingWord® Translation Questions',
              subject: 'TSV Translation Questions',
              language: 'en',
            },
          },
        ],
      },
    ],
  },
  {
    name: 'Шаг 2: Командное изучение текста',
    description: 'Some text here...',
    introstep: 'Text в формате md вместе с ютубом',
    workspace: [
      {
        size: '4',
        tools: [
          {
            id: 1,
            name: 'literal',
            config: {
              owner: 'DevleskoDrom',
              repo: 'onpu',
              commit: '209a944b5d9e6d15833a807d8fe771c9758c7139',
              bookPath: './57-TIT.usfm',
              format: 'text/usfm3',
              title:
                'Biblica® Open New Ukrainian Translation 2022 (New Testament and Psalms)',
              subject: 'Aligned Bible',
              language: 'uk',
            },
          },
          {
            id: 2,
            name: 'simplified',
            config: {
              owner: 'ru_gl',
              repo: 'rsob',
              commit: '38c10e570082cc615e45628ae7ea3f38d9b67b8c',
              bookPath: './57-TIT.usfm',
              format: 'text/usfm3',
              title: 'Russian Simplified Open Bible',
              subject: 'Aligned Bible',
              language: 'ru',
            },
          },
          {
            id: 3,
            name: 'notes',
            config: {
              owner: 'ru_gl',
              repo: 'tn',
              commit: 'f36b5a19fc6ebbd37a7baba671909cf71de775bc',
              bookPath: './en_tn_57-TIT.tsv',
              format: 'text/tsv',
              title: 'Russian Translation Notes',
              subject: 'TSV Translation Notes',
              language: 'ru',
            },
          },
          {
            id: 4,
            name: 'words',
            config: {
              owner: 'ru_gl',
              repo: 'twl',
              commit: '17383807b558d6a7268cb44a90ac105c864a2ca1',
              bookPath: './twl_TIT.tsv',
              format: 'text/tsv',
              title: 'unfoldingWord® Translation Words Links',
              subject: 'TSV Translation Words Links',
              language: 'ru',
            },
          },
        ],
      },
      {
        size: '2',
        tools: [
          {
            id: 5,
            name: 'ownNotes',
            config: {
              subject: 'ownNotes',
            },
          },
          {
            id: 6,
            name: 'notes',
            config: {
              subject: 'notes',
            },
          },
          {
            id: 7,
            name: 'dictionary',
            config: {
              subject: 'dictionary',
            },
          },
        ],
      },
    ],
  },
  {
    name: 'Шаг 3. Пересказ',
    description: 'Some text here...',
    introstep: 'Text в формате md вместе с ютубом',
    workspace: [
      {
        size: '4',
        tools: [
          {
            id: 1,
            name: 'literal',
            config: {
              owner: 'DevleskoDrom',
              repo: 'onpu',
              commit: '209a944b5d9e6d15833a807d8fe771c9758c7139',
              bookPath: './57-TIT.usfm',
              format: 'text/usfm3',
              title:
                'Biblica® Open New Ukrainian Translation 2022 (New Testament and Psalms)',
              subject: 'Aligned Bible',
              language: 'uk',
            },
          },
          {
            id: 2,
            name: 'simplified',
            config: {
              owner: 'ru_gl',
              repo: 'rsob',
              commit: '38c10e570082cc615e45628ae7ea3f38d9b67b8c',
              bookPath: './57-TIT.usfm',
              format: 'text/usfm3',
              title: 'Russian Simplified Open Bible',
              subject: 'Aligned Bible',
              language: 'ru',
            },
          },
          {
            id: 3,
            name: 'notes',
            config: {
              owner: 'ru_gl',
              repo: 'tn',
              commit: 'f36b5a19fc6ebbd37a7baba671909cf71de775bc',
              bookPath: './en_tn_57-TIT.tsv',
              format: 'text/tsv',
              title: 'Russian Translation Notes',
              subject: 'TSV Translation Notes',
              language: 'ru',
            },
          },
          {
            id: 4,
            name: 'words',
            config: {
              owner: 'ru_gl',
              repo: 'twl',
              commit: '17383807b558d6a7268cb44a90ac105c864a2ca1',
              bookPath: './twl_TIT.tsv',
              format: 'text/tsv',
              title: 'unfoldingWord® Translation Words Links',
              subject: 'TSV Translation Words Links',
              language: 'ru',
            },
          },
        ],
      },
      {
        size: '2',
        tools: [{ id: 5, name: 'literal', subject: 'audio' }],
      },
    ],
  },
  {
    name: 'Шаг 4',
    description: 'Some text here...',
    introstep: 'Text в формате md вместе с ютубом',
    workspace: [
      {
        size: '3',
        tools: [
          {
            id: 1,
            name: 'literal',
            config: {
              owner: 'DevleskoDrom',
              repo: 'onpu',
              commit: '209a944b5d9e6d15833a807d8fe771c9758c7139',
              bookPath: './57-TIT.usfm',
              format: 'text/usfm3',
              title:
                'Biblica® Open New Ukrainian Translation 2022 (New Testament and Psalms)',
              subject: 'Aligned Bible',
              language: 'uk',
            },
          },
          {
            id: 2,
            name: 'simplified',
            config: {
              owner: 'ru_gl',
              repo: 'rsob',
              commit: '38c10e570082cc615e45628ae7ea3f38d9b67b8c',
              bookPath: './57-TIT.usfm',
              format: 'text/usfm3',
              title: 'Russian Simplified Open Bible',
              subject: 'Aligned Bible',
              language: 'ru',
            },
          },
          {
            id: 3,
            name: 'notes',
            config: {
              owner: 'ru_gl',
              repo: 'tn',
              commit: 'f36b5a19fc6ebbd37a7baba671909cf71de775bc',
              bookPath: './en_tn_57-TIT.tsv',
              format: 'text/tsv',
              title: 'Russian Translation Notes',
              subject: 'TSV Translation Notes',
              language: 'ru',
            },
          },
          {
            id: 4,
            name: 'words',
            config: {
              owner: 'ru_gl',
              repo: 'twl',
              commit: '17383807b558d6a7268cb44a90ac105c864a2ca1',
              bookPath: './twl_TIT.tsv',
              format: 'text/tsv',
              title: 'unfoldingWord® Translation Words Links',
              subject: 'TSV Translation Words Links',
              language: 'ru',
            },
          },
        ],
      },
      {
        size: '3',
        tools: [
          {
            id: 5,
            name: 'translate',
            config: {
              subject: 'translate-extended',
              verses: [
                {
                  id: 1,
                  verse: '5',
                  text: '',
                },
                {
                  id: 2,
                  verse: '6',
                  text: '',
                },
                { id: 3, verse: '7', text: null },
                { id: 4, verse: '8', text: null },
                { id: 5, verse: '9', text: null },
              ],
            },
          },
          {
            id: 9,
            name: 'dictionary',
            config: {
              subject: 'dictionary',
            },
          },
        ],
      },
    ],
  },
  {
    name: 'Шаг 5',
    description: 'Some text here...',
    introstep: 'Text в формате md вместе с ютубом',
    workspace: [
      {
        size: '3',
        tools: [
          {
            id: 1,
            name: 'literal',
            config: {
              owner: 'DevleskoDrom',
              repo: 'onpu',
              commit: '209a944b5d9e6d15833a807d8fe771c9758c7139',
              bookPath: './57-TIT.usfm',
              format: 'text/usfm3',
              title:
                'Biblica® Open New Ukrainian Translation 2022 (New Testament and Psalms)',
              subject: 'Aligned Bible',
              language: 'uk',
            },
          },
          {
            id: 2,
            name: 'simplified',
            config: {
              owner: 'ru_gl',
              repo: 'rsob',
              commit: '38c10e570082cc615e45628ae7ea3f38d9b67b8c',
              bookPath: './57-TIT.usfm',
              format: 'text/usfm3',
              title: 'Russian Simplified Open Bible',
              subject: 'Aligned Bible',
              language: 'ru',
            },
          },
          {
            id: 3,
            name: 'notes',
            config: {
              owner: 'ru_gl',
              repo: 'tn',
              commit: 'f36b5a19fc6ebbd37a7baba671909cf71de775bc',
              bookPath: './en_tn_57-TIT.tsv',
              format: 'text/tsv',
              title: 'Russian Translation Notes',
              subject: 'TSV Translation Notes',
              language: 'ru',
            },
          },
          {
            id: 4,
            name: 'words',
            config: {
              owner: 'ru_gl',
              repo: 'twl',
              commit: '17383807b558d6a7268cb44a90ac105c864a2ca1',
              bookPath: './twl_TIT.tsv',
              format: 'text/tsv',
              title: 'unfoldingWord® Translation Words Links',
              subject: 'TSV Translation Words Links',
              language: 'ru',
            },
          },
          {
            id: 5,
            name: 'tq',
            config: {
              owner: 'unfoldingWord',
              repo: 'tq',
              commit: 'b09890c9166ba08d734c4acc9b232ad5f9c7a4f5',
              bookPath: './tq_TIT.tsv',
              format: 'text/tsv',
              title: 'unfoldingWord® Translation Questions',
              subject: 'TSV Translation Questions',
              language: 'en',
            },
          },
        ],
      },
      {
        size: '3',
        tools: [
          {
            id: 6,
            name: 'translate',
            config: {
              subject: 'translate',
              verses: [
                { id: 0, verse: '4', text: 'noneeditable', noneeditable: true },
                {
                  id: 1,
                  verse: '5',
                  text: ' Я оставил тебя на острове Крит для того, чтобы ты завершил незавершённые дела, а также поставил старейшин в собраниях верующих в каждом городе, как я тебе поручил.',
                },
                {
                  id: 2,
                  verse: '6',
                  text: ' Итак, старейшиной должен стать такой человек, который не подаёт повода для осуждения. У него должна быть одна жена, его дети также должны доверять Богу, и люди не должны считать, что его дети неуправляемые или непослушные.',
                },
                { id: 3, verse: '7', text: null },
                { id: 4, verse: '8', text: null },
                { id: 5, verse: '9', text: null },
                { id: 6, verse: '10', text: 'noneeditable', noneeditable: true },
              ],
            },
          },
          {
            id: 7,
            name: 'ownNotes',
            config: {
              subject: 'ownNotes',
            },
          },
          {
            id: 8,
            name: 'notes',
            config: {
              subject: 'notes',
            },
          },
          {
            id: 9,
            name: 'dictionary',
            config: {
              subject: 'dictionary',
            },
          },
        ],
      },
    ],
  },
  {
    name: 'Шаг 6',
    description: 'Some text here...',
    introstep: 'Text в формате md вместе с ютубом',
    workspace: [
      {
        size: '3',
        tools: [
          {
            name: 'literal',
            config: {
              owner: 'DevleskoDrom',
              repo: 'onpu',
              commit: '209a944b5d9e6d15833a807d8fe771c9758c7139',
              bookPath: './57-TIT.usfm',
              format: 'text/usfm3',
              title:
                'Biblica® Open New Ukrainian Translation 2022 (New Testament and Psalms)',
              subject: 'Aligned Bible',
              language: 'uk',
            },
          },
          {
            name: 'simplified',
            config: {
              owner: 'ru_gl',
              repo: 'rsob',
              commit: '38c10e570082cc615e45628ae7ea3f38d9b67b8c',
              bookPath: './57-TIT.usfm',
              format: 'text/usfm3',
              title: 'Russian Simplified Open Bible',
              subject: 'Aligned Bible',
              language: 'ru',
            },
          },
          {
            name: 'notes',
            config: {
              owner: 'ru_gl',
              repo: 'tn',
              commit: 'f36b5a19fc6ebbd37a7baba671909cf71de775bc',
              bookPath: './en_tn_57-TIT.tsv',
              format: 'text/tsv',
              title: 'Russian Translation Notes',
              subject: 'TSV Translation Notes',
              language: 'ru',
            },
          },
          {
            name: 'words',
            config: {
              owner: 'ru_gl',
              repo: 'twl',
              commit: '17383807b558d6a7268cb44a90ac105c864a2ca1',
              bookPath: './twl_TIT.tsv',
              format: 'text/tsv',
              title: 'unfoldingWord® Translation Words Links',
              subject: 'TSV Translation Words Links',
              language: 'ru',
            },
          },
          {
            name: 'questions',
            config: {
              owner: 'unfoldingWord',
              repo: 'tq',
              commit: 'b09890c9166ba08d734c4acc9b232ad5f9c7a4f5',
              manifest: {},
              bookPath: './tq_TIT.tsv',
              format: 'text/tsv',
              title: 'unfoldingWord® Translation Questions',
              subject: 'TSV Translation Questions',
              language: 'en',
            },
          },
        ],
      },
      {
        size: '3',
        tools: [
          {
            name: 'translate',
            config: {
              subject: 'translate',
            },
          },
          {
            name: 'ownNotes',
            config: {
              subject: 'ownNotes',
            },
          },
          {
            name: 'notes',
            config: {
              subject: 'notes',
            },
          },
          {
            name: 'dictionary',
            config: {
              subject: 'dictionary',
            },
          },
        ],
      },
    ],
  },
  {
    name: 'Шаг 7',
    description: 'Some text here...',
    introstep: 'Text в формате md вместе с ютубом',
    workspace: [
      {
        size: '3',
        tools: [
          {
            id: 1,
            name: 'literal',
            config: {
              owner: 'DevleskoDrom',
              repo: 'onpu',
              commit: '209a944b5d9e6d15833a807d8fe771c9758c7139',
              bookPath: './57-TIT.usfm',
              format: 'text/usfm3',
              title:
                'Biblica® Open New Ukrainian Translation 2022 (New Testament and Psalms)',
              subject: 'Aligned Bible',
              language: 'uk',
            },
          },
          {
            id: 2,
            name: 'simplified',
            config: {
              owner: 'ru_gl',
              repo: 'rsob',
              commit: '38c10e570082cc615e45628ae7ea3f38d9b67b8c',
              bookPath: './57-TIT.usfm',
              format: 'text/usfm3',
              title: 'Russian Simplified Open Bible',
              subject: 'Aligned Bible',
              language: 'ru',
            },
          },
          {
            id: 3,
            name: 'notes',
            config: {
              owner: 'ru_gl',
              repo: 'tn',
              commit: 'f36b5a19fc6ebbd37a7baba671909cf71de775bc',
              bookPath: './en_tn_57-TIT.tsv',
              format: 'text/tsv',
              title: 'Russian Translation Notes',
              subject: 'TSV Translation Notes',
              language: 'ru',
            },
          },
          {
            id: 4,
            name: 'words',
            config: {
              owner: 'ru_gl',
              repo: 'twl',
              commit: '17383807b558d6a7268cb44a90ac105c864a2ca1',
              bookPath: './twl_TIT.tsv',
              format: 'text/tsv',
              title: 'unfoldingWord® Translation Words Links',
              subject: 'TSV Translation Words Links',
              language: 'ru',
            },
          },
          {
            id: 5,
            name: 'tq',
            config: {
              owner: 'unfoldingWord',
              repo: 'tq',
              commit: 'b09890c9166ba08d734c4acc9b232ad5f9c7a4f5',
              bookPath: './tq_TIT.tsv',
              format: 'text/tsv',
              title: 'unfoldingWord® Translation Questions',
              subject: 'TSV Translation Questions',
              language: 'en',
            },
          },
        ],
      },
      {
        size: '3',
        tools: [
          {
            id: 6,
            name: 'translate',
            config: {
              subject: 'translate',
            },
          },
          {
            id: 7,
            name: 'ownNotes',
            config: {
              subject: 'ownNotes',
            },
          },
          {
            id: 8,
            name: 'notes',
            config: {
              subject: 'notes',
            },
          },
          {
            id: 9,
            name: 'dictionary',
            config: {
              subject: 'dictionary',
            },
          },
        ],
      },
    ],
  },
]

export const config = {
  resources: [
    {
      owner: 'DevleskoDrom',
      repo: 'onpu',
      commit: '209a944b5d9e6d15833a807d8fe771c9758c7139',
      manifest: {},
      bookPath: './57-TIT.usfm',
      format: 'text/usfm3',
      title: 'Biblica® Open New Ukrainian Translation 2022 (New Testament and Psalms)',
      subject: 'Aligned Bible',
      language: 'uk',
    },
    {
      owner: 'ru_gl',
      repo: 'rsob',
      commit: '38c10e570082cc615e45628ae7ea3f38d9b67b8c',
      manifest: {},
      bookPath: './57-TIT.usfm',
      format: 'text/usfm3',
      title: 'Russian Simplified Open Bible',
      subject: 'Aligned Bible',
      language: 'ru',
    },
    {
      owner: 'ru_gl',
      repo: 'tn',
      commit: 'f36b5a19fc6ebbd37a7baba671909cf71de775bc',
      manifest: {},
      bookPath: './en_tn_57-TIT.tsv',
      format: 'text/tsv',
      title: 'Russian Translation Notes',
      subject: 'TSV Translation Notes',
      language: 'ru',
    },
    {
      owner: 'unfoldingWord',
      repo: 'tq',
      commit: 'b09890c9166ba08d734c4acc9b232ad5f9c7a4f5',
      manifest: {},
      bookPath: './tq_TIT.tsv',
      format: 'text/tsv',
      title: 'unfoldingWord® Translation Questions',
      subject: 'TSV Translation Questions',
      language: 'en',
    },
    {
      owner: 'ru_gl',
      repo: 'twl',
      commit: '17383807b558d6a7268cb44a90ac105c864a2ca1',
      manifest: {},
      bookPath: './twl_TIT.tsv',
      format: 'text/tsv',
      title: 'unfoldingWord® Translation Words Links',
      subject: 'TSV Translation Words Links',
      language: 'ru',
    },
    {
      owner: 'ru_gl',
      repo: 'obs',
      commit: '921aaa41e3fe2a24f1a66c789d1840abab019131',
      manifest: {},
      bookPath: './content',
      format: 'text/markdown',
      title: 'Russian Open Bible Stories',
      subject: 'Open Bible Stories',
      language: 'ru',
    },
    {
      owner: 'ru_gl',
      repo: 'obs-tn',
      commit: '9c418b368b928e0cfdb8840cc8ddd418bcda5aec',
      manifest: {},
      bookPath: './tn_OBS.tsv',
      format: 'text/tsv',
      title: 'Russian Open Bible Stories Translation Notes',
      subject: 'OBS Translation Notes',
      language: 'ru',
    },
    {
      owner: 'unfoldingWord',
      repo: 'obs-tq',
      commit: 'b160230943b89798d7a6d4693c477c621601e34c',
      manifest: {},
      bookPath: './tq_OBS.tsv',
      format: 'text/tsv',
      title: 'unfoldingWord® Open Bible Stories Translation Questions',
      subject: 'TSV OBS Translation Questions',
      language: 'en',
    },
    {
      owner: 'unfoldingWord',
      repo: 'obs-twl',
      commit: '80def64e540fed5da6394bd88ac4588a98c4a3ec',
      manifest: {},
      bookPath: './twl_OBS.tsv',
      format: 'text/tsv',
      title: 'unfoldingWord® OBS Translation Words Links',
      subject: 'TSV OBS Translation Words Links',
      language: 'en',
    },
  ],
  reference: { book: 'tit', chapter: '1', step: '3', verses: [] },
}
