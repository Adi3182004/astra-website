const PROJECT_ID = process.env.VERCEL_PROJECT_ID || "prj_gWbvZYWtLJir73NFljHg55jpCNGs";
const TOKEN = process.env.VERCEL_TOKEN || process.env.TOKEN || "";

const envs = [
  { key: "VITE_SUPABASE_PROJECT_ID", value: "oriibywxhetfpcpstdyk" },
  { key: "VITE_SUPABASE_PUBLISHABLE_KEY", value: "sb_publishable_Ku9PVVi8kpH_EJXVCiFWvw_OXeEZS0y" },
  { key: "VITE_SUPABASE_URL", value: "https://oriibywxhetfpcpstdyk.supabase.co" },
];

async function sync() {
  console.log("Fetching existing Vercel envs...");
  const listRes = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}/env`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const listData = await listRes.json();
  console.log("Existing envs count:", listData.envs?.length ?? 0);

  for (const existing of listData.envs || []) {
    if (envs.some((e) => e.key === existing.key)) {
      console.log(`Deleting old ${existing.key} (${existing.id})...`);
      await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}/env/${existing.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
    }
  }

  for (const item of envs) {
    console.log(`Adding ${item.key}...`);
    const addRes = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/env`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: item.key,
        value: item.value,
        type: "encrypted",
        target: ["production", "preview", "development"],
      }),
    });
    const addData = await addRes.json();
    console.log(`Added ${item.key}:`, addRes.status, addData.key ?? addData.error?.message);
  }

  console.log("Triggering Vercel deployment...");
  const deployRes = await fetch(`https://api.vercel.com/v13/deployments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "priora",
      project: PROJECT_ID,
      gitSource: {
        type: "github",
        repo: "Adi3182004/priora",
        ref: "main",
      },
    }),
  });
  const deployData = await deployRes.json();
  console.log("Deployment response:", deployRes.status, deployData.url || deployData.error?.message);
}

sync().catch(console.error);
