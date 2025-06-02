const express = require("express");
const router = express.Router();
const {createRide,searchRides, getMyRides,updateRide, cancelRide} = require("./ride.controller");
const {authMiddleware,onlyDriver}=require("../../middlewares/auth");


router.post("/",authMiddleware,onlyDriver, createRide);
router.get("/search-rides",searchRides);
router.get("/my-rides",authMiddleware,onlyDriver,getMyRides);
router.put("/my-rides/:id",authMiddleware,onlyDriver,updateRide)
router.put("/cancel/:id", authMiddleware, onlyDriver, cancelRide);


module.exports = router;
