const express = require("express");
const router = express.Router();
const {createStop}= require("./stop.controller");

router.post("/", createStop);

module.exports = router;

