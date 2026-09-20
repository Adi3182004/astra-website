CREATE TABLE public.seo_overrides (
  id uuid primary key default gen_random_uuid(),
  route text not null unique,
  title text,
  description text,
  canonical text,
  og_title text,
  og_description text,
  og_image text,
  twitter_card text,
  json_ld jsonb,
  no_index boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT ON public.seo_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_overrides TO authenticated;
GRANT ALL ON public.seo_overrides TO service_role;

ALTER TABLE public.seo_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read seo overrides" ON public.seo_overrides FOR SELECT USING (true);
CREATE POLICY "staff write seo overrides" ON public.seo_overrides FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER seo_overrides_updated_at BEFORE UPDATE ON public.seo_overrides
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.seo_overrides;