ALTER TABLE public.products ADD COLUMN IF NOT EXISTS text_style jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS text_style jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS text_style jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS text_style jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.site_videos ADD COLUMN IF NOT EXISTS text_style jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.info_pages ADD COLUMN IF NOT EXISTS text_style jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode text NOT NULL,
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  delivery_days integer NOT NULL DEFAULT 4,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS service_areas_pincode_key ON public.service_areas (pincode);

GRANT SELECT ON public.service_areas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_areas TO authenticated;
GRANT ALL ON public.service_areas TO service_role;

ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read service areas" ON public.service_areas FOR SELECT USING (true);
CREATE POLICY "admin write service areas" ON public.service_areas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER service_areas_updated BEFORE UPDATE ON public.service_areas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.service_areas REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_areas;