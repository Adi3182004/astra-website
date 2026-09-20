CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  section text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL,
  label text,
  before_data jsonb,
  after_data jsonb,
  rolled_back boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff read audit log" ON public.admin_audit_log
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "staff write audit log" ON public.admin_audit_log
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "staff update audit log" ON public.admin_audit_log
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.is_staff(auth.uid()) OR public.has_role(auth.uid(),'admin'));

CREATE INDEX IF NOT EXISTS admin_audit_log_created_idx ON public.admin_audit_log (created_at DESC);

INSERT INTO public.site_videos (title, subtitle, video_url, poster_url, is_active, sort_order)
VALUES
 ('Atelier Film — Runway Light', 'Behind the seams of an evening show', 'https://assets.mixkit.co/videos/42286/42286-720.mp4', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80', true, 10),
 ('Atelier Film — Hands & Heirlooms', 'Every piece, finished by hand', 'https://assets.mixkit.co/videos/44541/44541-720.mp4', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80', true, 11);

INSERT INTO public.service_areas (pincode, city, state, delivery_days, is_active) VALUES
 ('400001','Mumbai','Maharashtra',3,true),
 ('411001','Pune','Maharashtra',3,true),
 ('110001','New Delhi','Delhi',4,true),
 ('560001','Bengaluru','Karnataka',4,true),
 ('600001','Chennai','Tamil Nadu',5,true),
 ('700001','Kolkata','West Bengal',5,true),
 ('380001','Ahmedabad','Gujarat',4,true),
 ('302001','Jaipur','Rajasthan',5,true),
 ('500001','Hyderabad','Telangana',4,true),
 ('440001','Nagpur','Maharashtra',4,true)
ON CONFLICT DO NOTHING;