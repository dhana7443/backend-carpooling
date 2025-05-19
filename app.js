const express = require("express");
const userRoutes = require("./modules/users/user.routes");
const stopRoutes=require("./modules/stops/stop.routes");

const app = express();
app.use(express.json());


app.use("/api/users", userRoutes);
app.use("/api/stops",stopRoutes);


module.exports = app;
