// Wires the pieces together.
import { DEMO, getBookings, addBooking, deleteBooking } from "./db.js";
import { login, logout, onUserChange } from "./auth.js";
import { SCREENS } from "./config.js";
import { todayStr, t12, dateLabel, availability, summarize, validate } from "./slots.js";
import { $, showHome, renderResult, renderBooked, showBooked, showCancelled } from "./ui.js";

/* ----- login ----- */
async function doLogin() {
  const id = $("lid").value.trim().toLowerCase(), pw = $("pw").value;
  $("loginErr").textContent = "";
  if (!id || !pw) { $("loginErr").textContent = "Enter your login ID and password."; return; }
  $("loginBtn").disabled = true;
  try { await login(id, pw); }
  catch (e) {
    $("loginErr").textContent = e.code === "auth/too-many-requests"
      ? "Too many attempts. Try again in a few minutes."
      : "Incorrect login ID or password.";
  }
  $("loginBtn").disabled = false;
}
$("loginBtn").onclick = doLogin;
["lid", "pw"].forEach(i => $(i).addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); }));
$("logoutBtn").onclick = () => { $("pw").value = ""; $("result").innerHTML = ""; logout(); };
if (DEMO) $("demoNote").classList.remove("hidden");

/* ----- home ----- */
$("date").value = todayStr();
$("date").min = todayStr();

async function refreshDay() {
  const date = $("date").value; if (!date) return;
  try {
    renderBooked(date, await getBookings(date), async (id, button) => {
      if (!confirm("Delete this booking? The time will become free.")) return;
      button.disabled = true;
      try {
        await deleteBooking(id);
        await refreshDay();
        showCancelled();
      } catch {
        button.disabled = false;
        $("formErr").textContent = "Could not delete this booking. You can only delete bookings made with this login.";
      }
    });
  }
  catch { $("dayList").innerHTML = '<p class="empty">Could not load bookings. Check your connection.</p>'; }
}

async function check() {
  const date = $("date").value, start = $("start").value;
  // Native time controls use 00:00 for the start of a date and cannot enter 24:00.
  // This checkbox deliberately means the midnight immediately following `date`.
  const end = $("endAtMidnight").checked ? "24:00" : $("end").value;
  const nickname = $("nickname").value.trim();
  const msg = validate(date, start, end);
  $("formErr").textContent = msg; $("result").innerHTML = "";
  if (msg) return;

  $("checkBtn").disabled = true;
  try {
    const bookings = await getBookings(date);
    const results = availability(bookings, start, end);
    const range = `${dateLabel(date)}, ${t12(start)} to ${t12(end)}`;
    renderResult(results, summarize(results), range, async (screenId, btn) => {
      btn.disabled = true;
      // Re-check right before saving, in case someone booked in the meantime
      const fresh = availability(await getBookings(date), start, end).find(r => r.screen.id === screenId);
      if (!fresh.free) { check(); return; }
      await addBooking({ date, screen: screenId, start, end, nickname });
      showBooked(SCREENS.find(s => s.id === screenId).name, range);
      refreshDay();
    });
  } catch {
    $("formErr").textContent = "Could not reach the database. Check your connection and try again.";
  }
  $("checkBtn").disabled = false;
}
$("checkBtn").onclick = check;
$("date").onchange = () => { $("result").innerHTML = ""; refreshDay(); };
$("endAtMidnight").onchange = event => {
  $("end").disabled = event.target.checked;
  $("result").innerHTML = "";
};

onUserChange(loggedIn => { showHome(loggedIn); if (loggedIn) refreshDay(); });
