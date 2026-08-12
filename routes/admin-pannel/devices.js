const express = require("express");
const router = express.Router();
const Device = require("../../db/deviceinfo");
const User = require("../../db/User");

// @desc    Get all devices
// @route   GET /api/devices
router.get("/", async (req, res) => {
  try {
    const devices = await Device.find({})
      .populate("purchaser", "name email")
      .populate("assignedUser", "name email")
      .sort({ createdAt: -1 });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Get single device
// @route   GET /api/devices/:id
router.get("/:id", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id)
      .populate("purchaser", "name email profilePicture")
      .populate("assignedUser", "name email profilePicture");
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Create/generate a device
// @route   POST /api/devices
router.post("/", async (req, res) => {
  try {
    const {
      name,
      deviceType,
      serialNumber,
      imei,
      macAddress,
      purchaser,
      assignedUser,
      model,
      firmwareVersion,
      notes,
    } = req.body;

    // Verify purchaser and assigned user exist
    const purchaserUser = await User.findById(purchaser);
    if (!purchaserUser) {
      return res.status(400).json({ message: "Purchaser user not found" });
    }

    const operatorUser = await User.findById(assignedUser);
    if (!operatorUser) {
      return res
        .status(400)
        .json({ message: "Assigned operator user not found" });
    }

    // Check unique fields
    if (serialNumber) {
      const serialExists = await Device.findOne({ serialNumber });
      if (serialExists) {
        return res
          .status(400)
          .json({ message: "Device with this serial number already exists" });
      }
    }

    // Generate unique deviceId if not provided
    const deviceId =
      req.body.deviceId ||
      `DEV_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Establish a default location (e.g. San Francisco or user's last location)
    const initialLocation = {
      latitude: operatorUser.location?.lat || 37.7749,
      longitude: operatorUser.location?.lng || -122.4194,
      accuracy: 5,
      speed: 0,
      address: "Simulated Starting Location",
      updatedAt: new Date(),
    };

    const device = new Device({
      deviceId,
      name: name || "Smart SOS Device",
      deviceType: deviceType || "Safety Device",
      serialNumber,
      imei: imei || null,
      macAddress: macAddress || null,
      purchaser,
      assignedUser,
      model: model || "SmartSOS V1",
      firmwareVersion: firmwareVersion || "1.0.0",
      status: "active",
      batteryLevel: 100,
      lastSeenAt: new Date(),
      lastLocation: initialLocation,
      emergencyMode: false,
      onRoute: false,
      conected: true,
      notes: notes || "",
    });

    const savedDevice = await device.save();

    // Automatically link device to user's device array
    await User.findByIdAndUpdate(assignedUser, {
      $push: {
        devices: {
          deviceId: savedDevice.deviceId,
          platform: "Web",
          lastActive: new Date(),
        },
      },
    });

    res.status(201).json(savedDevice);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid device data", error: error.message });
  }
});

// @desc    Update device settings & telemetry
// @route   PUT /api/devices/:id
router.put("/:id", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    // Allow updating links to users
    if (req.body.purchaser) {
      const purchaserUser = await User.findById(req.body.purchaser);
      if (!purchaserUser)
        return res.status(400).json({ message: "Purchaser user not found" });
      device.purchaser = req.body.purchaser;
    }
    if (req.body.assignedUser) {
      const operatorUser = await User.findById(req.body.assignedUser);
      if (!operatorUser)
        return res
          .status(400)
          .json({ message: "Assigned operator user not found" });

      // If user has changed, update devices arrays on user models
      if (device.assignedUser.toString() !== req.body.assignedUser) {
        // Remove device from previous assigned user's device array
        await User.findByIdAndUpdate(device.assignedUser, {
          $pull: { devices: { deviceId: device.deviceId } },
        });

        // Add to new assigned user's device array
        await User.findByIdAndUpdate(req.body.assignedUser, {
          $push: {
            devices: {
              deviceId: device.deviceId,
              platform: "Web",
              lastActive: new Date(),
            },
          },
        });
        device.assignedUser = req.body.assignedUser;
      }
    }

    // Basic details
    device.name = req.body.name || device.name;
    device.deviceType = req.body.deviceType || device.deviceType;
    device.model = req.body.model || device.model;
    device.firmwareVersion = req.body.firmwareVersion || device.firmwareVersion;
    device.notes = req.body.notes !== undefined ? req.body.notes : device.notes;

    // Status & Telemetry
    device.status = req.body.status || device.status;
    device.batteryLevel =
      req.body.batteryLevel !== undefined
        ? req.body.batteryLevel
        : device.batteryLevel;
    device.emergencyMode =
      req.body.emergencyMode !== undefined
        ? req.body.emergencyMode
        : device.emergencyMode;
    device.onRoute =
      req.body.onRoute !== undefined ? req.body.onRoute : device.onRoute;
    device.conected =
      req.body.conected !== undefined ? req.body.conected : device.conected;

    if (req.body.lastLocation) {
      device.lastLocation = {
        latitude:
          req.body.lastLocation.latitude || device.lastLocation.latitude,
        longitude:
          req.body.lastLocation.longitude || device.lastLocation.longitude,
        accuracy:
          req.body.lastLocation.accuracy || device.lastLocation.accuracy,
        speed:
          req.body.lastLocation.speed !== undefined
            ? req.body.lastLocation.speed
            : device.lastLocation.speed,
        address: req.body.lastLocation.address || device.lastLocation.address,
        updatedAt: new Date(),
      };
      device.lastSeenAt = new Date();

      // Mirror the position change to the assigned user's primary position field
      await User.findByIdAndUpdate(device.assignedUser, {
        location: {
          lat: device.lastLocation.latitude,
          lng: device.lastLocation.longitude,
          updatedAt: new Date(),
        },
      });
    }

    if (req.body.lastPhoto) {
      device.lastPhoto = {
        imageUrl: req.body.lastPhoto.imageUrl || device.lastPhoto.imageUrl,
        capturedAt: new Date(),
      };
    }

    const updatedDevice = await device.save();
    res.json(updatedDevice);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating device", error: error.message });
  }
});

// @desc    Delete device
// @route   DELETE /api/devices/:id
router.delete("/:id", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    // Clean up device link from assigned user's device array
    await User.findByIdAndUpdate(device.assignedUser, {
      $pull: { devices: { deviceId: device.deviceId } },
    });

    await Device.deleteOne({ _id: req.params.id });
    res.json({ message: "Device deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
