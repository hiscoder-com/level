INSERT INTO "public"."languages" ("eng", "code", "orig_name", "is_gl", "is_rtl") OVERRIDING SYSTEM VALUE VALUES
	('english', 'en', 'english', true, false),
	('russian', 'ru', 'русский', true, false),
	('kazakh', 'kk', 'казахский', false, false);	


INSERT INTO "public"."methods" ("title", "steps", "resources", "type", "brief") OVERRIDING SYSTEM VALUE VALUES
('cana-bible-eng','[
  {
    "title": "FIRST STEP  -  SELF-STUDY",
    "description": "This is individual work. Each translator must read the materials independently, without discussing what has been read with others, but making notes of their observations and ideas\n\nThe GOAL of this step is to understand the general meaning and purpose of the book, as well as the context (the situation, time and place, any facts that help to translate the text more accurately) and prepare for a team discussion of the text before starting the translation.\n\n\n\nTASKS FOR THE FIRST STEP\n\n\n\nIn this step you need to do several tasks:\n\nINTRODUCTION - Introduction to the book. Read the general information about the book. Mark interesting facts for discussion with the team.\n\nGENERAL NOTES - General information about the chapter. Read the general information about the chapter. Mark interesting facts for discussion with the team.\n\nLITERAL - Read the LITERAL TRANSLATION. Read the chapter that needs to be worked on. Note for discussion with the team sentences and words from the original text that may cause difficulties in translation or that require special attention from translators.\n\nSIMPLIFIED - Read the SIMPLIFIED TRANSLATION. Read the chapter that needs to be worked on. Note for discussion with the team sentences and words from the original text that may cause difficulties in translation or that require special attention from translators.\n\nREVIEW OF THE \"WORDS\" TOOL - Read the WORDS to the chapter. It is necessary to read the articles for each word. Mark for discussion with the team articles to words that may be useful for translating the biblical text.\n\nREVIEW OF THE \"NOTES\" TOOL - Read the NOTES to the chapter. It is necessary to read the notes for each chunk. Mark for discussion with the team those articles that may be useful for translating the biblical text.",
    "time": 60,
    "whole_chapter": true,
    "count_of_users": 1,
    "is_awaiting_team": false,
    "intro": "This is individual work. Each translator must read the materials independently, without discussing what has been read with others, but making notes of their observations and ideas\n\nThe GOAL of this step is to understand the general meaning and purpose of the book, as well as the context (the situation, time and place, any facts that help to translate the text more accurately) and prepare for a team discussion of the text before starting the translation.\n\n\n\nTASKS FOR THE FIRST STEP\n\n\n\nIn this step you need to do several tasks:\n\nINTRODUCTION - Introduction to the book. Read the general information about the book. Mark interesting facts for discussion with the team.\n\nGENERAL NOTES - General information about the chapter. Read the general information about the chapter. Mark interesting facts for discussion with the team.\n\nLITERAL - Read the LITERAL TRANSLATION. Read the chapter that needs to be worked on. Note for discussion with the team sentences and words from the original text that may cause difficulties in translation or that require special attention from translators.\n\nSIMPLIFIED - Read the SIMPLIFIED TRANSLATION. Read the chapter that needs to be worked on. Note for discussion with the team sentences and words from the original text that may cause difficulties in translation or that require special attention from translators.\n\nREVIEW OF THE \"WORDS\" TOOL - Read the WORDS to the chapter. It is necessary to read the articles for each word. Mark for discussion with the team articles to words that may be useful for translating the biblical text.\n\nREVIEW OF THE \"NOTES\" TOOL - Read the NOTES to the chapter. It is necessary to read the notes for each chunk. Mark for discussion with the team those articles that may be useful for translating the biblical text.\n\n",
    "config": [
      {
        "size": 2,
        "tools": [
          {
            "name": "literal",
            "config": {}
          },
          {
            "name": "simplified",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "personalNotes",
            "config": {}
          },
          {
            "name": "teamNotes",
            "config": {}
          },
          {
            "name": "dictionary",
            "config": {}
          },
          {
            "name": "aquifer",
            "config": {
              "languageCode": "eng"
            }
          }
        ]
      }
    ]
  },
  {
    "title": "SECOND STEP - TEAM TEXT STUDY",
    "description": "This is a team work and we recommend to spend no more than 60 minutes on it.\n\nThe GOAL of this step is to understand the text well as a team, as well as to make a team decision on the translation of some words before starting the main work.\n\n\n\nTASKS FOR THE SECOND STEP\n\nIn this step you need to do several tasks.\n\nINTRODUCTION - Introduction to the book. Discuss general information about the book with the team. Use your notes that you made in the previous step.\n\nGENERAL NOTES - General information about the chapter. Discuss general information about the chapter with the team. Use your notes that you made in the previous step.\n\nLITERAL - Let someone from the team read aloud the text of the LITERAL TRANSLATION. Then discuss sentences and words that may cause difficulties in translation or that require special attention from translators. Spend 20 minutes on this stage.\n\nSIMPLIFIED - Let someone from the team read aloud the text of the SIMPLIFIED TRANSLATION. Then discuss sentences and words that may cause difficulties in translation or that require special attention from translators. Spend 20 minutes on this stage.\n\nREVIEW OF THE \"WORDS\" TOOL - Discuss the WORDS tool. What useful for translation did you find in these articles? Use your comments from self-study. Spend 20 minutes on this stage.\n\nREVIEW OF THE \"NOTES\" TOOL - Discuss the NOTES tool. What useful for translation did you find in these articles? Use your notes on this tool from self-study. Spend 20 minutes on this stage.",
    "time": 120,
    "whole_chapter": true,
    "count_of_users": 4,
    "is_awaiting_team": false,
    "intro": "This is a team work and we recommend to spend no more than 60 minutes on it.\n\nThe GOAL of this step is to understand the text well as a team, as well as to make a team decision on the translation of some words before starting the main work.\n\n\n\nTASKS FOR THE SECOND STEP\n\nIn this step you need to do several tasks.\n\nINTRODUCTION - Introduction to the book. Discuss general information about the book with the team. Use your notes that you made in the previous step.\n\nGENERAL NOTES - General information about the chapter. Discuss general information about the chapter with the team. Use your notes that you made in the previous step.\n\nLITERAL - Let someone from the team read aloud the text of the LITERAL TRANSLATION. Then discuss sentences and words that may cause difficulties in translation or that require special attention from translators. Spend 20 minutes on this stage.\n\nSIMPLIFIED - Let someone from the team read aloud the text of the SIMPLIFIED TRANSLATION. Then discuss sentences and words that may cause difficulties in translation or that require special attention from translators. Spend 20 minutes on this stage.\n\nREVIEW OF THE \"WORDS\" TOOL - Discuss the WORDS tool. What useful for translation did you find in these articles? Use your comments from self-study. Spend 20 minutes on this stage.\n\nREVIEW OF THE \"NOTES\" TOOL - Discuss the NOTES tool. What useful for translation did you find in these articles? Use your notes on this tool from self-study. Spend 20 minutes on this stage.\n\n",
    "config": [
      {
        "size": 2,
        "tools": [
          {
            "name": "literal",
            "config": {}
          },
          {
            "name": "simplified",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "personalNotes",
            "config": {}
          },
          {
            "name": "teamNotes",
            "config": {}
          },
          {
            "name": "dictionary",
            "config": {}
          },
          {
            "name": "aquifer",
            "config": {
              "languageCode": "eng"
            }
          }
        ]
      }
    ]
  },
  {
    "title": "THIRD STEP - PREPARE TO DRAFT THE TRANSLATION.",
    "description": "This is a pair of work and we recommend spending no more than 30 minutes on it.\n\n\n\nThe GOAL of this step is to prepare for translating the text in natural language.\n\nIn this step you need to do two tasks.\n\n\n\nRETELLING IN THE SOURCE LANGUAGE - Read your chunk in the LITERAL BIBLE TRANSLATION. If necessary, study the chunk together with all the tools to convey this text in the most natural source language as possible. Tell your partner the meaning of the chunk using the most understandable and natural words of the source language. Do not try to retell the original text of the LITERAL TRANSLATION word for word. Tell the text in the simplest way for yourself.\n\nПThen listen to your partner retelling his chunk. \n\nDo not discuss your retellings - this is only speaking and listening.\n\n\n\nRETELLING IN THE TARGET LANGUAGE - Look at your chunk again in the SIMPLIFIED BIBLE TRANSLATION and think about how to retell this text in the language to which the translation is made, remembering the Summary to the translation about the style of the language (Translation Goals).\n\nTell your partner your chunk in the target language using the most understandable and natural words of this language. Transmit everything you remember without peeking into the text.\n\nThen listen to your partner retelling his chunk in the same way.\n\nDo not discuss your retellings - this is only speaking and listening.",
    "time": 30,
    "whole_chapter": false,
    "count_of_users": 2,
    "is_awaiting_team": false,
    "intro": "This is a pair of work and we recommend spending no more than 30 minutes on it.\n\n\n\nThe GOAL of this step is to prepare for translating the text in natural language.\n\nIn this step you need to do two tasks.\n\n\n\nRETELLING IN THE SOURCE LANGUAGE - Read your chunk in the LITERAL BIBLE TRANSLATION. If necessary, study the chunk together with all the tools to convey this text in the most natural source language as possible. Tell your partner the meaning of the chunk using the most understandable and natural words of the source language. Do not try to retell the original text of the LITERAL TRANSLATION word for word. Tell the text in the simplest way for yourself.\n\nПThen listen to your partner retelling his chunk. \n\nDo not discuss your retellings - this is only speaking and listening.\n\n\n\nRETELLING IN THE TARGET LANGUAGE - Look at your chunk again in the SIMPLIFIED BIBLE TRANSLATION and think about how to retell this text in the language to which the translation is made, remembering the Summary to the translation about the style of the language (Translation Goals).\n\nTell your partner your chunk in the target language using the most understandable and natural words of this language. Transmit everything you remember without peeking into the text.\n\nThen listen to your partner retelling his chunk in the same way.\n\nDo not discuss your retellings - this is only speaking and listening.\n\n",
    "config": [
      {
        "size": 4,
        "tools": [
          {
            "name": "literal",
            "config": {}
          },
          {
            "name": "simplified",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "retelling",
            "config": {"is_alone":true}
          }
        ]
      }
    ]
  },
  {
    "title": "FOURTH STEP - BLIND DRAFT",
    "description": "This is individual work and we recommend spending no more than 20 minutes on it.\n\n\n\nThe GOAL of this step is to make the first draft in the first place in natural language.\n\n\n\nTask for this step: Read your chunk from the LITERAL BIBLE TRANSLATION again and if necessary, review all the tools for this chunk. As soon as you are ready to make a \"draft\", go to the \"blind\" draft line and write your translation in your language, using the most understandable and natural words of your language.\n\nWrite from memory. Don''t peek! The main goal of this step is the naturalness of the language. Don''t be afraid to make mistakes! Mistakes at this stage are allowed. The accuracy of the translation will be checked in the next steps of working with the text.",
    "time": 20,
    "whole_chapter": false,
    "count_of_users": 1,
    "is_awaiting_team": false,
    "intro": "This is individual work and we recommend spending no more than 20 minutes on it.\n\n\n\nThe GOAL of this step is to make the first draft in the first place in natural language.\n\n\n\nTask for this step: Read your chunk from the LITERAL BIBLE TRANSLATION again and if necessary, review all the tools for this chunk. As soon as you are ready to make a \"draft\", go to the \"blind\" draft line and write your translation in your language, using the most understandable and natural words of your language.\n\nWrite from memory. Don''t peek! The main goal of this step is the naturalness of the language. Don''t be afraid to make mistakes! Mistakes at this stage are allowed. The accuracy of the translation will be checked in the next steps of working with the text.",
    "config": [
      {
        "size": 3,
        "tools": [
          {
            "name": "literal",
            "config": {
              "draft": true
            }
          },
          {
            "name": "simplified",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          }
        ]
      },
      {
        "size": 3,
        "tools": [
          {
            "name": "draftTranslate",
            "config": {}
          }
        ]
      }
    ]
  },
  {
    "title": "FIFTH STEP - SELF-CHECK",
    "description": "This is individual work and we recommend spending no more than 30 minutes on it.\n\n\n\nThe GOAL of this step is to work on the mistakes in the text and make sure that the first draft of the translation is accurate and natural enough.\n\n\n\nCheck your translation for ACCURACY by comparing it to the text of the LITERAL BIBLE TRANSLATION. Use all translation tools if necessary. Assess it according to the questions: nothing added, nothing omitted, meaning not changed? If there are mistakes, correct them.\n\n\n\nRead the QUESTIONS and answer them, looking at your text. Compare with the answers. If there are mistakes in your text, correct them.\n\n\n\nAfter that, read your translation aloud to yourself and assess - does your text sound UNDERSTANDABLE AND NATURAL? If not, correct it.\n\n\n\nGo to the next chunk of yours and repeat the Preparation-Draft-Check steps with all your chunks until the end of the chapter.",
    "time": 30,
    "whole_chapter": false,
    "count_of_users": 1,
    "is_awaiting_team": false,
    "intro": "This is individual work and we recommend spending no more than 30 minutes on it.\n\n\n\nThe GOAL of this step is to work on the mistakes in the text and make sure that the first draft of the translation is accurate and natural enough.\n\n\n\nCheck your translation for ACCURACY by comparing it to the text of the LITERAL BIBLE TRANSLATION. Use all translation tools if necessary. Assess it according to the questions: nothing added, nothing omitted, meaning not changed? If there are mistakes, correct them.\n\n\n\nRead the QUESTIONS and answer them, looking at your text. Compare with the answers. If there are mistakes in your text, correct them.\n\n\n\nAfter that, read your translation aloud to yourself and assess - does your text sound UNDERSTANDABLE AND NATURAL? If not, correct it.\n\n\n\nGo to the next chunk of yours and repeat the Preparation-Draft-Check steps with all your chunks until the end of the chapter.\n\n",
    "config": [
      {
        "size": 3,
        "tools": [
          {
            "name": "literal",
            "config": {}
          },
          {
            "name": "simplified",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "tquestions",
            "config": {
              "viewAllQuestions": true
            }
          }
        ]
      },
      {
        "size": 3,
        "tools": [
          {
            "name": "translate",
            "config": {}
          },
          {
            "name": "personalNotes",
            "config": {}
          },
          {
            "name": "teamNotes",
            "config": {}
          },
          {
            "name": "dictionary",
            "config": {}
          }
        ]
      }
    ]
  },
  {
    "title": "SIXTH STEP - PEER CHECK",
    "description": "This is a pair work and we recommend spending no more than 40 minutes on it.\n\n\n\nThe GOAL of this step is to improve the translation draft by inviting another person to check the translation for accuracy and naturalness.\n\n\n\nACCURACY CHECK - Read your text aloud to your partner who is simultaneously following the LITERAL BIBLE TRANSLATION text and paying attention only to the ACCURACY of the translation.\n\nDiscuss the text as to how accurate it is.\n\nChanges to the text are made by the translator working on it. If you cannot agree on any changes, leave this issue for discussion by the whole team.\n\nSwitch roles and work on your partner''s chunk.\n\n\n\nCLEARNESS and NATURALNESS CHECK - Read your text aloud to your partner again, who is now not looking at any text but just listening to your reading aloud, paying attention to the CLEARNESS and NATURALNESS of the language.\n\nDiscuss the text, keeping in mind the target audience and the PURPOSE OF THE TRANSLATION. If there are mistakes in your text, correct them.\n\nSwitch roles and work on your partner''s chunk.\n\n\n\n\n\n_Note to the step:_ \n\n- Do not fall in love with your text. Be flexible to hear another opinion and improve your draft translation. This is a group work and the text should correspond to the understanding of the majority in your team. Even if mistakes are made in this case, they will be corrected on the checks of subsequent levels.\n\n- If you could not agree with your partner on some issues related to the text, leave this issue for discussion with the whole team. Your goal is not to defeat your partner, but to improve the translation with his help.",
    "time": 40,
    "whole_chapter": false,
    "count_of_users": 2,
    "is_awaiting_team": false,
    "intro": "This is a pair work and we recommend spending no more than 40 minutes on it.\n\n\n\nThe GOAL of this step is to improve the translation draft by inviting another person to check the translation for accuracy and naturalness.\n\n\n\nACCURACY CHECK - Read your text aloud to your partner who is simultaneously following the LITERAL BIBLE TRANSLATION text and paying attention only to the ACCURACY of the translation.\n\nDiscuss the text as to how accurate it is.\n\nChanges to the text are made by the translator working on it. If you cannot agree on any changes, leave this issue for discussion by the whole team.\n\nSwitch roles and work on your partner''s chunk.\n\n\n\nCLEARNESS and NATURALNESS CHECK - Read your text aloud to your partner again, who is now not looking at any text but just listening to your reading aloud, paying attention to the CLEARNESS and NATURALNESS of the language.\n\nDiscuss the text, keeping in mind the target audience and the PURPOSE OF THE TRANSLATION. If there are mistakes in your text, correct them.\n\nSwitch roles and work on your partner''s chunk.\n\n\n\n\n\n_Note to the step:_ \n\n- Do not fall in love with your text. Be flexible to hear another opinion and improve your draft translation. This is a group work and the text should correspond to the understanding of the majority in your team. Even if mistakes are made in this case, they will be corrected on the checks of subsequent levels.\n\n- If you could not agree with your partner on some issues related to the text, leave this issue for discussion with the whole team. Your goal is not to defeat your partner, but to improve the translation with his help.\n\n",
    "config": [
      {
        "size": 3,
        "tools": [
          {
            "name": "literal",
            "config": {}
          },
          {
            "name": "simplified",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "tquestions",
            "config": {}
          }
        ]
      },
      {
        "size": 3,
        "tools": [
          {
            "name": "translate",
            "config": {}
          },
          {
            "name": "personalNotes",
            "config": {}
          },
          {
            "name": "teamNotes",
            "config": {}
          },
          {
            "name": "dictionary",
            "config": {}
          }
        ]
      }
    ]
  },
  {
    "title": "SEVENTH STEP - KEYWORD CHECK.",
    "description": "This is a team work and we recommend spending no more than 30 minutes on it.\n\n\n\nThe GOAL of this step is to improve the translation as a team by checking for key words.\n\n\n\nCHECKING THE TEXT FOR KEY WORDS - Read the text of all translators in turn as a team. Check the translation for the presence of key words from the WORDS tool. Are all the key words in place? Are all the key words translated correctly?\n\nThe team makes decisions on how to translate these words or phrases - the translator makes these changes to his chunk. In some cases, one person chosen from the translators may make the changes accepted by the team.",
    "time": 30,
    "whole_chapter": true,
    "count_of_users": 4,
    "is_awaiting_team": false,
    "intro": "This is a team work and we recommend spending no more than 30 minutes on it.\n\n\n\nThe GOAL of this step is to improve the translation as a team by checking for key words.\n\n\n\nCHECKING THE TEXT FOR KEY WORDS - Read the text of all translators in turn as a team. Check the translation for the presence of key words from the WORDS tool. Are all the key words in place? Are all the key words translated correctly?\n\nThe team makes decisions on how to translate these words or phrases - the translator makes these changes to his chunk. In some cases, one person chosen from the translators may make the changes accepted by the team.\n\n",
    "config": [
      {
        "size": 2,
        "tools": [
          {
            "name": "literal",
            "config": {}
          },
          {
            "name": "simplified",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "commandTranslate",
            "config": {
              "moderatorOnly": false
            }
          },
          {
            "name": "personalNotes",
            "config": {}
          },
          {
            "name": "teamNotes",
            "config": {}
          },
          {
            "name": "dictionary",
            "config": {}
          }
        ]
      }
    ]
  },
  {
    "title": "EIGHTH STEP - TEAM REVIEW",
    "description": "This is a team work and we recommend spending no more than 60 minutes on it.\n\nThe GOAL of this step is to improve the translation by making decisions as a team about difficult words or phrases, making the text good both in terms of accuracy and naturalness. This is the final step in working on the text.\n\n\n\nCHECK FOR ACCURACY - Read your text aloud to the team. The team at this time looks into the text of the LITERAL BIBLE TRANSLATION and pays attention only to the ACCURACY of the translation.\n\nDiscuss the text for how accurate it is. If there are errors in your text, correct them. Check the accuracy of each team member''s work, each completed chapter as a team.\n\n\n\nRead the QUESTIONS and answer them, looking at your text. Compare with the answers. If there are mistakes in your text, correct them.\n\n\n\nCLEARNESS AND NATURALNESS CHECK - Read your text aloud to the team again, which is now not looking at any text, but just listening, paying attention to the CLEARNESS and NATURALNESS of the language. Discuss the text, remembering the target audience and the PURPOSE OF THE TRANSLATION. If there are errors in your text, correct them. Work on each chapter/each chunk until the team is satisfied with the result.\n\n\n\nNote to the step: \n\n- Do not leave the text with several options for translating a sentence or word. After the eighth step, there should be no unresolved questions. The text should be ready to read.",
    "time": 60,
    "whole_chapter": true,
    "count_of_users": 4,
    "is_awaiting_team": false,
    "intro": "This is a team work and we recommend spending no more than 60 minutes on it.\n\nThe GOAL of this step is to improve the translation by making decisions as a team about difficult words or phrases, making the text good both in terms of accuracy and naturalness. This is the final step in working on the text.\n\n\n\nCHECK FOR ACCURACY - Read your text aloud to the team. The team at this time looks into the text of the LITERAL BIBLE TRANSLATION and pays attention only to the ACCURACY of the translation.\n\nDiscuss the text for how accurate it is. If there are errors in your text, correct them. Check the accuracy of each team member''s work, each completed chapter as a team.\n\n\n\nRead the QUESTIONS and answer them, looking at your text. Compare with the answers. If there are mistakes in your text, correct them.\n\n\n\nCLEARNESS AND NATURALNESS CHECK - Read your text aloud to the team again, which is now not looking at any text, but just listening, paying attention to the CLEARNESS and NATURALNESS of the language. Discuss the text, remembering the target audience and the PURPOSE OF THE TRANSLATION. If there are errors in your text, correct them. Work on each chapter/each chunk until the team is satisfied with the result.\n\n\n\nNote to the step: \n\n- Do not leave the text with several options for translating a sentence or word. After the eighth step, there should be no unresolved questions. The text should be ready to read.\n\n",
    "config": [
      {
        "size": 3,
        "tools": [
          {
            "name": "literal",
            "config": {}
          },
          {
            "name": "simplified",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "tquestions",
            "config": {}
          }
        ]
      },
      {
        "size": 3,
        "tools": [
          {
            "name": "commandTranslate",
            "config": {
              "moderatorOnly": true
            }
          },
          {
            "name": "personalNotes",
            "config": {}
          },
          {
            "name": "teamNotes",
            "config": {}
          },
          {
            "name": "dictionary",
            "config": {}
          }
        ]
      }
    ]
  }
]','{"simplified":false,"literal":true,"reference":false,"tnotes":false,"twords":false,"tquestions":false}', 'bible','[{"id":1,"title":"","block":[{"question":"","answer":""}],"resume":""}]'),('cana-obs-eng','[
  {
    "title": "FIRST STEP  -  SELF-STUDY",
    "description": "This is an individual job and is performed without the participation of other team members. Everyone reads the materials on their own, not discussing what they read, but writing down their comments. If your translation project is conducted online, then this step can be completed before meeting with other members of the translation team.The purpose of this step is to understand the general meaning and purpose of the book, as well as the context (setting, time and place, any facts that help to translate the text more accurately) and prepare for a team discussion of the text before starting the translation.\n\n\n\nThe TASKS FOR THE FIRST STEP:\n\n\n\n In this step you need to complete several tasks:\n\n\n\nSTORY - Read the story (the chapter that needs to be worked on). Write down sentences and words for the team''s discussion that may cause difficulties in translation or that require special attention from translators.\n\n\n\n Review OF THE \"WORDS\" TOOL - Read the WORDS to the chapter. It is necessary to read the articles for each word. Mark for discussion by the team articles to words that may be useful for translating Open Bible Stories.\n\n\n\n Review OF THE NOTES TOOL - Read the NOTES to the chapter. It is necessary to read the NOTES to each passage. Mark NOTES for the team''s discussion that may be useful for translating Open Bible Stories.",
    "time": 60,
    "whole_chapter": true,
    "count_of_users": 1,
    "is_awaiting_team": false,
    "intro": "https://www.youtube.com/watch?v=gxawAAQ9xbQ\n\nThis is an individual job and is performed without the participation of other team members. Everyone reads the materials on their own, not discussing what they read, but writing down their comments. If your translation project is conducted online, then this step can be completed before meeting with other members of the translation team.The purpose of this step is to understand the general meaning and purpose of the book, as well as the context (setting, time and place, any facts that help to translate the text more accurately) and prepare for a team discussion of the text before starting the translation.\n\n\n\nThe TASKS FOR THE FIRST STEP:\n\n\n\n In this step you need to complete several tasks:\n\n\n\nSTORY - Read the story (the chapter that needs to be worked on). Write down sentences and words for the team''s discussion that may cause difficulties in translation or that require special attention from translators.\n\n\n\n Review OF THE \"WORDS\" TOOL - Read the WORDS to the chapter. It is necessary to read the articles for each word. Mark for discussion by the team articles to words that may be useful for translating Open Bible Stories.\n\n\n\n Review OF THE NOTES TOOL - Read the NOTES to the chapter. It is necessary to read the NOTES to each passage. Mark NOTES for the team''s discussion that may be useful for translating Open Bible Stories.\n\n",
    "config": [
      {
        "size": 2,
        "tools": [
          {
            "name": "obs",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "personalNotes",
            "config": {}
          },
          {
            "name": "teamNotes",
            "config": {}
          },
          {
            "name": "dictionary",
            "config": {}
          }
        ]
      }
    ]
  },
  {
    "title": "SECOND STEP - TEAM TEXT STUDY",
    "description": "This is a team effort and we recommend spending no more than 60 minutes on it.The purpose of this step is to understand the meaning of the text and words well by the whole team, as well as make a team decision on translating some words before starting the main work.\n\n\n\nThe TASKS FOR THE SECOND STEP:\n\n\n\n In this step, you need to complete several tasks.\n\n\n\nStory - Read the story aloud (the chapter that needs to be worked on). Discuss sentences and words that may cause difficulties in translation or that require special attention from translators. Take 20 minutes to complete this step.\n\n\n\n Review OF THE \"WORDS\" TOOL - Discuss the WORD tool. What did you find useful for translation in these articles? Use your comments with self-study. Take 20 minutes to complete this step.\n\n\n\n Review OF THE NOTES TOOL - Discuss the NOTES tool. What did you find useful for translation in the NOTES? Use your comments on this tool for self-study. Take 20 minutes to complete this step.",
    "time": 120,
    "whole_chapter": true,
    "count_of_users": 4,
    "is_awaiting_team": false,
    "intro": "https://www.youtube.com/watch?v=HK6SXnU5zEw\n\nThis is a team effort and we recommend spending no more than 60 minutes on it.The purpose of this step is to understand the meaning of the text and words well by the whole team, as well as make a team decision on translating some words before starting the main work.\n\n\n\nThe TASKS FOR THE SECOND STEP:\n\n\n\n In this step, you need to complete several tasks.\n\n\n\nStory - Read the story aloud (the chapter that needs to be worked on). Discuss sentences and words that may cause difficulties in translation or that require special attention from translators. Take 20 minutes to complete this step.\n\n\n\n Review OF THE \"WORDS\" TOOL - Discuss the WORD tool. What did you find useful for translation in these articles? Use your comments with self-study. Take 20 minutes to complete this step.\n\n\n\n Review OF THE NOTES TOOL - Discuss the NOTES tool. What did you find useful for translation in the NOTES? Use your comments on this tool for self-study. Take 20 minutes to complete this step.\n\n",
    "config": [
      {
        "size": 2,
        "tools": [
          {
            "name": "obs",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "personalNotes",
            "config": {}
          },
          {
            "name": "teamNotes",
            "config": {}
          },
          {
            "name": "dictionary",
            "config": {}
          }
        ]
      }
    ]
  },
  {
    "title": "THIRD STEP - PREPARE TO DRAFT THE TRANSLATION",
    "description": "This is a work in pairs and we recommend spending no more than 20 minutes on it.The purpose of this step is to prepare for the translation of the text in natural language.\n\n\n\n In this step, you need to complete two tasks.\n\n\n\nThe first task is A RETELLING IN RUSSIAN - Read your excerpt from the chapter in OPEN BIBLE STORIES. If necessary, study the passage together with all the tools to understand this text as best as possible. Tell the meaning of the passage to your partner using the most understandable and natural words of the Russian language. Do not try to retell the original text exactly. Retell the text in maximum simplicity for yourself.After that, listen to your partner retelling his passage.\n\nTake 10 minutes to complete this step.\n\n Don''t discuss your retellings. In this step, only speaking the text and listening.\n\n\n\nThe second task is TO RETELL IN THE TARGET LANGUAGE - Once again review your passage or chapter in OPEN BIBLE STORIES, and think about how to retell this text in the language into which the translation is being made, keeping in mind the SHORT DESCRIPTION OF the TRANSLATION (Summary of the translation) and the style of the language. Tell your passage to your partner in the target language, using the most understandable and natural words of this language. Pass on everything you have memorized without peeking into the text. \n\nThen listen to your partner retelling his passage in the same way.\n\nTake 10 minutes to complete this step.\n\n Don''t discuss your retellings. In this step, only speaking the text and listening.",
    "time": 30,
    "whole_chapter": false,
    "count_of_users": 2,
    "is_awaiting_team": false,
    "intro": "https://www.youtube.com/watch?v=jlhwA9SIWXQ\n\nThis is a work in pairs and we recommend spending no more than 20 minutes on it.The purpose of this step is to prepare for the translation of the text in natural language.\n\n\n\n In this step, you need to complete two tasks.\n\n\n\nThe first task is A RETELLING IN RUSSIAN - Read your excerpt from the chapter in OPEN BIBLE STORIES. If necessary, study the passage together with all the tools to understand this text as best as possible. Tell the meaning of the passage to your partner using the most understandable and natural words of the Russian language. Do not try to retell the original text exactly. Retell the text in maximum simplicity for yourself.After that, listen to your partner retelling his passage.\n\nTake 10 minutes to complete this step.\n\n Don''t discuss your retellings. In this step, only speaking the text and listening.\n\n\n\nThe second task is TO RETELL IN THE TARGET LANGUAGE - Once again review your passage or chapter in OPEN BIBLE STORIES, and think about how to retell this text in the language into which the translation is being made, keeping in mind the SHORT DESCRIPTION OF the TRANSLATION (Summary of the translation) and the style of the language. Tell your passage to your partner in the target language, using the most understandable and natural words of this language. Pass on everything you have memorized without peeking into the text. \n\nThen listen to your partner retelling his passage in the same way.\n\nTake 10 minutes to complete this step.\n\n Don''t discuss your retellings. In this step, only speaking the text and listening.\n\n",
    "config": [
      {
        "size": 4,
        "tools": [
          {
            "name": "obs",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "retelling",
            "config": {"is_alone":true}
          }
        ]
      }
    ]
  },
  {
    "title": "FOURTH STEP - BLIND DRAFT",
    "description": "This is an individual job and we recommend spending no more than 20 minutes on it.The purpose of this step is to make the first sketch in natural language.\n\n\n\n Read your passage or chapter in OPEN BIBLE STORIES again. If necessary, review all the tools for this passage. As soon as you are ready to make a \"sketch\", go to the \"blind\" sketch panel in the Translation Studio program or in another program in which you work and write your translation in your language using the most understandable and natural words of your language. Write from memory. Don''t peek!The main goal of this step is the naturalness of the language. Don''t be afraid to make mistakes! Mistakes are acceptable at this stage. The accuracy of the translation will be checked in the next steps of working on the text.",
    "time": 20,
    "whole_chapter": false,
    "count_of_users": 1,
    "is_awaiting_team": false,
    "intro": "https://www.youtube.com/watch?v=HVXOiKUsXSI\n\nThis is an individual job and we recommend spending no more than 20 minutes on it.The purpose of this step is to make the first sketch in natural language.\n\n\n\n Read your passage or chapter in OPEN BIBLE STORIES again. If necessary, review all the tools for this passage. As soon as you are ready to make a \"sketch\", go to the \"blind\" sketch panel in the Translation Studio program or in another program in which you work and write your translation in your language using the most understandable and natural words of your language. Write from memory. Don''t peek!The main goal of this step is the naturalness of the language. Don''t be afraid to make mistakes! Mistakes are acceptable at this stage. The accuracy of the translation will be checked in the next steps of working on the text.\n\n",
    "config": [
      {
        "size": 3,
        "tools": [
          {
            "name": "obs",
            "config": {
              "draft": true
            }
          },
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          }
        ]
      },
      {
        "size": 3,
        "tools": [
          {
            "name": "draftTranslate",
            "config": {}
          }
        ]
      }
    ]
  },
  {
    "title": "FIFTH STEP - SELF-CHECK",
    "description": "This is an individual job and we recommend spending no more than 30 minutes on it.The purpose of this step is to work on the errors in the text and make sure that the first draft of the translation turned out to be quite accurate and natural. \n\n\n\n In this step, you need to complete three tasks.\n\n\n\nThe first task. Check your translation for ACCURACY by comparing it with the text of OPEN BIBLE STORIES in Russian. If necessary, use all the translation tools. Rate the questions: nothing has been added, nothing has been skipped, the meaning has not been changed? If there are errors, correct them. Take 10 minutes to complete this task.\n\n\n\the second task. Read the QUESTIONS and answer them by looking at your text. Compare with the answers. If there are errors in your text, correct them. Take 10 minutes to complete this task.\n\n\n\nThe third task. Read your translation aloud to yourself and evaluate - does your text sound CLEAR AND NATURAL? If not, then fix it. Take 10 minutes to complete this task.",
    "time": 30,
    "whole_chapter": false,
    "count_of_users": 1,
    "is_awaiting_team": false,
    "intro": "https://www.youtube.com/watch?v=p3p8c_K-O3c\n\nThis is an individual job and we recommend spending no more than 30 minutes on it.The purpose of this step is to work on the errors in the text and make sure that the first draft of the translation turned out to be quite accurate and natural. \n\n\n\n In this step, you need to complete three tasks.\n\n\n\nThe first task. Check your translation for ACCURACY by comparing it with the text of OPEN BIBLE STORIES in Russian. If necessary, use all the translation tools. Rate the questions: nothing has been added, nothing has been skipped, the meaning has not been changed? If there are errors, correct them. Take 10 minutes to complete this task.\n\n\n\the second task. Read the QUESTIONS and answer them by looking at your text. Compare with the answers. If there are errors in your text, correct them. Take 10 minutes to complete this task.\n\n\n\nThe third task. Read your translation aloud to yourself and evaluate - does your text sound CLEAR AND NATURAL? If not, then fix it. Take 10 minutes to complete this task.\n\n",
    "config": [
      {
        "size": 3,
        "tools": [
          {
            "name": "obs",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "tquestions",
            "config": {
              "viewAllQuestions": true
            }
          }
        ]
      },
      {
        "size": 3,
        "tools": [
          {
            "name": "translate",
            "config": {}
          },
          {
            "name": "personalNotes",
            "config": {}
          },
          {
            "name": "teamNotes",
            "config": {}
          },
          {
            "name": "dictionary",
            "config": {}
          }
        ]
      }
    ]
  },
  {
    "title": "SIXTH STEP - PEER CHECK",
    "description": "This is a work in pairs and we recommend spending no more than 40 minutes on it.The purpose of this step is to improve the outline of the translation by inviting another person to check the translation for accuracy and naturalness.\n\n\n\n In this step, you need to complete two tasks.The first task is to read your text aloud to your partner, who simultaneously monitors the text of OPEN BIBLE STORIES in Russian and pays attention only to the ACCURACY of your translation.\n\nDiscuss the text as to how accurate it is.\n\nChanges to the text are made by the translator who worked on it. If it was not possible to agree on any changes, leave this issue for discussion by the whole team.Switch roles and work on the partner''s passage.\n\nTake 20 minutes to complete this task.The second task is to read your text aloud to your partner again, who now does not look at any text, but simply listens to your reading aloud, paying attention to the CLARITY and NATURALNESS of the language.Review the text, keeping in mind the target audience and the SHORT DESCRIPTION OF THE TRANSLATION (Summary of the translation). If there are errors in your text, correct them.Switch roles and work on the partner''s passage.\n\nTake 20 minutes to complete this task.\n\n\n\n\n\n_Note to the step:_\n\n- Don''t fall in love with your text. Be flexible to hear other opinions and improve your translation outline. This is a group work and the text should correspond to the understanding of the majority in your team. Even if mistakes are made in this case, they will be corrected during the checks of subsequent levels.\n\n- If you have not been able to agree on any issues related to the text while working with your partner, leave this issue for discussion with the whole team. Your goal is not to defeat your partner, but to improve the translation with his help.",
    "time": 40,
    "whole_chapter": false,
    "count_of_users": 2,
    "is_awaiting_team": false,
    "intro": "https://www.youtube.com/watch?v=cAgypQsWgQk\n\nThis is a work in pairs and we recommend spending no more than 40 minutes on it.The purpose of this step is to improve the outline of the translation by inviting another person to check the translation for accuracy and naturalness.\n\n\n\n In this step, you need to complete two tasks.The first task is to read your text aloud to your partner, who simultaneously monitors the text of OPEN BIBLE STORIES in Russian and pays attention only to the ACCURACY of your translation.\n\nDiscuss the text as to how accurate it is.\n\nChanges to the text are made by the translator who worked on it. If it was not possible to agree on any changes, leave this issue for discussion by the whole team.Switch roles and work on the partner''s passage.\n\nTake 20 minutes to complete this task.The second task is to read your text aloud to your partner again, who now does not look at any text, but simply listens to your reading aloud, paying attention to the CLARITY and NATURALNESS of the language.Review the text, keeping in mind the target audience and the SHORT DESCRIPTION OF THE TRANSLATION (Summary of the translation). If there are errors in your text, correct them.Switch roles and work on the partner''s passage.\n\nTake 20 minutes to complete this task.\n\n\n\n\n\n_Note to the step:_\n\n- Don''t fall in love with your text. Be flexible to hear other opinions and improve your translation outline. This is a group work and the text should correspond to the understanding of the majority in your team. Even if mistakes are made in this case, they will be corrected during the checks of subsequent levels.\n\n- If you have not been able to agree on any issues related to the text while working with your partner, leave this issue for discussion with the whole team. Your goal is not to defeat your partner, but to improve the translation with his help.\n\n",
    "config": [
      {
        "size": 3,
        "tools": [
          {
            "name": "obs",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "tquestions",
            "config": {}
          }
        ]
      },
      {
        "size": 3,
        "tools": [
          {
            "name": "translate",
            "config": {}
          },
          {
            "name": "personalNotes",
            "config": {}
          },
          {
            "name": "teamNotes",
            "config": {}
          },
          {
            "name": "dictionary",
            "config": {}
          }
        ]
      }
    ]
  },
  {
    "title": "SEVENTH STEP - KEYWORD CHECK",
    "description": "This is a team effort and we recommend spending no more than 60 minutes on it.The goal of this step is to improve the translation by making team decisions about difficult words or phrases, making the text good both in terms of accuracy and naturalness. This is the final step in working on the text.\n\n\n\n In this step, you need to complete three tasks.\n\n\n\nThe first task is to read your text aloud to the team. At this time, the team looks at the text of OPEN BIBLE STORIES in Russian and pays attention only to the ACCURACY of your translation.\n\nDiscuss the text as to how accurate it is.  If there are errors in your text, correct them. As a team, check the accuracy of the work of each team member. Take 20 minutes to complete this task.\n\n\n\nThe second task is to check your translation together with the team for the presence of keywords from the WORD tool. Are all the keywords in place? Are all the keywords translated correctly? Take 20 minutes to complete this task.Task three - Once again read your text aloud to the team, which now does not look at any text, but simply listens, paying attention to the CLARITY and NATURALNESS of the language. Discuss the text, keeping in mind the target audience and the SHORT DESCRIPTION OF THE TRANSLATION (Summary of the translation). If there are errors in your text, correct them. Work through each chapter/passage until the team is satisfied with the result. Take 20 minutes to complete this task.\n\n\n\n\n\n_Note to the step:_\n\n- Do not leave a text with multiple translations of a sentence or word. After the seventh step, there should be no unresolved issues. The text should be ready to read.",
    "time": 30,
    "whole_chapter": true,
    "count_of_users": 4,
    "is_awaiting_team": false,
    "intro": "https://www.youtube.com/watch?v=P2MbEKDw8U4\n\nThis is a team effort and we recommend spending no more than 60 minutes on it.The goal of this step is to improve the translation by making team decisions about difficult words or phrases, making the text good both in terms of accuracy and naturalness. This is the final step in working on the text.\n\n\n\n In this step, you need to complete three tasks.\n\n\n\nThe first task is to read your text aloud to the team. At this time, the team looks at the text of OPEN BIBLE STORIES in Russian and pays attention only to the ACCURACY of your translation.\n\nDiscuss the text as to how accurate it is.  If there are errors in your text, correct them. As a team, check the accuracy of the work of each team member. Take 20 minutes to complete this task.\n\n\n\nThe second task is to check your translation together with the team for the presence of keywords from the WORD tool. Are all the keywords in place? Are all the keywords translated correctly? Take 20 minutes to complete this task.Task three - Once again read your text aloud to the team, which now does not look at any text, but simply listens, paying attention to the CLARITY and NATURALNESS of the language. Discuss the text, keeping in mind the target audience and the SHORT DESCRIPTION OF THE TRANSLATION (Summary of the translation). If there are errors in your text, correct them. Work through each chapter/passage until the team is satisfied with the result. Take 20 minutes to complete this task.\n\n\n\n\n\n_Note to the step:_\n\n- Do not leave a text with multiple translations of a sentence or word. After the seventh step, there should be no unresolved issues. The text should be ready to read.\n\n",
    "config": [
      {
        "size": 2,
        "tools": [
          {
            "name": "obs",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "twords",
            "config": {}
          },
          {
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "tquestions",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "commandTranslate",
            "config": {
              "moderatorOnly": true
            }
          },
          {
            "name": "personalNotes",
            "config": {}
          },
          {
            "name": "teamNotes",
            "config": {}
          },
          {
            "name": "dictionary",
            "config": {}
          }
        ]
      }
    ]
  }
]','{"obs":true,"reference":false,"tnotes":false,"twords":false,"tquestions":false}', 'obs','[{"id":1,"title":"","block":[{"question":"","answer":""}],"resume":""}]');
