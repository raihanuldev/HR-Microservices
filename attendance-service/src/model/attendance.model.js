const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    attendance: [
      {
        date: {
          type: String,
          required: true,
          match: /^\d{4}-\d{2}-\d{2}$/,
        },
        checkIn: {
          type: Date,
          required: true,
        },
        checkOut: {
          type: Date,
          default: null,
        },
        duration: {
          type: String,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ userId: 1, "attendance.date": 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
