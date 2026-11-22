# Private Attendance for RagabVerse

The portfolio links to [attendance.html](../attendance.html). GitHub Pages serves that entry page. The attendance server protects every page and asset with HTTP Basic authentication, and Firebase account sign-in controls access to personal records. The source and build folder are excluded from the portfolio's Pages build.

Imported from [MohammedRagab99/attendance-web](https://github.com/MohammedRagab99/attendance-web/tree/9fe8b4205b34e40b07c4cee97aa501e2fd2ee92f).

This integration uses Firestore for attendance, leave, overtime, and settings. The upstream app does not implement Google Sheets sync, biometric or PIN sign-in, or leave balance carry-over.

## Configure Firebase

1. Use a Firebase project you control. In Authentication, enable **Email/Password**, then create the intended account or select an existing account. Copy its Firebase **UID**.
2. Create a Firestore database. In the Firestore console, create a document with that UID in the `attendanceAccess` collection. It can have an `enabled` field for your reference. The rules check whether the document exists, so delete the document to revoke attendance access.
3. Review `firestore.rules` and `firestore.indexes.json`. Use them directly in a dedicated project, or merge the relevant rules and indexes with the existing project configuration. Deployment replaces the active rules, so review overlapping rules that could grant wider access. Use the Firebase CLI to deploy from this directory to a dedicated project:

   ```powershell
   firebase deploy --only firestore:rules,firestore:indexes --project YOUR_FIREBASE_PROJECT_ID
   ```

## Run on Windows

Use Node.js 22.13 or newer. From the RagabVerse checkout:

```powershell
cd private-attendance
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run password
```

Keep the generated password in your password manager. Paste the generated `ATTENDANCE_PASSWORD_SHA256` line and your Firebase web app configuration into `.env.local`, then run:

```powershell
npm.cmd run build
npm.cmd start
```

Open [the local attendance workspace](http://127.0.0.1:3100/). Enter `attendance` as the browser prompt username and use the generated password. Then sign in with the approved Firebase account. Firebase web configuration is baked into the build, so rebuild after changing it. Firebase account sign-out clears the app session. To clear browser-cached HTTP credentials, close the private browsing session or clear the browser's site data.

## Host for private online access

Run the same commands on a Node-capable host behind an HTTPS reverse proxy. The server listens on loopback port `3100` by default and accepts a different local port via `ATTENDANCE_PORT`. Forward the Authorization header, keep proxy caching off, and run `npm start` as the service entry point. Use the password generator for a new credential, replace its hash, and restart the service when rotating the password.

After verifying that your HTTPS URL challenges anonymous requests and accepts the password, change the target and local-only description in [attendance.html](../attendance.html) to point visitors at that deployment. Verify Firebase sign-in and create and remove a test record before entering real attendance data.
