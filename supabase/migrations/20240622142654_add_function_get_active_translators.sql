DROP FUNCTION IF EXISTS PUBLIC.get_active_translators;
CREATE FUNCTION PUBLIC.get_active_translators(project_code TEXT, book_code PUBLIC.book_code, chapter_num INT2) RETURNS TABLE(
    translator_id BIGINT,
    login TEXT,
    is_moderator BOOLEAN,
    user_id UUID
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- must be on the project
    IF authorize(auth.uid(), (SELECT id FROM projects WHERE code = get_active_translators.project_code)) NOT IN ('user', 'admin', 'coordinator', 'moderator') THEN
        RETURN;
    END IF;

    RETURN query SELECT project_translator_id, users.login, project_translators.is_moderator, users.id
    FROM verses
    LEFT JOIN chapters ON (verses.chapter_id = chapters.id)
    LEFT JOIN books ON (chapters.book_id = books.id)
    LEFT JOIN steps ON (verses.current_step = steps.id)
    LEFT JOIN projects ON (projects.id = verses.project_id)
    LEFT JOIN project_translators ON (project_translators.id = verses.project_translator_id)
    LEFT JOIN users ON (users.id = project_translators.user_id)
    WHERE projects.code = get_active_translators.project_code
    AND books.code = get_active_translators.book_code
    AND chapters.num = get_active_translators.chapter_num
    AND chapters.started_at IS NOT NULL
    AND chapters.finished_at IS NULL
    AND verses.project_translator_id IS NOT NULL
    GROUP BY project_translator_id, users.login, project_translators.is_moderator, users.id
    ORDER BY users.login;
END
$$;
