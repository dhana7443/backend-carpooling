const RideRequest = require("./rideRequest.model");
const Ride=require("../rides/ride.model");
const User=require("../users/user.model");
const stop=require("../stops/stop.model");

exports.createRideRequest = async (riderId, rideId) => {
  // Prevent duplicate request
  const existing = await RideRequest.findOne({ rider_id: riderId, ride_id: rideId });
  if (existing) {
    throw new Error("Ride request already sent.");
  }

  const request = new RideRequest({
    rider_id: riderId,
    ride_id: rideId
  });

  await request.save();
  return request;
};


exports.getRequestsByRider = async (riderId) => {
  const requests = await RideRequest.find({ rider_id: riderId })
    .populate({
      path: "ride_id",
      populate: [
        { path: "origin_stop_id", select: "stop_name -_id" },
        { path: "destination_stop_id", select: "stop_name -_id" }
      ],
      select: "origin_stop_id destination_stop_id departure_time"
    })
    .sort({ requested_at: -1 });

  // Format clean response
  return requests.map(req => ({
    ride_id: req.ride_id?._id,
    origin_stop_name: req.ride_id?.origin_stop_id?.stop_name || null,
    destination_stop_name: req.ride_id?.destination_stop_id?.stop_name || null,
    departure_time: req.ride_id?.departure_time || null,
    status: req.status,
    requested_at: req.requested_at
  }));
};

//ride-status
exports.updateRideRequestStatus = async (requestId, status, driverId) => {
  if (!["Accepted", "Rejected"].includes(status)) {
    throw new Error("Invalid status. Must be 'Accepted' or 'Rejected'.");
  }

  const rideRequest = await RideRequest.findById(requestId);
  if (!rideRequest) {
    throw new Error("Ride request not found");
  }
  console.log(rideRequest);
  
  // Check if driver owns the ride for this request
  const ride = await Ride.findById(rideRequest.ride_id);
  if (!ride) throw new Error("Associated ride not found");
  console.log(ride);
  if (ride.driver_id.toString() !== driverId) {
    throw new Error("Unauthorized: You can only update requests for your rides");
  }
  
  rideRequest.status = status;
  await rideRequest.save();

  return rideRequest;
};


exports.getRequestsOfDriver = async (driverId) => {
  const rides = await Ride.find({ driver_id: driverId }).lean();

  const result = await Promise.all(
    rides.map(async (ride) => {
      const [originStop, destinationStop, requests] = await Promise.all([
        Stop.findById(ride.origin_stop_id),
        Stop.findById(ride.destination_stop_id),
        RideRequest.find({ ride_id: ride._id }).populate("rider_id", "name email")
      ]);

      return {
        ride_id: ride._id,
        origin: originStop?.stop_name || "Unknown",
        destination: destinationStop?.stop_name || "Unknown",
        departure_time: ride.departure_time,
        available_seats: ride.available_seats,
        status: ride.status,
        requests: requests.map(req => ({
          request_id: req._id,
          status: req.status,
          requested_at: req.requested_at,
          rider: {
            id: req.rider_id._id,
            name: req.rider_id.name,
            email: req.rider_id.email
          }
        }))
      };
    })
  );

  return result;
};