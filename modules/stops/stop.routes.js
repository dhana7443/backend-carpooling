const express = require("express");
const router = express.Router();
const {createStop,getAllStops,getStopById,updateStop,deleteStop, getStartLocations}= require("./stop.controller");
const {isAdmin}=require("../../middlewares/auth")

router.post("/", isAdmin,createStop);
router.get("/",getAllStops);
router.get("/:id",getStopById);
router.patch("/:id",isAdmin,updateStop);
router.delete("/:id",isAdmin,deleteStop);
router.get("/start-locations",getStartLocations);

module.exports = router;

