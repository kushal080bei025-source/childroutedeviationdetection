const User = require("../db/User");
const EmergencyContact = require("../db/contacts.js");

/**
 * Handle MQTT request for emergency contacts
 * @param {Object} ctx - MQTT context object with topic, data, dbUser
 * @param {Object} mqttClient - MQTT client to publish response
 */
async function fetchEmergencyContacts(ctx, mqttClient) {
  const { data, dbUser } = ctx;

  console.log("Fetching emergency contacts for user:", dbUser.email);

  try {
    // Fetch user from database to get emergency contacts
    const user = await User.findById(dbUser._id).select("emergencyContacts");

    if (!user) {
      console.error("User not found:", dbUser._id);

      // Send error response
      mqttClient.publish(
        "SendEmergencyContactsResponse_051199c9b9c441f2b7bb3dac14eeeb6f",
        JSON.stringify({
          success: false,
          error: "User not found",
          contacts: [],
        }),
      );
      return;
    }

    // Check if user has emergency contacts
    const contacts = await EmergencyContact.find({
      userId: dbUser._id,
    }).sort({
      isPrimary: -1,
      createdAt: -1,
    });

    console.log(
      `Found ${contacts.length} emergency contacts for user ${dbUser.email}`,
    );

    // Format contacts for ESP32
    // Expected format: [{"name": "Parent 1", "phone": "9812345678"}]
    const formattedContacts = contacts
      .map((contact) => ({
        name: contact.name || "Unknown",
        phone: contact.phone || contact.phoneNumber || "",
      }))
      .filter((contact) => contact.phone !== ""); // Filter out contacts without phone numbers

    // Send response to ESP32
    const response = {
      success: true,
      contacts: formattedContacts,
      count: formattedContacts.length,
    };

    mqttClient.publish(
      "SendEmergencyContactsResponse_051199c9b9c441f2b7bb3dac14eeeb6f",
      JSON.stringify(response),
    );

    console.log("Emergency contacts response sent:", {
      count: formattedContacts.length,
      contacts: formattedContacts,
    });
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);

    // Send error response
    mqttClient.publish(
      "SendEmergencyContactsResponse_051199c9b9c441f2b7bb3dac14eeeb6f",
      JSON.stringify({
        success: false,
        error: error.message,
        contacts: [],
      }),
    );
  }
}

module.exports = { fetchEmergencyContacts };
