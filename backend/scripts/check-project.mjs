const PROJECT_ID = process.env.VERCEL_PROJECT_ID || "prj_gWbvZYWtLJir73NFljHg55jpCNGs";
const TOKEN = process.env.VERCEL_TOKEN || process.env.TOKEN || "";

async function check() {
  const projRes = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const proj = await projRes.json();
  console.log("Project targets / domains:", JSON.stringify(proj.targets, null, 2));

  const domRes = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}/domains`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const doms = await domRes.json();
  console.log("Domains:", doms.domains?.map((d) => d.name));

  const depRes = await fetch(`https://api.vercel.com/v6/deployments?projectId=${PROJECT_ID}&limit=5`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const deps = await depRes.json();
  console.log("Recent deployments:");
  for (const d of deps.deployments || []) {
    console.log(`- ${d.url} | ${d.state} | ${d.target} | ${d.meta?.githubCommitMessage || d.name}`);
  }
}

check().catch(console.error);
