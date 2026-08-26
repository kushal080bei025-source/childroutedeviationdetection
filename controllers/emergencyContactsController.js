const User = require("../models/User");

/**
 * Add a new emergency contact
 * POST /api/emergency-contacts
 */
exports.addEmergencyContact = async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;
    const userId = req.user._id; // From auth middleware

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        error: "Name and phone are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Initialize emergencyContacts array if it doesn't exist
    if (!user.emergencyContacts) {
      user.emergencyContacts = [];
    }

    // Check if maximum contacts reached
    if (user.emergencyContacts.length >= 5) {
      return res.status(400).json({
        error: "Maximum 5 emergency contacts allowed",
      });
    }

    // Add new contact
    user.emergencyContacts.push({
      name,
      phone,
      relationship: relationship || "other",
    });

    await user.save();

    const newContact =
      user.emergencyContacts[user.emergencyContacts.length - 1];

    res.status(201).json({
      success: true,
      message: "Emergency contact added successfully",
      contact: newContact,
    });
  } catch (error) {
    console.error("Error adding emergency contact:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all emergency contacts for authenticated user
 * GET /api/emergency-contacts
 */
exports.getEmergencyContacts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("emergencyContacts");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      contacts: user.emergencyContacts || [],
      count: (user.emergencyContacts || []).length,
    });
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update an emergency contact
 * PUT /api/emergency-contacts/:id
 */
exports.updateEmergencyContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, relationship } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const contact = user.emergencyContacts.id(id);

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Update fields if provided
    if (name !== undefined) contact.name = name;
    if (phone !== undefined) contact.phone = phone;
    if (relationship !== undefined) contact.relationship = relationship;

    await user.save();

    res.json({
      success: true,
      message: "Emergency contact updated successfully",
      contact,
    });
  } catch (error) {
    console.error("Error updating emergency contact:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete an emergency contact
 * DELETE /api/emergency-contacts/:id
 */
exports.deleteEmergencyContact = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove contact by id
    const contactExists = user.emergencyContacts.id(id);

    if (!contactExists) {
      return res.status(404).json({ error: "Contact not found" });
    }

    user.emergencyContacts.pull(id);
    await user.save();

    res.json({
      success: true,
      message: "Emergency contact deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting emergency contact:", error);
    res.status(500).json({ error: error.message });
  }
};
