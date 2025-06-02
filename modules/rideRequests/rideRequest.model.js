// riderDetails.model.js

const mongoose = require('mongoose');

const rideRequestSchema = new mongoose.Schema({
  ride_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
    required: true,
  },
  rider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },
  requested_at: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("RideRequest", rideRequestSchema);
