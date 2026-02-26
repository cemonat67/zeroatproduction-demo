// assets/js/risk-core.js — Phase 2 (storage-backed global risk core)
(function(){
  const KEY = "ZERO_RISK_V1";

  window.__ZERO_CONFIG__ = window.__ZERO_CONFIG__ || {
    thresholds: { cfoShock: { monitor: 1.0, action: 2.0 } }
  };

  window.__ZERO_RISK__ = window.__ZERO_RISK__ || {};

  function emit(){
    try{
      window.dispatchEvent(new CustomEvent("zero:risk-update", { detail: window.__ZERO_RISK__ }));
    } catch(_e){}
  }

  function persist(){
    try{
      localStorage.setItem(KEY, JSON.stringify(window.__ZERO_RISK__));
    } catch(_e){}
  }

  window.__ZERO_RISK__.load = function(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return;
      const obj = JSON.parse(raw);
      if(obj && typeof obj === "object"){
        Object.assign(window.__ZERO_RISK__, obj);
        emit();
      }
    } catch(_e){}
  };

  window.__ZERO_RISK__.setCfoShock = function(payload){
    const prev = window.__ZERO_RISK__.cfoShock || {};
    window.__ZERO_RISK__.cfoShock = Object.assign({}, prev, payload, {
      threshold: window.__ZERO_CONFIG__.thresholds.cfoShock
    });
    persist();
    emit();
  };

  // bootstrap
  try{ window.__ZERO_RISK__.load(); } catch(_e){}
})();
