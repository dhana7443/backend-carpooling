const stopService = require("./stop.service");

exports.createStop = async (req, res) => {
  try {
    const stop = await stopService.createStop(req.body);
    res.status(201).json({ message: "Stop created successfully", stop });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
