const jwt = require("jsonwebtoken");
const User = require("../db/User");

const authMiddleware = async (req, res, next) => {
  // console.log("Middleware Start");

  try {
    // Check if this is a React Native/ESP32 request (has Authorization header with Bearer token)
    const hasAuthHeader = req.headers.authorization?.startsWith("Bearer ");

    if (hasAuthHeader && !req.headers.origin) {
      return await React_Native_Request(req, res, next);
    }

    if (!hasAuthHeader && process.env.IS_WEP_NATIVE_TESTING) {
      const users = await User.find();
      const user = users[0];

      if (user) {
        req.dbUser = user;
      }
      return next();
    }

    // Debug logging for browser requests
    console.log("Browser request - Session data:", {
      hasSession: !!req.session,
      userId: req.session?.userId,
      hasUid: !!req.uid,
      path: req.path,
    });

    if ((process.env.IS_WEP_NATIVE || req.uid) && req.session?.userId) {
      const user = await User.findById(req.session.userId);

      if (user) {
        req.dbUser = user;
        console.log("User authenticated via Firebase session:", user.email);
      }
    } else if (req.session?.userId) {
      // Handle JWT-based browser sessions (non-Firebase)
      const user = await User.findById(req.session.userId);

      if (user) {
        req.dbUser = user;
        console.log("User authenticated via JWT session:", user.email);
      }
    }
    console.log("Request Authenticated");
    return next();
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
async function React_Native_Request(req, res, next) {
  //   const user = await User.findOne({ email: "nabin@gmail.com" });
  //   // console.log("React Native Request User:", user);
  //   req.user = { uid: user.uid };
  //   req.dbUser = user;
  //   next();
  //   return;
  if (req.user) {
    try {
      const user = await User.findOne({ uid: req.user.uid });
      if (user) {
        req.dbUser = user;
      }
    } catch (err) {}
  }
  next();
}
module.exports = authMiddleware;
