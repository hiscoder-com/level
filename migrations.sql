--Here added scripts for updating live db before setup migrating settings for supabase

--Update chapters - change type for column text from 'text' to jsonb
ALTER TABLE chapters ADD text_temp json;
UPDATE chapters SET text_temp = to_json('text');
ALTER TABLE chapters DROP COLUMN 'text';
ALTER TABLE chapters RENAME COLUMN text_temp To 'text';

