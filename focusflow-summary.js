(() => {
  "use strict";

  function readRecords(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value.filter(record => record && typeof record === "object") : [];
    } catch {
      return [];
    }
  }

  function getSummary() {
    const date = new Date().toISOString().slice(0, 10);
    const tasks = readRecords("ff_tasks");
    const sessions = readRecords("ff_pom").filter(session => session.date === date);
    const focusMinutes = sessions.reduce((total, session) => {
      const minutes = Number(session.totalFocusMin);
      return Number.isFinite(minutes) && minutes > 0 ? total + minutes : total;
    }, 0);

    return {
      date,
      open: tasks.filter(task => task.status !== "done").length,
      completed: tasks.filter(task => task.status === "done").length,
      focusMinutes: Math.round(focusMinutes)
    };
  }

  const summaryPanel = document.querySelector("[data-focusflow-summary]");
  if (summaryPanel) {
    function showSummary() {
      const summary = getSummary();
      for (const key of ["open", "completed", "focusMinutes"]) {
        summaryPanel.querySelector(`[data-count="${key}"]`).textContent = summary[key];
      }
      summaryPanel.hidden = !(summary.open || summary.completed || summary.focusMinutes);
    }

    showSummary();
    window.addEventListener("pageshow", showSummary);
    window.addEventListener("storage", event => {
      if (!event.key || ["ff_tasks", "ff_pom"].includes(event.key)) showSummary();
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) showSummary();
    });
  }

  const form = document.getElementById("focusflow-sheets");
  if (!form) return;
  const download = document.getElementById("focusflow-download-summary");
  const endpoint = form.elements.namedItem("endpoint");
  const key = form.elements.namedItem("syncKey");
  const submit = form.querySelector('button[type="submit"]');
  const message = document.getElementById("focusflow-sync-status");
  const endpointPreference = "ff_summary_endpoint";
  const deploymentUrl = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/;

  download.addEventListener("click", () => {
    const { date, open, completed, focusMinutes } = getSummary();
    const csv = `Date (UTC),Open tasks,Completed tasks,Focus minutes\r\n${date},${open},${completed},${focusMinutes}\r\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `focusflow-summary-${date}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  try {
    endpoint.value = localStorage.getItem(endpointPreference) || "";
  } catch {
    // A fresh endpoint can still be entered when storage is unavailable.
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (submit.disabled) return;
    const url = endpoint.value.trim();
    const syncKey = key.value.trim();
    if (!deploymentUrl.test(url) || syncKey.length < 32) {
      message.textContent = "Enter the Google Apps Script /exec URL and the configured sync key.";
      return;
    }

    submit.disabled = true;
    message.textContent = "Sending the summary to Google Sheets…";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "omit",
        body: JSON.stringify({ syncKey, summary: getSummary() }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error("Google Sheets did not accept the request.");
      const receipt = await response.json();
      if (receipt.status !== "ok") {
        message.textContent = "Sheets rejected the request. Check your deployment settings and sync key.";
        return;
      }
      try {
        localStorage.setItem(endpointPreference, url);
      } catch {
        // Saving the URL is optional after a successful write.
      }
      key.value = "";
      message.textContent = `Summary saved to Google Sheets for ${receipt.date} (UTC).`;
    } catch {
      message.textContent = "Could not confirm the sync. Check the deployment URL, permissions, or network and retry.";
    } finally {
      clearTimeout(timeout);
      submit.disabled = false;
    }
  });
  submit.disabled = false;
})();
