const Stop = require("./stop.model");

exports.createStop = async ({ stop_name, stop_type, route_id, stop_order }) => {
  if (!["origin", "destination", "intermediate"].includes(stop_type)) {
    throw new Error("Invalid stop_type");
  }

  const existing = await Stop.findOne({ stop_name, route_id });
  if (existing) {
    throw new Error("Stop with the same name already exists in this route");
  }

  const stop = new Stop({
    stop_name,
    stop_type,
    route_id,
    stop_order,
  });

  return await stop.save();
};

exports.getAllStops = async () => {
  return await Stop.find().sort({ route_id: 1, stop_order: 1 });
};

exports.getStopById = async (id) => {
  const stop = await Stop.findById(id);
  if (!stop) {
    throw new Error("Stop not found");
  }
  return stop;
};

exports.updateStop = async (id, data) => {
  const { stop_name, stop_type, route_id } = data;

  if (stop_type && !["origin", "destination", "intermediate"].includes(stop_type)) {
    throw new Error("Invalid stop_type");
  }

  if (stop_name || route_id) {
    const existing = await Stop.findOne({
      _id: { $ne: id },
      stop_name: stop_name || undefined,
      route_id: route_id || undefined,
    });
    if (existing) {
      throw new Error("Another stop with the same name already exists in this route");
    }
  }

  // Remove undefined fields to avoid overwriting
  Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

  const updatedStop = await Stop.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!updatedStop) {
    throw new Error("Stop not found");
  }

  return updatedStop;
};

exports.deleteStop = async (id) => {
  const deletedStop = await Stop.findByIdAndDelete(id);
  if (!deletedStop) {
    throw new Error("Stop not found");
  }
  return deletedStop;
};

exports.getStartLocations = async () => {
  return await Stop.find({
    stop_type: { $in: ["origin", "intermediate"] },
  }).sort({ route_id: 1, stop_order: 1 });
};
