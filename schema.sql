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
    DROP TABLE IF EXISTS PUBLIC.personal_notes;
    DROP TABLE IF EXISTS PUBLIC.team_notes;
    DROP TABLE IF EXISTS PUBLIC.projects;
    DROP TABLE IF EXISTS PUBLIC.methods;
    DROP TABLE IF EXISTS PUBLIC.users;
    DROP TABLE IF EXISTS PUBLIC.role_permissions;
    DROP TABLE IF EXISTS PUBLIC.languages;    


  -- EDN DROP TABLE

  -- DROP TRIGGER
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS on_public_project_created ON PUBLIC.projects;
    DROP TRIGGER IF EXISTS on_public_verses_next_step ON PUBLIC.verses;
    DROP TRIGGER IF EXISTS on_public_personal_notes_update ON PUBLIC.personal_notes;

  -- END DROP TRIGGER

  -- DROP FUNCTION
    DROP FUNCTION IF EXISTS PUBLIC.authorize;
    DROP FUNCTION IF EXISTS PUBLIC.has_access;
    DROP FUNCTION IF EXISTS PUBLIC.set_moderator;
    DROP FUNCTION IF EXISTS PUBLIC.check_confession;
    DROP FUNCTION IF EXISTS PUBLIC.check_agreement;
    DROP FUNCTION IF EXISTS PUBLIC.admin_only;
    DROP FUNCTION IF EXISTS PUBLIC.block_user;
    DROP FUNCTION IF EXISTS PUBLIC.can_translate;
    DROP FUNCTION IF EXISTS PUBLIC.create_chapters;
    DROP FUNCTION IF EXISTS PUBLIC.create_verses;
    DROP FUNCTION IF EXISTS PUBLIC.handle_new_user;
    DROP FUNCTION IF EXISTS PUBLIC.handle_new_project;
    DROP FUNCTION IF EXISTS PUBLIC.handle_next_step;
    DROP FUNCTION IF EXISTS PUBLIC.handle_update_personal_notes;    
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

  -- установить переводчика модератором. Проверить что такой есть, что устанавливает админ или координатор. Иначе вернуть FALSE. Условие что только один модератор на проект мы решили делать на уровне интерфейса а не базы. Оставить возможность чтобы модераторов было больше 1.
  CREATE FUNCTION PUBLIC.set_moderator(user_id uuid, project_id bigint) returns BOOLEAN
    LANGUAGE plpgsql security definer AS $$
    DECLARE
      usr RECORD;
      new_val BOOLEAN;
    BEGIN
      IF authorize(auth.uid(), set_moderator.project_id) NOT IN ('admin', 'coordinator') THEN
        RETURN FALSE;
      END IF;
      SELECT id, is_moderator INTO usr FROM PUBLIC.project_translators WHERE project_translators.project_id = set_moderator.project_id AND project_translators.user_id = set_moderator.user_id;
      IF usr.id IS NULL THEN
        RETURN FALSE;
      END IF;
      new_val := NOT usr.is_moderator;
      UPDATE PUBLIC.project_translators SET is_moderator = new_val WHERE project_translators.id = usr.id;

      RETURN new_val;

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

  -- после создания проекта создаем бриф?? repeat
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

 -- update changed_at to current time/data when personal_notes is updating
  CREATE FUNCTION PUBLIC.handle_update_personal_notes() returns TRIGGER
    LANGUAGE plpgsql security definer AS $$ BEGIN
      NEW.changed_at:=NOW();

      RETURN NEW;

    END;
  $$;  

  -- создать стихи главы
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
        ORDER BY steps.order ASC
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
      id bigint generated BY DEFAULT AS identity primary key,
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
      id bigint generated BY DEFAULT AS identity primary key,
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
      id bigint generated BY DEFAULT AS identity primary key,
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
      id bigint generated BY DEFAULT AS identity primary key,
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
      id bigint generated BY DEFAULT AS identity primary key,
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
      id bigint generated BY DEFAULT AS identity primary key,
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
      id bigint generated BY DEFAULT AS identity primary key,
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
      id bigint generated BY DEFAULT AS identity primary key,
      title text NOT NULL,
      "description" text DEFAULT NULL,
      intro text DEFAULT NULL,
      count_of_users int2 NOT NULL,
      "time" int2 NOT NULL,
      project_id bigint REFERENCES PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      config json NOT NULL,
      "order" int2 NOT NULL,
        UNIQUE (project_id, "order")
    );

    COMMENT ON COLUMN public.steps.order
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
      id bigint generated BY DEFAULT AS identity primary key,
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
      id bigint generated BY DEFAULT AS identity primary key,
      num int2 NOT NULL,
      book_id bigint REFERENCES PUBLIC.books ON
      DELETE
        CASCADE NOT NULL,
      project_id bigint references PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      "text" text DEFAULT NULL,
      verses integer,
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
      id bigint generated BY DEFAULT AS identity primary key,
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
      id bigint generated BY DEFAULT AS identity primary key,
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

