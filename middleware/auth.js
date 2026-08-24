// middleware/auth.js

const admin = require("../config/firebase");
const jwt = require("jsonwebtoken");

const verifyUser = async (req, res, next) => {
  try {
    // Check if this is a React Native/ESP32 request (has Authorization header with Bearer token)
    const hasAuthHeader = req.headers.authorization?.startsWith("Bearer ");

    if (hasAuthHeader && !req.headers.origin) {
      await React_Native_Request(req, res, next);
      return;
    }

    // Browser request - check for Firebase session cookie
    const sessionCookie = req.cookies.session;
    console.log("Session Cookie:", sessionCookie);
    if (!sessionCookie) {
      next();
      return;
    }

    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    req.uid = decoded.uid;
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    next();
  }
  return;
};

async function React_Native_Request(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  // console.log(req.headers, token);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      req.user = decoded;
    } catch (err) {}
  }
  next();
}

module.exports = verifyUser;
