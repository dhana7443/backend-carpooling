const rideRequestService = require("./rideRequest.service");

exports.sendRideRequest = async (req, res) => {
  try {
    const riderId = req.user.user_id; // from authMiddleware
    console.log(riderId);
    const { ride_id } = req.body;
    console.log(ride_id);
    const request = await rideRequestService.createRideRequest(riderId, ride_id);
    res.status(201).json({ message: "Ride request sent successfully", request });
    console.log(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getRiderRequests = async (req, res) => {
    try {
      const riderId = req.user.user_id;
  
      const requests = await rideRequestService.getRequestsByRider(riderId);
      res.json({ requests });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
  
  
  exports.updateRequestStatus = async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status } = req.body;
      const driverId = req.user.user_id; // from auth middleware
      console.log(status);
      console.log(driverId);
      console.log(requestId);
      
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
  
      const updatedRequest = await rideRequestService.updateRideRequestStatus(requestId, status, driverId);
      res.json({ message: `Request ${status.toLowerCase()} successfully`, updatedRequest });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // controllers/driverController.js


exports.getDriverRequests = async (req, res) => {
  try {
    const driverId = req.user.user_id; // from auth middleware
    const data = await rideRequestService.getRequestsOfDriver(driverId);
    res.status(200).json({ success: true, rides: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
