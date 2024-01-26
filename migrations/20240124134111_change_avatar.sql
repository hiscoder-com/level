-- update the users table with a new column
  ALTER TABLE
  PUBLIC.users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL;

-- insert a bucket in storage to store avatars
  insert into storage.buckets
    (id, name, public)
  values
    ('avatars', 'avatars', true);

  -- create Policies
  CREATE POLICY "Give users authenticated access to folder 1oj01fe_0" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'private' AND auth.role() = 'authenticated');

  CREATE POLICY "Give users authenticated access to folder 1oj01fe_1" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'private' AND auth.role() = 'authenticated');

  CREATE POLICY "Give users authenticated access to folder 1oj01fe_2" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'private' AND auth.role() = 'authenticated');

  CREATE POLICY "Give users authenticated access to folder 1oj01fe_3" ON storage.objects FOR DELETE TO public USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'private' AND auth.role() = 'authenticated');
