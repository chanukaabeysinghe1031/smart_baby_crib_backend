// jwtAuth.js
import dotenv from "dotenv";

dotenv.config();

const jwtAuth = (req, res, next) => {
  const token = req.header("X-API-TOKEN");
  if (token !== process.env.API_TOKEN) {
    return res.status(403).json({
      message: "Authentication failed. Invalid or missing API token.",
    });
  }
  next();
};

export default jwtAuth;
