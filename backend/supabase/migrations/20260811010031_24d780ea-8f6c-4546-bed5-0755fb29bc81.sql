-- 1. Second admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  IF lower(NEW.email) IN ('adi31082004@gmail.com', 'priorabykp@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $function$;

-- backfill for already-registered admins
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE lower(email) IN ('adi31082004@gmail.com','priorabykp@gmail.com')
ON CONFLICT DO NOTHING;

-- 2. Out of stock + media columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS out_of_stock boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.info_pages ADD COLUMN IF NOT EXISTS hero_image_url text;
ALTER TABLE public.info_pages ADD COLUMN IF NOT EXISTS hero_video_url text;

-- 3. Realtime
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.product_images REPLICA IDENTITY FULL;
ALTER TABLE public.categories REPLICA IDENTITY FULL;
ALTER TABLE public.banners REPLICA IDENTITY FULL;
ALTER TABLE public.reviews REPLICA IDENTITY FULL;
ALTER TABLE public.site_videos REPLICA IDENTITY FULL;
ALTER TABLE public.info_pages REPLICA IDENTITY FULL;
ALTER TABLE public.site_settings REPLICA IDENTITY FULL;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['products','product_images','categories','banners','reviews','site_videos','info_pages','site_settings'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;