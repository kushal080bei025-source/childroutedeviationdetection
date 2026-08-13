require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const { Server } = require("socket.io");

const verifyUser = require("./middleware/auth");
const authMiddleware = require("./middleware/authenticate");
const BaseMiddleware = require("./middleware/baseMiddleware");
const upload = require("./middleware/upload");

const {
  login,
  register,
  updateDevice,
  Logout,
  CheckAuthorization,
  loginWithGoogle,
  refreshToken,
} = require("./controllers/authController");

const {
  GetProfule,
  ProfileDashboard,
  ProfileDashboardSelectionUpdate,
  ProfilePictureUpload,
} = require("./controllers/profileController");

const { onLiveData, sendNotification } = require("./socketIo");

/* =========================================================
   APP + SERVER
========================================================= */

const app = express();

const server = http.createServer(app);

/*
 * IMPORTANT FOR RENDER
 *
 * Render provides process.env.PORT automatically.
 * Local development will use 3000.
 */
const PORT = process.env.PORT || 3000;

/* =========================================================
   TRUST PROXY
========================================================= */

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

/* =========================================================
   SOCKET.IO
========================================================= */

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Requests without Origin
      // (ESP32, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      const allowed =
        origin === "http://localhost:3000" ||
        origin === "http://localhost:8081" ||
        origin === "http://localhost:5173" ||
        origin.includes(".expo.app") ||
        origin.includes(".expo.dev") ||
        origin.includes(".ngrok-free.dev") ||
        origin.includes(".ngrok-free.app") ||
        origin.includes(".ngrok.io") ||
        origin.includes(".onrender.com");

      if (allowed) {
        callback(null, true);
      } else {
        console.log("Blocked Socket.IO Origin:", origin);
        callback(new Error("Not allowed by Socket.IO CORS"));
      }
    },

    methods: ["GET", "POST"],

    credentials: true,
  },

  transports: ["websocket", "polling"],

  pingInterval: 25000,

  pingTimeout: 60000,
});

/* =========================================================
   REQUEST LOGGER
========================================================= */

app.use((req, res, next) => {
  console.log("==================================");

  console.log("Request:", req.method, req.originalUrl);

  next();
});

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:5173",
  "https://snack-runtime.eascdn.net",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // ESP32 / Postman / server-to-server
      if (!origin) {
        return callback(null, true);
      }

      const allowed =
        allowedOrigins.includes(origin) ||
        origin.includes(".expo.app") ||
        origin.includes(".expo.dev") ||
        origin.includes(".ngrok-free.dev") ||
        origin.includes(".ngrok-free.app") ||
        origin.includes(".ngrok.io") ||
        origin.includes(".onrender.com");

      if (allowed) {
        callback(null, true);
      } else {
        console.log("Blocked Origin:", origin);

        callback(new Error("Not allowed by CORS"));
      }
    },

    credentials: true,
  }),
);

/* =========================================================
   BODY PARSING
========================================================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

/* =========================================================
   SESSION
========================================================= */

app.use(
  session({
    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),

    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,

      httpOnly: true,

      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

      secure: process.env.NODE_ENV === "production",
    },
  }),
);

/* =========================================================
   UPLOAD
========================================================= */

app.use(upload.any());

app.use(BaseMiddleware);

/* =========================================================
   STATIC FILES
========================================================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.static(path.join(__dirname, "public")));

/* =========================================================
   EJS
========================================================= */

app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");

/* =========================================================
   BASIC TEST ROUTES
========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Child Route Detection Backend is running",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GET /test working",
  });
});

app.post("/test", (req, res) => {
  console.log("POST /test received");

  console.log(req.body);

  res.status(200).json({
    success: true,

    message: "POST received",

    received: req.body,
  });
});

/* =========================================================
   SIM800 TEST
========================================================= */

app.post("/sim800/livedata", (req, res) => {
  console.log("SIM800 payload:", req.body);

  return res.status(200).json({
    success: true,

    message: "SIM800 data received",

    received: req.body,
  });
});

