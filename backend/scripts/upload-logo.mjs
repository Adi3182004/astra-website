import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const sb = createClient(
  "https://oriibywxhetfpcpstdyk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs"
);

const svgBuffer = fs.readFileSync("frontend/public/priora-logo.svg");

const { data: uploadSvg, error: errSvg } = await sb.storage
  .from("public-assets")
  .upload("priora-logo.svg", svgBuffer, { contentType: "image/svg+xml", upsert: true });

console.log("SVG uploaded:", errSvg ? errSvg : uploadSvg);

const { data: urlSvg } = sb.storage.from("public-assets").getPublicUrl("priora-logo.svg");
console.log("Public SVG CDN URL:", urlSvg.publicUrl);
