// Login / logout only. There is no sign-up. Create users in Firebase console > Authentication.
import { DEMO, getFirebase } from "./db.js";
import { EMAIL_DOMAIN } from "./config.js";

let demoUser = false;
let demoListener = null;

// If the user typed a full email already, use it directly.
// If they typed just an ID (like "raj" or "tanmay"), append the domain.
function toEmail(id) {
  return id.includes("@") ? id : id + EMAIL_DOMAIN;
}

export async function login(id, password) {
  if (DEMO) {
    if (id !== "player1" || password !== "demo123") throw { code: "auth/invalid-credential" };
    demoUser = true; demoListener?.(true); return;
  }
  const { auth, authM } = await getFirebase();
  await authM.signInWithEmailAndPassword(auth, toEmail(id), password);
}

export async function logout() {
  if (DEMO) { demoUser = false; demoListener?.(false); return; }
  const { auth, authM } = await getFirebase();
  await authM.signOut(auth);
}

export async function onUserChange(cb) {
  if (DEMO) { demoListener = cb; cb(demoUser); return; }
  const { auth, authM } = await getFirebase();
  authM.onAuthStateChanged(auth, u => cb(!!u));
}