"use strict";

const unit = document.getElementById("unit");
const notice = document.getElementById("status");
const form = document.getElementById("activity-form");
const sourceFilter = document.getElementById("activity-source");
const historySearch = document.getElementById("activity-search");
const equipmentSearch = document.getElementById("equipment-search");
const moreEquipment = document.getElementById("more-equipment");
const saveButton = document.getElementById("save-activity");
const viewButtons = [...document.querySelectorAll("[data-view]")];
let entries = [];
let library = [];
let libraryRequest;
let loaded = null;
let loadId = 0;
let view = "dashboard";
let equipmentLimit = 24;
let entryId = crypto.randomUUID();
let saving = false;

function today() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts();
  const datePart = type => parts.find(part => part.type === type).value;
  return [datePart("year"), datePart("month"), datePart("day")].join("-");
}

function status(text, error = false) {
  notice.textContent = text;
  notice.classList.toggle("error", error);
}

async function api(path, options) {
  const response = await fetch(path, options);
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      location.assign("/");
      throw new Error("Sign in again to continue.");
    }
    throw new Error(data.error || "The tracker could not complete the request.");
  }
  return data;
}

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function activityList(container, list) {
  container.replaceChildren();
  if (!list.length) {
    container.append(node("p", "No matching activity."));
    return;
  }
  for (const entry of list) {
    const row = node("article");
    row.append(node("h3", entry.tag || entry.unit), node("p", entry.activity));
    const details = [entry.date, entry.source, entry.order && "WO " + entry.order,
      entry.status, Number.isFinite(entry.progress) && entry.progress + "%",
      Number.isFinite(entry.hours) && entry.hours + " h"].filter(Boolean);
    row.append(node("p", details.join(" · "), "meta"));
    if (entry.permit) row.append(node("p", "EPTW " + entry.permit, "meta"));
    if (entry.remarks) row.append(node("p", entry.remarks, "meta"));
    container.append(row);
  }
}

function renderActivities() {
  const recent = document.getElementById("recent");
  const history = document.getElementById("history-results");
  if (loaded !== unit.value) {
    recent.replaceChildren();
    history.replaceChildren();
    for (const id of ["activity-count", "completed-count", "hours-count"]) {
      document.getElementById(id).textContent = "—";
    }
    return;
  }
  const day = today();
  const todays = entries.filter(item => item.source === "Tracker" && item.date === day);
  document.getElementById("activity-count").textContent = todays.length;
  document.getElementById("completed-count").textContent = todays.filter(item => item.status === "Complete").length;
  document.getElementById("hours-count").textContent = todays.reduce((sum, item) => sum + Number(item.hours || 0), 0);
  activityList(recent, entries.slice(0, 6));
  const search = historySearch.value.trim().toLowerCase();
  const filter = sourceFilter.value;
  activityList(history, entries.filter(item => {
    const matchesSource = filter === "all" || (filter === "Tracker" ? item.source === "Tracker" : item.source !== "Tracker");
    return matchesSource && [item.tag, item.order, item.permit, item.activity]
      .some(value => String(value).toLowerCase().includes(search));
  }));
}

async function refreshActivities(successMessage = "") {
  const requestedUnit = unit.value;
  const id = ++loadId;
  status("Loading workbook activity…");
  try {
    const data = await api("/api/activities?unit=" + encodeURIComponent(requestedUnit));
    if (id !== loadId) return;
    entries = data.entries;
    loaded = requestedUnit;
    renderActivities();
    status(data.writeReady ? successMessage : "Create the RagabVerseDaily table to enable Excel writes.", !data.writeReady);
  } catch (error) {
    if (id === loadId) status(error.message, true);
  }
}

async function loadLibrary() {
  if (!libraryRequest) {
    libraryRequest = api("/api/equipment").then(records => {
      library = records;
      const options = document.getElementById("equipment-options");
      for (const item of records) {
        const option = node("option", item.description);
        option.value = item.tag;
        options.append(option);
      }
    }).catch(error => {
      libraryRequest = null;
      throw error;
    });
  }
  try {
    await libraryRequest;
    renderEquipment();
  } catch (error) {
    if (view === "equipment") document.getElementById("equipment-count").textContent = error.message;
  }
}

function renderEquipment() {
  const query = equipmentSearch.value.trim().toLowerCase();
  const matches = library.filter(item => Object.values(item).some(value => value.toLowerCase().includes(query)));
  const results = document.getElementById("equipment-results");
  results.replaceChildren();
  document.getElementById("equipment-count").textContent = matches.length + " matching equipment records";
  for (const item of matches.slice(0, equipmentLimit)) {
    const card = node("article");
    const details = [item.family, item.type, item.location, item.locationDescription].filter(Boolean);
    card.append(node("h3", item.tag), node("p", item.description), node("p", details.join(" · "), "meta"));
    const choose = node("button", "Log activity for " + item.tag, "secondary");
    choose.type = "button";
    choose.addEventListener("click", () => {
      form.elements.namedItem("tag").value = item.tag;
      show("entry");
      form.elements.namedItem("activity").focus();
    });
    card.append(choose);
    results.append(card);
  }
  moreEquipment.hidden = matches.length <= equipmentLimit;
}

function show(next) {
  view = next;
  for (const button of viewButtons) {
    const active = button.dataset.view === next;
    button.setAttribute("aria-pressed", String(active));
    document.getElementById(button.dataset.view).hidden = !active;
  }
  if (next === "equipment" || next === "entry") loadLibrary();
}

form.elements.namedItem("date").value = today();
for (const button of viewButtons) button.addEventListener("click", () => show(button.dataset.view));
unit.addEventListener("change", () => {
  renderActivities();
  refreshActivities();
});
historySearch.addEventListener("input", renderActivities);
sourceFilter.addEventListener("change", renderActivities);
equipmentSearch.addEventListener("input", () => {
  equipmentLimit = 24;
  renderEquipment();
});
moreEquipment.addEventListener("click", () => {
  equipmentLimit += 24;
  renderEquipment();
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (saving) return;
  saving = true;
  saveButton.disabled = true;
  unit.disabled = true;
  status("Saving to the daily workbook…");
  const fields = Object.fromEntries(new FormData(form));
  try {
    await api("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({...fields, unit: unit.value, entryId, hours: Number(fields.hours), progress: Number(fields.progress)})
    });
    form.reset();
    form.elements.namedItem("date").value = today();
    entryId = crypto.randomUUID();
    status("Activity saved to Excel.");
    refreshActivities("Activity saved to Excel.");
  } catch (error) {
    status(error.message, true);
  } finally {
    saving = false;
    saveButton.disabled = false;
    unit.disabled = false;
  }
});

refreshActivities();
