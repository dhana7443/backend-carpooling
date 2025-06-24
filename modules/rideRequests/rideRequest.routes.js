const express = require("express");
const router = express.Router();
const { sendRideRequest,getMyRideRequests ,updateRequestStatus, getRiderRequests, getRideRequestsByRideId,getUnseenRequestCount, markRequestsAsSeen} = require("./rideRequest.controller");
const {authMiddleware} = require("../../middlewares/auth");

router.post("/", authMiddleware, sendRideRequest);
router.get("/my-requests", authMiddleware, getRiderRequests);
router.put("/request/:requestId/status", authMiddleware, updateRequestStatus);
router.get("/ride/:rideId/requests",authMiddleware,getRideRequestsByRideId);
router.get('/ride/:ride_id/unseen-count',authMiddleware,getUnseenRequestCount);
router.put('/ride/:ride_id/mark-seen',authMiddleware,markRequestsAsSeen);

module.exports = router;
