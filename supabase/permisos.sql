-- Permisos de la API (GRANT). Ejecutar UNA VEZ en Supabase -> SQL Editor.
-- Corrige el error 42501: "permission denied for table properties".
-- Es inofensivo si se ejecuta más de una vez.

grant usage on schema public to anon, authenticated;
grant select on public.properties to anon, authenticated;
grant select, insert, update, delete on public.users to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, insert, update, delete on public.preferences to authenticated;
grant select, insert on public.visit_requests to authenticated;
grant select, insert, update, delete on public.interactions to authenticated;
