const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("aauthheder=> ",authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("error from here:");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided....",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("token=> ", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.log("Current Req: ",req.user);
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token",
    });
  }
};

module.exports = authMiddleware;
