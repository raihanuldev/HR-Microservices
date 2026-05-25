const Attendance = require("../model/attendance.model");
const {
  verifyEmployeeExists,
  calculateDuration,
  getTodayDate,
} = require("../attendanceService");
const mongoose = require("mongoose");

exports.checkIn = async (req, res) => {
  try {
    const token = req.headers.authorization;
    console.log("check-in controller hit>> token=> ", token);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found in token",
      });
    }

    let employee;
    try {
      employee = await verifyEmployeeExists(
        userId,
        req.headers.authorization
      );
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    const employeeId = employee._id;
    const todayDate = getTodayDate();
    const checkInTime = new Date();

    let attendanceRecord = await Attendance.findOne({ userId });

    if (attendanceRecord) {
      const existingCheckIn = attendanceRecord.attendance.find(
        (record) => record.date === todayDate
      );

      if (existingCheckIn) {
        return res.status(400).json({
          success: false,
          message: "You have already checked in today",
        });
      }

      attendanceRecord.attendance.push({
        date: todayDate,
        checkIn: checkInTime,
      });

      await attendanceRecord.save();
    } else {
      attendanceRecord = await Attendance.create({
        employeeId,
        userId,
        attendance: [
          {
            date: todayDate,
            checkIn: checkInTime,
          },
        ],
      });
    }

    res.status(200).json({
      success: true,
      message: "Check-in successful",
      data: {
        userId,
        date: todayDate,
        checkIn: checkInTime,
      },
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong during check-in",
      error: error.message,
    });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found in token",
      });
    }

    const todayDate = getTodayDate();
    const checkOutTime = new Date();

    let attendanceRecord = await Attendance.findOne({ userId });

    if (!attendanceRecord) {
      return res.status(404).json({
        success: false,
        message: "No attendance record found for this user",
      });
    }

    const todayRecord = attendanceRecord.attendance.find(
      (record) => record.date === todayDate
    );

    if (!todayRecord) {
      return res.status(400).json({
        success: false,
        message: "No check-in found for today",
      });
    }

    if (todayRecord.checkOut) {
      return res.status(400).json({
        success: false,
        message: "You have already checked out today",
      });
    }

    let duration;
    try {
      duration = calculateDuration(todayRecord.checkIn, checkOutTime);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    todayRecord.checkOut = checkOutTime;
    todayRecord.duration = duration;

    await attendanceRecord.save();

    res.status(200).json({
      success: true,
      message: "Check-out successful",
      data: {
        userId,
        date: todayDate,
        checkIn: todayRecord.checkIn,
        checkOut: checkOutTime,
        duration,
      },
    });
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong during check-out",
      error: error.message,
    });
  }
};

exports.getAttendanceRecord = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found in token",
      });
    }

    const attendanceRecord = await Attendance.findOne({ userId });

    if (!attendanceRecord) {
      return res.status(404).json({
        success: false,
        message: "No attendance records found for this user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance records fetched successfully",
      data: attendanceRecord,
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching attendance",
      error: error.message,
    });
  }
};
