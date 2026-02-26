// assets/js/exec-bridge.js — Executive risk listener (CLEAN / demo-safe)
(function(){
  const KEY = "ZERO_RISK_V1";

  function byId(id){ return document.getElementById(id); }

  function setDot(status){
    const dot = byId("execRiskDot");
    if(!dot) return;

    if(!status){
      dot.className = "risk-dot";
      dot.title = "CFO Shock: OFFLINE";
      return;
    }

    const s = String(status).toLowerCase();
    dot.className = "risk-dot " + s;
    dot.title = "CFO Shock: " + String(status);
  }

  function setBanner(status){
    const host = byId("execRiskBanner");
    if(!host) return;

    const s = status ? String(status).toUpperCase() : "";
    if(s === "ACTION"){
      host.style.display = "block";
      host.textContent = "EXECUTIVE ALERT — CFO SHOCK CRITICAL";
    } else {
      host.style.display = "none";
      host.textContent = "";
    }
  }

  function apply(risk){
    const s = (risk && risk.cfoShock) ? risk.cfoShock.status : null;
    if(!s){
      setDot(null);
      setBanner(null);
      return;
    }
    setDot(s);
    setBanner(s);
    if(String(s).toUpperCase() === "ACTION"){ window.__GAUGE_OVERRIDE__ = true; }
  }

  // Same-page events
  window.addEventListener("zero:risk-update", function(e){
    apply(e && e.detail ? e.detail : null);
  });

  // Cross-tab/page propagation
  window.addEventListener("storage", function(e){
    if(!e || e.key !== KEY) return;
    try{ apply(JSON.parse(e.newValue || "{}")); }catch(_e){}
  });

  // Initial paint
  try{
    const raw = localStorage.getItem(KEY);
    if(raw) apply(JSON.parse(raw));
    else apply(null);
  }catch(_e){
    apply(null);
  }
})();

/* === DOT TOP-LAYER (ZERO_RISK_V1) — demo-safe v1 === */
(function(){
  var KEY = "ZERO_RISK_V1";
  var INTERVAL_MS = 2000;

  function pickStatus(){
    try{
      var raw = localStorage.getItem(KEY);
      if(!raw) return null;
      var obj = JSON.parse(raw);
      return obj && obj.cfoShock ? obj.cfoShock.status : null;
    }catch(e){
      return null;
    }
  }

  function normalize(s){
    s = (s || "").toString().trim().toUpperCase();
    if(!s) return null;
    // accepted: OK / MONITOR / ALERT / ACTION / CRITICAL / OFFLINE
    return s;
  }

  function paintDot(status){
    var dot = document.getElementById("execRiskDot");
    if(!dot) return;

    var s = normalize(status);

    // base class
    dot.className = "risk-dot";

    if(!s){
      dot.classList.add("offline");
      dot.title = "CFO Shock: OFFLINE";
      return;
    }

    // map -> class (keep CSS simple)
    if(s === "ACTION" || s === "CRITICAL") dot.classList.add("action");
    else if(s === "ALERT") dot.classList.add("alert");
    else if(s === "MONITOR") dot.classList.add("monitor");
    else if(s === "OK") dot.classList.add("ok");
    else if(s === "OFFLINE") dot.classList.add("offline");
    else dot.classList.add("monitor");

    dot.title = "CFO Shock: " + s;
  }

  function apply(){
    paintDot(pickStatus());
  }

  function boot(){
    if(window.__dotTopLayerGuard) return;
    window.__dotTopLayerGuard = 1;

    // initial
    apply();

    // periodic refresh
    setInterval(apply, INTERVAL_MS);

    // storage change (multi-tab)
    window.addEventListener("storage", function(ev){
      if(ev && ev.key === KEY) apply();
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
