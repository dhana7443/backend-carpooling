const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    origin_stop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },
    destination_stop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },
    route_id: {
      type: String,
      required: true,
    },
    departure_time: {
      type: Date,
      required: true,
    },
    available_seats: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active",
    },
  },
  {
    timestamps:true,
  }
);

module.exports = mongoose.model("Ride", rideSchema);
