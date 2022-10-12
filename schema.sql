-- DROP ALL DATA
  -- DROP TABLE
    DROP TABLE IF EXISTS PUBLIC.briefs;
    DROP TABLE IF EXISTS PUBLIC.progress;
    DROP TABLE IF EXISTS PUBLIC.verses;
    DROP TABLE IF EXISTS PUBLIC.chapters;
    DROP TABLE IF EXISTS PUBLIC.books;
    DROP TABLE IF EXISTS PUBLIC.steps;
    DROP TABLE IF EXISTS PUBLIC.project_translators;
    DROP TABLE IF EXISTS PUBLIC.project_coordinators;
    DROP TABLE IF EXISTS PUBLIC.projects;
    DROP TABLE IF EXISTS PUBLIC.methods;
    DROP TABLE IF EXISTS PUBLIC.users;
    DROP TABLE IF EXISTS PUBLIC.role_permissions;
    DROP TABLE IF EXISTS PUBLIC.languages;
  -- EDN DROP TABLE

  -- DROP TRIGGER
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS on_public_project_created ON PUBLIC.projects;
    DROP TRIGGER IF EXISTS on_public_book_created ON PUBLIC.books;
    DROP TRIGGER IF EXISTS on_public_verses_next_step ON PUBLIC.verses;
  -- END DROP TRIGGER

  -- DROP FUNCTION
    DROP FUNCTION IF EXISTS PUBLIC.authorize;
    DROP FUNCTION IF EXISTS PUBLIC.has_access;
    DROP FUNCTION IF EXISTS PUBLIC.get_current_step;
    DROP FUNCTION IF EXISTS PUBLIC.assign_moderator;
    DROP FUNCTION IF EXISTS PUBLIC.remove_moderator;
    DROP FUNCTION IF EXISTS PUBLIC.divide_verses;
    DROP FUNCTION IF EXISTS PUBLIC.start_chapter;
    DROP FUNCTION IF EXISTS PUBLIC.check_confession;
    DROP FUNCTION IF EXISTS PUBLIC.check_agreement;
    DROP FUNCTION IF EXISTS PUBLIC.admin_only;
    DROP FUNCTION IF EXISTS PUBLIC.can_translate;
    DROP FUNCTION IF EXISTS PUBLIC.block_user;
    DROP FUNCTION IF EXISTS PUBLIC.handle_new_user;
    DROP FUNCTION IF EXISTS PUBLIC.handle_new_project;
    DROP FUNCTION IF EXISTS PUBLIC.handle_new_book;
    DROP FUNCTION IF EXISTS PUBLIC.handle_next_step;
    DROP FUNCTION IF EXISTS PUBLIC.create_chapters;
    DROP FUNCTION IF EXISTS PUBLIC.create_verses;

  -- END DROP FUNCTION

  -- DROP TYPE
    DROP TYPE IF EXISTS PUBLIC.app_permission;
    DROP TYPE IF EXISTS PUBLIC.project_role;
    DROP TYPE IF EXISTS PUBLIC.project_type;
    DROP TYPE IF EXISTS PUBLIC.book_code;
  -- END DROP TYPE
-- END DROP ALL DATA

-- CREATE CUSTOM TYPE
  CREATE TYPE PUBLIC.app_permission AS enum (
    'dictionaries', 'notes', 'projects', 'verses.set', 'moderator.set', 'user_projects',
    'project_source', 'coordinator.set', 'languages', 'user_languages', 'translator.set'
  );

  CREATE TYPE PUBLIC.project_role AS enum ('coordinator', 'moderator', 'translator');

  CREATE TYPE PUBLIC.project_type AS enum ('obs', 'bible');

  CREATE TYPE PUBLIC.book_code AS enum (
    'gen', 'exo', 'lev', 'num', 'deu', 'jos', 'jdg', 'rut', '1sa', '2sa', '1ki', '2ki', '1ch',
    '2ch', 'ezr', 'neh', 'est', 'job', 'psa', 'pro', 'ecc', 'sng', 'isa', 'jer', 'lam', 'ezk',
    'dan', 'hos', 'jol', 'amo', 'oba', 'jon', 'mic', 'nam', 'hab', 'zep', 'hag', 'zec', 'mal',
    'mat', 'mrk', 'luk', 'jhn', 'act', 'rom', '1co', '2co', 'gal', 'eph', 'php', 'col', '1th',
    '2th', '1ti', '2ti', 'tit', 'phm', 'heb', 'jas', '1pe', '2pe', '1jn', '2jn', '3jn', 'jud',
    'rev', 'obs'
  );
-- END CREATE CUSTOM TYPE

-- CREATE FUNCTION
  -- пока что функция возвращает твою роль на проекте
  -- может оставить эту функцию и написать еще одну для проверки permission на основе этой
  CREATE FUNCTION PUBLIC.authorize(
      user_id uuid,
      project_id bigint
    ) returns TEXT
    LANGUAGE plpgsql security definer AS $$
    DECLARE
      bind_permissions INT;
      priv RECORD;
    BEGIN
      SELECT u.is_admin as is_admin,
        pc.project_id*1 IS NOT NULL as is_coordinator,
        pt.project_id*1 IS NOT NULL as is_translator,
        pt.is_moderator IS TRUE as is_moderator
      FROM public.users as u
        LEFT JOIN public.project_coordinators as pc
          ON (u.id = pc.user_id AND pc.project_id = authorize.project_id)
        LEFT JOIN public.project_translators as pt
          ON (u.id = pt.user_id AND pt.project_id = authorize.project_id)
      WHERE u.id = authorize.user_id AND u.blocked IS NULL INTO priv;

      IF priv.is_admin THEN
        return 'admin';
      END IF;

      IF priv.is_coordinator THEN
        return 'coordinator';
      END IF;

      IF priv.is_moderator THEN
        return 'moderator';
      END IF;

      IF priv.is_translator THEN
        return 'translator';
      END IF;

      return 'user';

    END;
  $$;

  -- чтобы юзер имел доступ к сайту надо чтобы стояли 2 чекбокса и он не был заблокирован
  CREATE FUNCTION PUBLIC.has_access() returns BOOLEAN
    LANGUAGE plpgsql security definer AS $$
    DECLARE
      access INT;

    BEGIN
      SELECT
        COUNT(*) INTO access
      FROM
        PUBLIC.users
      WHERE
        users.id = auth.uid() AND users.agreement
        AND users.confession AND users.blocked IS NULL;

      RETURN access > 0;

    END;
  $$;

  --
 CREATE FUNCTION PUBLIC.get_current_step(project_id bigint) returns RECORD
    LANGUAGE plpgsql security definer AS $$
    DECLARE
      current_step RECORD;
    BEGIN
      IF authorize(auth.uid(), get_current_step.project_id) IN ('user') THEN
        RETURN FALSE;
      END IF;

      SELECT steps.title, projects.code as project, books.code as book, chapters.num as chapter, steps.sorting as step, started_at, finished_at INTO current_step
      FROM verses
        LEFT JOIN chapters ON (verses.chapter_id = chapters.id)
        LEFT JOIN books ON (chapters.book_id = books.id)
        LEFT JOIN steps ON (verses.current_step = steps.id)
        LEFT JOIN projects ON (projects.id = verses.project_id)
      WHERE verses.project_id = get_current_step.project_id
        AND project_translator_id = (SELECT id FROM project_translators WHERE project_translators.project_id = get_current_step.project_id AND user_id = auth.uid())
      GROUP BY books.id, chapters.id, verses.current_step, steps.id, projects.id;

      RETURN current_step;

    END;
  $$;

  -- установить переводчика модератором. Проверить что такой есть, что устанавливает админ или координатор. Иначе вернуть FALSE. Условие что только один модератор на проект мы решили делать на уровне интерфейса а не базы. Оставить возможность чтобы модераторов было больше 1.
  CREATE FUNCTION PUBLIC.assign_moderator(user_id uuid, project_id bigint) returns BOOLEAN
    LANGUAGE plpgsql security definer AS $$
    DECLARE
      usr RECORD;
    BEGIN
      IF authorize(auth.uid(), assign_moderator.project_id) NOT IN ('admin', 'coordinator') THEN
        RETURN FALSE;
      END IF;
      SELECT id, is_moderator INTO usr FROM PUBLIC.project_translators WHERE project_translators.project_id = assign_moderator.project_id AND project_translators.user_id = assign_moderator.user_id;
      IF usr.id IS NULL THEN
        RETURN FALSE;
      END IF;
      UPDATE PUBLIC.project_translators SET is_moderator = TRUE WHERE project_translators.id = usr.id;

      RETURN TRUE;

    END;
  $$;

  CREATE FUNCTION PUBLIC.remove_moderator(user_id uuid, project_id bigint) returns BOOLEAN
    LANGUAGE plpgsql security definer AS $$
    DECLARE
      usr RECORD;
    BEGIN
      IF authorize(auth.uid(), remove_moderator.project_id) NOT IN ('admin', 'coordinator') THEN
        RETURN FALSE;
      END IF;
      SELECT id, is_moderator INTO usr FROM PUBLIC.project_translators WHERE project_translators.project_id = remove_moderator.project_id AND project_translators.user_id = remove_moderator.user_id;
      IF usr.id IS NULL THEN
        RETURN FALSE;
      END IF;
      UPDATE PUBLIC.project_translators SET is_moderator = FALSE WHERE project_translators.id = usr.id;

      RETURN TRUE;

    END;
  $$;

  -- Распределение стихов среди переводчиков
  CREATE FUNCTION PUBLIC.divide_verses(divider VARCHAR,project_id BIGINT) RETURNS BOOLEAN
    LANGUAGE plpgsql security definer AS $$
    DECLARE
     verse_row record;
    BEGIN
      IF authorize(auth.uid(), divide_verses.project_id) NOT IN ('admin', 'coordinator') THEN
        RETURN FALSE;
      END IF;

      FOR verse_row IN SELECT * FROM jsonb_to_recordset(divider::jsonb) AS x(project_translator_id INT,id INT)
      LOOP
        UPDATE PUBLIC.verses SET project_translator_id = verse_row.project_translator_id WHERE verse_row.id = id;
      END LOOP;

      RETURN TRUE;

    END;
  $$;

 -- Устанавливает дату начала перевода главы
  CREATE FUNCTION PUBLIC.start_chapter(chapter_id BIGINT,project_id BIGINT) RETURNS boolean
    LANGUAGE plpgsql security definer AS $$

    BEGIN
      IF authorize(auth.uid(), start_chapter.project_id) NOT IN ('admin', 'coordinator')THEN RETURN FALSE;
      END IF;

      UPDATE PUBLIC.chapters SET started_at = NOW() WHERE start_chapter.chapter_id = chapters.id AND start_chapter.project_id = chapters.project_id AND started_at IS NULL;

      RETURN true;

    END;
  $$;

  -- так как на прямую юзер не может исправлять поля в таблице юзеров то он вызывает этот функцию для отметки confession
  CREATE FUNCTION PUBLIC.check_confession() returns BOOLEAN
    LANGUAGE plpgsql security definer AS $$
    DECLARE

    BEGIN
      UPDATE PUBLIC.users SET confession = TRUE WHERE users.id = auth.uid();

      RETURN TRUE;

    END;
  $$;

  -- а эта функция для установки agreement
  CREATE FUNCTION PUBLIC.check_agreement() returns BOOLEAN
    LANGUAGE plpgsql security definer AS $$
    DECLARE

    BEGIN
      UPDATE PUBLIC.users SET agreement = TRUE WHERE users.id = auth.uid();

      RETURN TRUE;

    END;
  $$;

  -- для rls функция которая разрешает что-то делать только админу
  CREATE FUNCTION PUBLIC.admin_only()
    returns BOOLEAN LANGUAGE plpgsql security definer AS $$
    DECLARE
      access INT;

    BEGIN
      SELECT
        COUNT(*) INTO access
      FROM
        PUBLIC.users
      WHERE
        users.id = auth.uid() AND users.is_admin;

      RETURN access > 0;

    END;
  $$;

  -- для rls функция которая проверяет, является ли юзер переводчиком стиха
  -- может используя функцию записать в таблицу сразу айди юзера, а то часто придется такие проверки делать
  CREATE FUNCTION PUBLIC.can_translate(translator_id bigint)
    returns BOOLEAN LANGUAGE plpgsql security definer AS $$
    DECLARE
      access INT;

    BEGIN
      SELECT
        COUNT(*) INTO access
      FROM
        PUBLIC.project_translators
      WHERE
        user_id = auth.uid() AND id = can_translate.translator_id;

      RETURN access > 0;

    END;
  $$;

  -- блокировка юзера, может вызвать только админ, заблокировать другого админа нельзя
  CREATE FUNCTION PUBLIC.block_user(user_id uuid) returns TEXT
    LANGUAGE plpgsql security definer AS $$
    DECLARE
      blocked_user RECORD;
    BEGIN
      IF NOT PUBLIC.admin_only() THEN
        RETURN FALSE;
      END IF;
      SELECT blocked, is_admin INTO blocked_user FROM PUBLIC.users WHERE id = block_user.user_id;

      IF blocked_user.is_admin = TRUE THEN
        RETURN FALSE;
      END IF;

      IF blocked_user.blocked IS NULL THEN
        UPDATE PUBLIC.users SET blocked = NOW() WHERE id = block_user.user_id;
      ELSE
        UPDATE PUBLIC.users SET blocked = NULL WHERE id = block_user.user_id;
      END IF;

      RETURN TRUE;

    END;
  $$;

  -- create policy "политика с джойном"
  --   on teams
  --   for update using (
  --     auth.uid() in (
  --       select user_id from members
  --       where team_id = id
  --     )
  --   );

  -- inserts a row into public.users
  CREATE FUNCTION PUBLIC.handle_new_user() returns TRIGGER
    LANGUAGE plpgsql security definer AS $$ BEGIN
      INSERT INTO
        PUBLIC.users (id, email, login)
      VALUES
        (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'login');

      RETURN NEW;

    END;

  $$;

  -- после создания проекта создаем бриф
  CREATE FUNCTION PUBLIC.handle_new_project() returns TRIGGER
    LANGUAGE plpgsql security definer AS $$ BEGIN
      INSERT INTO
        PUBLIC.briefs (project_id)
      VALUES
        (NEW.id);

      RETURN NEW;

    END;
  $$;

  -- после создания книги создаем главы
  CREATE FUNCTION PUBLIC.handle_new_book() returns TRIGGER
    LANGUAGE plpgsql security definer AS $$ BEGIN
      IF (PUBLIC.create_chapters(NEW.id)) THEN
        RETURN NEW;
      ELSE
        RETURN NULL;
      END IF;
    END;
  $$;

  -- после создания проекта создаем бриф
  CREATE FUNCTION PUBLIC.handle_next_step() returns TRIGGER
    LANGUAGE plpgsql security definer AS $$ BEGIN
      IF NEW.current_step = OLD.current_step THEN
        RETURN NEW;
      END IF;
      INSERT INTO
        PUBLIC.progress (verse_id, "text", step_id)
      VALUES
        (NEW.id, NEW.text, OLD.current_step);

      RETURN NEW;

    END;
  $$;

  -- создать главы
  CREATE FUNCTION PUBLIC.create_chapters(book_id bigint) returns BOOLEAN
    LANGUAGE plpgsql security definer AS $$
    DECLARE
      book RECORD;
      chapter RECORD;
    BEGIN
      -- 1. Получаем список json глав и стихов для книги
      SELECT id, chapters, project_id FROM PUBLIC.books WHERE id = create_chapters.book_id into book;

      IF authorize(auth.uid(), book.project_id) NOT IN ('admin', 'coordinator') THEN
        RETURN FALSE;
      END IF;

      FOR chapter IN SELECT * FROM json_each_text(book.chapters)
      LOOP
        INSERT INTO
          PUBLIC.chapters (num, book_id, verses, project_id)
        VALUES
          (chapter.key::int2 , book.id, chapter.value::int4, book.project_id);
      END LOOP;
      -- 2. Наверное не вариант сразу создавать все стихи и все главы
      -- 3. Создадим все главы книги. И сделаем какую-нить функцию которая потом создаст все стихи

      RETURN true;

    END;
  $$;

  CREATE FUNCTION PUBLIC.create_verses(chapter_id bigint) returns BOOLEAN
    LANGUAGE plpgsql security definer AS $$
    DECLARE
      chapter RECORD;
    BEGIN
      -- 1. Получаем количество стихов
      SELECT  chapters.id as id,
              chapters.verses as verses,
              chapters.project_id as project_id,
              steps.id as step_id
        FROM PUBLIC.chapters
          JOIN PUBLIC.steps ON (steps.project_id = chapters.project_id)
        WHERE chapters.id = create_verses.chapter_id
        ORDER BY steps.sorting ASC
        LIMIT 1
        INTO chapter;

      IF authorize(auth.uid(), chapter.project_id) NOT IN ('admin', 'coordinator')
      THEN
        RETURN FALSE;
      END IF;

      FOR i IN 1..chapter.verses LOOP
        INSERT INTO
          PUBLIC.verses (num, chapter_id, current_step, project_id)
        VALUES
          (i , chapter.id, chapter.step_id, chapter.project_id);
      END LOOP;

      RETURN true;

    END;
  $$;
