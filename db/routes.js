const mongoose = require("mongoose");

const routePointSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const routeSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      unique: true, // One route per device
    },
    name: {
      type: String,
      default: "Default Route",
    },
    routeIndex: {
      type: Number,
      default: 0,
    },
    direction: {
      type: String,
      enum: ["HOME_TO_SCHOOL", "SCHOOL_TO_HOME"],
      default: "HOME_TO_SCHOOL",
    },
    points: {
      type: [routePointSchema],
      required: true,
    },
    isUpdated: {
      type: Boolean,
      default: true,
    },
    HOME: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    SCHOOL: {
      latitude: Number,
      longitude: Number,
      address: String,
    },

    totalDistance: Number,
    estimatedDuration: Number,

    // Recomputed from the device's live location (lastLocation) as it moves along the route
    remainingDistance: Number,
    estimatedRemainingDuration: Number,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Route", routeSchema);
