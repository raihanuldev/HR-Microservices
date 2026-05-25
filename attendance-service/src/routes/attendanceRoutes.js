const express = require("express");
const router = express.Router();
const attendanceController = require("../controller/attendance.controller");
const authMiddleware = require("../authMiddleware");

router.post("/check-in", authMiddleware, attendanceController.checkIn);
router.post("/check-out", authMiddleware, attendanceController.checkOut);
router.get("/record", authMiddleware, attendanceController.getAttendanceRecord);

module.exports = router;
