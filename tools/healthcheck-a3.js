const fs = require("fs");

const cfgPath = "assets/js/supabase.fabric.config.js";
const s = fs.readFileSync(cfgPath, "utf8");

function pick(re){
  const m = s.match(re);
  return m ? m[1] : "";
}

const base = pick(/window\.SUPABASE_URL\s*=\s*"([^"]+)"/) || "";
const key  = pick(/window\.SUPABASE_ANON_KEY\s*=\s*"([^"]+)"/) || "";

if(!base || !key){
  console.error("FATAL: missing SUPABASE_URL or SUPABASE_ANON_KEY in", cfgPath);
  process.exit(1);
}

const facility = process.argv[2] || "Ekoten";
const url = `${base.replace(/\/+$/,"")}/rest/v1/v_wastewater_health_v3_api?facility=eq.${encodeURIComponent(facility)}&select=facility,health,severity_score,last_sample_date,exceed_count,unknown_count&limit=1`;

fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
  .then(async r => {
    const body = await r.text();
    console.log("HTTP", r.status, r.ok ? "OK" : "FAIL");
    console.log(body);
    if(!r.ok) process.exit(2);
  })
  .catch(e => { console.error(e); process.exit(1); });
