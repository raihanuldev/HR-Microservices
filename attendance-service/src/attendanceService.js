const axios = require("axios");

const EMPLOYEE_SERVICE_URL = process.env.EMPLOYEE_SERVICE_URL || "http://localhost:5002";

exports.verifyEmployeeExists = async (userId, token) => {
  try {

    const response = await axios.get(
      `${EMPLOYEE_SERVICE_URL}/employees`,
      {
        params: { userId },

        headers: {
          Authorization: token,
        },

        timeout: 5000,
      }
    );

    console.log("EMPLOYEE RESPONSE => ", response.data);

    const employees = response.data.employees || [];

    if (employees.length === 0) {
      throw new Error("Employee not found for this user");
    }

    return employees[0];

  } catch (error) {

    console.log("FULL ERROR => ", error.message);

    console.log("ERROR RESPONSE => ", error.response?.data);

    throw new Error(
      error.response?.data?.message || error.message
    );
  }
};
exports.calculateDuration = (checkInTime, checkOutTime) => {
  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);

  const diffMs = checkOut - checkIn;

  if (diffMs <= 0) {
    throw new Error("Check-out time must be after check-in time");
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours} hours, ${minutes} minutes`;
};

exports.getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
