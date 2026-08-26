const express = require("express");
const router = express.Router();
// Import your auth middleware (adjust path as needed)
// const auth = require("../middleware/auth");
const {
  addEmergencyContact,
  getEmergencyContacts,
  updateEmergencyContact,
  deleteEmergencyContact,
} = require("../controllers/emergencyContactsController");

/**
 * Emergency Contacts Routes
 * All routes require authentication
 */

// POST /api/emergency-contacts - Add new emergency contact
// Body: { name, phone, relationship }
router.post("/", /* auth, */ addEmergencyContact);

// GET /api/emergency-contacts - Get all emergency contacts
router.get("/", /* auth, */ getEmergencyContacts);

// PUT /api/emergency-contacts/:id - Update emergency contact
// Body: { name?, phone?, relationship? }
router.put("/:id", /* auth, */ updateEmergencyContact);

// DELETE /api/emergency-contacts/:id - Delete emergency contact
router.delete("/:id", /* auth, */ deleteEmergencyContact);

module.exports = router;

/**
 * Usage in main app.js or server.js:
 *
 * const emergencyContactsRoutes = require("./routes/emergencyContactsRoutes");
 * app.use("/api/emergency-contacts", emergencyContactsRoutes);
 */
