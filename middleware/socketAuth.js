const jwt = require("jsonwebtoken");
const User = require("../db/User");

const socketAuth = async (socket, next) => {
  try {
    const origin = socket.handshake.headers.origin;

    if (!origin) {
      return await React_Native_Socket(socket, next);
    }

    return next();
  } catch (error) {
    console.error("Socket auth error:", error.message);
    next();
  }
};

async function React_Native_Socket(socket, next) {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers.authorization?.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.uid = decoded.uid;
    socket.user = decoded;

    const dbUser = await User.findOne({ uid: decoded.uid });
    if (dbUser) {
      socket.dbUser = dbUser;
    }
  } catch (error) {
    console.error("Socket JWT verification failed:", error.message);
  }

  next();
}

module.exports = socketAuth;
