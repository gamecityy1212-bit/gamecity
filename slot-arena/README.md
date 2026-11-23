# Slot Arena

Check whether Screen 1 and Screen 2 are free for a chosen date and time, backed by Firebase.

## Structure
```
slot-arena/
├── firebase.json          Firebase Hosting + Firestore config
├── firestore.rules        Database security rules
├── README.md
└── public/
    ├── index.html         Login screen + home page markup
    ├── assets/logo.svg    Your image (replace this file, keep the name or edit index.html)
    ├── css/styles.css     Gaming / classy theme
    └── js/
        ├── config.js      Firebase keys, business hours, list of screens  <- edit this
        ├── db.js          Firestore reads/writes (demo data until config is filled)
        ├── auth.js        Login and logout (no sign-up)
        ├── slots.js       Overlap logic, validation, summary text
        ├── ui.js          Rendering
        └── main.js        Wiring
```

## Try it now (demo mode)
```
cd slot-arena
npx serve public        # or: python3 -m http.server -d public 8000
```
Log in with `player1` / `demo123`. Today has Screen 1 booked 10:00-10:30, Screen 1 and 2 booked 14:00-15:00.

## Connect Firebase
1. console.firebase.google.com: create a project, add a Web app, copy its config into `public/js/config.js`.
2. Authentication > Sign-in method: enable Email/Password. Users tab: add users as `loginid@slotarena.app` (login ID `raj` = `raj@slotarena.app`).
3. Firestore Database: create a database (production mode).
4. Deploy:
```
npm i -g firebase-tools
firebase login
firebase init        # choose Hosting + Firestore, use existing files, public dir = public
firebase deploy
```

## Booking data format (collection `bookings`)
| field | example |
|---|---|
| date | "2026-11-24" |
| screen | 1 or 2 |
| start | "10:00" |
| end | "10:30" |
| status | "confirmed" or "cancelled" |
| uid | Firebase user id |

## Result scenarios
- Both free: "Both screens are free"
- One full: "Screen 1 is full. Screen 2 is free."
- Both full: "Both screens are full"
