const jwt = require("jsonwebtoken");
const User = require("../db/User");

// wraps a socket event handler and requires data.authorization === "Bearer <token>"
const socketAuthenticate = (handler) => {
  return async (socket, data, ...rest) => {
    try {
      const authorization = data?.authorization;

      if (!authorization || !authorization.startsWith("Bearer ")) {
        return socket.emit("error", {
          success: false,
          message: "Unauthorized",
        });
      }

      const token = authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      const dbUser = await User.findOne({ uid: decoded.uid });
      if (!dbUser) {
        return socket.emit("error", {
          success: false,
          message: "Unauthorized",
        });
      }

      socket.uid = decoded.uid;
      socket.user = decoded;
      socket.dbUser = dbUser;

      return handler(socket, data, ...rest);
    } catch (error) {
      console.error("Socket authenticate error:", error.message);
      return socket.emit("error", {
        success: false,
        message: "Unauthorized",
      });
    }
  };
};

module.exports = socketAuthenticate;
