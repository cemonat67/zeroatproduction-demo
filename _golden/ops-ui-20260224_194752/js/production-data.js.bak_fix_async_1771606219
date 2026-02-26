/* Zero@Production v1 — data layer (Supabase + cache) */
(function () {
  const KEY = "ZP_V1_CACHE";
  const TTL_MS = 5 * 60 * 1000; // 5 min

  function now() { return Date.now(); }

  function readCache() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.ts) return null;
      if (now() - obj.ts > TTL_MS) return null;
      return obj.data || null;
    } catch { return null; }
  }

  function writeCache(data) {
    try { localStorage.setItem(KEY, JSON.stringify({ ts: now(), data })); } catch {}
  }

  function setText(sel, txt) {
    const el = document.querySelector(sel);
    if (el) el.textContent = txt;
  }

  function setHealth(state, lastSync) {
    setText("#ctoHealth", state);
    setText("#ctoSub", lastSync ? `Last sync: ${lastSync}` : "Offline mode active");
  }

  function render(data, mode) {

    // LIVE_BADGE_RUNTIME_V3 (data-aware)
    (function(){
      const badge = document.getElementById("liveBadge");
      if (!badge) return;

      if (!data) {
        badge.textContent = "OFFLINE";
        badge.className = "badge badge-offline";
        return;
      }

      const m = String(mode || "");
      if (m === "cache") {
        badge.textContent = "CACHE";
        badge.className = "badge badge-offline";
      } else {
        badge.textContent = "LIVE";
        badge.className = "badge badge-live";
      }
    })();


    


    setText("#ceoScore", (data?.scorePct ?? 75) + "%");
    setText("#cfoImpact", "€ " + (data?.eurYear ?? 477440).toLocaleString("en-GB"));
    setHealth(data?.health ?? (mode === "offline" ? "DEGRADED" : "OK"), data?.lastSyncISO ?? null);
  

    // LIVE_BADGE_RUNTIME_V1
    }
}

  async function fetchLive() {
    // V1 placeholder — next step: hook to Supabase REST
    return {
      scorePct: 75,
      eurYear: 477440,
      health: "OK",
      lastSyncISO: new Date().toISOString()
    };
  }

  async function boot() {
    const cached = readCache();
    if (cached) { render(cached, "cache"); return; }

    try {
      const live = await fetchLive();
      writeCache(live);
      render(live, "live");
    } catch (e) {
      render(null, "offline");
    }
  }

  
  // LIVE_FETCH_V1_START — Supabase RPC: get_ops_payload(passport)
  async function rpcGetOpsPayload(passportId){
    const base = window.SUPABASE_URL || window.__SUPABASE_URL || window.ZERO_SUPABASE_URL || window.supabaseUrl;
    const anon = window.SUPABASE_ANON_KEY || window.__SUPABASE_ANON_KEY || window.ZERO_SUPABASE_ANON_KEY || window.supabaseAnonKey || window.SUPABASE_KEY;

    if (!base || !anon) throw new Error("Supabase config missing (SUPABASE_URL / SUPABASE_ANON_KEY).");

    const url = base.replace(/\/+$/,"") + "/rest/v1/rpc/get_ops_payload";
    const headers = {
      "apikey": anon,
      "Authorization": "Bearer " + anon,
      "Content-Type": "application/json"
    ,
      "x-zp-src": "production-data.js"};

    // Single arg (DB signature locked)


    const body = { p_passport_id: passportId };

    const res = await fetch(url, { method:"POST", headers, body: JSON.stringify(body) });


    if (!res.ok){


      const txt = await res.text().catch(()=> "");


      throw new Error("RPC failed: " + res.status + " " + txt);


    }


    return await res.json();

    // AUTO_LIVE_V1: if URL has ?pid=... then auto-load live once
    try {
      const u = new URL(location.href);
      const pid = (u.searchParams.get("pid") || "").trim();
      if (pid) {
        const inp = document.getElementById("inpPassportId");
        if (inp && !inp.value) inp.value = pid;
        await onLoadLive({ preventDefault: function(){} });
      }
    } catch(e) {}
  }

  function fmtInt(x){
    try{
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Number(x));
    }catch(e){
      return String(x);
    }
  }

  function setText(id, txt){
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  async function onLoadLive(e){
    e && e.preventDefault();
    const inp = document.getElementById("inpPassportId");
    const pid = (inp && inp.value || "").trim();
    if (!pid){
      alert("Passport ID required (e.g., EKOTEN-2401-B01)");
      return;
    }

    // UI: optimistic status
    setText("ctoHealth", "LIVE");
    setText("ctoSub", "Fetching…");

    try{
      const data = await rpcGetOpsPayload(pid);

      
      // cache live payload for refresh/offline
      try{ writeCache({ ts: now(), payload: data }); }catch(e){}
// Expected structure (from your psql output):
      // { passport_id, kpis:{total_co2_t, energy_mwh,...}, cfo:{eur_year,...}, trends_7d:[...] }

      const totalCo2T = data && data.kpis && data.kpis.total_co2_t;
      const eurYear   = data && data.cfo  && data.cfo.eur_year;

      

      // ZERO_CEO_KPI_INLINE_V1 — CEO card: CO₂ + Water + Energy + Risk

      try {

        const k = data && data.kpis;

        const co2t = k && k.total_co2_t;

        const water = k && k.water_m3;

        let eMwh = k && k.energy_mwh;

        if ((eMwh === undefined || eMwh === null) && k && k.total_energy_kwh !== undefined && k.total_energy_kwh !== null) {

          eMwh = Number(k.total_energy_kwh) / 1000.0;

        }

        const risk = (k && k.wastewater_risk) ? String(k.wastewater_risk) : "—";

      

        if (co2t !== undefined && co2t !== null) setText("ceoScore", (Math.round(Number(co2t)*100)/100) + " t");

        setText("ceoSub", "Total CO₂ (batch)");

        const waterTxt = (water === undefined || water === null) ? "—" : (Math.round(Number(water)*10)/10);

        const eTxt = (eMwh === undefined || eMwh === null) ? "—" : (Math.round(Number(eMwh)*100)/100);

        setText("ceoMeta", "Water: " + waterTxt + " m³  ·  Energy: " + eTxt + " MWh  ·  Risk: " + risk);

      } catch (e) {}
// CEO card: keep label, inject a "live metric" (CO2)
      if (totalCo2T !== undefined && totalCo2T !== null){
        setText("ceoScore", fmtInt(totalCo2T) + " t");
      } else {
        setText("ceoScore", "—");
      }

      // CFO card
      if (eurYear !== undefined && eurYear !== null){
        setText("cfoImpact", "€ " + fmtInt(eurYear));
      } else {
        setText("cfoImpact", "€ —");
      }

      // CTO
      setText("ctoHealth", "OK");
      const now = new Date();
      setText("ctoSub", "Live sync • " + now.toLocaleString());

      // Optional: expose for debugging
      window.__OPS_PAYLOAD = data;

    }catch(err){
      console.error(err);
      setText("ctoHealth", "OFFLINE");
      setText("ctoSub", "Offline — Last known data");
      alert("Load Live failed. Check Supabase config + RPC. See console.");
    }
  }

  // Bind button
  (function bindLoadLive(){
    const b = document.getElementById("btnLoadLive");
    if (b) b.addEventListener("click", onLoadLive);
  })();
  // LIVE_FETCH_V1_END


  // INGESTION_UI_V1_START
  function showPane(which){
    const pm = document.getElementById("paneManual");
    const pc = document.getElementById("paneCSV");
    if (pm) pm.style.display = (which==="manual") ? "block" : "none";
    if (pc) pc.style.display = (which==="csv") ? "block" : "none";
  }

  function parseCsvText(txt){
    const lines = (txt||"").split(/\r?\n/).filter(Boolean);
    if (!lines.length) return { rows: 0, cols: 0 };
    const head = lines[0].split(",").map(x=>x.trim());
    return { rows: Math.max(0, lines.length-1), cols: head.length };
  }

  async function onCsvPick(inp, label){
    const st = document.getElementById("csvStatus");
    if (!inp || !inp.files || !inp.files[0]){
      if (st) st.textContent = "No files loaded.";
      return;
    }
    const file = inp.files[0];
    const txt = await file.text();
    const info = parseCsvText(txt);
    return `${label}: ${file.name} — rows=${info.rows}, cols=${info.cols}`;
  }

  function bindIngestionUI(){
    const tM = document.getElementById("tabManual");
    const tC = document.getElementById("tabCSV");
    if (tM) tM.addEventListener("click", function(e){ e.preventDefault(); showPane("manual"); });
    if (tC) tC.addEventListener("click", function(e){ e.preventDefault(); showPane("csv"); });

    // default open manual
    showPane("manual");

    const eInp = document.getElementById("csvEnergy");
    const pInp = document.getElementById("csvProduction");
    const st = document.getElementById("csvStatus");

    async function refreshStatus(){
      const a = await onCsvPick(eInp, "energy.csv").catch(()=>null);
      const b = await onCsvPick(pInp, "production.csv").catch(()=>null);
      const parts = [a,b].filter(Boolean);
      if (st) st.textContent = parts.length ? parts.join(" • ") : "No files loaded.";
    }

    if (eInp) eInp.addEventListener("change", function(){ refreshStatus(); });
    if (pInp) pInp.addEventListener("change", function(){ refreshStatus(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindIngestionUI);
  else bindIngestionUI();
  // INGESTION_UI_V1_END

window.ZeroProductionV1 = { boot };
})();

/* ZP_ACTIONS_ENGINE_V1 */
(function(){
  function $(id){ return document.getElementById(id); }

  function getText(id, fallback){
    const el = $(id);
    const t = el ? (el.textContent || "").trim() : "";
    return t || fallback || "";
  }

  function buildExecutiveSummary(){
    const ceoScore = getText("ceoScore", "—");
    const cfoImpact = getText("cfoImpact", "—");
    const ctoHealth = getText("ctoHealth", "—");
    const ctoSub = getText("ctoSub", "");

    const ts = new Date().toISOString();
    const lines = [
      "Zero@Production — Executive Snapshot",
      "ML-Ready · Offline-first · iPad-safe",
      "",
      `CEO — Overall Score: ${ceoScore}`,
      `CFO — Impact / Year: ${cfoImpact}`,
      `CTO — System Health: ${ctoHealth}${ctoSub ? " ("+ctoSub+")" : ""}`,
      "",
      `Generated: ${ts}`,
      "",
      "Modules: Fibre · Yarn · Fabric · Chemicals & Dyes · Finishing · Garment · Wastewater"
    ];
    return lines.join("\n");
  }

  async function copyToClipboard(text){
    // modern
    try{
      if (navigator.clipboard && navigator.clipboard.writeText){
        await navigator.clipboard.writeText(text);
        return true;
      }
    }catch(e){ /* fallthrough */ }

    // fallback
    try{
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "readonly");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    }catch(e){
      return false;
    }
  }

  function mailtoSnapshot(){
    const subject = encodeURIComponent("Zero@Production — Executive Snapshot");
    const body = encodeURIComponent(buildExecutiveSummary());
    // demo-safe: user still confirms in mail client
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  function exportSimplePDF(){
    const summary = buildExecutiveSummary();

    // Senin index.html’de zaten window.ZeroPDF.exportSimpleReport kullanımı var.
    // Yoksa fallback: print dialog.
    if (window.ZeroPDF && typeof window.ZeroPDF.exportSimpleReport === "function"){
      window.ZeroPDF.exportSimpleReport("Zero@Production Report", [
        { h: "Executive Snapshot", p: summary }
      ]);
      return;
    }
    // fallback
    alert("PDF export engine not found. Fallback: Print dialog will open.");
    window.print();
  }

  async function onCopySummary(e){
    e && e.preventDefault();
    const txt = buildExecutiveSummary();
    const ok = await copyToClipboard(txt);
    if (!ok) alert("Copy failed. (Browser denied clipboard)");
  }

  function bind(){
    const b1 = $("btnExportPDF");
    const b2 = $("btnCopySummary");
    const b3 = $("btnEmailSnapshot");

    if (b1) b1.addEventListener("click", function(e){ e.preventDefault(); exportSimplePDF(); });
    if (b2) b2.addEventListener("click", onCopySummary);
    if (b3) b3.addEventListener("click", function(e){ e.preventDefault(); mailtoSnapshot(); });
  }

  // bind after DOM ready
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();

  // expose tiny api if needed later
  window.ZeroProductionActions = { buildExecutiveSummary, exportSimplePDF, mailtoSnapshot };
})();


/* ============================
   Manual Entry (DEMO WRITE)
   Table: public.production_manual_entries
   ============================ */

function _zapNum(v){
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function _zapTrim(v){ return (v ?? "").toString().trim(); }

function _zapSet(el, txt){
  const x = document.getElementById(el);
  if (x) x.textContent = txt ?? "";
}

async function insertManualEntry(payload){
  if (!window.supabaseClient) throw new Error("supabaseClient missing");
  const { data, error } = await window.supabaseClient
    .from("production_manual_entries")
    .insert([payload])
    .select("id, created_at")
    .single();
  if (error) throw error;
  return data;
}

function wireManualModal(){
  const modal = document.getElementById("manualModal");
  const openBtn = document.getElementById("btnOpenManualModal");
  const closeBtn = document.getElementById("btnCloseManualModal");
  const cancelBtn = document.getElementById("btnManualCancel");
  const submitBtn = document.getElementById("btnManualSubmit");

  function open(){
    if (!modal) return;
    // prefill from main inputs if exists
    const mainPid = document.getElementById("inpPassportId");
    const mainFac = document.getElementById("inpFacility");
    const pid = document.getElementById("mPassportId");
    const fac = document.getElementById("mFacility");
    if (pid && mainPid && !_zapTrim(pid.value)) pid.value = _zapTrim(mainPid.value);
    if (fac && mainFac && !_zapTrim(fac.value)) fac.value = _zapTrim(mainFac.value);

    _zapSet("manualStatus", "");
    modal.style.display = "flex";
  }
  function close(){
    if (!modal) return;
    modal.style.display = "none";
  }

  function validPeriod(x){
    return /^\d{4}-\d{2}$/.test(_zapTrim(x));
  }

  async function submit(ev){
    ev && ev.preventDefault && ev.preventDefault();
    try{
      _zapSet("manualStatus", "Saving…");
      const pid = _zapTrim(document.getElementById("mPassportId")?.value);
      const fac = _zapTrim(document.getElementById("mFacility")?.value);
      const per = _zapTrim(document.getElementById("mPeriod")?.value);
      const prod = _zapNum(document.getElementById("mProductionKg")?.value);
      const en   = _zapNum(document.getElementById("mEnergyKwh")?.value);
      const w    = _zapNum(document.getElementById("mWaterM3")?.value);

      if (!pid) throw new Error("passport_id is required");
      if (!validPeriod(per)) throw new Error("period must be YYYY-MM");
      if (prod < 0 || en < 0 || w < 0) throw new Error("values must be non-negative");

      const client_id = (window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now()));
      const row = {
        passport_id: pid,
        facility: fac || null,
        period: per,
        production_kg: prod,
        energy_kwh: en,
        water_m3: w,
        source: "manual_ui",
        client_id,
        meta: { ui: "zero@production", note: "manual entry demo" }
      };

      const res = await insertManualEntry(row);
      _zapSet("manualStatus", `Saved ✓ (${res.id})`);

      // refresh live read automatically
      const mainPid = document.getElementById("inpPassportId");
      const mainFac = document.getElementById("inpFacility");
      if (mainPid) mainPid.value = pid;
      if (mainFac && fac) mainFac.value = fac;

      // small delay so user sees success
      setTimeout(() => {
        close();
        const load = document.getElementById("btnLoadLive");
        if (load) load.click();
      }, 350);

    }catch(err){
      _zapSet("manualStatus", `Error: ${err?.message || err}`);
    }
  }

  // bind
  openBtn && openBtn.addEventListener("click", (e)=>{ e.preventDefault(); open(); });
  closeBtn && closeBtn.addEventListener("click", (e)=>{ e.preventDefault(); close(); });
  cancelBtn && cancelBtn.addEventListener("click", (e)=>{ e.preventDefault(); close(); });
  submitBtn && submitBtn.addEventListener("click", submit);

  // click outside closes
  modal && modal.addEventListener("click", (e)=>{
    if (e.target === modal) close();
  });

  // escape closes
  document.addEventListener("keydown", (e)=>{
    if (e.key === "Escape" && modal && modal.style.display === "flex") close();
  });
}

// auto-wire when DOM ready
document.addEventListener("DOMContentLoaded", () => {
  try{ wireManualModal(); }catch(e){ /* no-op */ }
});
