import pg from "pg";

const connectionString = "postgres://postgres.oriibywxhetfpcpstdyk:31082004@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

// If direct pooler connection or via supabase rest:
// Let's create an updated trigger function via pg or supabase
const client = new pg.Client({
  connectionString: "postgresql://postgres:31082004@db.oriibywxhetfpcpstdyk.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log("Connected to Supabase PostgreSQL!");

  await client.query(`
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
      IF lower(NEW.email) IN ('adi31082004@gmail.com', 'priorabykp@gmail.com', 'kshitijdevadiga03@gmail.com') THEN
        INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
      END IF;
      RETURN NEW;
    END; $function$;
  `);

  console.log("handle_new_user() updated successfully with all approved admin emails!");
  await client.end();
} catch (err) {
  console.log("PG direct connection:", err.message);
}
