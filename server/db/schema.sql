-- Supabase SQL Editor에서 실행한다.
-- CLAUDE.md의 "저장 데이터" 정의를 그대로 따른다.

-- 보유 재료
create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.ingredients enable row level security;

create policy "own ingredients" on public.ingredients
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 즐겨찾기한 레시피 ID
-- recipe_id: 레시피 데이터 출처가 미정이라 text로 둔다. 출처 확정 시 타입을 재검토할 것.
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, recipe_id)
);

alter table public.favorites enable row level security;

create policy "own favorites" on public.favorites
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
