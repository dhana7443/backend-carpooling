const Ride = require("./ride.model");
const Stop = require("../stops/stop.model");
const Route = require("../routes/route.model");

exports.createRide = async ({
  origin_stop_id,
  destination_stop_id,
  departure_time,
  available_seats
}, { user_id }) => {

  const existingRide = await Ride.findOne({
    driver_id: user_id,
    status: "Active"
  });

  if (existingRide) {
    throw new Error("You already have an active ride. Complete or cancel it before creating a new one.");
  }

  const originStop = await Stop.findById(origin_stop_id);
  const destinationStop = await Stop.findById(destination_stop_id);
  console.log(originStop);
  console.log(origin_stop_id);
  if (!originStop || !destinationStop) {
    throw new Error("Invalid origin or destination stop");
  }

  if (originStop.route_id.toString() !== destinationStop.route_id.toString()) {
    throw new Error("Origin and destination must belong to the same route");
  }

  const ride = new Ride({
    driver_id: user_id,
    origin_stop_id: originStop._id,
    destination_stop_id: destinationStop._id,
    route_id: originStop.route_id,
    departure_time,
    available_seats
  });

  await ride.save();

  return {
    originStopName: originStop.stop_name,
    destinationStopName: destinationStop.stop_name,
    departure_time,
    route_id: originStop.route_id,
    available_seats
  };
};



// services/rideService.js
exports.searchRidesByIntermediateStops = async (startStopName, endStopName, date) => {
  const startStops = await Stop.find({ stop_name: startStopName });
  const endStops = await Stop.find({ stop_name: endStopName });

  if (!startStops.length || !endStops.length) {
    throw new Error("Start or end stop not found.");
  }

  const validPairs = [];

  for (const startStop of startStops) {
    for (const endStop of endStops) {
      if (
        startStop.route_id.toString() === endStop.route_id.toString() &&
        startStop.stop_order < endStop.stop_order
      ) {
        validPairs.push({ startStop, endStop });
      }
    }
  }

  if (!validPairs.length) {
    throw new Error("No valid route segments found between the selected stops.");
  }

  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  let matchedRides = [];

  for (const { startStop, endStop } of validPairs) {
    const rides = await Ride.find({
      route_id: startStop.route_id,
      departure_time: { $gte: startOfDay, $lte: endOfDay },
      status: "Active",
    })
      .populate("driver_id", "name email -_id")
      .populate("origin_stop_id", "stop_order stop_name -_id")
      .populate("destination_stop_id", "stop_order stop_name -_id");

    const segmentRides = rides.filter((ride) => {
      return (
        ride.origin_stop_id.stop_order <= startStop.stop_order &&
        ride.destination_stop_id.stop_order >= endStop.stop_order
      );
    });

    // Fetch route info
    const routeInfo = await Route.findOne({
      start_stop_id: startStop._id,
      end_stop_id: endStop._id,
    });

    const routeStops = await Stop.find({ route_id: startStop.route_id })
      .sort("stop_order")
      .select("stop_name stop_order -_id");

    matchedRides.push(
      ...segmentRides.map((ride) => ({
        ride_id: ride._id,
        driver_id: ride.driver_id || null,
        driver_name: ride.driver_id?.name || null,
        origin_stop_name: ride.origin_stop_id?.stop_name || null,
        destination_stop_name: ride.destination_stop_id?.stop_name || null,
        route_id: ride.route_id,
        departure_time: ride.departure_time,
        available_seats: ride.available_seats,
        status: ride.status,
        route_stops: routeStops.map((stop) => ({
          stop_name: stop.stop_name,
          stop_order: stop.stop_order,
        })),
        distance: routeInfo?.distance || null,
        time: routeInfo?.time || null,
        cost: routeInfo?.cost || null,
      }))
    );
  }

  return matchedRides;
};


//get-rides
exports.getRidesByDriver = async (driverId) => {
  const rides = await Ride.find({ driver_id: driverId })
    .populate("driver_id", "name -_id") 
    .populate("origin_stop_id", "stop_name -_id")
    .populate("destination_stop_id", "stop_name -_id")
    .sort({ departure_time: -1 }); // most recent first

  // Map rides to clean output format
  const formattedRides = rides.map(ride => ({
    driver_name: ride.driver_id?.name || null,
    origin_stop_name: ride.origin_stop_id?.stop_name || null,
    destination_stop_name: ride.destination_stop_id?.stop_name || null,
    route_id: ride.route_id || null,
    departure_time: ride.departure_time,
    available_seats: ride.available_seats,
    status: ride.status,
  }));
  
  return formattedRides;
};

//update-ride
exports.updateRide = async (rideId, driverId, updateData) => {
  // Validate allowed fields to update
  const allowedUpdates = ['available_seats', 'departure_time', 'status'];
  const updates = Object.keys(updateData);

  const isValidOperation = updates.every(field => allowedUpdates.includes(field));
  if (!isValidOperation) {
    throw new Error("Invalid fields for update");
  }

  // Find the ride and verify driver ownership
  const ride = await Ride.findOne({ _id: rideId, driver_id: driverId })
  .populate("driver_id", "name -_id") 
  .populate("origin_stop_id", "stop_name -_id")
  .populate("destination_stop_id", "stop_name -_id"); 
;
  if (!ride) {
    throw new Error("Ride not found or you don't have permission to update");
  }

  // Update fields
  updates.forEach(field => {
    ride[field] = updateData[field];
  });

  // Save updated ride
  await ride.save();
  const formattedRides = {
    driver_name: ride.driver_id?.name || null,
    origin_stop_name: ride.origin_stop_id?.stop_name || null,
    destination_stop_name: ride.destination_stop_id?.stop_name || null,
    route_id: ride.route_id || null,
    departure_time: ride.departure_time,
    available_seats: ride.available_seats,
    status: ride.status,
  };

  return formattedRides;
};

//delete-ride
exports.deleteRide=async(rideId,driverId)=>{

  const ride = await Ride.findOne({
    _id: rideId,
    driver_id: driverId,
    status: "Active"
  })

  if (!ride) {
    return res.status(404).json({ message: "Ride not found or already cancelled" });
  }

  ride.status = "Cancelled";
  await ride.save();
  return ride;
}