const stopService = require("./stop.service");

exports.createStop = async (req, res) => {
  try {
    const stop = await stopService.createStop(req.body);
    res.status(201).json({ message: "Stop created successfully", stop });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllStops = async (req, res) => {
  try {
    const stops = await stopService.getAllStops();
    res.status(200).json(stops);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStopById = async (req, res) => {
  try {
    const stop = await stopService.getStopById(req.params.id);
    res.status(200).json(stop);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.updateStop = async (req, res) => {
  try {
    const updatedStop = await stopService.updateStop(req.params.id, req.body);
    res.status(200).json(updatedStop);
  } catch (error) {
    if (error.message === "Stop not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

exports.deleteStop = async (req, res) => {
  try {
    await stopService.deleteStop(req.params.id);
    res.status(200).json({ message: "Stop deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getStartLocations = async (req, res) => {
  try {
    const stops = await stopService.getStartLocations();
    res.status(200).json(stops);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
