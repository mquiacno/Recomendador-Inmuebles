-- Supabase OPCIONAL para el Recomendador Inteligente de Inmuebles (Beta)
-- Ejecutar en SQL Editor. La app funciona sin esto en MODO DEMO.
-- Incluye 6 colecciones, índices, RLS básico y perfil automático.

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default 'Usuario',
  email text,
  creado_en timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text not null default '',
  operacion text not null check (operacion in ('venta', 'alquiler')),
  tipo text not null check (tipo in ('departamento', 'casa', 'terreno', 'oficina')),
  precio numeric(14, 2) not null check (precio >= 0),
  moneda text not null check (moneda in ('PEN', 'USD')),
  precio_usd numeric(14, 2),
  distrito text not null,
  ciudad text not null default 'Lima',
  direccion text,
  dormitorios integer not null default 0 check (dormitorios >= 0),
  banos integer not null default 1 check (banos >= 0),
  area_m2 numeric(10, 2),
  estacionamientos integer not null default 0 check (estacionamientos >= 0),
  mascotas boolean not null default false,
  antiguedad integer,
  cerca_transporte integer not null default 3 check (cerca_transporte between 1 and 5),
  cerca_colegios integer not null default 3 check (cerca_colegios between 1 and 5),
  cerca_parques integer not null default 3 check (cerca_parques between 1 and 5),
  destacado boolean not null default false,
  creado_en timestamptz not null default now(),
  fotos text[] not null default '{}'
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  creado_en timestamptz not null default now(),
  constraint cart_item_unico unique (user_id, property_id)
);

create table if not exists public.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  presupuesto_min numeric(14, 2) not null default 0,
  presupuesto_max numeric(14, 2) not null default 0,
  distritos text[] not null default '{}',
  tipos text[] not null default '{}',
  dormitorios_min integer not null default 0,
  prioridades jsonb not null default '{"transport":3,"schools":3,"parks":3,"pets":3}'::jsonb,
  mascotas text not null default 'indiferente' check (mascotas in ('indiferente', 'si', 'no')),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.visit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  nombre text not null,
  telefono text not null,
  mensaje text,
  fecha_preferida date,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'confirmada', 'cancelada')),
  creado_en timestamptz not null default now()
);

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  tipo text not null check (tipo in ('vista', 'carrito', 'guardado', 'me_interesa', 'no_me_interesa', 'visita')),
  creado_en timestamptz not null default now()
);

-- Índices
create index if not exists properties_operacion_idx on public.properties (operacion);
create index if not exists properties_tipo_idx on public.properties (tipo);
create index if not exists properties_distrito_idx on public.properties (distrito);
create index if not exists properties_precio_idx on public.properties (precio);
create index if not exists cart_items_user_idx on public.cart_items (user_id);
create index if not exists preferences_user_idx on public.preferences (user_id);
create index if not exists visit_requests_user_idx on public.visit_requests (user_id, creado_en desc);
create index if not exists interactions_user_idx on public.interactions (user_id, creado_en desc);
create index if not exists interactions_property_idx on public.interactions (property_id);

-- RLS: catálogo público; el resto pertenece al usuario autenticado.
alter table public.users enable row level security;
alter table public.properties enable row level security;
alter table public.cart_items enable row level security;
alter table public.preferences enable row level security;
alter table public.visit_requests enable row level security;
alter table public.interactions enable row level security;

drop policy if exists "propiedades lectura publica" on public.properties;
create policy "propiedades lectura publica" on public.properties for select using (true);

drop policy if exists "usuarios propios" on public.users;
create policy "usuarios propios" on public.users for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "carrito propio" on public.cart_items;
create policy "carrito propio" on public.cart_items for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "preferencias propias" on public.preferences;
create policy "preferencias propias" on public.preferences for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "visitas lectura propia" on public.visit_requests;
create policy "visitas lectura propia" on public.visit_requests for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "visitas insercion propia" on public.visit_requests;
create policy "visitas insercion propia" on public.visit_requests for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "interacciones propias" on public.interactions;
create policy "interacciones propias" on public.interactions for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Crear fila en public.users cuando se registra un usuario (incluye Google).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, nombre, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nombre', ''), split_part(coalesce(new.email, ''), '@', 1), 'Usuario'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Permisos (GRANT). Sin esto PostgREST responde 42501 "permission denied
-- for table properties" aunque las políticas RLS existan.
grant usage on schema public to anon, authenticated;
grant select on public.properties to anon, authenticated;
grant select, insert, update, delete on public.users to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, insert, update, delete on public.preferences to authenticated;
grant select, insert on public.visit_requests to authenticated;
grant select, insert, update, delete on public.interactions to authenticated;
