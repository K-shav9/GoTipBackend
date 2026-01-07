import jwt from "jsonwebtoken";
import { messageID, messages, responseCodes } from "../constant";
const config = require("../config/config").get(process.env.Node_env);

const { secret } = config;

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    token = token.split(" ")[1];
    let jwtSecretKey = secret.jwt;
    if (!token || token == "undefined") {
      res.status(messageID.unAuthorizedUser).json({
        status: responseCodes.failedStatus,
        messageID: messageID.unAuthorizedUser,
        message: messages.authError,
      });
    } else {
      const decode = jwt.verify(token, jwtSecretKey);
      req.user = decode;
      next();
    }
  } catch (error) {
    res.status(202).json(false);
  }
};

export function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1]; // Get the payload part
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Replace URL-safe characters
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload); // Return the decoded JSON object
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
}
