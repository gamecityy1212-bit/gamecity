// Everything that draws on the page.
import { SCREENS } from "./config.js";
import { t12, dateLabel } from "./slots.js";

export const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function showHome(on) {
  $("loginView").classList.toggle("hidden", on);
  $("homeView").classList.toggle("hidden", !on);
}

// results = [{screen, free, clashes}], summary = {kind, text}
export function renderResult(results, summary, range, onBook) {
  $("result").innerHTML =
    `<div class="summary ${summary.kind}">${esc(summary.text)}</div>
     <div class="cards">${results.map(r => `
       <div class="card ${r.free ? "ok" : "full"}">
         <h3>${esc(r.screen.name)}</h3>
         <div class="state">${r.free ? "Open" : "Full in this time period"}</div>
         <small>${r.free ? esc(range) : "Booked " + r.clashes.map(c => t12(c.start) + " to " + t12(c.end)).join(", ")}</small>
         ${r.free ? `<button class="book" data-screen="${r.screen.id}">Book ${esc(r.screen.name)}</button>` : ""}
       </div>`).join("")}
     </div>`;
  $("result").querySelectorAll(".book").forEach(b => b.onclick = () => onBook(Number(b.dataset.screen), b));
}

export function renderBooked(date, bookings, onDelete) {
  $("dayTitle").textContent = "Booked on " + dateLabel(date);
  $("dayList").innerHTML = SCREENS.map(s => {
    const list = bookings.filter(b => b.screen === s.id).sort((a, b) => a.start.localeCompare(b.start));
    return `<div><h3>${esc(s.name)}</h3>${list.length
      ? `<ul>${list.map(b => `<li><span>${t12(b.start)} to ${t12(b.end)}${b.nickname ? ` — ${esc(b.nickname)}` : ""}</span><button class="delete-slot" data-id="${esc(b.id)}" aria-label="Delete this booking">Delete</button></li>`).join("")}</ul>`
      : '<p class="empty">Open all day</p>'}</div>`;
  }).join("");
  $("dayList").querySelectorAll(".delete-slot").forEach(button => {
    button.onclick = () => onDelete(button.dataset.id, button);
  });
}

export const showBooked = (screenName, range) => {
  $("result").innerHTML = `<div class="summary ok">${esc(screenName)} booked: ${esc(range)}</div>`;
};

export const showCancelled = () => {
  $("result").innerHTML = '<div class="summary ok">Slot deleted. This time is now free.</div>';
};
