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