-- END CREATE FUNCTION

-- USERS
  -- TABLE
    CREATE TABLE PUBLIC.users (
      id uuid NOT NULL primary key,
      email text NOT NULL UNIQUE,
      login text NOT NULL UNIQUE,
      agreement BOOLEAN NOT NULL DEFAULT FALSE,
      confession BOOLEAN NOT NULL DEFAULT FALSE,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      blocked TIMESTAMP DEFAULT NULL
    );

    ALTER TABLE
      PUBLIC.users enable ROW LEVEL security;
  -- END TABLE

  -- RLS
    -- На прямую работать с этой таблицей может только суперадмин
    -- Потом поправить так чтобы можно было получить только юзеров, с которыми ты работаешь на проекте. Чтобы нельзя было одним запросом получить всех.
    -- И поставить ограничения на то, какие поля возвращать
    -- Если нужно будет работать админу, то или мы тут настроим, или же он будет через сервисный ключ работать (все запросы только через апи)
    DROP POLICY IF EXISTS "Залогиненый юзер может получить список всех юзеров" ON PUBLIC.users;
    CREATE policy "Залогиненый юзер может получить список всех юзеров" ON PUBLIC.users FOR
    SELECT
      TO authenticated USING (TRUE);

  -- END RLS
-- END USERS

-- ROLE PERMISSIONS
  -- TABLE
    CREATE TABLE PUBLIC.role_permissions (
      id bigint generated ALWAYS AS identity primary key,
      role project_role NOT NULL,
      permission app_permission NOT NULL,
      UNIQUE (role, permission)
    );
    COMMENT ON TABLE PUBLIC.role_permissions IS 'Application permissions for each role.';

    ALTER TABLE
      PUBLIC.role_permissions enable ROW LEVEL security;
  -- END TABLE

  -- RLS
  -- END RLS
-- END ROLE PERMISSIONS

-- LANGUAGES
  --TABLE
    CREATE TABLE PUBLIC.languages (
      id bigint generated ALWAYS AS identity primary key,
      eng text NOT NULL,
      code text NOT NULL UNIQUE,
      orig_name text NOT NULL,
      is_gl BOOLEAN NOT NULL DEFAULT FALSE
    );

    -- Secure languages
    ALTER TABLE
      PUBLIC.languages enable ROW LEVEL security;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Залогиненый юзер может получить список всех языков" ON PUBLIC.languages;

    CREATE policy "Залогиненый юзер может получить список всех языков" ON PUBLIC.languages FOR
    SELECT
      TO authenticated USING (TRUE);

    DROP POLICY IF EXISTS "Создавать может только админ" ON PUBLIC.languages;

    CREATE policy "Создавать может только админ" ON PUBLIC.languages FOR
    INSERT
      WITH CHECK (admin_only());

    DROP POLICY IF EXISTS "Обновлять может только админ" ON PUBLIC.languages;

    CREATE policy "Обновлять может только админ" ON PUBLIC.languages FOR
    UPDATE
      USING (admin_only());

    DROP POLICY IF EXISTS "Удалять может только админ" ON PUBLIC.languages;

    CREATE policy "Удалять может только админ" ON PUBLIC.languages FOR
    DELETE
      USING (admin_only());
  -- END RLS
-- END LANGUAGES

-- METHODS
  -- TABLE
    CREATE TABLE PUBLIC.methods (
      id bigint generated ALWAYS AS identity primary key,
      title text NOT NULL,
      steps json,
      resources json,
      "type" project_type NOT NULL DEFAULT 'bible'::project_type
    );
    -- Secure methods
    ALTER TABLE
      PUBLIC.methods enable ROW LEVEL security;
  -- END TABLE

  -- RLS
    -- это глобальная таблица с методами. Думаю что не стоит тут разрешать редактировать админам. Может добавлять методы могут только суперадмины, чтобы все подряд тут ничего не исправляли.
    -- Если представить что другие команды подключатся к этой платформе, то у меня две идеи. Или они во время создания проекта могут отредактировать метод. Или добавить поле с юзер айди к каждому методу в этой таблице. Чтобы в дальнейшем редактировать мог только свои методы.
    DROP POLICY IF EXISTS "Админ может получить список всех методов" ON PUBLIC.methods;

    CREATE policy "Админ может получить список всех методов" ON PUBLIC.methods FOR
    SELECT
      TO authenticated USING (admin_only());

    -- Сейчас добавлять, удалять, исправлять может только суперадмин. Методов не много, они не появляются каждый месяц.
  -- END RLS
-- END METHODS

-- PROJECTS
  -- TABLE
    CREATE TABLE PUBLIC.projects (
      id bigint generated ALWAYS AS identity primary key,
      title text NOT NULL,
      code text NOT NULL,
      language_id bigint references PUBLIC.languages ON
      DELETE
        CASCADE NOT NULL,
      "type" project_type NOT NULL,
      resources json,
      method text NOT NULL,
      base_manifest json,
      UNIQUE (code, language_id)
    );

    COMMENT ON COLUMN public.projects.type
        IS 'копируется с таблицы методов';

    COMMENT ON COLUMN public.projects.resources
        IS 'копируем с таблицы методов, должны быть заполнены ссылки, указываем овнера, репо, коммит';

    COMMENT ON COLUMN public.projects.method
        IS 'копируем без изменений название метода с таблицы шаблонов';

    ALTER TABLE
      PUBLIC.projects enable ROW LEVEL security;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Админ видит все проекты, остальные только те, на которых они назначены" ON PUBLIC.projects;

    CREATE policy "Админ видит все проекты, остальные только те, на которых они назначены" ON PUBLIC.projects FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), id) != 'user');

    DROP POLICY IF EXISTS "Создавать может только админ" ON PUBLIC.projects;

    CREATE policy "Создавать может только админ" ON PUBLIC.projects FOR
    INSERT
      WITH CHECK (admin_only());

    -- пока что сделаем что обновлять только админ может. Может для координатора сделать функцию для обновления только некоторых полей
    DROP POLICY IF EXISTS "Обновлять может только админ" ON PUBLIC.projects;

    CREATE policy "Обновлять может только админ" ON PUBLIC.projects FOR
    UPDATE
      USING (admin_only());

    -- удалять пока что ничего не будем. Только в режиме супер админа
  -- END RLS
-- END PROJECTS

-- PROJECT TRANSLATORS
  -- TABLE
    CREATE TABLE PUBLIC.project_translators (
      id bigint generated ALWAYS AS identity primary key,
      project_id bigint references PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      is_moderator boolean DEFAULT false,
      user_id uuid references PUBLIC.users ON
      DELETE
        CASCADE NOT NULL,
      UNIQUE (project_id, user_id)
    );
    ALTER TABLE
      PUBLIC.project_translators enable ROW LEVEL security;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Админ видит всех, остальные только тех кто с ними на проекте" ON PUBLIC.project_translators;

    CREATE policy "Админ видит всех, остальные только тех кто с ними на проекте" ON PUBLIC.project_translators FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

    DROP POLICY IF EXISTS "Добавлять на проект может админ или кординатор проекта" ON PUBLIC.project_translators;

    CREATE policy "Добавлять на проект может админ или кординатор проекта" ON PUBLIC.project_translators FOR
    INSERT
      WITH CHECK (authorize(auth.uid(), project_id) IN ('admin', 'coordinator'));

    DROP POLICY IF EXISTS "Удалять с проекта может админ или кординатор проекта" ON PUBLIC.project_translators;

    CREATE policy "Удалять с проекта может админ или кординатор проекта" ON PUBLIC.project_translators FOR
    DELETE
      USING (authorize(auth.uid(), project_id) IN ('admin', 'coordinator'));

  -- END RLS
-- PROJECT TRANSLATORS

-- PROJECT COORDINATORS
  -- TABLE
    CREATE TABLE PUBLIC.project_coordinators (
      id bigint generated ALWAYS AS identity primary key,
      project_id bigint references PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      user_id uuid references PUBLIC.users ON
      DELETE
        CASCADE NOT NULL,
      UNIQUE (project_id, user_id)
    );
    ALTER TABLE
      PUBLIC.project_coordinators enable ROW LEVEL security;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Админ видит всех, остальные только тех кто с ними на проекте" ON PUBLIC.project_coordinators;

    CREATE policy "Админ видит всех, остальные только тех кто с ними на проекте" ON PUBLIC.project_coordinators FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

    DROP POLICY IF EXISTS "Добавлять на проект может только админ" ON PUBLIC.project_coordinators;

    CREATE policy "Добавлять на проект может только админ" ON PUBLIC.project_coordinators FOR
    INSERT
      WITH CHECK (admin_only());

    DROP POLICY IF EXISTS "Удалять только админ" ON PUBLIC.project_coordinators;

    CREATE policy "Удалять только админ" ON PUBLIC.project_coordinators FOR
    DELETE
      USING (admin_only());
  -- END RLS
-- END PROJECT COORDINATORS

