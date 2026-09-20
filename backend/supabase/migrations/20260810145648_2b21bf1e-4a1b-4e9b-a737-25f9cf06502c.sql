ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS show_stock boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS stock_prefix text,
  ADD COLUMN IF NOT EXISTS stock_suffix text;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS show_in_menu boolean NOT NULL DEFAULT true;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS search_placeholders text[] NOT NULL DEFAULT ARRAY['Search for earrings...','Search for rings...','Search for necklaces...','Search for bracelets...'],
  ADD COLUMN IF NOT EXISTS pincode_images text[] NOT NULL DEFAULT ARRAY[]::text[];

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  body text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "admin write reviews" ON public.reviews FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER reviews_updated BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.site_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  video_url text NOT NULL,
  poster_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_videos TO authenticated;
GRANT ALL ON public.site_videos TO service_role;
ALTER TABLE public.site_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read videos" ON public.site_videos FOR SELECT USING (true);
CREATE POLICY "admin write videos" ON public.site_videos FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER site_videos_updated BEFORE UPDATE ON public.site_videos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.info_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.info_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.info_pages TO authenticated;
GRANT ALL ON public.info_pages TO service_role;
ALTER TABLE public.info_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read info pages" ON public.info_pages FOR SELECT USING (true);
CREATE POLICY "admin write info pages" ON public.info_pages FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER info_pages_updated BEFORE UPDATE ON public.info_pages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();