const rideService = require("./ride.service");

exports.createRide = async (req, res) => {
  try {
    const ride = await rideService.createRide(req.body, req.user); // pass full user object
    res.status(201).json({ message: "Ride created successfully", ride });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// exports.searchRides = async (req, res) => {
//   try {
//     const { origin, destination, date } = req.query;
//     console.log(origin,destination,date)
//     const rides = await rideService.searchRides(origin, destination, date);
//     res.status(200).json({ rides });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };


exports.searchRides = async (req, res) => {
  try {
    const { startStopName, endStopName, date } = req.query;
    if (!startStopName || !endStopName || !date) {
      return res
        .status(400)
        .json({ message: "start_stop_id, end_stop_id, and date are required" });
    }

    const rides = await rideService.searchRidesByIntermediateStops(
      startStopName,
      endStopName,
      date
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
    const rides = await rideService.getRidesByDriver(driverId);
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
    const rideId=req.params.id;
    console.log(driverId);
    console.log(rideId);
    const deleteRide=await rideService.deleteRide(rideId,driverId);
    return res.json({ message: "Ride cancelled successfully" });
  } catch (error) {
    console.error("Cancel ride error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}