-- PERSONAL NOTES
  -- TABLE
    CREATE TABLE PUBLIC.personal_notes (
      id text NOT NULL primary key,
      user_id uuid references PUBLIC.users ON
      DELETE
        CASCADE NOT NULL,
      title text DEFAULT NULL,
      data json DEFAULT NULL,
      created_at TIMESTAMP DEFAULT now(),
      changed_at TIMESTAMP DEFAULT now(),
      is_folder BOOLEAN DEFAULT FALSE,
      parent_id text DEFAULT NULL
    );
    ALTER TABLE
      PUBLIC.personal_notes enable ROW LEVEL security;
  -- END TABLE

  -- RLS
    
    DROP POLICY IF EXISTS "Залогиненый юзер может добавить личную заметку" ON PUBLIC.personal_notes;

    CREATE policy "Залогиненый юзер может добавить личную заметку" ON PUBLIC.personal_notes FOR
    INSERT
      TO authenticated WITH CHECK (TRUE); 
   
    DROP POLICY IF EXISTS "Залогиненый юзер может удалить личную заметку" ON PUBLIC.personal_notes;

    CREATE policy "Залогиненый юзер может удалить личную заметку" ON PUBLIC.personal_notes FOR
    DELETE
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Залогиненый юзер может изменить личную заметку" ON PUBLIC.personal_notes;

    CREATE policy "Залогиненый юзер может изменить личную заметку" ON PUBLIC.personal_notes FOR
    UPDATE
      USING (auth.uid() = user_id);


    DROP POLICY IF EXISTS "Показывать личные заметки данного пользователя" ON PUBLIC.personal_notes;

    CREATE policy "Показывать личные заметки данного пользователя" ON PUBLIC.personal_notes FOR
    SELECT
     USING (auth.uid() = user_id);

  -- END RLS
-- PERSONAL NOTES

-- TEAM NOTES
  -- TABLE
    CREATE TABLE PUBLIC.team_notes (
      id text NOT NULL primary key,
      project_id bigint references PUBLIC.projects ON
      DELETE
        CASCADE NOT NULL,
      title text DEFAULT NULL,
      data json DEFAULT NULL,
      created_at TIMESTAMP DEFAULT now(),
      is_folder BOOLEAN DEFAULT FALSE,
      parent_id text DEFAULT NULL
    );
    ALTER TABLE
      PUBLIC.team_notes enable ROW LEVEL security;
  -- END TABLE

  -- RLS
    --Администратор или координатор может добавить командную заметку
    DROP POLICY IF EXISTS "team_notes insert" ON PUBLIC.team_notes;
    CREATE policy "team_notes insert" ON PUBLIC.team_notes FOR
    INSERT
      WITH CHECK (authorize(auth.uid(), project_id) IN ('admin', 'coordinator', 'moderator')); 

    --Администратор или координатор может удалить командную заметку
    DROP POLICY IF EXISTS "team_notes delete" ON PUBLIC.team_notes;
    CREATE policy "team_notes delete" ON PUBLIC.team_notes FOR
    DELETE
      USING (authorize(auth.uid(), project_id) IN ('admin', 'coordinator', 'moderator'));  

    --Администратор или координатор может изменить командную заметку
    DROP POLICY IF EXISTS "team_notes update" ON PUBLIC.team_notes;
    CREATE policy "team_notes update" ON PUBLIC.team_notes FOR
    UPDATE
      USING (authorize(auth.uid(), project_id) IN ('admin', 'coordinator', 'moderator'));

    --Все на проекте могут читать командные заметки
    DROP POLICY IF EXISTS "team_notes select" ON PUBLIC.team_notes;
    CREATE policy "team_notes select" ON PUBLIC.team_notes FOR
    SELECT
     USING (authorize(auth.uid(), project_id) != 'user'); 

  -- END RLS
