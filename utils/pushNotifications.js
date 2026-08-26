const admin = require("../config/firebase");
const User = require("../db/User.js");
const Notification = require("../db/notifications.js");
const UserCurrentDevice = require("../db/user_current_device.js");

/**
 * Send a push notification to a single FCM token.
 */
const sendToToken = async (token, { title, body, data = {} } = {}) => {
  if (!token) return { success: false, error: "Missing FCM token" };

  try {
    const messageId = await admin.messaging().send({
      token,
      notification: { title, body },
      data: stringifyData(data),
    });
    return { success: true, messageId };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
};

/**
 * Send a push notification to multiple FCM tokens at once.
 * Returns which tokens failed so callers can prune stale ones.
 */
const sendToTokens = async (tokens, { title, body, data = {} } = {}) => {
  const uniqueTokens = [...new Set((tokens || []).filter(Boolean))];
  console.log("Sending notification to tokens:", uniqueTokens);
  if (uniqueTokens.length === 0) {
    return { successCount: 0, failureCount: 0, invalidTokens: [] };
  }

  const response = await admin.messaging().sendEachForMulticast({
    tokens: uniqueTokens,
    notification: { title, body },
    icon: "./favicon.ico",
    data: stringifyData(data),
  });

  // Tokens Firebase reports as unregistered/invalid should be removed from the DB
  const invalidTokens = response.responses
    .map((res, i) => ({ res, token: uniqueTokens[i] }))
    .filter(
      ({ res }) =>
        !res.success &&
        [
          "messaging/invalid-registration-token",
          "messaging/registration-token-not-registered",
        ].includes(res.error?.code),
    )
    .map(({ token }) => token);

  if (invalidTokens.length) {
    await pruneInvalidTokens(invalidTokens);
  }

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    invalidTokens,
  };
};

/**
 * Send a push notification to every device registered to a user, and
 * persist it as a Notification document so it shows up in-app too.
 */
const sendToUser = async (
  userId,
  io,
  {
    title,
    body,
    data = {},
    type = "system",
    priority = "medium",
    sender = null,
    actionUrl = "",
  } = {},
) => {
  const user = await User.findById(userId).select("devices");

  if (!user) return { success: false, error: "User not found" };
  const currentDevice = await UserCurrentDevice.findOne({
    user: user._id,
  })
    .populate("device")
    .lean();
  const tokens = user.devices.map((d) => d.fcmToken).filter(Boolean);
  const notificationData = {
    recipient: userId,
    sender: userId,
    device: currentDevice?.device || null,
    title,
    message: body,
    type,
    priority,
    actionUrl,
    metadata: data,
  };
  console.log(
    "Sending notification to user:",
    userId,
    "with tokens:",
    tokens,
    notificationData,
  );

  if (io && io.sockets && io.sockets.sockets) {
    const sockets = io.sockets.sockets;
    console.log("Notification is sent to", sockets.size, "connected clients");
    for (const [id, socket] of sockets) {
      socket.emit("notification", notificationData);
    }
  }
  const [pushResult, notification] = await Promise.all([
    sendToTokens(tokens, { title, body, data }),
    notificationData,
  ]);
  Notification.create(notificationData);

  return { success: true, notification, ...pushResult };
};

// FCM data payload values must be strings
const stringifyData = (data) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value)]),
  );

const pruneInvalidTokens = async (invalidTokens) => {
  await User.updateMany(
    { "devices.fcmToken": { $in: invalidTokens } },
    { $pull: { devices: { fcmToken: { $in: invalidTokens } } } },
  );
};

module.exports = {
  sendToToken,
  sendToTokens,
  sendToUser,
};
