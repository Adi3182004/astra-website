import pg from "pg";

const client = new pg.Client({
  connectionString: "postgresql://postgres:31082004@db.oriibywxhetfpcpstdyk.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log("Connected to Supabase PostgreSQL!");

  // Drop existing insert policies
  await client.query(`DROP POLICY IF EXISTS "insert order any" ON public.orders;`);
  await client.query(`DROP POLICY IF EXISTS "guest can insert order" ON public.orders;`);
  await client.query(`DROP POLICY IF EXISTS "user can insert own order" ON public.orders;`);
  console.log("Dropped old policies");

  // Create correct policies
  await client.query(`
    CREATE POLICY "guest can insert order" ON public.orders
      FOR INSERT TO anon
      WITH CHECK (user_id IS NULL);
  `);
  await client.query(`
    CREATE POLICY "user can insert own order" ON public.orders
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
  `);
  console.log("Created new policies");

  // Ensure grants
  await client.query(`GRANT INSERT ON public.orders TO anon;`);
  await client.query(`GRANT INSERT ON public.orders TO authenticated;`);
  console.log("Grants applied");

  // Verify
  const { rows } = await client.query(`
    SELECT policyname, roles, cmd, with_check
    FROM pg_policies
    WHERE tablename = 'orders'
    ORDER BY policyname;
  `);
  console.log("\nCurrent orders RLS policies:");
  rows.forEach(r => {
    console.log(`  [${r.cmd}] "${r.policyname}" roles=${JSON.stringify(r.roles)} check=${r.with_check}`);
  });

  await client.end();
  console.log("\n✅ Orders RLS INSERT policies fixed successfully!");
} catch (err) {
  console.error("❌ Error:", err.message);
  await client.end().catch(() => {});
}
