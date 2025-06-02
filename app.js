const express = require("express");
const userRoutes = require("./modules/users/user.routes");
const stopRoutes=require("./modules/stops/stop.routes");
const routeRoutes=require("./modules/routes/route.routes");
const rideRoutes=require("./modules/rides/ride.routes");
const rideRequestRoutes=require("./modules/rideRequests/rideRequest.routes")

const app = express();
app.use(express.json());


app.use("/api/users", userRoutes);
app.use("/api/stops",stopRoutes);
app.use("/api/routes",routeRoutes);
app.use("/api/rides",rideRoutes);
app.use("/api/ride-requests",rideRequestRoutes);

module.exports = app;
