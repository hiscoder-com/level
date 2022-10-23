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
    DROP FUNCTION IF EXISTS PUBLIC.save_verse;
    DROP FUNCTION IF EXISTS PUBLIC.save_verses;
    DROP FUNCTION IF EXISTS PUBLIC.handle_new_user;
    DROP FUNCTION IF EXISTS PUBLIC.handle_new_project;
    DROP FUNCTION IF EXISTS PUBLIC.handle_new_book;
    DROP FUNCTION IF EXISTS PUBLIC.handle_next_step;
    DROP FUNCTION IF EXISTS PUBLIC.create_chapters;
    DROP FUNCTION IF EXISTS PUBLIC.create_verses;
    DROP FUNCTION IF EXISTS PUBLIC.get_verses;
    DROP FUNCTION IF EXISTS PUBLIC.go_to_next_step;

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
  -- функция возвращает твою максимальную роль на проекте
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

  -- возвращает, на каком шаге сейчас  юзер в конкретном проекте. Не знаю что будет, ели запустить сразу две главы в одном проекте
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
        AND chapters.started_at IS NOT NULL
        AND chapters.finished_at IS NULL
        AND project_translator_id = (SELECT id FROM project_translators WHERE project_translators.project_id = get_current_step.project_id AND user_id = auth.uid())
      GROUP BY books.id, chapters.id, verses.current_step, steps.id, projects.id;

      RETURN current_step;

    END;
  $$;

  -- получить все стихи переводчика
  CREATE FUNCTION PUBLIC.get_verses(project_id BIGINT, chapter int2, book PUBLIC.book_code) returns TABLE(verse_id bigint, num int2, verse text)
    LANGUAGE plpgsql security definer AS $$
    DECLARE
      verses_list RECORD;
      cur_chapter_id BIGINT;
    BEGIN
      IF authorize(auth.uid(), get_verses.project_id) IN ('user') THEN
        RETURN;
      END IF;

      SELECT chapters.id into cur_chapter_id
      FROM PUBLIC.chapters
      WHERE chapters.num = get_verses.chapter AND chapters.project_id = get_verses.project_id AND chapters.book_id = (SELECT id FROM PUBLIC.books WHERE books.code = get_verses.book AND books.project_id = get_verses.project_id);

      IF cur_chapter_id IS NULL THEN
        RETURN;
      END IF;

      return query SELECT verses.id as verse_id, verses.num, verses.text as verse
      FROM public.verses
      WHERE verses.project_translator_id = (SELECT id
      FROM PUBLIC.project_translators
      WHERE project_translators.user_id = auth.uid()
        AND project_translators.project_id = get_verses.project_id)
        AND verses.project_id = get_verses.project_id
        AND verses.chapter_id = cur_chapter_id
      ORDER BY verses.num;

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
  CREATE FUNCTION PUBLIC.divide_verses(divider VARCHAR, project_id BIGINT) RETURNS BOOLEAN
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

  -- Сохранить стих
  CREATE FUNCTION PUBLIC.save_verse(verse_id bigint, new_verse text) RETURNS boolean
    LANGUAGE plpgsql security definer AS $$

    BEGIN
      -- проверить что глава начата, что стих назначен переводчику
      UPDATE PUBLIC.verses SET "text" = save_verse.new_verse WHERE verses.id = save_verse.verse_id;

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

  -- для rls, функция которая разрешает что-то делать только админу
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

  -- для rls, функция которая проверяет, является ли юзер переводчиком стиха
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

  -- Функция для перехода на следующий шаг (проверим что юзер имеет право редактировать эти стихи, узнаем айди следующего шага, поменяем у всех стихов айди шага)
  CREATE FUNCTION PUBLIC.go_to_next_step(project TEXT, chapter int2, book PUBLIC.book_code) returns INTEGER
    LANGUAGE plpgsql security definer AS $$
    DECLARE
      proj_trans RECORD;
      cur_step int2;
      cur_chapter_id bigint;
      next_step RECORD;
    BEGIN

      SELECT
        project_translators.id, projects.id as project_id INTO proj_trans
      FROM
        PUBLIC.project_translators LEFT JOIN PUBLIC.projects ON (projects.id = project_translators.project_id)
      WHERE
        project_translators.user_id = auth.uid() AND projects.code = go_to_next_step.project;

      -- Есть ли такой переводчик на проекте
      IF proj_trans.id IS NULL THEN
        RETURN 0;
      END IF;

      -- получаем айди главы
      SELECT chapters.id into cur_chapter_id
      FROM PUBLIC.chapters
      WHERE chapters.num = go_to_next_step.chapter AND chapters.project_id = proj_trans.project_id AND chapters.book_id = (SELECT id FROM PUBLIC.books WHERE books.code = go_to_next_step.book AND books.project_id = proj_trans.project_id);

      -- валидация главы
      IF cur_chapter_id IS NULL THEN
        RETURN 0;
      END IF;

      SELECT
        sorting INTO cur_step
      FROM
        PUBLIC.verses LEFT JOIN PUBLIC.steps ON (steps.id = verses.current_step)
      WHERE verses.chapter_id = cur_chapter_id
        AND project_translator_id = proj_trans.id
      LIMIT 1;

      -- Есть ли закрепленные за ним стихи, и узнать на каком сейчас шаге
      IF cur_step IS NULL THEN
        RETURN 0;
      END IF;

      SELECT id, sorting into next_step
      FROM PUBLIC.steps
      WHERE steps.project_id = proj_trans.project_id
        AND steps.sorting > cur_step
      ORDER BY steps.sorting
      LIMIT 1;

      -- получить с базы, какой следующий шаг, если его нет то ничего не делать
      IF next_step.id IS NULL THEN
        RETURN cur_step;
      END IF;

      -- Если есть, то обновить в базе
      UPDATE PUBLIC.verses SET current_step = next_step.id WHERE verses.chapter_id = cur_chapter_id
        AND verses.project_translator_id = proj_trans.id;

      RETURN next_step.sorting;

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

  -- после перехода на новый шаг - сохраняем предыдущий в прогресс
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

  -- пакетно сохранить стихи
  CREATE FUNCTION PUBLIC.save_verses(verses json) returns BOOLEAN
    LANGUAGE plpgsql security definer AS $$
    DECLARE
    new_verses RECORD;
    BEGIN
      -- узнать айди переводчика на проекте
      -- узнать айди главы, которую переводим, убедиться что перевод еще в процессе
      -- в цикле обновить текст стихов, с учетом айди переводчика и главы

      FOR new_verses IN SELECT * FROM json_each_text(save_verses.verses)
      LOOP
        UPDATE
          PUBLIC.verses
        SET "text" = new_verses.value::text
        WHERE
          verses.id = new_verses.key::bigint;
      END LOOP;

      RETURN true;

    END;
  $$;

  -- создать стихи
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
      whole_chapter BOOLEAN DEFAULT true,
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
    DROP POLICY IF EXISTS "Стих получить может переводчик, координатор проекта, модератор и админ" ON PUBLIC.verses;

    CREATE policy "Стих получить может переводчик, координатор проекта, модератор и админ" ON PUBLIC.verses FOR
    SELECT
      TO authenticated USING (authorize(auth.uid(), project_id) != 'user');

    -- Создаются у нас стихи автоматом, так что никто не может добавлять

    -- Редактировать на прямую тоже запретим. Нам можно редактировать только два поля, текущий шаг и текст стиха

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
      created_at TIMESTAMP DEFAULT NOW()
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
      ('Vcana Bible', '{"simplified":true, "literal":false, "tnotes":false, "twords":false, "tquestions":false}', '[
        {
          "title": "1 ШАГ - ОБЗОР КНИГИ",
          "description": "для КОРРЕКТОРА МАТЕРИАЛОВ: убедиться, что материалы букпэкеджа подготовлены корректно и не содержат ошибок или каких-либо трудностей для использования переводчиками.\nдля ТЕСТОВОГО ПЕРЕВОДЧИКА: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.",
          "time": 60,
          "whole_chapter": true,
          "count_of_users": 1,
          "intro": "https://youtu.be/IAxFRRy5qw8\n\nЭто индивидуальная работа и выполняется до встречи с другими участниками команды КРАШ-ТЕСТА.\n\n\n\nЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: убедиться, что материалы букпэкеджа подготовлены корректно и не содержат ошибок или каких-либо трудностей для использования переводчиками.\n\nЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.\n\n\n\n\n\nОБЩИЙ ОБЗОР К КНИГЕ\n\nПрочитайте общий обзор к книге. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в общем обзоре к книге.\n\nЭто задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно. \n\n\n\nОБЗОР К ГЛАВЕ\n\nПрочитайте обзор к главе. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в обзоре к главе.\n\n\n\nЧТЕНИЕ ДОСЛОВНОЙ БИБЛИИ РОБ-Д (RLOB)\n\nПрочитайте ГЛАВУ ДОСЛОВНОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nЧТЕНИЕ СМЫСЛОВОЙ БИБЛИИ РОБ-С (RSOB)\n\nПрочитайте ГЛАВУ СМЫСЛОВОЙ БИБЛИИ. Запишите для обсуждения командой предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА»\n\nПрочитайте СЛОВА к главе. Необходимо прочитать статьи к каждому слову. Отметьте для обсуждения командой статьи к словам, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ»\n\nПрочитайте ЗАМЕТКИ к главе. Необходимо прочитать ЗАМЕТКИ к каждому отрывку. Отметьте для обсуждения командой ЗАМЕТКИ, которые могут быть полезными для перевода Писания. Также отметьте найденные ошибки или неточности в этом инструменте.","config": [
            {
              "size": 4,
              "tools": [
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "literal",
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
          "title": "2 ШАГ - КОМАНДНОЕ ИЗУЧЕНИЕ ТЕКСТА",
          "description": "для КОРРЕКТОРА МАТЕРИАЛОВ: обсудить с командой материалы букпэкеджа.\nдля ТЕСТОВОГО ПЕРЕВОДЧИКА: обсудить командой общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к началу перевода.",
          "time": 120,
          "whole_chapter": true,
          "count_of_users": 4,
          "intro": "https://youtu.be/d6kvUVRttUw\n\nЭто командная работа и мы рекомендуем потратить на нее не более 120 минут.\n\n\n\nЦЕЛЬ этого шага для КОРРЕКТОРА МАТЕРИАЛОВ: обсудить с командой материалы букпэкеджа. Для этого поделитесь заметками, которые вы сделали при индивидуальной работе. Обсудите все предложенные правки по инструментам букпэкеджа. Запишите командное резюме по ним для передачи команде, работающей над букпэкеджом.\n\nЦЕЛЬ этого шага для ТЕСТОВОГО ПЕРЕВОДЧИКА: обсудить командой общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к началу перевода.\n\n\n\n\n\nОБЩИЙ ОБЗОР К КНИГЕ - Обсудите ОБЩИЙ ОБЗОР К КНИГЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения этого инструмента. Также обсудите найденные ошибки или неточности в общем обзоре к книге. Уделите этому этапу 10 минут.\n\nЭто задание выполняется только при работе над первой главой. При работе над другими главами книги возвращаться к общему обзору книги не нужно.\n\n\n\nОБЗОР К ГЛАВЕ - Обсудите ОБЗОР К ГЛАВЕ. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в общем обзоре к главе. Уделите этому этапу 10 минут.\n\n\n\nЧТЕНИЕ РОБ-Д (RLOB) - Прочитайте вслух ГЛАВУ ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 20 мин.\n\n\n\nЧТЕНИЕ РОБ-С (RSOB) - Прочитайте вслух ГЛАВУ СМЫСЛОВОГО ПЕРЕВОДА БИБЛИИ РОБ-С (RSOB). Обсудите предложения, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Используйте свои заметки с самостоятельного изучения этого перевода. Уделите этому этапу 10 мин.\n\n\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Обсудите инструмент СЛОВА. Что полезного для перевода вы нашли в этих статьях? Используйте свои заметки с самостоятельного изучения. Также обсудите найденные ошибки или неточности в статьях этого инструмента. Уделите этому этапу 60 минут.\n\n\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Обсудите инструмент ЗАМЕТКИ. Что полезного для перевода вы нашли в ЗАМЕТКАХ. Используйте свои записи по этому инструменту с самостоятельного изучения. Также обсудите найденные ошибки или неточности в этом инструменте. Уделите этому этапу 10 минут.\n\n","config": [
            {
              "size": 4,
              "tools": [
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "literal",
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
          "title": "3 ШАГ - ПОДГОТОВКА К ПЕРЕВОДУ",
          "description": "подготовиться к переводу текста естественным языком.",
          "time": 30,
          "whole_chapter": false,
          "count_of_users": 2,
          "intro": "https://youtu.be/ujMGcdkGGhI\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.\n\nВ этом шаге вам необходимо выполнить два задания.\n\n\n\nПЕРЕСКАЗ НА РУССКОМ - Прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB). Если необходимо - изучите отрывок вместе со всеми инструментами, чтобы как можно лучше передать этот текст более естественным русским языком. Перескажите смысл отрывка своему напарнику, используя максимально понятные и естественные слова русского языка. Не старайтесь пересказывать в точности исходный текст ДОСЛОВНОГО ПЕРЕВОДА. Перескажите текст в максимальной для себя простоте.\n\nПосле этого послушайте вашего напарника, пересказывающего свой отрывок. \n\nНе обсуждайте ваши пересказы - это только проговаривание и слушание.\n\n\n\nПЕРЕСКАЗ НА ЦЕЛЕВОМ - Еще раз просмотрите ваш отрывок. Теперь в СМЫСЛОВОМ ПЕРЕВОДЕ БИБЛИИ РОБ-С (RSOB) и подумайте, как пересказать этот текст на языке, на который делается перевод, помня о Резюме к переводу о стиле языка. \n\nПерескажите ваш отрывок напарнику на целевом языке, используя максимально понятные и естественные слова этого языка. Передайте всё, что вы запомнили, не подглядывая в текст. \n\nЗатем послушайте вашего напарника, пересказывающего свой отрывок таким же образом.\n\nНе обсуждайте ваши пересказы - это только проговаривание и слушание.\n\n","config": [
            {
              "size": 4,
              "tools": [
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "literal",
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
          "title": "4 ШАГ - НАБРОСОК «ВСЛЕПУЮ»",
          "description": "сделать первый набросок в первую очередь естественным языком.",
          "time": 20,
          "whole_chapter": false,
          "count_of_users": 1,
          "intro": "https://youtu.be/3RJQxjnxJ-I\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 20 минут.\n\n\n\nЦЕЛЬ этого шага: сделать первый набросок в первую очередь естественным языком.\n\n\n\nРОБ-Д + НАБРОСОК «ВСЛЕПУЮ» - Еще раз прочитайте ваш отрывок в ДОСЛОВНОМ ПЕРЕВОДЕ БИБЛИИ РОБ-Д (RLOB) и если вам необходимо, просмотрите все инструменты к этому отрывку. Как только вы будете готовы сделать «набросок», перейдите на панель «слепого» наброска и напишите ваш перевод на своем языке, используя максимально понятные и естественные слова вашего языка. Пишите по памяти. Не подглядывайте! Главная цель этого шага - естественность языка. Не бойтесь ошибаться! Ошибки на этом этапе допустимы. Точность перевода будет проверена на следующих шагах работы над текстом. \n\n","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "simplified",
                  "config": {
                    "draft":true
                  }
                },
                {
                  "name": "literal",
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
                  "name": "draftTranslate",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "5 ШАГ - САМОПРОВЕРКА",
          "description": "поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным.",
          "time": 30,
          "whole_chapter": false,
          "count_of_users": 1,
          "intro": "https://youtu.be/WgvaOH9Lnpc\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным.\n\n\n\nПроверьте ваш перевод на ТОЧНОСТЬ, сравнив с текстом - ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB). При необходимости используйте все инструменты к переводу. Оцените по вопросам: ничего не добавлено, ничего не пропущено, смысл не изменён? Если есть ошибки, исправьте.\n\n\n\nПрочитайте ВОПРОСЫ и ответьте на них, глядя в свой текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте.\n\n\n\nПосле этого прочитайте себе ваш перевод вслух и оцените - звучит ли ваш текст ПОНЯТНО И ЕСТЕСТВЕННО? Если нет, то исправьте.\n\n\n\nПерейдите к следующему вашему отрывку и повторите шаги Подготовка-Набросок-Проверка со всеми вашими отрывками до конца главы.\n\n","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "literal",
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
          "title": "6 ШАГ - ВЗАИМНАЯ ПРОВЕРКА",
          "description": "улучшить набросок перевода, пригласив другого человека, чтобы проверить перевод на точность и естественность.",
          "time": 40,
          "whole_chapter": false,
          "count_of_users": 2,
          "intro": "https://youtu.be/xtgTo3oWxKs\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 40 минут.\n\n\n\nЦЕЛЬ этого шага: улучшить набросок перевода, пригласив другого человека, чтобы проверить перевод на точность и естественность.\n\n\n\nПРОВЕРКА НА ТОЧНОСТЬ - Прочитайте вслух свой текст напарнику, который параллельно следит за текстом ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д(RLOB) и обращает внимание только на ТОЧНОСТЬ перевода. \n\nОбсудите текст насколько он точен. \n\nИзменения в текст вносит переводчик, работавший над ним. Если не удалось договориться о каких-либо изменениях, оставьте этот вопрос для обсуждения всей командой.\n\nПоменяйтесь ролями и поработайте над отрывком партнёра.\n\n\n\nПРОВЕРКА НА ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ - Еще раз прочитайте вслух свой текст напарнику, который теперь не смотрит ни в какой текст, а просто слушает ваше чтение вслух, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка.\n\nОбсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте.\n\nПоменяйтесь ролями и поработайте над отрывком партнёра.\n\n\n\n\n\n_Примечание к шагу:_ \n\n- Не влюбляйтесь в свой текст. Будьте гибкими к тому, чтобы слышать другое мнение и улучшать свой набросок перевода.  Это групповая работа и текст должен соответствовать пониманию большинства в вашей команде. Если даже будут допущены ошибки в этом случае, то на проверках последующих уровней они будут исправлены.\n\n- Если в работе с напарником вам не удалось договориться по каким-то вопросам, касающихся текста, оставьте этот вопрос на обсуждение со всей командой. Ваша цель - не победить напарника, а с его помощью улучшить перевод.\n\n","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "literal",
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
          "title": "7 ШАГ - ПРОВЕРКА КЛЮЧЕВЫХ СЛОВ",
          "description": "всей командой улучшить перевод, выслушав больше мнений относительно самых важных слов и фраз в переводе, а также решить разногласия, оставшиеся после взаимопроверки.",
          "time": 30,
          "whole_chapter": true,
          "count_of_users": 4,
          "intro": "https://youtu.be/w5766JEVCyU\n\nЭто командная работа и мы рекомендуем потратить на нее не более 30 минут.\n\n\n\nЦЕЛЬ этого шага: всей командой улучшить перевод, выслушав больше мнений относительно самых важных слов и фраз в переводе, а также решить разногласия, оставшиеся после взаимопроверки.\n\n\n\nПРОВЕРКА ТЕКСТА ПО КЛЮЧЕВЫМ СЛОВАМ - Прочитайте текст всех переводчиков по очереди всей командой. Проверьте перевод на наличие ключевых слов из инструмента СЛОВА. Все ключевые слова на месте? Все ключевые слова переведены корректно?\n\nКоманда принимает решения, как переводить эти слова или фразы – переводчик вносит эти изменения в свой отрывок. В некоторых случаях, вносить изменения вносить изменения, которые принимает команда, может один человек, выбранный из переводчиков. \n\n","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "literal",
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
          "title": "8 ШАГ - КОМАНДНЫЙ ОБЗОР ПЕРЕВОДА",
          "description": "улучшить перевод, приняв решения командой о трудных словах или фразах, делая текст хорошим как с точки зрения точности, так и с точки зрения естественности. Это финальный шаг в работе над текстом.",
          "time": 60,
          "whole_chapter": true,
          "count_of_users": 4,
          "intro": "https://youtu.be/EiVuJd9ijF0\n\nЭто командная работа и мы рекомендуем потратить на нее не более 60 минут.\n\nЦЕЛЬ этого шага: улучшить перевод, приняв решения командой о трудных словах или фразах, делая текст хорошим как с точки зрения точности, так и с точки зрения естественности. Это финальный шаг в работе над текстом.\n\n\n\nПРОВЕРКА НА ТОЧНОСТЬ - Прочитайте вслух свой текст команде. Команда в это время смотрит в текст ДОСЛОВНОГО ПЕРЕВОДА БИБЛИИ РОБ-Д (RLOB) и обращает внимание только на ТОЧНОСТЬ перевода. \n\nОбсудите текст насколько он точен. Если есть ошибки в вашем тексте, исправьте. Всей командой проверьте на точность работу каждого члена команды, каждую законченную главу.\n\n\n\nПрочитайте ВОПРОСЫ и ответьте на них, глядя в ваш текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте.\n\n\n\nПРОВЕРКА НА ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ - Еще раз прочитайте вслух свой текст команде, которая теперь не смотрит ни в какой текст, а просто слушает, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка. Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте. Проработайте каждую главу/ каждый отрывок, пока команда не будет довольна результатом.\n\n\n\nПримечание к шагу: \n\n- Не оставляйте текст с несколькими вариантами перевода предложения или слова. После восьмого шага не должны оставаться нерешенные вопросы. Текст должен быть готовым к чтению. \n\n",
          "config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "simplified",
                  "config": {}
                },
                {
                  "name": "literal",
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
      ]', 'bible'::project_type),
      ('Vcana OBS', '{"obs":true, "tnotes":false, "twords":false, "tquestions":false}', '[
        {
          "title": "Шаг 1: Самостоятельное изучение",
          "description": "понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.",
          "time": 60,
          "whole_chapter": true,
          "count_of_users": 1,
          "intro": "# Первый шаг - самостоятельное изучение\n\nhttps://www.youtube.com/watch?v=gxawAAQ9xbQ\n\nЭто индивидуальная работа и выполняется без участия других членов команды. Каждый читает материалы самостоятельно, не обсуждая прочитанное, но записывая свои комментарии. Если ваш проект по переводу ведется онлайн, то этот шаг можно выполнить до встречи с другими участниками команды переводчиков.\n\nЦЕЛЬ этого шага: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.\n\nЗАДАНИЯ ДЛЯ ПЕРВОГО ШАГА:\n\nВ этом шаге вам необходимо выполнить несколько заданий:\n\nИСТОРИЯ - Прочитайте историю (главу, над которой предстоит работа). Запишите для обсуждения командой предложения и слова, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков.\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Прочитайте СЛОВА к главе. Необходимо прочитать статьи к каждому слову. Отметьте для обсуждения командой статьи к словам, которые могут быть полезными для перевода Открытых Библейских Историй.\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Прочитайте ЗАМЕТКИ к главе. Необходимо прочитать ЗАМЕТКИ к каждому отрывку. Отметьте для обсуждения командой ЗАМЕТКИ, которые могут быть полезными для перевода Открытых Библейских Историй.","config": [
            {
              "size": 4,
              "tools": [
                {
                  "name": "obs",
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
          "description": "хорошо понять смысл текста и слов всей командой, а также принять командное решение по переводу некоторых слов перед тем, как начать основную работу.",
          "time": 60,
          "whole_chapter": true,
          "count_of_users": 4,
          "intro": "# Второй шаг - командное изучение текста\n\nhttps://www.youtube.com/watch?v=HK6SXnU5zEw\n\nЭто командная работа и мы рекомендуем потратить на нее не более 60 минут.\n\nЦЕЛЬ этого шага: хорошо понять смысл текста и слов всей командой, а также принять командное решение по переводу некоторых слов перед тем, как начать основную работу.\n\nЗАДАНИЯ ДЛЯ ВТОРОГО ШАГА:\n\nВ этом шаге вам необходимо выполнить несколько заданий.\n\nИСТОРИЯ - Прочитайте вслух историю(главу, над которой предстоит работа). Обсудите предложения и слова, которые могут вызвать трудности при переводе или которые требуют особого внимания от переводчиков. Уделите этому этапу 20 минут.\n\nОБЗОР ИНСТРУМЕНТА «СЛОВА» - Обсудите инструмент СЛОВА. Что полезного для перевода вы нашли в этих статьях? Используйте свои комментарии с самостоятельного изучения. Уделите этому этапу 20 минут.\n\nОБЗОР ИНСТРУМЕНТА «ЗАМЕТКИ» - Обсудите инструмент ЗАМЕТКИ. Что полезного для перевода вы нашли в ЗАМЕТКАХ. Используйте свои комментарии по этому инструменту с самостоятельного изучения. Уделите этому этапу 20 минут.","config": [
            {
              "size": 4,
              "tools": [
                {
                  "name": "obs",
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
          "description": "подготовиться к переводу текста естественным языком.",
          "time": 20,
          "whole_chapter": false,
          "count_of_users": 2,
          "intro": "# ТРЕТИЙ шаг - ПОДГОТОВКА К ПЕРЕВОДУ\n\nhttps://www.youtube.com/watch?v=jlhwA9SIWXQ\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 20 минут.\n\nЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.\n\nВ этом шаге вам необходимо выполнить два задания.\n\nПервое задание - ПЕРЕСКАЗ НА РУССКОМ - Прочитайте ваш отрывок из главы в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ. Если необходимо - изучите отрывок вместе со всеми инструментами, чтобы как можно лучше понять этот текст. Перескажите смысл отрывка своему напарнику, используя максимально понятные и естественные слова русского языка. Не старайтесь пересказывать в точности исходный текст. Перескажите текст в максимальной для себя простоте. После этого послушайте вашего напарника, пересказывающего свой отрывок.\n\nУделите этому этапу 10 минут. Не обсуждайте ваши пересказы. В этом шаге только проговаривание текста и слушание.\n\nВторое задание - ПЕРЕСКАЗ НА ЦЕЛЕВОМ - Еще раз просмотрите ваш отрывок или главу в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ, и подумайте, как пересказать этот текст на языке, на который делается перевод, помня о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу) и о стиле языка.\n\nПерескажите ваш отрывок напарнику на целевом языке, используя максимально понятные и естественные слова этого языка. Передайте всё, что вы запомнили, не подглядывая в текст. Затем послушайте вашего напарника, пересказывающего свой отрывок таким же образом. Уделите этому этапу 10 минут. Не обсуждайте ваши пересказы. В этом шаге только проговаривание текста и слушание.","config": [
            {
              "size": 4,
              "tools": [
                {
                  "name": "obs",
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
          "description": "сделать первый набросок естественным языком.",
          "time": 20,
          "whole_chapter": false,
          "count_of_users": 1,
          "intro": "# ЧЕТВЕРТЫЙ ШАГ - НАБРОСОК «ВСЛЕПУЮ»\n\nhttps://www.youtube.com/watch?v=HVXOiKUsXSI\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 20 минут.\n\nЦЕЛЬ этого шага: сделать первый набросок естественным языком.\n\nЕще раз прочитайте ваш отрывок  или главу в ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЯХ. Если вам необходимо, просмотрите все инструменты к этому отрывку. Как только вы будете готовы сделать «набросок», перейдите на панель «слепого» наброска в программе Translation Studio или в другой программе, в которой вы работаете и напишите ваш перевод на своем языке, используя максимально понятные и естественные слова вашего языка. Пишите по памяти. Не подглядывайте!\n\nГлавная цель этого шага - естественность языка. Не бойтесь ошибаться! Ошибки на этом этапе допустимы. Точность перевода будет проверена на следующих шагах работы над текстом.","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "obs",
                  "config": {
                    "draft":true
                  }
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
                  "name": "draftTranslate",
                  "config": {}
                }
              ]
            }
          ]
        },
        {
          "title": "Шаг 5: Самостоятельная проверка",
          "description": "поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным.",
          "time": 30,
          "whole_chapter": false,
          "count_of_users": 1,
          "intro": "# ПЯТЫЙ ШАГ - САМОСТОЯТЕЛЬНАЯ ПРОВЕРКА\n\nhttps://www.youtube.com/watch?v=p3p8c_K-O3c\n\nЭто индивидуальная работа и мы рекомендуем потратить на нее не более 30 минут.\n\nЦЕЛЬ этого шага: поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным.\n\nВ этом шаге вам необходимо выполнить три задания.\n\nЗадание первое. Проверьте ваш перевод на ТОЧНОСТЬ, сравнив с текстом ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке. При необходимости используйте все инструменты к переводу. Оцените по вопросам: ничего не добавлено, ничего не пропущено, смысл не изменён? Если есть ошибки, исправьте. Уделите этому заданию 10 минут.\n\nЗадание второе. Прочитайте ВОПРОСЫ и ответьте на них, глядя в свой текст. Сравните с ответами. Если есть ошибки в вашем тексте, исправьте. Уделите этому заданию 10 минут.\n\nЗадание третье. Прочитайте себе ваш перевод вслух и оцените - звучит ли ваш текст ПОНЯТНО И ЕСТЕСТВЕННО? Если нет, то исправьте. Уделите этому заданию 10 минут.","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "obs",
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
          "description": "улучшить набросок перевода, пригласив другогого человека, чтобы проверить перевод на точность и естественность.",
          "time": 40,
          "whole_chapter": false,
          "count_of_users": 2,
          "intro": "# ШЕСТОЙ ШАГ - ВЗАИМНАЯ ПРОВЕРКА\n\nhttps://www.youtube.com/watch?v=cAgypQsWgQk\n\nЭто работа в паре и мы рекомендуем потратить на нее не более 40 минут.\n\nЦЕЛЬ этого шага: улучшить набросок перевода, пригласив другогого человека, чтобы проверить перевод на точность и естественность.\n\nВ этом шаге вам необходимо выполнить два задания.\n\nЗадание первое - Прочитайте вслух свой текст напарнику, который параллельно следит за текстом ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке и обращает внимание только на ТОЧНОСТЬ вашего перевода. Обсудите текст насколько он точен. Изменения в текст вносит переводчик, работавший над ним. Если не удалось договориться о каких-либо изменениях, оставьте этот вопрос для обсуждения всей командой. Поменяйтесь ролями и поработайте над отрывком партнёра. Уделите этому заданию 20 минут.\n\nЗадание второе - Еще раз прочитайте вслух свой текст напарнику, который теперь не смотрит ни в какой текст, а просто слушает ваше чтение вслух, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка. Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте. Поменяйтесь ролями и поработайте над отрывком партнёра. Уделите этому заданию 20 минут.\n\nПримечание к шагу:\n\n- Не влюбляйтесь в свой текст. Будьте гибкими к тому, чтобы слышать другое мнение и улучшать свой набросок перевода.  Это групповая работа и текст должен соответствовать пониманию большинства в вашей команде. Если даже будут допущены ошибки в этом случае, то на проверках последующих уровней они будут исправлены.\n- Если в работе с напарником вам не удалось договориться по каким-то вопросам, касающихся текста, оставьте этот вопрос на обсуждение со всей командой. Ваша цель - не победить напарника, а с его помощью улучшить перевод.","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "obs",
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
          "description": "улучшить перевод, приняв решения командой о трудных словах или фразах, делая текст хорошим как с точки зрения точности, так и с точки зрения естественности. Это финальный шаг в работе над текстом.",
          "time": 60,
          "whole_chapter": true,
          "count_of_users": 4,
          "intro": "# СЕДЬМОЙ шаг - КОМАНДНЫЙ ОБЗОР ПЕРЕВОДА\n\nhttps://www.youtube.com/watch?v=P2MbEKDw8U4\n\nЭто командная работа и мы рекомендуем потратить на нее не более 60 минут.\n\nЦЕЛЬ этого шага: улучшить перевод, приняв решения командой о трудных словах или фразах, делая текст хорошим как с точки зрения точности, так и с точки зрения естественности. Это финальный шаг в работе над текстом.\n\nВ этом шаге вам необходимо выполнить три задания.\n\nЗадание первое - Прочитайте вслух свой текст команде. Команда в это время смотрит в текст ОТКРЫТЫХ БИБЛЕЙСКИХ ИСТОРИЙ на русском языке и обращает внимание только на ТОЧНОСТЬ вашего перевода.Обсудите текст насколько он точен. Если есть ошибки в вашем тексте, исправьте. Всей командой проверьте на точность работу каждого члена команды. Уделите этому заданию 20 минут.\n\nЗадание второе - Проверьте вместе с командой ваш перевод на наличие ключевых слов из инструмента СЛОВА. Все ключевые слова на месте? Все ключевые слова переведены корректно? Уделите этому заданию 20 минут.\n\nЗадание третье - Еще раз прочитайте вслух свой текст команде, которая теперь не смотрит ни в какой текст, а просто слушает, обращая внимание на ПОНЯТНОСТЬ и ЕСТЕСТВЕННОСТЬ языка. Обсудите текст, помня о целевой аудитории и о КРАТКОМ ОПИСАНИИ ПЕРЕВОДА (Резюме к переводу). Если есть ошибки в вашем тексте, исправьте. Проработайте каждую главу/каждый отрывок, пока команда не будет довольна результатом. Уделите этому заданию 20 минут.\n\nПримечание к шагу:\n\n- Не оставляйте текст с несколькими вариантами перевода предложения или слова. После седьмого шага не должны оставаться нерешенные вопросы. Текст должен быть готовым к чтению.","config": [
            {
              "size": 3,
              "tools": [
                {
                  "name": "obs",
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
      ]', 'obs'::project_type);
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

  -- PROJECTS

  -- PROJECT TRANSLATORS
    DELETE FROM
      PUBLIC.project_translators;

  -- END PROJECT TRANSLATORS

  -- PROJECT COORDINATORS
    DELETE FROM
      PUBLIC.project_coordinators;

  -- END PROJECT COORDINATORS

  -- STEPS
    DELETE FROM
      PUBLIC.steps;

  -- END STEPS

  -- BOOKS
    DELETE FROM
      PUBLIC.books;

  -- END BOOKS

  -- CHAPTERS
    DELETE FROM
      PUBLIC.chapters;

  -- END CHAPTERS

  -- VERSES
    DELETE FROM
      PUBLIC.verses;

  -- END VERSES

  -- PROGRESS
    DELETE FROM
      PUBLIC.progress;

  -- END PROGRESS
-- END DUMMY DATA
