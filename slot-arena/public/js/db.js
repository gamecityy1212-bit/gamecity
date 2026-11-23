// Data layer. Talks to Firebase, or uses in-memory demo data until config.js is filled in.
import { firebaseConfig } from "./config.js";

export const DEMO = firebaseConfig.apiKey.startsWith("YOUR_");
const V = "10.12.2";
const CDN = `https://www.gstatic.com/firebasejs/${V}`;

let fb = null;
export async function getFirebase() {
  if (fb) return fb;
  const [appM, authM, fsM] = await Promise.all([
    import(`${CDN}/firebase-app.js`),
    import(`${CDN}/firebase-auth.js`),
    import(`${CDN}/firebase-firestore.js`)
  ]);
  const app = appM.initializeApp(firebaseConfig);
  fb = { auth: authM.getAuth(app), db: fsM.getFirestore(app), authM, fsM };
  return fb;
}

// ---- demo data (so you can try every scenario before Firebase is connected) ----
const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const demoBookings = [
  { id: "demo-1", date: today(), screen: 1, start: "10:00", end: "10:30", status: "confirmed" }, // Screen 1 busy
  { id: "demo-2", date: today(), screen: 1, start: "14:00", end: "15:00", status: "confirmed" },
  { id: "demo-3", date: today(), screen: 2, start: "14:00", end: "15:00", status: "confirmed" }  // both busy at 14:00
];

// All active bookings for one date (both screens)
export async function getBookings(date) {
  if (DEMO) return demoBookings.filter(b => b.date === date && b.status !== "cancelled");
  const { db, fsM } = await getFirebase();
  const snap = await fsM.getDocs(fsM.query(fsM.collection(db, "bookings"), fsM.where("date", "==", date)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(b => b.status !== "cancelled");
}

export async function addBooking({ date, screen, start, end, nickname }) {
  if (DEMO) { demoBookings.push({ id: `demo-${Date.now()}`, date, screen, start, end, nickname, status: "confirmed" }); return; }
  const { auth, db, fsM } = await getFirebase();
  await fsM.addDoc(fsM.collection(db, "bookings"), {
    date, screen, start, end, nickname, status: "confirmed",
    uid: auth.currentUser.uid, createdAt: fsM.serverTimestamp()
  });
}

export async function deleteBooking(id) {
  if (DEMO) {
    const index = demoBookings.findIndex(b => b.id === id);
    if (index !== -1) demoBookings.splice(index, 1);
    return;
  }
  const { db, fsM } = await getFirebase();
  await fsM.deleteDoc(fsM.doc(db, "bookings", id));
}
