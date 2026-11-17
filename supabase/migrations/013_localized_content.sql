-- Multilingual content for excursions + fleet vehicles.
-- Existing text is copied into { lv, en, fr, ru }.
-- Safe to re-run after a partial failure (skips columns already jsonb).
-- Run in Supabase Dashboard → SQL Editor

-- ---------------------------------------------------------------------------
-- Excursions: title / teaser / details / route → jsonb Localized
-- ---------------------------------------------------------------------------

-- Drop text defaults that block text → jsonb casts
alter table public.excursions alter column route drop default;
alter table public.excursions alter column teaser drop default;
alter table public.excursions alter column details drop default;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'excursions'
      and column_name = 'title' and data_type = 'text'
  ) then
    alter table public.excursions
      alter column title type jsonb
      using jsonb_build_object(
        'lv', coalesce(title::text, ''),
        'en', coalesce(title::text, ''),
        'fr', coalesce(title::text, ''),
        'ru', coalesce(title::text, '')
      );
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'excursions'
      and column_name = 'teaser' and data_type = 'text'
  ) then
    alter table public.excursions
      alter column teaser type jsonb
      using jsonb_build_object(
        'lv', coalesce(teaser::text, ''),
        'en', coalesce(teaser::text, ''),
        'fr', coalesce(teaser::text, ''),
        'ru', coalesce(teaser::text, '')
      );
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'excursions'
      and column_name = 'details' and data_type = 'text'
  ) then
    alter table public.excursions
      alter column details type jsonb
      using jsonb_build_object(
        'lv', coalesce(details::text, ''),
        'en', coalesce(details::text, ''),
        'fr', coalesce(details::text, ''),
        'ru', coalesce(details::text, '')
      );
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'excursions'
      and column_name = 'route' and data_type = 'text'
  ) then
    alter table public.excursions
      alter column route type jsonb
      using jsonb_build_object(
        'lv', coalesce(route::text, ''),
        'en', coalesce(route::text, ''),
        'fr', coalesce(route::text, ''),
        'ru', coalesce(route::text, '')
      );
  end if;
end $$;

alter table public.excursions
  alter column title set default '{"lv":"","en":"","fr":"","ru":""}'::jsonb;
alter table public.excursions
  alter column teaser set default '{"lv":"","en":"","fr":"","ru":""}'::jsonb;
alter table public.excursions
  alter column details set default '{"lv":"","en":"","fr":"","ru":""}'::jsonb;
alter table public.excursions
  alter column route set default '{"lv":"","en":"","fr":"","ru":""}'::jsonb;

comment on column public.excursions.title is 'Localized title {lv,en,fr,ru}.';
comment on column public.excursions.teaser is 'Localized teaser {lv,en,fr,ru}.';
comment on column public.excursions.details is 'Localized details {lv,en,fr,ru}.';
comment on column public.excursions.route is 'Localized route {lv,en,fr,ru}.';

-- ---------------------------------------------------------------------------
-- Fleet: name / summary / colors → jsonb Localized
-- description / closing_notes / extras: string arrays → { lv:[], en:[], ... }
-- ---------------------------------------------------------------------------

alter table public.fleet_vehicles alter column summary drop default;
alter table public.fleet_vehicles alter column interior_color drop default;
alter table public.fleet_vehicles alter column body_color drop default;
alter table public.fleet_vehicles alter column description drop default;
alter table public.fleet_vehicles alter column closing_notes drop default;
alter table public.fleet_vehicles alter column extras drop default;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'fleet_vehicles'
      and column_name = 'name' and data_type = 'text'
  ) then
    alter table public.fleet_vehicles
      alter column name type jsonb
      using jsonb_build_object(
        'lv', coalesce(name::text, ''),
        'en', coalesce(name::text, ''),
        'fr', coalesce(name::text, ''),
        'ru', coalesce(name::text, '')
      );
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'fleet_vehicles'
      and column_name = 'summary' and data_type = 'text'
  ) then
    alter table public.fleet_vehicles
      alter column summary type jsonb
      using jsonb_build_object(
        'lv', coalesce(summary::text, ''),
        'en', coalesce(summary::text, ''),
        'fr', coalesce(summary::text, ''),
        'ru', coalesce(summary::text, '')
      );
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'fleet_vehicles'
      and column_name = 'interior_color' and data_type = 'text'
  ) then
    alter table public.fleet_vehicles
      alter column interior_color type jsonb
      using jsonb_build_object(
        'lv', coalesce(interior_color::text, ''),
        'en', coalesce(interior_color::text, ''),
        'fr', coalesce(interior_color::text, ''),
        'ru', coalesce(interior_color::text, '')
      );
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'fleet_vehicles'
      and column_name = 'body_color' and data_type = 'text'
  ) then
    alter table public.fleet_vehicles
      alter column body_color type jsonb
      using jsonb_build_object(
        'lv', coalesce(body_color::text, ''),
        'en', coalesce(body_color::text, ''),
        'fr', coalesce(body_color::text, ''),
        'ru', coalesce(body_color::text, '')
      );
  end if;
end $$;

update public.fleet_vehicles
set description = jsonb_build_object(
  'lv', description,
  'en', description,
  'fr', description,
  'ru', description
)
where jsonb_typeof(description) = 'array';

update public.fleet_vehicles
set closing_notes = jsonb_build_object(
  'lv', closing_notes,
  'en', closing_notes,
  'fr', closing_notes,
  'ru', closing_notes
)
where jsonb_typeof(closing_notes) = 'array';

update public.fleet_vehicles
set extras = jsonb_build_object(
  'lv', extras,
  'en', extras,
  'fr', extras,
  'ru', extras
)
where jsonb_typeof(extras) = 'array';

alter table public.fleet_vehicles
  alter column name set default '{"lv":"","en":"","fr":"","ru":""}'::jsonb;
alter table public.fleet_vehicles
  alter column summary set default '{"lv":"","en":"","fr":"","ru":""}'::jsonb;
alter table public.fleet_vehicles
  alter column interior_color set default '{"lv":"","en":"","fr":"","ru":""}'::jsonb;
alter table public.fleet_vehicles
  alter column body_color set default '{"lv":"","en":"","fr":"","ru":""}'::jsonb;
alter table public.fleet_vehicles
  alter column description set default '{"lv":[],"en":[],"fr":[],"ru":[]}'::jsonb;
alter table public.fleet_vehicles
  alter column closing_notes set default '{"lv":[],"en":[],"fr":[],"ru":[]}'::jsonb;
alter table public.fleet_vehicles
  alter column extras set default '{"lv":[],"en":[],"fr":[],"ru":[]}'::jsonb;

comment on column public.fleet_vehicles.name is 'Localized name {lv,en,fr,ru}.';
comment on column public.fleet_vehicles.summary is 'Localized summary {lv,en,fr,ru}.';
comment on column public.fleet_vehicles.interior_color is 'Localized interior color {lv,en,fr,ru}.';
comment on column public.fleet_vehicles.body_color is 'Localized body color {lv,en,fr,ru}.';
comment on column public.fleet_vehicles.description is 'Localized paragraphs {lv:[],en:[],fr:[],ru:[]}.';
comment on column public.fleet_vehicles.closing_notes is 'Localized notes {lv:[],en:[],fr:[],ru:[]}.';
comment on column public.fleet_vehicles.extras is 'Localized extras {lv:[],en:[],fr:[],ru:[]}.';
