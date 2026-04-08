(function () {

  const endpoint = "http://localhost:5000/api/rum";

  function sendData(payload) {
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).catch(() => {});
  }

  // ✅ CORRECT LOAD TIME (MODERN API)
  window.addEventListener("load", () => {
    const nav = performance.getEntriesByType("navigation")[0];

    const loadTime = Math.round(nav.loadEventEnd);

    sendData({
      type: "performance",
      loadTime,
      url: window.location.href,
      timestamp: Date.now()
    });
  });

  // ❌ ERROR CAPTURE
  window.onerror = function (msg, src, line, col) {
    sendData({
      type: "error",
      message: msg,
      source: src,
      line,
      col,
      url: window.location.href,
      timestamp: Date.now()
    });
  };

})();