(() => {
  function $(id){ return document.getElementById(id); }

  function getText(id, fallback=""){
    const el = $(id);
    if (!el) return fallback;
    return (el.textContent || "").trim() || fallback;
  }

  function buildSummary() {
    const ceo = getText("ceoScore", "75%");
    const cfo = getText("cfoImpact", "€ 477,440");
    const cto = getText("ctoHealth", "OK");
    const sub = getText("ctoSub", "Offline mode active");

    const ts = new Date().toISOString();
    return [
      "Zero@Production — Executive Snapshot",
      "----------------------------------",
      `CEO  Overall Score : ${ceo}`,
      `CFO  Impact / Year : ${cfo}`,
      `CTO  System Health : ${cto}`,
      `CTO  Note          : ${sub}`,
      "",
      `Generated: ${ts}`,
    ].join("\n");
  }

  async function copyToClipboard(text){
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // iPad/Safari fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch (e2) {
        document.body.removeChild(ta);
        return false;
      }
    }
  }

  function exportPDF() {
    const lines = buildSummary().split("\n").filter(Boolean).map(x => ({ label: "", value: x }));
    if (window.ZeroPDF && typeof window.ZeroPDF.exportSimpleReport === "function") {
      window.ZeroPDF.exportSimpleReport("Zero@Production — Executive Report", lines);
      return true;
    }
    alert("PDF export not available (ZeroPDF missing).");
    return false;
  }

  function mailDraft() {
    const subject = encodeURIComponent("Zero@Production — Executive Snapshot");
    const body = encodeURIComponent(buildSummary());
    // senin mailini istersen sonra parametre yaparız
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  function wire() {
    const btnPdf  = $("btnExportPDF");
    const btnCopy = $("btnCopySummary");
    const btnMail = $("btnEmailSnapshot");

    if (btnPdf) btnPdf.addEventListener("click", (e) => { e.preventDefault(); exportPDF(); });
    if (btnCopy) btnCopy.addEventListener("click", async (e) => {
      e.preventDefault();
      const ok = await copyToClipboard(buildSummary());
      if (!ok) alert("Copy failed on this browser. (Try selecting text manually.)");
    });
    if (btnMail) btnMail.addEventListener("click", (e) => { e.preventDefault(); mailDraft(); });
  }

  document.addEventListener("DOMContentLoaded", wire);
})();
