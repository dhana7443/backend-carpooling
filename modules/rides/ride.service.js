const Ride = require("./ride.model");
const Stop = require("../stops/stop.model");
const Route = require("../routes/route.model");
const RideRequest=require("../rideRequests/rideRequest.model");


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

  // Get all stops on the route
  const stops = await Stop.find({ route_id: originStop.route_id })
    .sort({ stop_order: 1 })
    .select('_id stop_name stop_order');
  console.log(stops)
  // Get all subroutes (from-to pairs) for this route
  const subroutes = await Route.find({ route_id: originStop.route_id })
    .select('start_stop_id end_stop_id distance time cost');
  console.log(subroutes)
  // Format: Map for faster lookup of stop name by ID
  const stopMap = new Map();
  stops.forEach(stop => stopMap.set(stop._id.toString(), stop.stop_name));
  console.log(stopMap);
  // Attach subroute info with stop names
  const subrouteDetails = subroutes.map(sr => ({
    from_stop_id: sr.start_stop_id,
    from_stop_name: stopMap.get(sr.start_stop_id.toString()),
    to_stop_id: sr.end_stop_id,
    to_stop_name: stopMap.get(sr.end_stop_id.toString()),
    distance: sr.distance,
    time: sr.time,
    cost: sr.cost
  }));
  console.log(subrouteDetails);
  return {
    message: "Ride created successfully",
    ride_id: ride._id,
    originStopName: originStop.stop_name,
    destinationStopName: destinationStop.stop_name,
    departure_time,
    available_seats,
    route_id: originStop.route_id,
    subroutes: subrouteDetails
  };
};


// services/rideService.js
// exports.searchRidesByIntermediateStops = async (startStopName, endStopName, date) => {
//   const startStops = await Stop.find({ stop_name: startStopName });
//   const endStops = await Stop.find({ stop_name: endStopName });

//   if (!startStops.length || !endStops.length) {
//     throw new Error("Start or end stop not found.");
//   }

//   const validPairs = [];

//   for (const startStop of startStops) {
//     for (const endStop of endStops) {
//       if (
//         startStop.route_id.toString() === endStop.route_id.toString() &&
//         startStop.stop_order < endStop.stop_order
//       ) {
//         validPairs.push({ startStop, endStop });
//       }
//     }
//   }

//   if (!validPairs.length) {
//     throw new Error("No valid route segments found between the selected stops.");
//   }

//   const startOfDay = new Date(`${date}T00:00:00.000Z`);
//   const endOfDay = new Date(`${date}T23:59:59.999Z`);

//   let matchedRides = [];

//   for (const { startStop, endStop } of validPairs) {
//     const rides = await Ride.find({
//       route_id: startStop.route_id,
//       departure_time: { $gte: startOfDay, $lte: endOfDay },
//       status: "Active",
//     })
//       .populate("driver_id", "name email -_id")
//       .populate("origin_stop_id", "stop_order stop_name -_id")
//       .populate("destination_stop_id", "stop_order stop_name -_id");

//     const segmentRides = rides.filter((ride) => {
//       return (
//         ride.origin_stop_id.stop_order <= startStop.stop_order &&
//         ride.destination_stop_id.stop_order >= endStop.stop_order
//       );
//     });

//     // Fetch route info
//     const routeInfo = await Route.findOne({
//       start_stop_id: startStop._id,
//       end_stop_id: endStop._id,
//     });

//     const routeStops = await Stop.find({ route_id: startStop.route_id })
//       .sort("stop_order")
//       .select("stop_name stop_order -_id");

//     matchedRides.push(
//       ...segmentRides.map((ride) => ({
//         ride_id: ride._id,
//         driver_id: ride.driver_id || null,
//         driver_name: ride.driver_id?.name || null,
//         origin_stop_name: ride.origin_stop_id?.stop_name || null,
//         destination_stop_name: ride.destination_stop_id?.stop_name || null,
//         route_id: ride.route_id,
//         departure_time: ride.departure_time,
//         available_seats: ride.available_seats,
//         status: ride.status,
//         route_stops: routeStops.map((stop) => ({
//           stop_name: stop.stop_name,
//           stop_order: stop.stop_order,
//         })),
//         distance: routeInfo?.distance || null,
//         time: routeInfo?.time || null,
//         cost: routeInfo?.cost || null,
//       }))
//     );
//   }

//   return matchedRides;
// };

