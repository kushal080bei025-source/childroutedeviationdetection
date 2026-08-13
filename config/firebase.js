const { getApps, initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getMessaging } = require("firebase-admin/messaging");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Render / production
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Local development
  serviceAccount = require("./serviceAccountKey.json");
}

// Reuse an existing app instance to avoid duplicate initialization
const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
    });

// Keep a backward-compatible surface for existing code paths
module.exports = {
  app,
  auth: () => getAuth(app),
  messaging: () => getMessaging(app),
};
