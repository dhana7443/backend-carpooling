const express = require("express");
const router = express.Router();
const {createRide,searchRides, getMyRides,updateRide, cancelRide,getRideDetails, getSegmentOccupancy, validateRideRequest} = require("./ride.controller");
const {authMiddleware,onlyDriver}=require("../../middlewares/auth");


router.post("/",authMiddleware,onlyDriver, createRide);
router.get("/search-rides",searchRides);
router.get("/my-rides",authMiddleware,onlyDriver,getMyRides);
router.get('/ride/:ride_id', authMiddleware, getRideDetails);

router.put("/my-rides/:id",authMiddleware,onlyDriver,updateRide)
router.put("/cancel/:ride_id", authMiddleware, onlyDriver, cancelRide);
router.get('/segment-occupancy/:ride_id/:route_id',getSegmentOccupancy);
router.post('/validate-request',validateRideRequest);
router.get('/test', (req, res) => {
  res.send('Ride test route works');
});

module.exports = router;
