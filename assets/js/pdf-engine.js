/* Zero@Production — PDF Engine Wrapper (clean)
   Depends on: window.jspdf (jsPDF UMD)
*/

(function () {
  "use strict";

  function ensureJsPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert(
        "System Notice: PDF Engine (jspdf) missing.\n" +
        "Please run:\n" +
        "curl -L -o site/assets/libs/jspdf.umd.min.js https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js"
      );
      return null;
    }
    return window.jspdf.jsPDF;
  }

  // Public API
  window.ZeroPDF = {
    exportSimpleReport: function (title, lines) {
      var jsPDF = ensureJsPDF();
      if (!jsPDF) return;

      var doc = new jsPDF({ unit: "pt", format: "a4" });
      var x = 40, y = 60;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(String(title || "Report"), x, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      y += 24;

      (lines || []).forEach(function (ln) {
        if (y > 800) { doc.addPage(); y = 60; }
        doc.text(String(ln), x, y);
        y += 16;
      });

      doc.save((title || "report") + ".pdf");
    }
  };
})();