-- TEAM NOTES



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

  -- trigger the function every time a project is created

  CREATE TRIGGER on_public_verses_next_step AFTER
  UPDATE
    ON PUBLIC.verses FOR each ROW EXECUTE FUNCTION PUBLIC.handle_next_step();

  -- trigger the function every time a note is update

  CREATE TRIGGER on_public_personal_notes_update BEFORE
  UPDATE
    ON PUBLIC.personal_notes FOR each ROW EXECUTE FUNCTION PUBLIC.handle_update_personal_notes();
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
        'b68180b0-49dc-4124-868f-b15b177b6d8e',
        'Translator0',
        'translator0@mail.com',
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
        '9116f676-716d-470c-b3d0-2d07325d5b10',
        'Coordinator0',
        'coordinator0@mail.com',
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
        '689b2ba5-717e-4237-ba3f-d5fa6a55600b',
        'Admin0',
        'admin0@mail.com',
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
        'be6688c3-1864-4fff-a03f-c49ddd53e2d0',
        'Moderator0',
        'moderator0@mail.com',
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
      ('Vcana Bible', '{"literal":false, "simplified":true, "tn":false}', '[
      {
        "title": "Шаг один. Читаем вместе",
        "description": "Some text here...",
        "time": 60,
        "count_of_users": 4,
        "intro": "# Intro\n\n### How To Start\n\nSome text here\n\nhttps://youtu.be/sDcfb_f-f",
        "config": [
          {
            "size": 4,
            "tools": [
              {
                "name": "literal",
                "config": {}
              }
            ]
          },
          {
            "size": 2,
            "tools": [
              {
                "name": "notepad",
                "config": {"team": true}
              },
              {
                "name": "notepad",
                "config": {}
              }
            ]
          }
        ]
      },
      {
        "title": "Шаг два. Набросок",
        "description": "Some text here2...",
        "time": 30,
        "count_of_users": 2,
        "intro": "# Intro\n\n### Как сделать набросок\n\nSome text here\n\nhttps://youtu.be/sDcfb_f-f",
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
                "name": "tn",
                "config": {}
              }
            ]
          },
          {
            "size": 3,
            "tools": [
              {
                "name": "editor",
                "config": {"type":"blind"}
              },
              {
                "name": "dictionary",
                "config": {}
              }
            ]
          }
        ]
      }]', 'bible'::project_type),
      ('Vcana OBS', '{"obs":true, "tw":false, "tq":false}', '[
      {
        "title": "Шаг один. Читаем вместе OBS",
        "description": "Some text here...",
        "time": 45,
        "count_of_users": 4,
        "intro": "# Intro\n\n### How To Start\n\nSome text here\n\nhttps://youtu.be/sDcfb_f-f",
        "config": [
          {
            "size": 4,
            "tools": [
              {
                "name": "obs",
                "config": {}
              },
              {
                "name": "tw",
                "config": {}
              },
              {
                "name": "tq",
                "config": {}
              }
            ]
          },
          {
            "size": 2,
            "tools": [
              {
                "name": "notepad",
                "config": {}
              }
            ]
          }
        ]
      },
      {
        "title": "Шаг два. Набросок OBS",
        "description": "Some text here2...",
        "time": 30,
        "count_of_users": 2,
        "intro": "# Intro\n\n### Как сделать набросок\n\nSome text here\n\nhttps://youtu.be/sDcfb_f-f",
        "config": [
          {
            "size": 3,
            "tools": [
              {
                "name": "obs",
                "config": {}
              }
            ]
          },
          {
            "size": 3,
            "tools": [
              {
                "name": "editor",
                "config": {"type":"blind"}
              },
              {
                "name": "dictionary",
                "config": {}
              }
            ]
          }
        ]
      }]', 'obs'::project_type);
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

    INSERT INTO
      PUBLIC.projects (title, code, language_id, method, "type", resources, base_manifest)
    VALUES
      (
        'Russian Literal Open Bible',
        'ru_rlob',
        2,
        'Vcana Bible',
        'bible'::project_type,
        '{
          "literal": {
            "owner": "unfoldingword",
            "repo": "en_ult",
            "commit": "acf32a196",
            "manifest": "{}"
          },
          "simplified": {
            "owner": "unfoldingword",
            "repo": "en_ust",
            "commit": "acf32a196",
            "manifest": "{}"
          },
          "tn": {
            "owner": "unfoldingword",
            "repo": "en_tn",
            "commit": "acf32a196",
            "manifest": "{}"
          }
        }',
        '{
          "resource": "literal",
          "books": [
            {
              "name": "gen",
              "link": "unfoldingword/en_ult/a3c1876/01_GEN.usfm"
            },
            {
              "name": "1ti",
              "link": "unfoldingword/en_ult/a3c1876/55_1TI.usfm"
            },
            {
              "name": "tit",
              "link": "unfoldingword/en_ult/a3c1876/57_TIT.usfm"
            }
          ]
        }'
      ),
      (
        'Kazakh Open Bible Story',
        'kk_obs',
        3,
        'Vcana OBS',
        'obs'::project_type,
        '{
          "obs": {
            "owner": "ru_gl",
            "repo": "ru_obs",
            "commit": "acf32a196",
            "manifest": "{}"
          },
          "tw": {
            "owner": "ru_gl",
            "repo": "ru_obs-twl",
            "commit": "acf32a196",
            "manifest": "{}"
          },
          "tq": {
            "owner": "ru_gl",
            "repo": "ru_obs-tq",
            "commit": "acf32a196",
            "manifest": "{}"
          }
        }',
        '{
          "resource": "obs",
          "books": [
            {
              "name": "obs",
              "link": "ru_gl/ru_obs/a3c1876/content"
            }
          ]
        }'
      );
  -- PROJECTS

  -- PROJECT TRANSLATORS
    DELETE FROM
      PUBLIC.project_translators;

    INSERT INTO
      PUBLIC.project_translators (project_id, user_id, is_moderator)
    VALUES
      (1, '21ae6e79-3f1d-4b87-bcb1-90256f63c167', FALSE),
      (1, 'bba5a95e-33b7-431d-8c43-aedc517a1aa6', FALSE),
      (1, 'f193af4d-ca5e-4847-90ef-38f969792dd5', FALSE),
      (1, '2e108465-9c20-46cd-9e43-933730229762', TRUE),
      (2, '21ae6e79-3f1d-4b87-bcb1-90256f63c167', FALSE),
      (2, 'bba5a95e-33b7-431d-8c43-aedc517a1aa6', FALSE),
      (2, 'f193af4d-ca5e-4847-90ef-38f969792dd5', FALSE),
      (2, '8331e952-5771-49a6-a679-c44736f5581b', TRUE);
  -- END PROJECT TRANSLATORS

  -- PROJECT COORDINATORS
    DELETE FROM
      PUBLIC.project_coordinators;

    INSERT INTO
      PUBLIC.project_coordinators (project_id, user_id)
    VALUES
      (1, '2b95a8e9-2ee1-41ef-84ec-2403dd87c9f2'),
      (2, '54358d8e-0144-47fc-a290-a6882023a3d6');
  -- END PROJECT COORDINATORS

  -- STEPS
    DELETE FROM
      PUBLIC.steps;

    INSERT INTO
      PUBLIC.steps (title, "description", "time", count_of_users, intro, project_id, config, "order" )
    VALUES
      ('Шаг один. Читаем вместе Библию', 'Тут можно перевести текст...', 60, 4,
        '# Вводная\n\n### Как начать\n\nСсылка на видео, должна парситься\n\nhttps://youtu.be/sDcfb_f-f',
        1,
        '[
          {
            "size": 4,
            "tools": [
              {
                "name": "literal",
                "config": {}
              }
            ]
          },
          {
            "size": 2,
            "tools": [
              {
                "name": "notepad",
                "config": {"team": true}
              },
              {
                "name": "notepad",
                "config": {}
              }
            ]
          }
        ]', 1),
      ('Шаг два. Набросок', 'Some text here2...', 30, 2,
        '# Intro\n\n### Как сделать набросок\n\nSome text here\n\nhttps://youtu.be/sDcfb_f-f',
        1,
        '[
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
                "name": "tn",
                "config": {}
              }
            ]
          },
          {
            "size": 3,
            "tools": [
              {
                "name": "editor",
                "config": {"type":"blind"}
              },
              {
                "name": "dictionary",
                "config": {}
              }
            ]
          }
        ]',2),
      ('Шаг один. Читаем вместе OBS', 'Some text here...', 45, 4,
        '# Intro\n\n### How To Start\n\nSome text here\n\nhttps://youtu.be/sDcfb_f-f',
        2,
        '[
          {
            "size": 4,
            "tools": [
              {
                "name": "obs",
                "config": {}
              },
              {
                "name": "tw",
                "config": {}
              },
              {
                "name": "tq",
                "config": {}
              }
            ]
          },
          {
            "size": 2,
            "tools": [
              {
                "name": "notepad",
                "config": {}
              }
            ]
          }
        ]', 1),
      ('Шаг два. Набросок OBS', 'Some text here2...', 30, 2,
        '# Intro\n\n### Как сделать набросок\n\nSome text here\n\nhttps://youtu.be/sDcfb_f-f',
        2,
        '[
          {
            "size": 3,
            "tools": [
              {
                "name": "obs",
                "config": {}
              }
            ]
          },
          {
            "size": 3,
            "tools": [
              {
                "name": "editor",
                "config": {"type":"blind"}
              },
              {
                "name": "dictionary",
                "config": {}
              }
            ]
          }
        ]',2);
  -- END STEPS

  -- BOOKS
    DELETE FROM
      PUBLIC.books;

    INSERT INTO
      PUBLIC.books (code, project_id, chapters)
    VALUES
      ('tit', 1, '{ "1": 3, "2": 4, "3": 2 }'),
      ('1ti', 1, '{ "1": 4, "2": 2, "3": 16, "4": 16, "5": 25, "6": 21 }'),
      ('obs', 2, '{ "1": 3, "2": 17, "3": 23, "4": 19, "5": 14, "6": 16, "7": 21, "8": 16, "9": 11, "10": 15 }');
  -- END BOOKS

  -- CHAPTERS
    DELETE FROM
      PUBLIC.chapters;

    INSERT INTO
      PUBLIC.chapters (project_id, num, book_id, verses, "text")
    VALUES
      (1, 1, 1, 3, '1. Тут будет у нас сохраняться итоговый текст\n2. Не знаю пока в каком формате\n3. USFM нужен в итоге, но может тут MD или JSON'),
      (1, 2, 1, 4, '1. А тут\n2. У нас\n3. Итоговая вторая\n4. Глава'),
      (1, 3, 1, 2, null),
      (1, 1, 2, 4, '1. Тут итог\n2. другой\n3. Книги\n4. 4 стиха'),
      (1, 2, 2, 2, null),
      (2, 1, 3, 3, null);
  -- END CHAPTERS

  -- VERSES
    DELETE FROM
      PUBLIC.verses;

    INSERT INTO
      PUBLIC.verses (project_id, num, "text", chapter_id, project_translator_id, current_step)
    VALUES
      (1, 1, 'Тут будет у нас сохраняться итоговый текст', 1, 3, 2),
      (1, 2, 'Не знаю пока в каком формате', 1, 1, 2),
      (1, 3, 'USFM нужен в итоге, но может тут MD или JSON', 1, 2, 2),
      (1, 1, 'А тут', 2, 3, 2),
      (1, 2, 'У нас', 2, 1, 2),
      (1, 3, 'Итоговая вторая', 2, 2, 2),
      (1, 4, 'Глава', 2, 4, 2),
      (1, 1, null, 3, 3, 1),
      (1, 2, null, 3, 1, 1),
      (1, 1, 'Тут итог', 4, 3, 2),
      (1, 2, 'другой', 4, 1, 2),
      (1, 3, 'Книги', 4, 2, 2),
      (1, 4, '4 стиха', 4, 4, 2),
      (1, 1, null, 5, 3, 1),
      (1, 2, null, 5, 1, 1),
      (2, 1, 'Здесь начался перевод', 6, 2, 4),
      (2, 2, 'Какой-то главы', 6, 8, 3),
      (2, 3, null, 6, 8, 3);
  -- END VERSES

  -- PROGRESS
    DELETE FROM
      PUBLIC.progress;

    INSERT INTO
      PUBLIC.progress (verse_id, step_id, "text")
    VALUES
      (1, 1, 'Тут будет у нас сохраняться итоговый текст'),
      (2, 1, 'Не знаю пока в каком формате'),
      (3, 1, 'USFM нужен в итоге, но может тут MD или JSON'),
      (4, 1, 'А тут'),
      (5, 1, 'У нас'),
      (6, 1, 'Итоговая вторая'),
      (7, 1, 'Глава'),
      (10, 1, 'Тут итог'),
      (11, 1, 'другой'),
      (12, 1, 'Книги'),
      (13, 1, '4 стиха'),
      (16, 3, 'Здесь начался перевод');
  -- END PROGRESS
-- END DUMMY DATA