/* =========================================================
   AUTH ROUTES
========================================================= */

app.post("/login", login);

app.post("/register", register);

app.post("/google-login", loginWithGoogle);

app.post("/refreshtoken", refreshToken);

/* =========================================================
   AUTHENTICATION MIDDLEWARE
========================================================= */

app.use(verifyUser);

app.use(authMiddleware);

/* =========================================================
   PROTECTED ROUTES
========================================================= */

app.post("/auth", CheckAuthorization);

app.use("/admin", require("./routes/admin-routes"));

app.use("", require("./routes/devices"));

app.use("", require("./routes/alerts"));

app.use("/adminPannel/users", require("./routes/admin-pannel/users"));

app.use("/adminPannel/devices", require("./routes/admin-pannel/devices"));

app.use("/api/route", require("./routes/route_deviation.js"));

app.use("", require("./routes/users"));

/* =========================================================
   PROFILE / DEVICE ROUTES
========================================================= */

app.post("/update", updateDevice);

app.post("/logout", Logout);

app.post("/profile", GetProfule);

app.post("/profileDashboard", ProfileDashboard);

app.post("/uploadProfilePicture", ProfilePictureUpload);

app.post("/profileDashboard/select", ProfileDashboardSelectionUpdate);

/* =========================================================
   SEND NOTIFICATION
========================================================= */

app.post("/sendNotification", async (req, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({
        success: false,

        message: "Unauthorized",
      });
    }

    const { notification_type } = req.body;

    if (!notification_type) {
      return res.status(400).json({
        success: false,

        message: "notification_type is required",
      });
    }

    await sendNotification(notification_type, req, res, io);
  } catch (error) {
    console.error("Error sending notification:", error.message);

    return res.status(500).json({
      success: false,

      error: error.message,
    });
  }
});

/* =========================================================
   LIVE DATA
========================================================= */

app.post("/livedata", async (req, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({
        success: false,

        message: "Unauthorized",
      });
    }

    const updated = await onLiveData(io, req.dbUser, req.body);

    return res.status(200).json({
      success: true,

      updated,
    });
  } catch (error) {
    console.error("Error processing /livedata request:", error.message);

    return res.status(500).json({
      success: false,

      error: error.message,
    });
  }
});

/* =========================================================
   SOCKET.IO EVENTS
========================================================= */

io.on("connection", (socket) => {
  console.log("\nUser Connected:", socket.id);

  console.log(
    "Transport:",
    socket.handshake.headers["user-agent"]?.substring(0, 50),
  );

  console.log("Time:", new Date().toLocaleTimeString());

  /* -----------------------------------------
           TEST EVENT
        ----------------------------------------- */

  socket.on("test", (data) => {
    console.log("Test event received:", data);

    socket.emit("test-response", {
      status: "ok",
      received: data,
    });
  });

  /* -----------------------------------------
           CONTINUOUS MESSAGE
        ----------------------------------------- */

  socket.on("continuousMessage", (message) => {
    try {
      console.log("got", message.data);
    } catch (error) {
      console.error("Error processing message:", error.message);

      socket.emit("messageReceived", {
        success: false,

        messageId: message?.id,

        error: error.message,
      });
    }
  });

  /* -----------------------------------------
           PING
        ----------------------------------------- */

  socket.on("ping", () => {
    socket.emit("pong");
  });

  /* -----------------------------------------
           DISCONNECT
        ----------------------------------------- */

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });

  /* -----------------------------------------
           SOCKET ERROR
        ----------------------------------------- */

  socket.on("error", (error) => {
    console.error("Socket error:", socket.id, error);
  });
});

/* =========================================================
   MONGODB + SERVER START
========================================================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    /*
     * IMPORTANT:
     *
     * 0.0.0.0 allows Render to reach
     * the Node.js server.
     */

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);

      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);

    process.exit(1);
  });
