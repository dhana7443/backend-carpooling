// modules/routes/routeStop.model.js

const mongoose = require("mongoose");

const routeStopSchema = new mongoose.Schema(
  {
    start_stop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop", // Assumes your stop collection is named 'stops' and model is 'Stop'
      required: true,
    },
    end_stop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },
    distance: {
      type: Number, // in kilometers or meters, depending on your standard
      required: true,
    },
    time: {
      type: Number, // in minutes or seconds
      required: true,
    },
    cost: {
      type: Number, // predefined fare
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

routeStopSchema.index({ start_stop_id: 1, end_stop_id: 1 }, { unique: true });

module.exports = mongoose.model("Route", routeStopSchema);
