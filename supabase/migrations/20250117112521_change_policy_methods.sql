DROP POLICY IF EXISTS "Админ может получить список всех м" ON "public"."methods";

CREATE POLICY "All_auth_can_view_methods" ON "public"."methods" FOR SELECT TO "authenticated" USING (true);