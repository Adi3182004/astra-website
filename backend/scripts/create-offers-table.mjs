import pg from "pg";

const client = new pg.Client({
  connectionString: "postgresql://postgres.oriibywxhetfpcpstdyk:31082004@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log("Connected to Supabase PostgreSQL for Offers table setup!");

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.offers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      code TEXT,
      type TEXT NOT NULL DEFAULT 'bogo',
      buy_qty INT DEFAULT 2,
      get_qty INT DEFAULT 1,
      discount_value NUMERIC DEFAULT 0,
      min_order_value NUMERIC DEFAULT 0,
      duration_hours INT DEFAULT 48,
      start_date TIMESTAMPTZ DEFAULT NOW(),
      end_date TIMESTAMPTZ,
      is_active BOOLEAN DEFAULT TRUE,
      usage_count INT DEFAULT 0,
      history JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Public can view active offers" ON public.offers;
    CREATE POLICY "Public can view active offers" ON public.offers
      FOR SELECT USING (is_active = true);

    DROP POLICY IF EXISTS "Admins can manage offers" ON public.offers;
    CREATE POLICY "Admins can manage offers" ON public.offers
      FOR ALL USING (true) WITH CHECK (true);
  `);

  console.log("public.offers table created with RLS successfully!");
  await client.end();
} catch (err) {
  console.log("PG direct error:", err.message);
}
