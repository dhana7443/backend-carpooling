const rideService = require("./ride.service");

exports.createRide = async (req, res) => {
  try {
    const ride = await rideService.createRide(req.body, req.user); // pass full user object
    res.status(201).json({ message: "Ride created successfully", ride });
    console.log({ride});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.searchRides = async (req, res) => {
  try {
    const { startStopName, endStopName, datetime } = req.query;
    if (!startStopName || !endStopName || !datetime) {
      return res
        .status(400)
        .json({ message: "start_stop_id, end_stop_id, and datetime are required" });
    }
    console.log(startStopName,endStopName,datetime)
    const rides = await rideService.searchRidesByIntermediateStops(
      startStopName,
      endStopName,
      datetime
    );

    res.json({ rides });
    console.log({rides});
  } catch (error) {
    console.error("Error in searchRidesByIntermediateStops controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};


exports.getMyRides = async (req, res) => {
  try {
    const driverId = req.user.user_id;
    const rides = await rideService.getActiveRidesByDriver(driverId);
    res.status(200).json({ rides });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// controllers/rideController.js
exports.updateRide = async (req, res) => {
  try {
    const driverId = req.user.user_id;  // from JWT middleware
    const rideId = req.params.id;
    const updateData = req.body;
    
    const updatedRide = await rideService.updateRide(rideId,driverId,updateData);

    res.status(200).json({ message: "Ride updated successfully", ride: updatedRide });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.cancelRide=async(req,res)=>{
  try{
    const driverId=req.user.user_id;
    const rideId=req.params.ride_id;
    console.log(driverId);
    console.log(rideId);
    const deleteRide=await rideService.deleteRide(rideId,driverId);
    console.log(deleteRide);
    return res.json({ message: "Ride cancelled successfully" });
  } catch (error) {
    console.error("Cancel ride error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

exports.getRideDetails = async (req, res) => {
  try {
    const { ride_id } = req.params;
    const user_id = req.user.user_id;
    console.log({ride_id});
    console.log(user_id);
    const data = await rideService.getRideDetails(ride_id, { user_id });
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSegmentOccupancy = async (req, res) => {
  console.log('hit');
  try {
    const { ride_id, route_id } = req.params;

    const result = await rideService.buildSegmentOccupancy(ride_id, route_id);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error in getSegmentOccupancy:', err.message);
    res.status(500).json({ message: 'Failed to get segment occupancy' });
  }
};

exports.validateRideRequest = async (req, res) => {
  console.log('hit')
  try {
    const { ride_id, route_id, from_stop, to_stop } = req.body;

    const canAccept = await rideService.canAcceptRideRequest(
      ride_id,
      route_id,
      from_stop,
      to_stop
    );

    console.log(canAccept);
    if (!canAccept) {
      return res.status(400).json({ canBook:false,message: "No available seats on this subroute" });
    }

    return res.status(200).json({ canBook:true,message: "Request can be accepted" });
  } catch (err) {
    console.error("Validation error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};