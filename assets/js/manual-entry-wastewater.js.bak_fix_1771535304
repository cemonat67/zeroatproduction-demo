/* Zero@Production — Manual Entry (Wastewater) v2 (stable)
   - Opens modal via #btnOpenManualModal (no tab hijack)
   - Writes to public.wastewater_desarj via Supabase REST
   - Renders small preview under Ingestion
*/
(function(){
  const $ = (q, root=document)=>root.querySelector(q);
  const $$ = (q, root=document)=>Array.from(root.querySelectorAll(q));
  const esc = (s)=>String(s ?? "").replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));

  function getSB(){
    const url =
      window.SUPABASE_URL ||
      window.__SUPABASE_URL ||
      (window.ZAE && window.ZAE.SUPABASE_URL) ||
      localStorage.getItem("SUPABASE_URL") || "";
    const key =
      window.SUPABASE_ANON_KEY ||
      window.__SUPABASE_ANON_KEY ||
      (window.ZAE && window.ZAE.SUPABASE_ANON_KEY) ||
      localStorage.getItem("SUPABASE_ANON_KEY") || "";
    return { url, key };
  }

  function toast(msg, kind="info"){
    console.log("[WW]", msg);
    let t = $("#wwToast");
    if(!t){
      t = document.createElement("div");
      t.id = "wwToast";
      t.style.cssText = "position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:99999;background:#02154e;color:#fff;padding:10px 14px;border-radius:10px;font:14px system-ui;box-shadow:0 10px 30px rgba(0,0,0,.25);opacity:0;transition:.2s;";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    t.style.background = (kind==="err") ? "#D51635" : (kind==="ok" ? "#005530" : "#02154e");
    if (window.__WW_TOAST_T) clearTimeout(window.__WW_TOAST_T);
  }

  function ensureModal(){
    if ($("#wwModal")) return;

    const wrap = document.createElement("div");
    wrap.id = "wwModal";
    wrap.innerHTML = `
      <div class="ww-backdrop"></div>
      <div class="ww-panel" role="dialog" aria-modal="true">
        <div class="ww-head">
          <div>
            <div class="ww-title">Manual Entry — Wastewater Discharge</div>
            <div class="ww-sub">Writes to <code>public.wastewater_desarj</code></div>
          </div>
          <button class="ww-x" id="wwCloseX" aria-label="Close">×</button>
        </div>

        <div class="ww-grid">
          <label class="ww-field">
            <span>Sample date <b>*</b></span>
            <input id="wwSampleDate" type="date" />
          </label>
          <label class="ww-field">
            <span>Facility <b>*</b></span>
            <input id="wwFacility" placeholder="e.g., Ekoten (Izmir)" />
          </label>
          <label class="ww-field">
            <span>Sampling point</span>
            <input id="wwSamplingPoint" placeholder="e.g., ETP outlet" />
          </label>
          <label class="ww-field">
            <span>Discharge route</span>
            <input id="wwDischargeRoute" placeholder="e.g., Municipal / Sea" />
          </label>
        </div>

        <div class="ww-params-head">
          <div class="ww-params-title">Parameters</div>
          <div class="ww-params-actions">
            <button class="ww-btn" id="wwAddRow">+ Add row</button>
            <button class="ww-btn ghost" id="wwClear">Clear</button>
          </div>
        </div>

        <div class="ww-table-wrap">
          <table class="ww-table" id="wwTable">
            <thead>
              <tr>
                <th>parameter_code <b>*</b></th>
                <th>parameter_tr</th>
                <th>value <b>*</b></th>
                <th>unit <b>*</b></th>
                <th></th>
              </tr>
            </thead>
            <tbody id="wwTbody"></tbody>
          </table>
        </div>

        <div class="ww-foot">
          <button class="ww-btn ghost" id="wwClose">Close</button>
          <button class="ww-btn primary" id="wwSave">Save to Supabase</button>
        </div>
      </div>
    `;

    const css = document.createElement("style");
    css.textContent = `
      #wwModal{position:fixed;inset:0;z-index:9999;display:none}
      #wwModal.is-open{display:block}
      #wwModal .ww-backdrop{position:absolute;inset:0;background:rgba(2,21,78,.35)}
      #wwModal .ww-panel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
        width:min(980px,92vw);background:#fff;border-radius:16px;box-shadow:0 20px 70px rgba(0,0,0,.25);
        padding:18px 18px 14px;font:14px system-ui}
      #wwModal .ww-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}
      #wwModal .ww-title{font-size:18px;font-weight:700;color:#02154e}
      #wwModal .ww-sub{font-size:12px;color:#667}
      #wwModal .ww-x{border:0;background:#02154e;color:#fff;width:36px;height:36px;border-radius:10px;font-size:22px;cursor:pointer}
      #wwModal .ww-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
      #wwModal .ww-field span{display:block;font-size:12px;color:#556;margin-bottom:6px}
      #wwModal .ww-field b{color:#D51635}
      #wwModal input{width:100%;padding:10px 12px;border:1px solid #e6e7eb;border-radius:10px;outline:none}
      #wwModal input:focus{border-color:#02154e;box-shadow:0 0 0 3px rgba(2,21,78,.08)}
      #wwModal .ww-params-head{display:flex;align-items:center;justify-content:space-between;margin:6px 0 10px}
      #wwModal .ww-params-title{font-weight:700;color:#02154e}
      #wwModal .ww-params-actions{display:flex;gap:10px}
      #wwModal .ww-table-wrap{border:1px solid #eef0f4;border-radius:12px;overflow:hidden}
      #wwModal .ww-table{width:100%;border-collapse:collapse}
      #wwModal th,#wwModal td{padding:10px;border-bottom:1px solid #eef0f4;text-align:left;vertical-align:middle}
      #wwModal th{background:#f7f8fb;font-size:12px;color:#334}
      #wwModal td:last-child{width:42px;text-align:center}
      #wwModal .ww-btn{border:0;background:#02154e;color:#fff;padding:10px 12px;border-radius:12px;cursor:pointer}
      #wwModal .ww-btn.ghost{background:#eef0f6;color:#02154e}
      #wwModal .ww-btn.primary{background:#02154e}
      #wwModal .ww-del{border:0;background:transparent;color:#D51635;font-size:18px;cursor:pointer}
      #wwModal .ww-foot{display:flex;justify-content:flex-end;gap:10px;margin-top:12px}
      @media (max-width:720px){ #wwModal .ww-grid{grid-template-columns:1fr} }
    `;
    document.head.appendChild(css);
    document.body.appendChild(wrap);
  }

  function openModal(){ ensureModal(); $("#wwModal")?.classList.add("is-open"); }

  // expose for external bind patches
  try{ window.__WW_openModal = openModal; window.__WW_ensureModal = ensureModal; }catch(e){}


  function bind(){
    const btn = document.getElementById("btnOpenManualModal");
    if (btn){
      btn.addEventListener("click", (e)=>{ e.preventDefault(); openModal(); }, { capture:true });
      console.log("[WW] bound to #btnOpenManualModal");
      return true
    }
    return false
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ()=>{ bind(); setTimeout(bind, 300); setTimeout(bind, 1200); });
  } else {
    bind(); setTimeout(bind, 300); setTimeout(bind, 1200);
  }
  console.log("[WW] LOADED v2");
})();

// ---- PATCH: bind to #tabManual AND #btnOpenManualModal (capture) ----
(function(){
  function _wwBind2(){
    try{
      const tab = document.getElementById("tabManual");
      if (tab && !tab.__WW_BOUND){
        tab.__WW_BOUND = true;
        tab.addEventListener("click", function(){
          try{ (window.__WW_openModal||openModal)(); }catch(e){ console.warn("[WW] openModal failed", e); }
        }, { capture:true });
        console.log("[WW] PATCH bound to #tabManual (capture)");
      }

      const btn = document.getElementById("btnOpenManualModal");
      if (btn && !btn.__WW_BOUND){
        btn.__WW_BOUND = true;
        btn.addEventListener("click", function(e){
          e.preventDefault();
          try{ (window.__WW_openModal||openModal)(); }catch(err){ console.warn("[WW] openModal failed", err); }
        }, { capture:true });
        console.log("[WW] PATCH bound to #btnOpenManualModal (capture)");
      }
    }catch(e){
      console.warn("[WW] PATCH bind error", e);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", _wwBind2);
  else _wwBind2();

  setTimeout(_wwBind2, 200);
  setTimeout(_wwBind2, 900);
})();