-- BRIEFS
  -- TABLE
    CREATE TABLE PUBLIC.briefs (
      id bigint generated ALWAYS AS identity primary key,
      project_id bigint references PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL UNIQUE,
      "text" text DEFAULT NULL
    );

    COMMENT ON COLUMN public.briefs.text
        IS 'бриф пишем в формате маркдаун';

    ALTER TABLE
      PUBLIC.briefs enable ROW LEVEL security;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Видят все кто на проекте и админ" ON PUBLIC.briefs;

    CREATE policy "Видят все кто на проекте и админ" ON PUBLIC.briefs FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

    DROP POLICY IF EXISTS "Изменять может админ, кординатор и модератор" ON PUBLIC.briefs;

    CREATE policy "Изменять может админ, кординатор и модератор" ON PUBLIC.briefs FOR
    UPDATE
      USING (authorize(auth.uid(), project_id) NOT IN ('user', 'translator'));
    -- создавать и удалять на прямую нельзя
  -- END RLS
-- END BRIEFS

-- STEPS
  -- TABLE
    CREATE TABLE PUBLIC.steps (
      id bigint generated ALWAYS AS identity primary key,
      title text NOT NULL,
      "description" text DEFAULT NULL,
      intro text DEFAULT NULL,
      count_of_users int2 NOT NULL,
      "time" int2 NOT NULL,
      project_id bigint REFERENCES PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      config json NOT NULL,
      sorting int2 NOT NULL,
        UNIQUE (project_id, sorting)
    );

    COMMENT ON COLUMN public.steps.sorting
        IS 'это поле юзер не редактирует. Мы его указываем сами. Пока что будем получать с клиента.';
    ALTER TABLE
      PUBLIC.steps enable ROW LEVEL security;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Получают данные по шагам все кто на проекте" ON PUBLIC.steps;

    CREATE policy "Получают данные по шагам все кто на проекте" ON PUBLIC.steps FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

    DROP POLICY IF EXISTS "Добавлять можно только админу" ON PUBLIC.steps;

    CREATE policy "Добавлять можно только админу" ON PUBLIC.steps FOR
    INSERT
      WITH CHECK (admin_only());
  -- END RLS
-- END STEPS

-- BOOKS
  -- TABLE
    CREATE TABLE PUBLIC.books (
      id bigint generated ALWAYS AS identity primary key,
      code book_code NOT NULL,
      project_id bigint references PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      "text" text DEFAULT NULL,
      chapters json,
      UNIQUE (project_id, code)
    );

    COMMENT ON TABLE public.books
        IS 'У каждой книги потом прописать ее вес. Рассчитать на основе англ или русских ресурсов (сколько там слов). Подумать о том, что будет если удалить проект. Так как в таблице книги мы хотим хранить текст. Отобразим 66 книг Библии или 1 ОБС. В будущем парсить манифест чтобы отображать книги которые уже готовы. Или в момент когда админ нажмет "Создать книгу" проверить есть ли они, если нет то выдать предупреждение. При создании проекта он указывает сразу метод. Придумать так чтобы нельзя было добавлять новые шаги после всего. Может сделать функцию, которая проверяет код книги, и добавляет. Тогда никто лишнего не отправит.';

    COMMENT ON COLUMN public.books.text
        IS 'Здесь мы будем собирать книгу чтобы не делать много запросов. Возьмем все главы и объединим. Так же тут со временем пропишем вес книги на основе англ или русского ресурса. Делать это надо через функцию какую-то, чтобы она собрала сама книгу.';
    ALTER TABLE
      PUBLIC.books enable ROW LEVEL security;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Получают книги все кто на проекте" ON PUBLIC.books;

    CREATE policy "Получают книги все кто на проекте" ON PUBLIC.books FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

    DROP POLICY IF EXISTS "Добавлять можно только админу" ON PUBLIC.books;

    CREATE policy "Добавлять можно только админу" ON PUBLIC.books FOR
    INSERT
      WITH CHECK (admin_only());
  -- END RLS
-- END BOOK

-- CHAPTERS
  -- TABLE
    CREATE TABLE PUBLIC.chapters (
      id bigint generated ALWAYS AS identity primary key,
      num int2 NOT NULL,
      book_id bigint REFERENCES PUBLIC.books ON
      DELETE
        CASCADE NOT NULL,
      project_id bigint references PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      "text" text DEFAULT NULL,
      verses integer,
      started_at TIMESTAMP DEFAULT NULL,
      finished_at TIMESTAMP DEFAULT NULL,
        UNIQUE (book_id, num)
    );
    ALTER TABLE
      PUBLIC.chapters enable ROW LEVEL security;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Получают книги все кто на проекте" ON PUBLIC.chapters;

    CREATE policy "Получают книги все кто на проекте" ON PUBLIC.chapters FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

  -- END RLS
-- END CHAPTERS

-- VERSES
  -- TABLE
    CREATE TABLE PUBLIC.verses (
      id bigint GENERATED ALWAYS AS IDENTITY primary key,
      num int2 NOT NULL,
      "text" text DEFAULT NULL,
      current_step bigint REFERENCES PUBLIC.steps ON
      DELETE
        CASCADE NOT NULL,
      chapter_id bigint REFERENCES PUBLIC.chapters ON
      DELETE
        CASCADE NOT NULL,
      project_id bigint references PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      project_translator_id bigint REFERENCES PUBLIC.project_translators ON
      DELETE
        CASCADE DEFAULT NULL,
        UNIQUE (chapter_id, num)
    );

    COMMENT ON COLUMN public.verses.text
        IS 'тут будет храниться последний текст. Когда мы переходим на следующий шаг, мы копируем текст и номер предыдущего шага';

    COMMENT ON COLUMN public.verses.current_step
        IS 'Скорее всего тут придется хранить айдишник шага. Так как несколько переводчиков то часть стихов может быть на одном а часть на другом шаге. Переводчик у нас на уровне проекта а не главы, чтобы можно было у переводчика хранить, на каком он шаге.';
    ALTER TABLE
      PUBLIC.verses enable ROW LEVEL security;
  -- END TABLE

  -- RLS
    DROP POLICY IF EXISTS "Стих получить может переводчик, координатор проекта, модератор " ON PUBLIC.verses;

    CREATE policy "Стих получить может переводчик, координатор проекта, модератор и админ" ON PUBLIC.verses FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

    DROP POLICY IF EXISTS "Добавлять можно только админу" ON PUBLIC.verses;

    CREATE policy "Добавлять можно только админу" ON PUBLIC.verses FOR
    INSERT
      WITH CHECK (can_translate(project_translator_id));

    DROP POLICY IF EXISTS "Добавлять можно только админу" ON PUBLIC.verses;

    CREATE policy "Добавлять можно только админу" ON PUBLIC.verses FOR
    UPDATE
      USING (can_translate(project_translator_id));
  -- END RLS
-- VERSES

-- PROGRESS
  -- TABLE
    CREATE TABLE PUBLIC.progress (
      id bigint generated ALWAYS AS identity primary key,
      verse_id bigint REFERENCES PUBLIC.verses ON
      DELETE
        CASCADE NOT NULL,
      step_id bigint REFERENCES PUBLIC.steps ON
      DELETE
        CASCADE NOT NULL,
      "text" text DEFAULT NULL,
        UNIQUE (verse_id, step_id)
    );
    ALTER TABLE
      PUBLIC.progress enable ROW LEVEL security;
  -- END TABLE

  -- Я добавил триггер, когда номер шага в таблице стихов обновляется - то мы копируем новый контент и старый айди шага

  -- RLS
  -- END RLS
-- END PROGRESS

-- Send "previous data" on change

ALTER TABLE
  PUBLIC.users replica identity full;

ALTER TABLE
  PUBLIC.languages replica identity full;


-- TRIGGERS
  -- trigger the function every time a user is created

  CREATE TRIGGER on_auth_user_created AFTER
  INSERT
    ON auth.users FOR each ROW EXECUTE FUNCTION PUBLIC.handle_new_user();

  -- trigger the function every time a project is created

  CREATE TRIGGER on_public_project_created AFTER
  INSERT
    ON PUBLIC.projects FOR each ROW EXECUTE FUNCTION PUBLIC.handle_new_project();

  -- trigger the function every time a book is created

  CREATE TRIGGER on_public_book_created AFTER
  INSERT
    ON PUBLIC.books FOR each ROW EXECUTE FUNCTION PUBLIC.handle_new_book();

  -- trigger the function every time a project is created

  CREATE TRIGGER on_public_verses_next_step AFTER
  UPDATE
    ON PUBLIC.verses FOR each ROW EXECUTE FUNCTION PUBLIC.handle_next_step();
-- END TRIGGERS

/**
 * REALTIME SUBSCRIPTIONS
 * Only allow realtime listening on public tables.
 */
BEGIN
;

-- remove the realtime publication
DROP publication IF EXISTS supabase_realtime;

-- re-create the publication but don't enable it for any tables
CREATE publication supabase_realtime;

COMMIT;

-- add tables to the publication
ALTER publication supabase_realtime
ADD
  TABLE PUBLIC.languages;

ALTER publication supabase_realtime
ADD
  TABLE PUBLIC.users;

