// Koa-style onion middleware pipeline for MQTT "message" events.
// Each middleware: async (ctx, next) => { ...; await next(); }
// ctx = { topic, raw, data, io, user, dbUser }

const jwt = require("jsonwebtoken");
const User = require("../db/User");

function composeMqttMiddleware(middlewares) {
  return function (ctx) {
    let index = -1;

    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error("next() called multiple times"));
      }
      index = i;
      const fn = middlewares[i];
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}

const mqttLogger = async (ctx, next) => {
  console.log("MQTT message received on topic:", ctx.topic);
  await next();
};

const mqttJsonParser = async (ctx, next) => {
  try {
    ctx.data = JSON.parse(ctx.raw.toString("utf8"));
  } catch (error) {
    console.error("Invalid JSON received:", error.message);
    return; // stop the pipeline, don't call next()
  }
  await next();
};

const mqttErrorHandler = (handler) => async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    handler(error, ctx);
  }
};

// expects ctx.data.accessToken (or ctx.data.authorization === "Bearer <accessToken>"), sets ctx.user (jwt payload) and ctx.dbUser (real user)
const mqttAuth = async (ctx, next) => {
  const token = ctx.data?.accessToken || ctx.data?.authorization?.split(" ")[1];

  if (token) {
    delete ctx.data.authorization; // remove token from data for security
    delete ctx.data.accessToken;
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      ctx.user = decoded;

      const dbUser = await User.findOne({ uid: decoded.uid });
      if (dbUser) {
        ctx.dbUser = dbUser;
      }
    } catch (error) {
      console.error("MQTT auth failed:", error.message);
    }
  }

  await next();
};

module.exports = {
  composeMqttMiddleware,
  mqttLogger,
  mqttJsonParser,
  mqttErrorHandler,
  mqttAuth,
};
