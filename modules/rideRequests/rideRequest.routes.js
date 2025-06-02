const express = require("express");
const router = express.Router();
const { sendRideRequest,getMyRideRequests ,updateRequestStatus, getRiderRequests, getDriverRequests} = require("./rideRequest.controller");
const {authMiddleware} = require("../../middlewares/auth");

router.post("/", authMiddleware, sendRideRequest);
router.get("/my-requests", authMiddleware, getRiderRequests);
router.put("/request/:requestId/status", authMiddleware, updateRequestStatus);
router.get("/driver-requests",authMiddleware,getDriverRequests);

module.exports = router;