-- DUMMY DATA
  -- USERS
    DELETE FROM
      PUBLIC.users;

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
        '21ae6e79-3f1d-4b87-bcb1-90256f63c167',
        'Translator',
        'translator@mail.com',
        FALSE,
        FALSE,
        NULL,
        FALSE
      ),
      (
        '2b95a8e9-2ee1-41ef-84ec-2403dd87c9f2',
        'Coordinator2',
        'coordinator2@mail.com',
        FALSE,
        FALSE,
        NULL,
        FALSE
      ),
      (
        '2e108465-9c20-46cd-9e43-933730229762',
        'Moderator3',
        'moderator3@mail.com',
        FALSE,
        FALSE,
        NULL,
        FALSE
      ),
      (
        '54358d8e-0144-47fc-a290-a6882023a3d6',
        'Coordinator3',
        'coordinator3@mail.com',
        FALSE,
        FALSE,
        NULL,
        FALSE
      ),
      (
        '83282f7a-c4b7-4387-97c9-4c356e56af5c',
        'Coordinator',
        'coordinator@mail.com',
        FALSE,
        FALSE,
        NULL,
        FALSE
      ),
      (
        '8331e952-5771-49a6-a679-c44736f5581b',
        'Moderator2',
        'moderator2@mail.com',
        FALSE,
        FALSE,
        NULL,
        FALSE
      ),
      (
        'ae891f6d-0f04-4b01-aa15-1ed46d0ef91d',
        'Admin2',
        'admin2@mail.com',
        FALSE,
        FALSE,
        NULL,
        TRUE
      ),
      (
        'bba5a95e-33b7-431d-8c43-aedc517a1aa6',
        'Translator2',
        'translator2@mail.com',
        FALSE,
        FALSE,
        NULL,
        FALSE
      ),
      (
        'cba74237-0801-4e3b-93f6-012aeab6eb91',
        'Admin',
        'admin@mail.com',
        FALSE,
        FALSE,
        NULL,
        TRUE
      ),
      (
        'e50d5d0a-4fdb-4de3-b431-119e684d775e',
        'Moderator',
        'moderator@mail.com',
        FALSE,
        FALSE,
        NULL,
        FALSE
      ),
      (
        'f193af4d-ca5e-4847-90ef-38f969792dd5',
        'Translator3',
        'translator3@mail.com',
        FALSE,
        FALSE,
        NULL,
        FALSE
      );
  -- END USERS

  -- LANGUAGES
    DELETE FROM
      PUBLIC.languages;

    INSERT INTO
      PUBLIC.languages (eng, code, orig_name, is_gl)
    VALUES
      ('english', 'en', 'english', TRUE),
      ('russian', 'ru', 'русский', TRUE),
      ('kazakh', 'kk', 'казахский', FALSE);
  -- END LANGUAGES

  -- METHODS
    DELETE FROM
      PUBLIC.methods;

    INSERT INTO
      PUBLIC.methods (title, resources, steps, "type")
    VALUES
      ('Vcana Bible', '{"literal":false, "simplified":true, "tnotes":false, "twords":false, "tquestions":false}', '[
  {
    "title": "Шаг 1: Самостоятельное изучение",
    "description": "Some text here...",
    "time": 60,
    "count_of_users": 1,
    "intro": "# Первый шаг - самостоятельное изучение\n\nhttps://www.youtube.com/watch?v=gxawAAQ9xbQ\n\nЭто индивидуальная работа и выполняется без участия других членов команды. Каждый читает материалы самостоятельно, не обсуждая прочитанное, но записывая свои комментарии. Если ваш проект по переводу ведется онлайн, то этот шаг можно выполнить до встречи с другими участниками команды переводчиков.\n\nЦЕЛЬ этого шага: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.\n\nЗАДАНИЯ ДЛЯ ПЕРВОГО ШАГА:\n\nВ этом шаге вам необходимо выполнить несколько заданий:\n\nИСТОРИЯ - Прочитайте историю (главу, над которой предстоит работа). Запишите для обсуждения командой предложения и слова, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков.\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Прочитайте СЛОВА к главе. Необходимо прочитать статьи к каждому слову. Отметьте для обсуждения командой статьи к словам, которые могут быть полезными для перевода Открытых Библейских Историй.\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Прочитайте ЗАМЕТКИ к главе. Необходимо прочитать ЗАМЕТКИ к каждому отрывку. Отметьте для обсуждения командой ЗАМЕТКИ, которые могут быть полезными для перевода Открытых Библейских Историй.","config": [
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
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "ownNotes",
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
    "title": "Шаг 2: Командное изучение текста",
    "description": "Some text here2...",
    "time": 60,
    "count_of_users": 4,
    "intro": "# Второй шаг - командное изучение текста\n\nhttps://www.youtube.com/watch?v=HK6SXnU5zEw\n\nЭто командная работа и мы рекомендуем потратить на нее не более 60 минут.\n\nЦЕЛЬ этого шага: хорошо понять смысл текста и слов всей командой, а также принять командное решение по переводу некоторых слов перед тем, как начать основную работу.\n\nЗАДАНИЯ ДЛЯ ВТОРОГО ШАГА:\n\nВ этом шаге вам необходимо выполнить несколько заданий.\n\nИСТОРИЯ - Прочитайте вслух историю(главу, над которой предстоит работа). Обсудите предложения и слова, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Уделите этому этапу 20 минут.\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Обсудите инструмент СЛОВА. Что полезного для перевода вы нашли в этих статьях? Используйте свои комментарии с самостоятельного изучения. Уделите этому этапу 20 минут.\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Обсудите инструмент ЗАМЕТКИ. Что полезного для перевода вы нашли в ЗАМЕТКАХ. Используйте свои комментарии по этому инструменту с самостоятельного изучения. Уделите этому этапу 20 минут.","config": [
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
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "ownNotes",
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
    "title": "Шаг 3: Подготовка к переводу",
    "description": "Some text here3...",
    "time": 60,
    "count_of_users": 2,
    "intro": "# ТРЕТИЙ шаг - ПОДГОТОВКА К ПЕРЕВОДУ\n\nhttps://www.youtube.com/watch?v=jlhwA9SIWXQ\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 20 минут.\n\nЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.\n\nВ этом шаге вам необходимо выполнить два задания.\n\nПервое задание - ПЕРЕСКАЗ НА РУССКОМ - Прочитайте ваш отрывок из главы в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ. Если необходимо - изучите отрывок вместе со всеми инструментами, чтобы как можно лучше понять этот текст. Перескажите смысл отрывка своему напарнику, используя максимально понятные и естественные слова русского языка. Не старайтесь пересказывать в точности исходный текст. Перескажите текст в максимальной для себя простоте. После этого послушайте вашего напарника, пересказывающего свой отрывок.\n\nУделите этому этапу 10 минут. Не обсуждайте ваши пересказы. В этом шаге только проговаривание текста и слушание.\n\nВторое задание - ПЕРЕСКАЗ НА ЦЕЛЕВОМ - Еще раз просмотрите ваш отрывок или главу в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ, и подумайте, как пересказать этот текст на языке, на который делается перевод, помня о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу) и о стиле языка.\n\nПерескажите ваш отрывок напарнику на целевом языке, используя максимально понятные и естественные слова этого языка. Передайте всё, что вы запомнили, не подглядывая в текст. Затем послушайте вашего напарника, пересказывающего свой отрывок таким же образом. Уделите этому этапу 10 минут. Не обсуждайте ваши пересказы. В этом шаге только проговаривание текста и слушание.","config": [
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
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          }
        ]
      },
      {
        "size": 2,
        "tools": [
          {
            "name": "audio",
            "config": {}
          }
        ]
      }
    ]
  },
  {
    "title": "Шаг 4: Набросок \"Вслепую\"",
    "description": "Some text here4...",
    "time": 60,
    "count_of_users": 1,
    "intro": "# ЧЕТВЕРТЫЙ ШАГ - НАБРОСОК «ВСЛЕПУЮ»\n\nhttps://www.youtube.com/watch?v=HVXOiKUsXSI\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 20 минут.\n\nЦЕЛЬ этого шага: сделать первый набросок естественным языком.\n\nЕще раз прочитайте ваш отрывок  или главу в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ. Если вам необходимо, просмотрите все инструменты к этому отрывку. Как только вы будете готовы сделать «набросок», перейдите на панель «слепого» наброска в программе Translation Studio или в другой программе, в которой вы работаете и напишите ваш перевод на своем языке, используя максимально понятные и естественные слова вашего языка. Пишите по памяти. Не подглядывайте!\n\nГлавная цель этого шага - естественность языка. Не бойтесь ошибаться! Ошибки на этом этапе допустимы. Точность перевода будет проверена на следующих шагах работы над текстом.","config": [
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
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "twords",
            "config": {}
          }
        ]
      },
      {
        "size": 3,
        "tools": [
          {
            "name": "translate",
            "config": {
              "stepOption": "draft"
            }
          }
        ]
      }
    ]
  },
  {
    "title": "Шаг 5: Самостоятельная проверка",
    "description": "Some text here5...",
    "time": 60,
    "count_of_users": 1,
    "intro": "# ПЯТЫЙ ШАГ - САМОСТОЯТЕЛЬНАЯ ПРОВЕРКА\n\nhttps://www.youtube.com/watch?v=p3p8c_K-O3c\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 30 минут.\n\nЦЕЛЬ этого шага: поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным.\n\nВ этом шаге вам необходимо выполнить три задания.\n\nЗадание первое. Проверьте ваш перевод на ТОЧНОСТЬ, сравнив с текстом ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке. При необходимости используйте все инструменты к переводу. Оцените по вопросам: ничего не добавлено, ничего не пропущено, смысл не изменён? Если есть ошибки, исправьте. Уделите этому заданию 10 минут.\n\nЗадание второе. Прочитайте ВОПРОСЫ и ответьте на них, глядя в свой текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте. Уделите этому заданию 10 минут.\n\nЗадание третье. Прочитайте себе ваш перевод вслух и оцените - звучит ли ваш текст ПОНЯТНО И ЕСТЕСТВЕННО? Если нет, то исправьте. Уделите этому заданию 10 минут.","config": [
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
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "twords",
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
            "name": "ownNotes",
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
    "title": "Шаг 6: Взаимная проверка",
    "description": "Some text here6...",
    "time": 60,
    "count_of_users": 2,
    "intro": "# ШЕСТОЙ ШАГ - ВЗАИМНАЯ ПРОВЕРКА\n\nhttps://www.youtube.com/watch?v=cAgypQsWgQk\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 40 минут.\n\nЦЕЛЬ этого шага: улучшить набросок перевода, пригласив другогого человека, чтобы проверить перевод на точность и естественность.\n\nВ этом шаге вам необходимо выполнить два задания.\n\nЗадание первое - Прочитайте вслух свой текст напарнику, который параллельно следит за текстом ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке и обращает внимание только на ТОЧНОСТЬ вашего перевода. Обсудите текст насколько он точен. Изменения в текст вносит переводчик, работавший над ним. Если не удалось договориться о каких-либо изменениях, оставьте этот вопрос для обсуждения всей командой. Поменяйтесь ролями и поработайте над отрывком партнёра. Уделите этому заданию 20 минут.\n\nЗадание второе - Еще раз прочитайте вслух свой текст напарнику, который теперь не смотрит ни в какой текст, а просто слушает ваше чтение вслух, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка. Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте. Поменяйтесь ролями и поработайте над отрывком партнёра. Уделите этому заданию 20 минут.\n\nПримечание к шагу:\n\n- Не влюбляйтесь в свой текст. Будьте гибкими к тому, чтобы слышать другое мнение и улучшать свой набросок перевода.  Это групповая работа и текст должен соответствовать пониманию большинства в вашей команде. Если даже будут допущены ошибки в этом случае, то на проверках последующих уровней они будут исправлены.\n- Если в работе с напарником вам не удалось договориться по каким-то вопросам, касающихся текста, оставьте этот вопрос на обсуждение со всей командой. Ваша цель - не победить напарника, а с его помощью улучшить перевод.","config": [
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
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "twords",
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
            "name": "ownNotes",
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
    "title": "Шаг 7: Командная проверка",
    "description": "Some text here7...",
    "time": 60,
    "count_of_users": 4,
    "intro": "# СЕДЬМОЙ шаг - КОМАНДНЫЙ ОБЗОР ПЕРЕВОДА\n\nhttps://www.youtube.com/watch?v=P2MbEKDw8U4\n\nЭто командная работа и мы рекомендуем потратить на нее не более 60 минут.\n\nЦЕЛЬ этого шага: улучшить перевод, приняв решения командой о трудных словах или фразах, делая текст хорошим как с точки зрения точности, так и с точки зрения естественности. Это финальный шаг в работе над текстом.\n\nВ этом шаге вам необходимо выполнить три задания.\n\nЗадание первое - Прочитайте вслух свой текст команде. Команда в это время смотрит в текст ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке и обращает внимание только на ТОЧНОСТЬ вашего перевода.Обсудите текст насколько он точен. Если есть ошибки в вашем тексте, исправьте. Всей командой проверьте на точность работу каждого члена команды. Уделите этому заданию 20 минут.\n\nЗадание второе - Проверьте вместе с командой ваш перевод на наличие ключевых слов из инструмента СЛОВА. Все ключевые слова на месте? Все ключевые слова переведены корректно? Уделите этому заданию 20 минут.\n\nЗадание третье - Еще раз прочитайте вслух свой текст команде, которая теперь не смотрит ни в какой текст, а просто слушает, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка. Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте. Проработайте каждую главу/каждый отрывок, пока команда не будет довольна результатом. Уделите этому заданию 20 минут.\n\nПримечание к шагу:\n\n- Не оставляйте текст с несколькими вариантами перевода предложения или слова. После седьмого шага не должны оставаться нерешенные вопросы. Текст должен быть готовым к чтению.","config": [
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
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "twords",
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
            "name": "ownNotes",
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
    "title": "Шаг 8: ",
    "description": "Some text here2...",
    "time": 30,
    "count_of_users": 2,
    "intro": "# Intro\n\n### Как сделать набросок\n\nSome text here\n\nhttps://youtu.be/pRptZjtfUIE",
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
            "name": "tnotes",
            "config": {}
          },
          {
            "name": "twords",
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
            "name": "ownNotes",
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
]', 'bible'::project_type);
  -- END METHODS

  -- ROLE PERMISSIONS
    DELETE FROM
      PUBLIC.role_permissions;

    INSERT INTO
      PUBLIC.role_permissions (role, permission)
    VALUES
      ('moderator', 'dictionaries'),
      ('moderator', 'notes'),
      ('moderator', 'translator.set'),
      ('coordinator', 'dictionaries'),
      ('coordinator', 'notes'),
      ('coordinator', 'verses.set'),
      ('coordinator', 'moderator.set'),
      ('coordinator', 'user_projects'),
      ('coordinator', 'translator.set');
  -- END ROLE PERMISSIONS

  -- PROJECTS
    DELETE FROM
      PUBLIC.projects;
    INSERT INTO public.projects (title, code, language_id, type, resources, method, base_manifest) VALUES
    ('ROST Bible', 'rost', 2, 'bible',
    '{"simplified":{"owner":"ru_gl","repo":"ru_rsob","commit":"38c10e570082cc615e45628ae7ea3f38d9b67b8c","manifest":{"dublin_core":{"type":"bundle","conformsto":"rc0.2","comment":"RSOB","format":"text/usfm3","identifier":"rsob","title":"Russian Simplified Open Bible","subject":"Aligned Bible","description":"Russian RSOB aligned to unfoldingWord® Greek New Testament","language":{"identifier":"ru","title":"Русский","direction":"ltr"},"source":[{"identifier":"rsob","language":"ru","version":"1.0.0"}],"rights":"CC BY-SA 4.0","creator":"Door43 World Missions Community","contributor":["Door43 World Missions Community"],"relation":["ru/tw","el-x-koine/ugnt"],"publisher":"Door43 World Missions Community","issued":"2020-08-12","modified":"2020-08-12","version":"1"},"checking":{"checking_entity":["Door43 World Missions Community"],"checking_level":"3"},"projects":[{"title":"Бытие","versification":"ufw","identifier":"gen","sort":1,"path":"./01-GEN.usfm","categories":["bible-ot"]},{"title":"Исход","versification":"ufw","identifier":"exo","sort":2,"path":"./02-EXO.usfm","categories":["bible-ot"]},{"title":"Leviticus","versification":"ufw","identifier":"lev","sort":3,"path":"./03-LEV.usfm","categories":["bible-ot"]},{"title":"Numbers","versification":"ufw","identifier":"num","sort":4,"path":"./04-NUM.usfm","categories":["bible-ot"]},{"title":"Deuteronomy","versification":"ufw","identifier":"deu","sort":5,"path":"./05-DEU.usfm","categories":["bible-ot"]},{"title":"Joshua","versification":"ufw","identifier":"jos","sort":6,"path":"./06-JOS.usfm","categories":["bible-ot"]},{"title":"Judges","versification":"ufw","identifier":"jdg","sort":7,"path":"./07-JDG.usfm","categories":["bible-ot"]},{"title":"Руфь","versification":"ufw","identifier":"rut","sort":8,"path":"./08-RUT.usfm","categories":["bible-ot"]},{"title":"1 Samuel","versification":"ufw","identifier":"1sa","sort":9,"path":"./09-1SA.usfm","categories":["bible-ot"]},{"title":"2 Samuel","versification":"ufw","identifier":"2sa","sort":10,"path":"./10-2SA.usfm","categories":["bible-ot"]},{"title":"1 Kings","versification":"ufw","identifier":"1ki","sort":11,"path":"./11-1KI.usfm","categories":["bible-ot"]},{"title":"2 Kings","versification":"ufw","identifier":"2ki","sort":12,"path":"./12-2KI.usfm","categories":["bible-ot"]},{"title":"1 Chronicles","versification":"ufw","identifier":"1ch","sort":13,"path":"./13-1CH.usfm","categories":["bible-ot"]},{"title":"2 Chronicles","versification":"ufw","identifier":"2ch","sort":14,"path":"./14-2CH.usfm","categories":["bible-ot"]},{"title":"Ezra","versification":"ufw","identifier":"ezr","sort":15,"path":"./15-EZR.usfm","categories":["bible-ot"]},{"title":"Nehemiah","versification":"ufw","identifier":"neh","sort":16,"path":"./16-NEH.usfm","categories":["bible-ot"]},{"title":"Есфирь","versification":"ufw","identifier":"est","sort":17,"path":"./17-EST.usfm","categories":["bible-ot"]},{"title":"Job","versification":"ufw","identifier":"job","sort":18,"path":"./18-JOB.usfm","categories":["bible-ot"]},{"title":"Psalms","versification":"ufw","identifier":"psa","sort":19,"path":"./19-PSA.usfm","categories":["bible-ot"]},{"title":"Proverbs","versification":"ufw","identifier":"pro","sort":20,"path":"./20-PRO.usfm","categories":["bible-ot"]},{"title":"Ecclesiastes","versification":"ufw","identifier":"ecc","sort":21,"path":"./21-ECC.usfm","categories":["bible-ot"]},{"title":"Song of Solomon","versification":"ufw","identifier":"sng","sort":22,"path":"./22-SNG.usfm","categories":["bible-ot"]},{"title":"Isaiah","versification":"ufw","identifier":"isa","sort":23,"path":"./23-ISA.usfm","categories":["bible-ot"]},{"title":"Jeremiah","versification":"ufw","identifier":"jer","sort":24,"path":"./24-JER.usfm","categories":["bible-ot"]},{"title":"Lamentations","versification":"ufw","identifier":"lam","sort":25,"path":"./25-LAM.usfm","categories":["bible-ot"]},{"title":"Ezekiel","versification":"ufw","identifier":"ezk","sort":26,"path":"./26-EZK.usfm","categories":["bible-ot"]},{"title":"Daniel","versification":"ufw","identifier":"dan","sort":27,"path":"./27-DAN.usfm","categories":["bible-ot"]},{"title":"Hosea","versification":"ufw","identifier":"hos","sort":28,"path":"./28-HOS.usfm","categories":["bible-ot"]},{"title":"Joel","versification":"ufw","identifier":"jol","sort":29,"path":"./29-JOL.usfm","categories":["bible-ot"]},{"title":"Amos","versification":"ufw","identifier":"amo","sort":30,"path":"./30-AMO.usfm","categories":["bible-ot"]},{"title":"Obadiah","versification":"ufw","identifier":"oba","sort":31,"path":"./31-OBA.usfm","categories":["bible-ot"]},{"title":"Ионы","versification":"ufw","identifier":"jon","sort":32,"path":"./32-JON.usfm","categories":["bible-ot"]},{"title":"Micah","versification":"ufw","identifier":"mic","sort":33,"path":"./33-MIC.usfm","categories":["bible-ot"]},{"title":"Nahum","versification":"ufw","identifier":"nam","sort":34,"path":"./34-NAM.usfm","categories":["bible-ot"]},{"title":"Habakkuk","versification":"ufw","identifier":"hab","sort":35,"path":"./35-HAB.usfm","categories":["bible-ot"]},{"title":"Zephaniah","versification":"ufw","identifier":"zep","sort":36,"path":"./36-ZEP.usfm","categories":["bible-ot"]},{"title":"Haggai","versification":"ufw","identifier":"hag","sort":37,"path":"./37-HAG.usfm","categories":["bible-ot"]},{"title":"Zechariah","versification":"ufw","identifier":"zec","sort":38,"path":"./38-ZEC.usfm","categories":["bible-ot"]},{"title":"Malachi","versification":"ufw","identifier":"mal","sort":39,"path":"./39-MAL.usfm","categories":["bible-ot"]},{"title":"Matthew","versification":"ufw","identifier":"mat","sort":40,"path":"./41-MAT.usfm","categories":["bible-nt"]},{"title":"Mark","versification":"ufw","identifier":"mrk","sort":41,"path":"./42-MRK.usfm","categories":["bible-nt"]},{"title":"Луки","versification":"ufw","identifier":"luk","sort":42,"path":"./43-LUK.usfm","categories":["bible-nt"]},{"title":"John","versification":"ufw","identifier":"jhn","sort":43,"path":"./44-JHN.usfm","categories":["bible-nt"]},{"title":"Деяния","versification":"ufw","identifier":"act","sort":44,"path":"./45-ACT.usfm","categories":["bible-nt"]},{"title":"Romans","versification":"ufw","identifier":"rom","sort":45,"path":"./46-ROM.usfm","categories":["bible-nt"]},{"title":"1 Corinthians","versification":"ufw","identifier":"1co","sort":46,"path":"./47-1CO.usfm","categories":["bible-nt"]},{"title":"2 Corinthians","versification":"ufw","identifier":"2co","sort":47,"path":"./48-2CO.usfm","categories":["bible-nt"]},{"title":"Galatians","versification":"ufw","identifier":"gal","sort":48,"path":"./49-GAL.usfm","categories":["bible-nt"]},{"title":"Ефесянам","versification":"ufw","identifier":"eph","sort":49,"path":"./50-EPH.usfm","categories":["bible-nt"]},{"title":"Philippians","versification":"ufw","identifier":"php","sort":50,"path":"./51-PHP.usfm","categories":["bible-nt"]},{"title":"Colossians","versification":"ufw","identifier":"col","sort":51,"path":"./52-COL.usfm","categories":["bible-nt"]},{"title":"1 Thessalonians","versification":"ufw","identifier":"1th","sort":52,"path":"./53-1TH.usfm","categories":["bible-nt"]},{"title":"2 Thessalonians","versification":"ufw","identifier":"2th","sort":53,"path":"./54-2TH.usfm","categories":["bible-nt"]},{"title":"1 Тимофею","versification":"ufw","identifier":"1ti","sort":54,"path":"./55-1TI.usfm","categories":["bible-nt"]},{"title":"2 Тимофею","versification":"ufw","identifier":"2ti","sort":55,"path":"./56-2TI.usfm","categories":["bible-nt"]},{"title":"Титу","versification":"ufw","identifier":"tit","sort":56,"path":"./57-TIT.usfm","categories":["bible-nt"]},{"title":"Philemon","versification":"ufw","identifier":"phm","sort":57,"path":"./58-PHM.usfm","categories":["bible-nt"]},{"title":"Hebrews","versification":"ufw","identifier":"heb","sort":58,"path":"./59-HEB.usfm","categories":["bible-nt"]},{"title":"James","versification":"ufw","identifier":"jas","sort":59,"path":"./60-JAS.usfm","categories":["bible-nt"]},{"title":"1 Peter","versification":"ufw","identifier":"1pe","sort":60,"path":"./61-1PE.usfm","categories":["bible-nt"]},{"title":"2 Peter","versification":"ufw","identifier":"2pe","sort":61,"path":"./62-2PE.usfm","categories":["bible-nt"]},{"title":"1 John","versification":"ufw","identifier":"1jn","sort":62,"path":"./63-1JN.usfm","categories":["bible-nt"]},{"title":"2 John","versification":"ufw","identifier":"2jn","sort":63,"path":"./64-2JN.usfm","categories":["bible-nt"]},{"title":"3 Иоанна","versification":"ufw","identifier":"3jn","sort":64,"path":"./65-3JN.usfm","categories":["bible-nt"]},{"title":"Jude","versification":"ufw","identifier":"jud","sort":65,"path":"./66-JUD.usfm","categories":["bible-nt"]},{"title":"Revelation","versification":"ufw","identifier":"rev","sort":66,"path":"./67-REV.usfm","categories":["bible-nt"]}]}},
    "literal":{"owner":"ru_gl","repo":"ru_rlob","commit":"b64975c9d8a4dc0392865e228d03e91cd9f6ac3e","manifest":{"dublin_core":{"type":"bundle","conformsto":"rc0.2","comment":"RLOB","format":"text/usfm3","identifier":"rlob","title":"Russian Literal Open Bible","subject":"Aligned Bible","description":"Russian RLOB aligned to unfoldingWord® Greek New Testament","language":{"identifier":"ru","title":"Русский","direction":"ltr"},"source":[{"identifier":"rlob","language":"ru","version":"1.0.0"}],"rights":"CC BY-SA 4.0","creator":"Door43 World Missions Community","contributor":["Door43 World Missions Community"],"relation":["ru/tw","el-x-koine/ugnt"],"publisher":"Door43 World Missions Community","issued":"2020-08-12","modified":"2020-08-12","version":"1"},"checking":{"checking_entity":["Door43 World Missions Community"],"checking_level":"3"},"projects":[{"title":"Genesis","versification":"ufw","identifier":"gen","sort":1,"path":"./01-GEN.usfm","categories":["bible-ot"]},{"title":"Exodus","versification":"ufw","identifier":"exo","sort":2,"path":"./02-EXO.usfm","categories":["bible-ot"]},{"title":"Leviticus","versification":"ufw","identifier":"lev","sort":3,"path":"./03-LEV.usfm","categories":["bible-ot"]},{"title":"Numbers","versification":"ufw","identifier":"num","sort":4,"path":"./04-NUM.usfm","categories":["bible-ot"]},{"title":"Deuteronomy","versification":"ufw","identifier":"deu","sort":5,"path":"./05-DEU.usfm","categories":["bible-ot"]},{"title":"Joshua","versification":"ufw","identifier":"jos","sort":6,"path":"./06-JOS.usfm","categories":["bible-ot"]},{"title":"Judges","versification":"ufw","identifier":"jdg","sort":7,"path":"./07-JDG.usfm","categories":["bible-ot"]},{"title":"Руфь","versification":"ufw","identifier":"rut","sort":8,"path":"./08-RUT.usfm","categories":["bible-ot"]},{"title":"1 Samuel","versification":"ufw","identifier":"1sa","sort":9,"path":"./09-1SA.usfm","categories":["bible-ot"]},{"title":"2 Samuel","versification":"ufw","identifier":"2sa","sort":10,"path":"./10-2SA.usfm","categories":["bible-ot"]},{"title":"1 Kings","versification":"ufw","identifier":"1ki","sort":11,"path":"./11-1KI.usfm","categories":["bible-ot"]},{"title":"2 Kings","versification":"ufw","identifier":"2ki","sort":12,"path":"./12-2KI.usfm","categories":["bible-ot"]},{"title":"1 Chronicles","versification":"ufw","identifier":"1ch","sort":13,"path":"./13-1CH.usfm","categories":["bible-ot"]},{"title":"2 Chronicles","versification":"ufw","identifier":"2ch","sort":14,"path":"./14-2CH.usfm","categories":["bible-ot"]},{"title":"Ezra","versification":"ufw","identifier":"ezr","sort":15,"path":"./15-EZR.usfm","categories":["bible-ot"]},{"title":"Nehemiah","versification":"ufw","identifier":"neh","sort":16,"path":"./16-NEH.usfm","categories":["bible-ot"]},{"title":"Есфирь","versification":"ufw","identifier":"est","sort":17,"path":"./17-EST.usfm","categories":["bible-ot"]},{"title":"Job","versification":"ufw","identifier":"job","sort":18,"path":"./18-JOB.usfm","categories":["bible-ot"]},{"title":"Psalms","versification":"ufw","identifier":"psa","sort":19,"path":"./19-PSA.usfm","categories":["bible-ot"]},{"title":"Proverbs","versification":"ufw","identifier":"pro","sort":20,"path":"./20-PRO.usfm","categories":["bible-ot"]},{"title":"Ecclesiastes","versification":"ufw","identifier":"ecc","sort":21,"path":"./21-ECC.usfm","categories":["bible-ot"]},{"title":"Song of Solomon","versification":"ufw","identifier":"sng","sort":22,"path":"./22-SNG.usfm","categories":["bible-ot"]},{"title":"Isaiah","versification":"ufw","identifier":"isa","sort":23,"path":"./23-ISA.usfm","categories":["bible-ot"]},{"title":"Jeremiah","versification":"ufw","identifier":"jer","sort":24,"path":"./24-JER.usfm","categories":["bible-ot"]},{"title":"Lamentations","versification":"ufw","identifier":"lam","sort":25,"path":"./25-LAM.usfm","categories":["bible-ot"]},{"title":"Ezekiel","versification":"ufw","identifier":"ezk","sort":26,"path":"./26-EZK.usfm","categories":["bible-ot"]},{"title":"Daniel","versification":"ufw","identifier":"dan","sort":27,"path":"./27-DAN.usfm","categories":["bible-ot"]},{"title":"Hosea","versification":"ufw","identifier":"hos","sort":28,"path":"./28-HOS.usfm","categories":["bible-ot"]},{"title":"Joel","versification":"ufw","identifier":"jol","sort":29,"path":"./29-JOL.usfm","categories":["bible-ot"]},{"title":"Amos","versification":"ufw","identifier":"amo","sort":30,"path":"./30-AMO.usfm","categories":["bible-ot"]},{"title":"Авдия","versification":"ufw","identifier":"oba","sort":31,"path":"./31-OBA.usfm","categories":["bible-ot"]},{"title":"Ионы","versification":"ufw","identifier":"jon","sort":32,"path":"./32-JON.usfm","categories":["bible-ot"]},{"title":"Micah","versification":"ufw","identifier":"mic","sort":33,"path":"./33-MIC.usfm","categories":["bible-ot"]},{"title":"Nahum","versification":"ufw","identifier":"nam","sort":34,"path":"./34-NAM.usfm","categories":["bible-ot"]},{"title":"Habakkuk","versification":"ufw","identifier":"hab","sort":35,"path":"./35-HAB.usfm","categories":["bible-ot"]},{"title":"Zephaniah","versification":"ufw","identifier":"zep","sort":36,"path":"./36-ZEP.usfm","categories":["bible-ot"]},{"title":"Haggai","versification":"ufw","identifier":"hag","sort":37,"path":"./37-HAG.usfm","categories":["bible-ot"]},{"title":"Zechariah","versification":"ufw","identifier":"zec","sort":38,"path":"./38-ZEC.usfm","categories":["bible-ot"]},{"title":"Malachi","versification":"ufw","identifier":"mal","sort":39,"path":"./39-MAL.usfm","categories":["bible-ot"]},{"title":"Matthew","versification":"ufw","identifier":"mat","sort":40,"path":"./41-MAT.usfm","categories":["bible-nt"]},{"title":"Mark","versification":"ufw","identifier":"mrk","sort":41,"path":"./42-MRK.usfm","categories":["bible-nt"]},{"title":"Luke","versification":"ufw","identifier":"luk","sort":42,"path":"./43-LUK.usfm","categories":["bible-nt"]},{"title":"John","versification":"ufw","identifier":"jhn","sort":43,"path":"./44-JHN.usfm","categories":["bible-nt"]},{"title":"Acts","versification":"ufw","identifier":"act","sort":44,"path":"./45-ACT.usfm","categories":["bible-nt"]},{"title":"Romans","versification":"ufw","identifier":"rom","sort":45,"path":"./46-ROM.usfm","categories":["bible-nt"]},{"title":"1 Corinthians","versification":"ufw","identifier":"1co","sort":46,"path":"./47-1CO.usfm","categories":["bible-nt"]},{"title":"2 Corinthians","versification":"ufw","identifier":"2co","sort":47,"path":"./48-2CO.usfm","categories":["bible-nt"]},{"title":"Galatians","versification":"ufw","identifier":"gal","sort":48,"path":"./49-GAL.usfm","categories":["bible-nt"]},{"title":"Ephesians","versification":"ufw","identifier":"eph","sort":49,"path":"./50-EPH.usfm","categories":["bible-nt"]},{"title":"Philippians","versification":"ufw","identifier":"php","sort":50,"path":"./51-PHP.usfm","categories":["bible-nt"]},{"title":"Colossians","versification":"ufw","identifier":"col","sort":51,"path":"./52-COL.usfm","categories":["bible-nt"]},{"title":"1 Thessalonians","versification":"ufw","identifier":"1th","sort":52,"path":"./53-1TH.usfm","categories":["bible-nt"]},{"title":"2 Thessalonians","versification":"ufw","identifier":"2th","sort":53,"path":"./54-2TH.usfm","categories":["bible-nt"]},{"title":"1 Тимофею","versification":"ufw","identifier":"1ti","sort":54,"path":"./55-1TI.usfm","categories":["bible-nt"]},{"title":"2 Тимофею","versification":"ufw","identifier":"2ti","sort":55,"path":"./56-2TI.usfm","categories":["bible-nt"]},{"title":"Титу","versification":"ufw","identifier":"tit","sort":56,"path":"./57-TIT.usfm","categories":["bible-nt"]},{"title":"Philemon","versification":"ufw","identifier":"phm","sort":57,"path":"./58-PHM.usfm","categories":["bible-nt"]},{"title":"Hebrews","versification":"ufw","identifier":"heb","sort":58,"path":"./59-HEB.usfm","categories":["bible-nt"]},{"title":"James","versification":"ufw","identifier":"jas","sort":59,"path":"./60-JAS.usfm","categories":["bible-nt"]},{"title":"1 Peter","versification":"ufw","identifier":"1pe","sort":60,"path":"./61-1PE.usfm","categories":["bible-nt"]},{"title":"2 Peter","versification":"ufw","identifier":"2pe","sort":61,"path":"./62-2PE.usfm","categories":["bible-nt"]},{"title":"1 Иоанна","versification":"ufw","identifier":"1jn","sort":62,"path":"./63-1JN.usfm","categories":["bible-nt"]},{"title":"2 Иоанна","versification":"ufw","identifier":"2jn","sort":63,"path":"./64-2JN.usfm","categories":["bible-nt"]},{"title":"3 Иоанна","versification":"ufw","identifier":"3jn","sort":64,"path":"./65-3JN.usfm","categories":["bible-nt"]},{"title":"Jude","versification":"ufw","identifier":"jud","sort":65,"path":"./66-JUD.usfm","categories":["bible-nt"]},{"title":"Revelation","versification":"ufw","identifier":"rev","sort":66,"path":"./67-REV.usfm","categories":["bible-nt"]}]}},
    "tnotes":{"owner":"ru_gl","repo":"ru_tn","commit":"61f25360fb057675c1c6e5b4da6f5ee077817aa5","manifest":{"dublin_core":{"conformsto":"rc0.2","contributor":["Ivan Pavlii, PhD in World Literature, Baku Slavic University","Maria Karyakina, PhD, University of Pretoria, MTh in New Testament, University of South Africa","Aleksey Voskresenskiy, MTh in New Testament, University of Cardiff, Wales","Yuri Tamurkin, BTh,  St.Petersburg Christian University","Anna Savitskaya","Samuel Kim","Door43 World Missions Community"],"creator":"Door43, Russian Open Bible","description":"Open-licensed exegetical notes that provide historical, cultural, and linguistic information for translators. It provides translators and checkers with pertinent, just-in-time information to help them make the best possible translation decisions.","format":"text/tsv","identifier":"tn","issued":"2021-05-09","language":{"identifier":"ru","title":"Русский","direction":"ltr"},"modified":"2021-05-09","publisher":"Door43, Russian Open Bible","relation":["ru/ult","ru/ust","el-x-koine/ugnt?v=0.19","hbo/uhb?v=2.1.17","ru/ta","ru/tw","ru/tq","ru/rlb","ru/rlob","ru/rob","ru/rsob","ru/rsb","ru/ulb"],"rights":"CC BY-SA 4.0","source":[{"identifier":"tn","language":"ru","version":"50.8"}],"subject":"TSV Translation Notes","title":"Russian Translation Notes","type":"help","version":"50.9"},"checking":{"checking_entity":["Door43, Russian Open Bible"],"checking_level":"3"},"projects":[{"title":"Genesis","versification":"ufw","identifier":"gen","sort":1,"path":"./en_tn_01-GEN.tsv","categories":["bible-ot"]},{"title":"Exodus","versification":"ufw","identifier":"exo","sort":2,"path":"./en_tn_02-EXO.tsv","categories":["bible-ot"]},{"title":"Leviticus","versification":"ufw","identifier":"lev","sort":3,"path":"./en_tn_03-LEV.tsv","categories":["bible-ot"]},{"title":"Numbers","versification":"ufw","identifier":"num","sort":4,"path":"./en_tn_04-NUM.tsv","categories":["bible-ot"]},{"title":"Deuteronomy","versification":"ufw","identifier":"deu","sort":5,"path":"./en_tn_05-DEU.tsv","categories":["bible-ot"]},{"title":"Joshua","versification":"ufw","identifier":"jos","sort":6,"path":"./en_tn_06-JOS.tsv","categories":["bible-ot"]},{"title":"Judges","versification":"ufw","identifier":"jdg","sort":7,"path":"./en_tn_07-JDG.tsv","categories":["bible-ot"]},{"title":"Руфь","versification":"ufw","identifier":"rut","sort":8,"path":"./en_tn_08-RUT.tsv","categories":["bible-ot"]},{"title":"1 Samuel","versification":"ufw","identifier":"1sa","sort":9,"path":"./en_tn_09-1SA.tsv","categories":["bible-ot"]},{"title":"2 Samuel","versification":"ufw","identifier":"2sa","sort":10,"path":"./en_tn_10-2SA.tsv","categories":["bible-ot"]},{"title":"1 Kings","versification":"ufw","identifier":"1ki","sort":11,"path":"./en_tn_11-1KI.tsv","categories":["bible-ot"]},{"title":"2 Kings","versification":"ufw","identifier":"2ki","sort":12,"path":"./en_tn_12-2KI.tsv","categories":["bible-ot"]},{"title":"1 Chronicles","versification":"ufw","identifier":"1ch","sort":13,"path":"./en_tn_13-1CH.tsv","categories":["bible-ot"]},{"title":"2 Chronicles","versification":"ufw","identifier":"2ch","sort":14,"path":"./en_tn_14-2CH.tsv","categories":["bible-ot"]},{"title":"Ezra","versification":"ufw","identifier":"ezr","sort":15,"path":"./en_tn_15-EZR.tsv","categories":["bible-ot"]},{"title":"Nehemiah","versification":"ufw","identifier":"neh","sort":16,"path":"./en_tn_16-NEH.tsv","categories":["bible-ot"]},{"title":"Есфирь","versification":"ufw","identifier":"est","sort":17,"path":"./en_tn_17-EST.tsv","categories":["bible-ot"]},{"title":"Job","versification":"ufw","identifier":"job","sort":18,"path":"./en_tn_18-JOB.tsv","categories":["bible-ot"]},{"title":"Psalms","versification":"ufw","identifier":"psa","sort":19,"path":"./en_tn_19-PSA.tsv","categories":["bible-ot"]},{"title":"Proverbs","versification":"ufw","identifier":"pro","sort":20,"path":"./en_tn_20-PRO.tsv","categories":["bible-ot"]},{"title":"Ecclesiastes","versification":"ufw","identifier":"ecc","sort":21,"path":"./en_tn_21-ECC.tsv","categories":["bible-ot"]},{"title":"Song of Solomon","versification":"ufw","identifier":"sng","sort":22,"path":"./en_tn_22-SNG.tsv","categories":["bible-ot"]},{"title":"Isaiah","versification":"ufw","identifier":"isa","sort":23,"path":"./en_tn_23-ISA.tsv","categories":["bible-ot"]},{"title":"Jeremiah","versification":"ufw","identifier":"jer","sort":24,"path":"./en_tn_24-JER.tsv","categories":["bible-ot"]},{"title":"Lamentations","versification":"ufw","identifier":"lam","sort":25,"path":"./en_tn_25-LAM.tsv","categories":["bible-ot"]},{"title":"Ezekiel","versification":"ufw","identifier":"ezk","sort":26,"path":"./en_tn_26-EZK.tsv","categories":["bible-ot"]},{"title":"Daniel","versification":"ufw","identifier":"dan","sort":27,"path":"./en_tn_27-DAN.tsv","categories":["bible-ot"]},{"title":"Hosea","versification":"ufw","identifier":"hos","sort":28,"path":"./en_tn_28-HOS.tsv","categories":["bible-ot"]},{"title":"Joel","versification":"ufw","identifier":"jol","sort":29,"path":"./en_tn_29-JOL.tsv","categories":["bible-ot"]},{"title":"Amos","versification":"ufw","identifier":"amo","sort":30,"path":"./en_tn_30-AMO.tsv","categories":["bible-ot"]},{"title":"Obadiah","versification":"ufw","identifier":"oba","sort":31,"path":"./en_tn_31-OBA.tsv","categories":["bible-ot"]},{"title":"Ионы","versification":"ufw","identifier":"jon","sort":32,"path":"./en_tn_32-JON.tsv","categories":["bible-ot"]},{"title":"Micah","versification":"ufw","identifier":"mic","sort":33,"path":"./en_tn_33-MIC.tsv","categories":["bible-ot"]},{"title":"Nahum","versification":"ufw","identifier":"nam","sort":34,"path":"./en_tn_34-NAM.tsv","categories":["bible-ot"]},{"title":"Habakkuk","versification":"ufw","identifier":"hab","sort":35,"path":"./en_tn_35-HAB.tsv","categories":["bible-ot"]},{"title":"Zephaniah","versification":"ufw","identifier":"zep","sort":36,"path":"./en_tn_36-ZEP.tsv","categories":["bible-ot"]},{"title":"Haggai","versification":"ufw","identifier":"hag","sort":37,"path":"./en_tn_37-HAG.tsv","categories":["bible-ot"]},{"title":"Zechariah","versification":"ufw","identifier":"zec","sort":38,"path":"./en_tn_38-ZEC.tsv","categories":["bible-ot"]},{"title":"Malachi","versification":"ufw","identifier":"mal","sort":39,"path":"./en_tn_39-MAL.tsv","categories":["bible-ot"]},{"title":"Matthew","versification":"ufw","identifier":"mat","sort":40,"path":"./en_tn_41-MAT.tsv","categories":["bible-nt"]},{"title":"Mark","versification":"ufw","identifier":"mrk","sort":41,"path":"./en_tn_42-MRK.tsv","categories":["bible-nt"]},{"title":"Luke","versification":"ufw","identifier":"luk","sort":42,"path":"./en_tn_43-LUK.tsv","categories":["bible-nt"]},{"title":"John","versification":"ufw","identifier":"jhn","sort":43,"path":"./en_tn_44-JHN.tsv","categories":["bible-nt"]},{"title":"Acts","versification":"ufw","identifier":"act","sort":44,"path":"./en_tn_45-ACT.tsv","categories":["bible-nt"]},{"title":"Romans","versification":"ufw","identifier":"rom","sort":45,"path":"./en_tn_46-ROM.tsv","categories":["bible-nt"]},{"title":"1 Corinthians","versification":"ufw","identifier":"1co","sort":46,"path":"./en_tn_47-1CO.tsv","categories":["bible-nt"]},{"title":"2 Corinthians","versification":"ufw","identifier":"2co","sort":47,"path":"./en_tn_48-2CO.tsv","categories":["bible-nt"]},{"title":"Galatians","versification":"ufw","identifier":"gal","sort":48,"path":"./en_tn_49-GAL.tsv","categories":["bible-nt"]},{"title":"Ephesians","versification":"ufw","identifier":"eph","sort":49,"path":"./en_tn_50-EPH.tsv","categories":["bible-nt"]},{"title":"Philippians","versification":"ufw","identifier":"php","sort":50,"path":"./en_tn_51-PHP.tsv","categories":["bible-nt"]},{"title":"Colossians","versification":"ufw","identifier":"col","sort":51,"path":"./en_tn_52-COL.tsv","categories":["bible-nt"]},{"title":"1 Thessalonians","versification":"ufw","identifier":"1th","sort":52,"path":"./en_tn_53-1TH.tsv","categories":["bible-nt"]},{"title":"2 Thessalonians","versification":"ufw","identifier":"2th","sort":53,"path":"./en_tn_54-2TH.tsv","categories":["bible-nt"]},{"title":"1 Тимофею","versification":"ufw","identifier":"1ti","sort":54,"path":"./en_tn_55-1TI.tsv","categories":["bible-nt"]},{"title":"2 Тимофею","versification":"ufw","identifier":"2ti","sort":55,"path":"./en_tn_56-2TI.tsv","categories":["bible-nt"]},{"title":"Титу","versification":"ufw","identifier":"tit","sort":56,"path":"./en_tn_57-TIT.tsv","categories":["bible-nt"]},{"title":"Philemon","versification":"ufw","identifier":"phm","sort":57,"path":"./en_tn_58-PHM.tsv","categories":["bible-nt"]},{"title":"Hebrews","versification":"ufw","identifier":"heb","sort":58,"path":"./en_tn_59-HEB.tsv","categories":["bible-nt"]},{"title":"James","versification":"ufw","identifier":"jas","sort":59,"path":"./en_tn_60-JAS.tsv","categories":["bible-nt"]},{"title":"1 Peter","versification":"ufw","identifier":"1pe","sort":60,"path":"./en_tn_61-1PE.tsv","categories":["bible-nt"]},{"title":"2 Peter","versification":"ufw","identifier":"2pe","sort":61,"path":"./en_tn_62-2PE.tsv","categories":["bible-nt"]},{"title":"1 Иоанна","versification":"ufw","identifier":"1jn","sort":62,"path":"./en_tn_63-1JN.tsv","categories":["bible-nt"]},{"title":"2 Иоанна","versification":"ufw","identifier":"2jn","sort":63,"path":"./en_tn_64-2JN.tsv","categories":["bible-nt"]},{"title":"3 Иоанна","versification":"ufw","identifier":"3jn","sort":64,"path":"./en_tn_65-3JN.tsv","categories":["bible-nt"]},{"title":"Jude","versification":"ufw","identifier":"jud","sort":65,"path":"./en_tn_66-JUD.tsv","categories":["bible-nt"]},{"title":"Revelation","versification":"ufw","identifier":"rev","sort":66,"path":"./en_tn_67-REV.tsv","categories":["bible-nt"]}]}},
    "twords":{"owner":"ru_gl","repo":"ru_tw","commit":"ea337e3dc7d8e9100af1224d1698b58abb53849d","manifest":{"dublin_core":{"conformsto":"rc0.2","contributor":["Ivan Pavlii, PhD in World Literature, Baku Slavic University","Maria Karyakina, PhD, University of Pretoria, MTh in New Testament, University of South Africa","Aleksey Voskresenskiy, MTh in New Testament, University of Cardiff, Wales","Yuri Tamurkin, BTh,  St.Petersburg Christian University","Anna Savitskaya","Samuel Kim","Katya Tsvetaeva","elman","saidjenya","ludig","sergey.sheidt","arman.arenbayev","Door43 World Missions Community"],"creator":"Door43, Russian Open Bible","description":"A basic Bible lexicon that provides translators with clear, concise definitions and translation suggestions for every important word in the Bible. It provides translators and checkers with essential lexical information to help them make the best possible translation decisions.","format":"text/markdown","identifier":"tw","issued":"2020-10-12","language":{"identifier":"ru","title":"Russian","direction":"ltr"},"modified":"2020-12-07","publisher":"Door43, Russian Open Bible","relation":["en/ult","en/ust","en/obs","en/tw","en/tn","el-x-koine/ugnt?v=0.15","hbo/uhb?v=2.1.15","ru/tw","ru/tn","ru/tq","ru/obs","ru/ulb","ru/rsb","ru/rob","ru/rlob","ru/rsob"],"rights":"CC BY-SA 4.0","source":[{"identifier":"tw","language":"ru","version":"3"}],"subject":"Translation Words","title":"Russian Translation Words","type":"dict","version":"12"},"checking":{"checking_entity":["Door43, Russian Open Bible"],"checking_level":"3"},"projects":[{"categories":null,"identifier":"bible","path":"./bible","sort":0,"title":"Russian Translation Words","versification":null}]}},
    "tquestions":{"owner":"Door43-Catalog","repo":"ru_tq","commit":"22b0b98063b8ce17a970d123f807c86371001a34","manifest":{"dublin_core":{"conformsto":"rc0.2","contributor":["Ivan Pavlii, PhD in World Literature, Baku Slavic University","Maria Karyakina, PhD, University of Pretoria, MTh in New Testament, University of South Africa","Aleksey Voskresenskiy, MTh in New Testament, University of Cardiff, Wales","Yuri Tamurkin, BTh,  St.Petersburg Christian University","Anna Savitskaya","Samuel Kim","Larry Sallee (Th.M Dallas Theological Seminary, D.Min. Columbia Biblical Seminary)","Perry Oakes (BA Biblical Studies, Taylor University; MA Theology, Fuller Seminary; MA Linguistics, University of Texas at Arlington; PhD Old Testament, Southwestern Baptist Theological Seminary)","Joel D. Ruark (M.A.Th. Gordon-Conwell Theological Seminary; Th.M. Stellenbosch University; Ph.D. Candidate in Old Testament Studies, Stellenbosch University)","Jesse Griffin (BA Biblical Studies, Liberty University; MA Biblical Languages, Gordon-Conwell Theological Seminary)","Susan Quigley, MA in Linguistics","Jerrell Hein","Cheryl Stauter","Deb Richey","Don Ritchey","Gena Schottmuller","Irene Little","Marsha Rogne","Pat Naber","Randy Stauter","Russ Isham","Vickey DeKraker","Door43 World Missions Community"],"creator":"Door43, Russian Open Bible","description":"Comprehension and theological questions for each chapter of the Bible. It enables translators and translation checkers to confirm that the intended meaning of their translations is clearly communicated to the speakers of that language.","format":"text/markdown","identifier":"tq","issued":"2021-01-27","language":{"identifier":"ru","title":"Русский (Russian)","direction":"ltr"},"modified":"2021-01-27","publisher":"Door43, Russian Open Bible","relation":["ru/rlob","ru/rob","ru/rsb","ru/rsob","ru/ulb","ru/obs","ru/ta","ru/tn","ru/tw"],"rights":"CC BY-SA 4.0","source":[{"identifier":"tq","language":"en","version":"19"}],"subject":"Translation Questions","title":"Russian Translation Questions","type":"help","version":"19.1"},"checking":{"checking_entity":["Door43, Russian Open Bible"],"checking_level":"3"},"projects":[{"title":"Бытие","identifier":"gen","sort":1,"path":"./gen","categories":["bible-ot"],"versification":null},{"title":"Исход","identifier":"exo","sort":2,"path":"./exo","categories":["bible-ot"],"versification":null},{"title":"Левит","identifier":"lev","sort":3,"path":"./lev","categories":["bible-ot"],"versification":null},{"title":"Числа","identifier":"num","sort":4,"path":"./num","categories":["bible-ot"],"versification":null},{"title":"Второзаконие","identifier":"deu","sort":5,"path":"./deu","categories":["bible-ot"],"versification":null},{"title":"Иисуса Навина","identifier":"jos","sort":6,"path":"./jos","categories":["bible-ot"],"versification":null},{"title":"Судей","identifier":"jdg","sort":7,"path":"./jdg","categories":["bible-ot"],"versification":null},{"title":"Руфь","identifier":"rut","sort":8,"path":"./rut","categories":["bible-ot"],"versification":null},{"title":"1 Царств","identifier":"1sa","sort":9,"path":"./1sa","categories":["bible-ot"],"versification":null},{"title":"2 Царств","identifier":"2sa","sort":10,"path":"./2sa","categories":["bible-ot"],"versification":null},{"title":"3 Царств","identifier":"1ki","sort":11,"path":"./1ki","categories":["bible-ot"],"versification":null},{"title":"4 Царств","identifier":"2ki","sort":12,"path":"./2ki","categories":["bible-ot"],"versification":null},{"title":"1 Паралипоменон","identifier":"1ch","sort":13,"path":"./1ch","categories":["bible-ot"],"versification":null},{"title":"2 Паралипоменон","identifier":"2ch","sort":14,"path":"./2ch","categories":["bible-ot"],"versification":null},{"title":"Ездры","identifier":"ezr","sort":15,"path":"./ezr","categories":["bible-ot"],"versification":null},{"title":"Неемии","identifier":"neh","sort":16,"path":"./neh","categories":["bible-ot"],"versification":null},{"title":"Есфири","identifier":"est","sort":17,"path":"./est","categories":["bible-ot"],"versification":null},{"title":"Иова","identifier":"job","sort":18,"path":"./job","categories":["bible-ot"],"versification":null},{"title":"Псалтирь","identifier":"psa","sort":19,"path":"./psa","categories":["bible-ot"],"versification":null},{"title":"Притчи","identifier":"pro","sort":20,"path":"./pro","categories":["bible-ot"],"versification":null},{"title":"Екклезиаста","identifier":"ecc","sort":21,"path":"./ecc","categories":["bible-ot"],"versification":null},{"title":"Песнь","identifier":"sng","sort":22,"path":"./sng","categories":["bible-ot"],"versification":null},{"title":"Исаии","identifier":"isa","sort":23,"path":"./isa","categories":["bible-ot"],"versification":null},{"title":"Иеремии","identifier":"jer","sort":24,"path":"./jer","categories":["bible-ot"],"versification":null},{"title":"Плач","identifier":"lam","sort":25,"path":"./lam","categories":["bible-ot"],"versification":null},{"title":"Иезекииля","identifier":"ezk","sort":26,"path":"./ezk","categories":["bible-ot"],"versification":null},{"title":"Даниила","identifier":"dan","sort":27,"path":"./dan","categories":["bible-ot"],"versification":null},{"title":"Осии","identifier":"hos","sort":28,"path":"./hos","categories":["bible-ot"],"versification":null},{"title":"Иоиля","identifier":"jol","sort":29,"path":"./jol","categories":["bible-ot"],"versification":null},{"title":"Амоса","identifier":"amo","sort":30,"path":"./amo","categories":["bible-ot"],"versification":null},{"title":"Авдия","identifier":"oba","sort":31,"path":"./oba","categories":["bible-ot"],"versification":null},{"title":"Ионы","identifier":"jon","sort":32,"path":"./jon","categories":["bible-ot"],"versification":null},{"title":"Михея","identifier":"mic","sort":33,"path":"./mic","categories":["bible-ot"],"versification":null},{"title":"Наума","identifier":"nam","sort":34,"path":"./nam","categories":["bible-ot"],"versification":null},{"title":"Аввакума","identifier":"hab","sort":35,"path":"./hab","categories":["bible-ot"],"versification":null},{"title":"Софонии","identifier":"zep","sort":36,"path":"./zep","categories":["bible-ot"],"versification":null},{"title":"Аггея","identifier":"hag","sort":37,"path":"./hag","categories":["bible-ot"],"versification":null},{"title":"Захарии","identifier":"zec","sort":38,"path":"./zec","categories":["bible-ot"],"versification":null},{"title":"Малахии","identifier":"mal","sort":39,"path":"./mal","categories":["bible-ot"],"versification":null},{"title":"Матфея","identifier":"mat","sort":40,"path":"./mat","categories":["bible-nt"],"versification":null},{"title":"Марка","identifier":"mrk","sort":41,"path":"./mrk","categories":["bible-nt"],"versification":null},{"title":"Луки","identifier":"luk","sort":42,"path":"./luk","categories":["bible-nt"],"versification":null},{"title":"Иоанна","identifier":"jhn","sort":43,"path":"./jhn","categories":["bible-nt"],"versification":null},{"title":"Деяния","identifier":"act","sort":44,"path":"./act","categories":["bible-nt"],"versification":null},{"title":"Римлянам","identifier":"rom","sort":45,"path":"./rom","categories":["bible-nt"],"versification":null},{"title":"1 Коринфянам","identifier":"1co","sort":46,"path":"./1co","categories":["bible-nt"],"versification":null},{"title":"2 Коринфянам","identifier":"2co","sort":47,"path":"./2co","categories":["bible-nt"],"versification":null},{"title":"Галатам","identifier":"gal","sort":48,"path":"./gal","categories":["bible-nt"],"versification":null},{"title":"Ефесянам","identifier":"eph","sort":49,"path":"./eph","categories":["bible-nt"],"versification":null},{"title":"Филиппийцам","identifier":"php","sort":50,"path":"./php","categories":["bible-nt"],"versification":null},{"title":"Колоссянам","identifier":"col","sort":51,"path":"./col","categories":["bible-nt"],"versification":null},{"title":"1 Фессалоникийцам","identifier":"1th","sort":52,"path":"./1th","categories":["bible-nt"],"versification":null},{"title":"2 Фессалоникийцам","identifier":"2th","sort":53,"path":"./2th","categories":["bible-nt"],"versification":null},{"title":"1 Тимофею","identifier":"1ti","sort":54,"path":"./1ti","categories":["bible-nt"],"versification":null},{"title":"2 Тимофею","identifier":"2ti","sort":55,"path":"./2ti","categories":["bible-nt"],"versification":null},{"title":"Титу","identifier":"tit","sort":56,"path":"./tit","categories":["bible-nt"],"versification":null},{"title":"Филимону","identifier":"phm","sort":57,"path":"./phm","categories":["bible-nt"],"versification":null},{"title":"Евреям","identifier":"heb","sort":58,"path":"./heb","categories":["bible-nt"],"versification":null},{"title":"Иакова","identifier":"jas","sort":59,"path":"./jas","categories":["bible-nt"],"versification":null},{"title":"1 Петра","identifier":"1pe","sort":60,"path":"./1pe","categories":["bible-nt"],"versification":null},{"title":"2 Петра","identifier":"2pe","sort":61,"path":"./2pe","categories":["bible-nt"],"versification":null},{"title":"1 Иоанна","identifier":"1jn","sort":62,"path":"./1jn","categories":["bible-nt"],"versification":null},{"title":"2 Иоанна","identifier":"2jn","sort":63,"path":"./2jn","categories":["bible-nt"],"versification":null},{"title":"3 Иоанна","identifier":"3jn","sort":64,"path":"./3jn","categories":["bible-nt"],"versification":null},{"title":"Иуды","identifier":"jud","sort":65,"path":"./jud","categories":["bible-nt"],"versification":null},{"title":"Откровение","identifier":"rev","sort":66,"path":"./rev","categories":["bible-nt"],"versification":null}]}}}',
    'Vcana Bible',
    '{"resource":"simplified","books":[{"name":"gen","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/01-GEN.usfm"},{"name":"exo","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/02-EXO.usfm"},{"name":"lev","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/03-LEV.usfm"},{"name":"num","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/04-NUM.usfm"},{"name":"deu","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/05-DEU.usfm"},{"name":"jos","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/06-JOS.usfm"},{"name":"jdg","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/07-JDG.usfm"},{"name":"rut","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/08-RUT.usfm"},{"name":"1sa","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/09-1SA.usfm"},{"name":"2sa","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/10-2SA.usfm"},{"name":"1ki","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/11-1KI.usfm"},{"name":"2ki","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/12-2KI.usfm"},{"name":"1ch","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/13-1CH.usfm"},{"name":"2ch","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/14-2CH.usfm"},{"name":"ezr","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/15-EZR.usfm"},{"name":"neh","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/16-NEH.usfm"},{"name":"est","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/17-EST.usfm"},{"name":"job","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/18-JOB.usfm"},{"name":"psa","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/19-PSA.usfm"},{"name":"pro","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/20-PRO.usfm"},{"name":"ecc","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/21-ECC.usfm"},{"name":"sng","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/22-SNG.usfm"},{"name":"isa","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/23-ISA.usfm"},{"name":"jer","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/24-JER.usfm"},{"name":"lam","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/25-LAM.usfm"},{"name":"ezk","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/26-EZK.usfm"},{"name":"dan","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/27-DAN.usfm"},{"name":"hos","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/28-HOS.usfm"},{"name":"jol","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/29-JOL.usfm"},{"name":"amo","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/30-AMO.usfm"},{"name":"oba","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/31-OBA.usfm"},{"name":"jon","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/32-JON.usfm"},{"name":"mic","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/33-MIC.usfm"},{"name":"nam","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/34-NAM.usfm"},{"name":"hab","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/35-HAB.usfm"},{"name":"zep","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/36-ZEP.usfm"},{"name":"hag","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/37-HAG.usfm"},{"name":"zec","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/38-ZEC.usfm"},{"name":"mal","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/39-MAL.usfm"},{"name":"mat","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/41-MAT.usfm"},{"name":"mrk","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/42-MRK.usfm"},{"name":"luk","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/43-LUK.usfm"},{"name":"jhn","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/44-JHN.usfm"},{"name":"act","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/45-ACT.usfm"},{"name":"rom","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/46-ROM.usfm"},{"name":"1co","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/47-1CO.usfm"},{"name":"2co","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/48-2CO.usfm"},{"name":"gal","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/49-GAL.usfm"},{"name":"eph","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/50-EPH.usfm"},{"name":"php","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/51-PHP.usfm"},{"name":"col","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/52-COL.usfm"},{"name":"1th","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/53-1TH.usfm"},{"name":"2th","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/54-2TH.usfm"},{"name":"1ti","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/55-1TI.usfm"},{"name":"2ti","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/56-2TI.usfm"},{"name":"tit","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/57-TIT.usfm"},{"name":"phm","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/58-PHM.usfm"},{"name":"heb","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/59-HEB.usfm"},{"name":"jas","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/60-JAS.usfm"},{"name":"1pe","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/61-1PE.usfm"},{"name":"2pe","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/62-2PE.usfm"},{"name":"1jn","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/63-1JN.usfm"},{"name":"2jn","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/64-2JN.usfm"},{"name":"3jn","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/65-3JN.usfm"},{"name":"jud","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/66-JUD.usfm"},{"name":"rev","link":"https://git.door43.org/ru_gl/ru_rsob/raw/commit/38c10e570082cc615e45628ae7ea3f38d9b67b8c/67-REV.usfm"}]}');

  -- PROJECTS

  -- PROJECT TRANSLATORS
    DELETE FROM
      PUBLIC.project_translators;

    -- INSERT INTO
    --   PUBLIC.project_translators (project_id, user_id, is_moderator)
    -- VALUES
    --   (1, '21ae6e79-3f1d-4b87-bcb1-90256f63c167', FALSE),
    --   (1, 'bba5a95e-33b7-431d-8c43-aedc517a1aa6', FALSE),
    --   (1, 'f193af4d-ca5e-4847-90ef-38f969792dd5', FALSE),
    --   (1, '2e108465-9c20-46cd-9e43-933730229762', TRUE);
  -- END PROJECT TRANSLATORS

  -- PROJECT COORDINATORS
    DELETE FROM
      PUBLIC.project_coordinators;

    -- INSERT INTO
    --   PUBLIC.project_coordinators (project_id, user_id)
    -- VALUES
    --   (1, '2b95a8e9-2ee1-41ef-84ec-2403dd87c9f2');
  -- END PROJECT COORDINATORS

  -- STEPS
    DELETE FROM
      PUBLIC.steps;

    INSERT INTO public.steps (title, description, intro, count_of_users, "time", project_id, config, sorting) VALUES
    ('Шаг 1: Самостоятельное изучение', 'Some text here...', '# Intro

    ### How To Start

    Some text here

    https://youtu.be/pRptZjtfUIE', 1, 60, 1, '[{"size":4,"tools":[{"name":"literal","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}}]},{"size":2,"tools":[{"name":"ownNotes","config":{}},{"name":"teamNotes","config":{}},{"name":"dictionary","config":{}}]}]', 1),
    ('Шаг 3: Подготовка к переводу', 'Some text here3...', '# Intro

    ### Как сделать набросок

    Some text here

    https://youtu.be/pRptZjtfUIE', 2, 60, 1, '[{"size":4,"tools":[{"name":"literal","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}}]},{"size":2,"tools":[{"name":"audio","config":{}}]}]', 3),
    ('Шаг 2: Командное изучение текста', 'Some text here2...', '# Intro

    ### Как сделать набросок

    Some text here

    https://youtu.be/pRptZjtfUIE', 4, 60, 1, '[{"size":4,"tools":[{"name":"literal","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}}]},{"size":2,"tools":[{"name":"ownNotes","config":{}},{"name":"teamNotes","config":{}},{"name":"dictionary","config":{}}]}]', 2),
    ('Шаг 4: Набросок "Вслепую"', 'Some text here4...', '# Intro

    ### Как сделать набросок

    Some text here

    https://youtu.be/pRptZjtfUIE', 1, 60, 1, '[{"size":3,"tools":[{"name":"literal","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}}]},{"size":3,"tools":[{"name":"translate","config":{"stepOption":"draft"}}]}]', 4),
    ('Шаг 5: Самостоятельная проверка', 'Some text here5...', '# Intro

    ### Как сделать набросок

    Some text here

    https://youtu.be/pRptZjtfUIE', 1, 60, 1, '[{"size":3,"tools":[{"name":"literal","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}},{"name":"tquestions","config":{"viewAllQuestions":true}}]},{"size":3,"tools":[{"name":"translate","config":{}},{"name":"ownNotes","config":{}},{"name":"teamNotes","config":{}},{"name":"dictionary","config":{}}]}]', 5),
    ('Шаг 6: Взаимная проверка', 'Some text here6...', '# Intro

    ### Как сделать набросок

    Some text here

    https://youtu.be/pRptZjtfUIE', 2, 60, 1, '[{"size":3,"tools":[{"name":"literal","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}},{"name":"tquestions","config":{}}]},{"size":3,"tools":[{"name":"translate","config":{}},{"name":"ownNotes","config":{}},{"name":"teamNotes","config":{}},{"name":"dictionary","config":{}}]}]', 6),
    ('Шаг 7: Командная проверка', 'Some text here7...', '# Intro

    ### Как сделать набросок

    Some text here

    https://youtu.be/pRptZjtfUIE', 4, 60, 1, '[{"size":3,"tools":[{"name":"literal","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}},{"name":"tquestions","config":{}}]},{"size":3,"tools":[{"name":"translate","config":{}},{"name":"ownNotes","config":{}},{"name":"teamNotes","config":{}},{"name":"dictionary","config":{}}]}]', 7),
    ('Шаг 8: ', 'Some text here2...', '# Intro

    ### Как сделать набросок

    Some text here

    https://youtu.be/pRptZjtfUIE', 2, 30, 1, '[{"size":3,"tools":[{"name":"literal","config":{}},{"name":"simplified","config":{}},{"name":"tnotes","config":{}},{"name":"twords","config":{}},{"name":"tquestions","config":{}}]},{"size":3,"tools":[{"name":"translate","config":{}},{"name":"ownNotes","config":{}},{"name":"teamNotes","config":{}},{"name":"dictionary","config":{}}]}]', 8);


  -- END STEPS

  -- BOOKS
    DELETE FROM
      PUBLIC.books;

    INSERT INTO public.books (code, project_id, text, chapters) VALUES ('tit', 1, NULL, '{"1":16,"2":15,"3":15}');

  -- END BOOKS

  -- CHAPTERS
    DELETE FROM
      PUBLIC.chapters;

    INSERT INTO public.chapters (num, book_id, project_id, text, verses) VALUES
      (1, 1, 1, NULL, 16),
      (2, 1, 1, NULL, 15),
      (3, 1, 1, NULL, 15);

  -- END CHAPTERS

  -- VERSES
    DELETE FROM
      PUBLIC.verses;

    INSERT INTO public.verses (num, text, current_step, chapter_id, project_id, project_translator_id) VALUES
    (1, NULL, 1, 1, 1, NULL),
    (2, NULL, 1, 1, 1, NULL),
    (3, NULL, 1, 1, 1, NULL),
    (4, NULL, 1, 1, 1, NULL),
    (5, NULL, 1, 1, 1, NULL),
    (6, NULL, 1, 1, 1, NULL),
    (7, NULL, 1, 1, 1, NULL),
    (8, NULL, 1, 1, 1, NULL),
    (9, NULL, 1, 1, 1, NULL),
    (10, NULL, 1, 1, 1, NULL),
    (11, NULL, 1, 1, 1, NULL),
    (12, NULL, 1, 1, 1, NULL),
    (13, NULL, 1, 1, 1, NULL),
    (14, NULL, 1, 1, 1, NULL),
    (15, NULL, 1, 1, 1, NULL),
    (16, NULL, 1, 1, 1, NULL);


  -- END VERSES

  -- PROGRESS
    DELETE FROM
      PUBLIC.progress;

  -- END PROGRESS
-- END DUMMY DATA
