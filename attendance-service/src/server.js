const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();
const port = process.env.ATTENDANCE_SERVICE_PORT || 5003;

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send({
    status: "Success",
    message: "Attendance Service is Running...",
  });
});

app.use("/attendance", attendanceRoutes);

app.listen(port, () => {
  console.log("Attendance Service Running on Port", port);
});
