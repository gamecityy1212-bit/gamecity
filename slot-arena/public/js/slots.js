// Pure slot logic (no screen, no database). Easy to test.
import { OPEN, CLOSE, SCREENS } from "./config.js";

export const todayStr = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };

export function t12(t) {
  let [h, m] = t.split(":").map(Number);
  const s = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${s}`;
}
export const dateLabel = d => new Date(d + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long" });

// Two ranges overlap when: existing.start < requested.end AND existing.end > requested.start
export const overlaps = (list, start, end) => list.filter(b => b.start < end && b.end > start);

// For each screen: is the requested time free or full?
export function availability(bookings, start, end) {
  return SCREENS.map(screen => {
    const clashes = overlaps(bookings.filter(b => b.screen === screen.id), start, end);
    return { screen, free: clashes.length === 0, clashes };
  });
}

// Headline for every scenario: both free, one free, both full
export function summarize(results) {
  const free = results.filter(r => r.free).map(r => r.screen.name);
  const full = results.filter(r => !r.free).map(r => r.screen.name);
  if (full.length === 0) return { kind: "ok", text: results.length === 2 ? "Both screens are free" : "All screens are free" };
  if (free.length === 0) return { kind: "full", text: results.length === 2 ? "Both screens are full" : "All screens are full" };
  return { kind: "mixed", text: `${full.join(", ")} ${full.length > 1 ? "are" : "is"} full. ${free.join(", ")} ${free.length > 1 ? "are" : "is"} free.` };
}

export function validate(date, start, end) {
  if (!date || !start || !end) return "Pick a date and both times.";
  if (date < todayStr()) return "Pick today or a later date.";
  if (end <= start) return "End time must be after the start time.";
  if (start < OPEN || end > CLOSE) return `Slots run from ${t12(OPEN)} to ${t12(CLOSE)}.`;
  if (date === todayStr()) {
    const n = new Date(), now = String(n.getHours()).padStart(2, "0") + ":" + String(n.getMinutes()).padStart(2, "0");
    if (start < now) return "That start time has already passed.";
  }
  return "";
}