exports.searchRidesByIntermediateStops = async (startStopName, endStopName, datetime) => {
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
  console.log(validPairs)
  if (!validPairs.length) {
    throw new Error("No valid route segments found between the selected stops.");
  }

  // Parse datetime from frontend
  const inputDateTime = new Date(datetime);
  console.log(inputDateTime);
  // Get the start and end of the same day (today)
  const startOfDay = new Date(inputDateTime);
  startOfDay.setUTCHours(0, 0, 0, 0);
  console.log(startOfDay)
  const endOfDay = new Date(inputDateTime);
  endOfDay.setUTCHours(23, 59, 59, 999);
  console.log(endOfDay)
  let matchedRides = [];

  for (const { startStop, endStop } of validPairs) {
    const rides = await Ride.find({
      route_id: startStop.route_id,
      departure_time: {
        $gte: inputDateTime, // rides from now onward
        $lte: endOfDay,       // same day
      },
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
    console.log(segmentRides);
    // Route info between selected stops
    const routeInfo = await Route.findOne({
      start_stop_id: startStop._id,
      end_stop_id: endStop._id,
    });
    console.log(routeInfo);
    const routeStops = await Stop.find({ route_id: startStop.route_id })
      .sort("stop_order")
      .select("stop_name stop_order -_id");
    console.log(routeStops)
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
  console.log(matchedRides)

  return matchedRides;
};


//get-rides
exports.getActiveRidesByDriver = async (driverId) => {
  const rides = await Ride.find({ driver_id: driverId ,status:"Active"})
    .populate("driver_id", "name -_id") 
    .populate("origin_stop_id", "stop_name -_id")
    .populate("destination_stop_id", "stop_name -_id")
    .sort({ departure_time: -1 }); // most recent first

  // Map rides to clean output format
  const formattedRides = rides.map(ride => ({
    ride_id:ride._id,
    driver_id:ride.driver_id,
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

exports.getRideDetails = async (ride_id, { user_id }) => {
  const ride = await Ride.findOne({ _id: ride_id, driver_id: user_id });

  if (!ride) {
    throw new Error("Ride not found or you are not authorized to view it.");
  }

  const originStop = await Stop.findById(ride.origin_stop_id);
  const destinationStop = await Stop.findById(ride.destination_stop_id);

  if (!originStop || !destinationStop) {
    throw new Error("Invalid origin or destination stop associated with the ride");
  }

  // Get all stops on the same route
  const stops = await Stop.find({ route_id: ride.route_id })
    .sort({ stop_order: 1 })
    .select('_id stop_name stop_order');

  // Get all subroutes for this route
  const subroutes = await Route.find({ route_id: ride.route_id })
    .select('start_stop_id end_stop_id distance time cost');

  // Create a map of stop_id => stop_name
  const stopMap = new Map();
  stops.forEach(stop => stopMap.set(stop._id.toString(), stop.stop_name));

  // Attach subroute info with stop names
  const subrouteDetails = subroutes.map(sr => ({
    from_stop_id: sr.start_stop_id,
    from_stop_name: stopMap.get(sr.start_stop_id.toString()),
    to_stop_id: sr.end_stop_id,
    to_stop_name: stopMap.get(sr.end_stop_id.toString()),
    distance: sr.distance,
    time: sr.time,
    cost: sr.cost
  }));

  return {
    message: "Ride details fetched successfully",
    ride_id: ride._id,
    originStopName: originStop.stop_name,
    destinationStopName: destinationStop.stop_name,
    departure_time: ride.departure_time,
    available_seats: ride.available_seats,
    route_id: ride.route_id,
    subroutes: subrouteDetails
  };
};

const buildSegmentOccupancy = async (ride_id, route_id) => {

  console.log("🚀 buildSegmentOccupancy CALLED");
  // 1. Get ordered stop names for this route
  const stops = await Stop.find({ route_id }).sort({ stop_order: 1 });
  const orderedStopNames = stops.map(s => s.stop_name);

  // 2. Initialize segment occupancy
  const segmentOccupancy = {};
  for (let i = 0; i < orderedStopNames.length - 1; i++) {
    const segment = `${orderedStopNames[i]}-${orderedStopNames[i + 1]}`;
    segmentOccupancy[segment] = 0;
  }

  // 3. Fetch all accepted ride requests
  const acceptedRequests = await RideRequest.find({
    ride_id,
    status: { $in: ["Pending", "Accepted"] }
  });

  // 4. Update segment counts based on each request
  for (const req of acceptedRequests) {
    const fromIndex = orderedStopNames.indexOf(req.from_stop);
    const toIndex = orderedStopNames.indexOf(req.to_stop);

    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
      console.warn(`Invalid request: ${req.from_stop} -> ${req.to_stop}`);
      continue;
    }

    for (let i = fromIndex; i < toIndex; i++) {
      const segment = `${orderedStopNames[i]}-${orderedStopNames[i + 1]}`;
      segmentOccupancy[segment]+=1;
    }
  }

  return {
    orderedStopNames,
    segmentOccupancy
  };
};

exports.buildSegmentOccupancy = buildSegmentOccupancy;

exports.canAcceptRideRequest = async (ride_id, route_id, from_stop, to_stop) => {
  console.log("🚀 canAcceptRideRequest called");
  console.log("  ride_id:", ride_id);
  console.log("  route_id:", route_id);
  console.log("  from:", from_stop, "to:", to_stop);

  const ride = await Ride.findById(ride_id);
  console.log(ride);
  if (!ride) throw new Error("Ride not found");

  const { segmentOccupancy, orderedStopNames } = await buildSegmentOccupancy(ride_id, route_id);
  console.log({segmentOccupancy,orderedStopNames});
  console.log(from_stop,to_stop);
  const fromIndex = orderedStopNames.indexOf(from_stop);
  const toIndex = orderedStopNames.indexOf(to_stop);

  if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
    throw new Error("Invalid stop selection");
  }

  // Check segment occupancy against total available seats
  for (let i = fromIndex; i < toIndex; i++) {
    const segmentKey = `${orderedStopNames[i]}-${orderedStopNames[i + 1]}`;
    const occupancy = segmentOccupancy[segmentKey] || 0;

    if (occupancy >= ride.available_seats) {
      return false; // segment full
    }
  }

  return true; // all segments available
};

